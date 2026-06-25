# Database Schema

## HanQuran V1

---

# 1. Overview

HanQuran tidak menggunakan backend sendiri.

Penyimpanan data menggunakan tiga layer:

- **`public/data/*`** — sumber kebenaran konten Quran (statis, dihasilkan)
- **Dexie (IndexedDB)** — data pengguna: preferensi, favorit, last read, manifest offline, growth tables
- **Cache Storage** — file audio MP3 (Phase 5, Service Worker)

> **Keputusan MVP:** Konten Quran **tidak** disimpan di Dexie. Lihat `docs/23-static-dataset-architecture.md`.

---

# 2. Storage Strategy

| Storage | Teknologi | Digunakan Untuk |
|---------|-----------|-----------------|
| Static files | `public/data/*` | Surat, ayat, terjemahan, word timings (sumber kebenaran) |
| IndexedDB | Dexie.js | Preferensi, favorit, last read, bookmark, progress, manifest offline |
| Cache Storage | Cache Storage API | File audio MP3, aset statis (Phase 5) |
| In-memory | `Map` di `services/quran/` | Cache sesi — hindari fetch ulang dalam satu tab |

---

# 3. Prinsip Desain Database

## Static Dataset untuk Konten Quran

Konten Quran dibaca langsung dari `public/data/*` via `services/quran/`.

```text
hooks → services/quran/ → fetch(/data/quran/*.json)
```

Tidak ada tabel Dexie untuk surat, ayat, terjemahan, atau word timings.

---

## Dexie untuk Data Pengguna

```text
UI → Store (Zustand) → Dexie
```

Komponen tidak mengakses Dexie secara langsung — hanya melalui action store.

---

## Platform Evolution Schema

| Fase | Tabel Dexie Aktif |
|------|-------------------|
| MVP | `settings`, `favorites`, `lastRead`, `downloadManifest` |
| Growth | `bookmarks`, `memorization_progress`, `murajaah_sessions`, `statistics`, `notes` |

---

# 4. Database Name & Version

```text
Name:    hanquran-db
Version: 2  (v1 menyertakan tabel konten Quran — dihapus di v2)
```

Version dinaikkan setiap ada perubahan schema yang tidak backward-compatible.

---

# 5. IndexedDB Tables

> **Usang (schema v1, dihapus v2):** `surahs`, `ayahs`, `translations`, `wordTimings`, `reciters`.
> Bagian 5.1–5.5 di bawah ini dipertahankan sebagai referensi historis saja.

## 5.1 `surahs` — ⚠️ DIHAPUS (v2)

### Purpose

Menyimpan metadata 114 surat. Dimuat dari `public/data/*` satu kali, lalu disimpan lokal.

### Record Shape

```ts
interface SurahRecord {
  id: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslation: string;
  versesCount: number;
  revelationPlace: 'makkah' | 'madinah';
  cachedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `nameLatin`, `revelationPlace`, `cachedAt`

### Notes

- Setelah `surahs` tersimpan, Home Screen tidak perlu request API lagi.
- Phase: **MVP**

---

## 5.2 `ayahs`

### Purpose

Menyimpan teks ayat per surat.

### Record Shape

```ts
interface AyahRecord {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  textUthmani: string;
  cachedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `surahId`, `[surahId+ayahNumber]`, `cachedAt`

### Notes

- Phase: **MVP**

---

## 5.3 `translations`

### Purpose

Menyimpan terjemahan ayat.

### Record Shape

```ts
interface TranslationRecord {
  id: string; // `${resourceId}:${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  resourceId: number;
  text: string;
  cachedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `[surahId+ayahNumber]`, `[resourceId+surahId]`, `cachedAt`

### Notes

- V1 default: terjemahan Indonesia (resourceId default dikonfigurasi di settings)
- Phase: **MVP**

---

## 5.4 `wordTimings`

### Purpose

Menyimpan timestamp per kata untuk highlight sinkron dengan audio.

### Record Shape

```ts
interface WordTimingRecord {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  segments: [string, number, number][][];
  cachedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `[surahId+ayahNumber]`, `cachedAt`

### Notes

- Phase: **MVP**

---

## 5.5 `reciters`

### Purpose

Menyimpan daftar qari yang tersedia dari `data/reciters.json`.

### Record Shape

```ts
interface ReciterRecord {
  id: number;
  nameArabic: string;
  nameLatin: string;
  style?: string;
  cachedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `nameLatin`, `cachedAt`

### Notes

- Di-fetch dari `/v4/resources/recitations` dan di-cache
- Phase: **MVP**

---

## 5.6 `favorites`

### Purpose

Menyimpan surat favorit pengguna.

### Record Shape

```ts
interface FavoriteRecord {
  surahId: number;
  createdAt: number;
}
```

### Keys & Index

- Primary key: `surahId`
- Index: `createdAt`

### Notes

- V1: favorit di level surat, belum sampai level ayat
- Phase: **MVP**

---

## 5.7 `lastRead`

### Purpose

Menyimpan posisi terakhir pengguna untuk fitur `Lanjutkan Hafalan`.

### Record Shape

```ts
interface LastReadRecord {
  id: 'last-read';
  surahId: number;
  ayahNumber: number;
  updatedAt: number;
}
```

### Keys & Index

- Primary key: `id`

### Notes

- V1: satu record aktif
- Dipakai membentuk deep link `/surah/[id]?ayah=[n]`
- Phase: **MVP**

---

## 5.8 `settings`

### Purpose

Menyimpan preferensi UI global pengguna.

### Record Shape

```ts
interface SettingsRecord {
  id: 'default';
  appLocale: 'id' | 'en';
  fontSize: number;
  translationVisible: boolean;
  transliterationVisible: boolean;
  contrastMode: 'default' | 'high';
  smoothAnimation: boolean;
  autoFollowPlayback: boolean;
  murotalEnabled: boolean;
  qariId: number;
  translationResourceId: number;
  updatedAt: number;
}
```

### Keys & Index

- Primary key: `id`

### Notes

- Record tunggal dengan `id: 'default'`
- `appLocale`: bahasa UI aplikasi (`id` | `en`). Lihat `docs/21-i18n-and-locale.md`.
- `translationVisible` / `transliterationVisible`: dikontrol dari **Verse Display Controls** pada Surah Detail — bukan dari Pengaturan. Lihat `docs/22-verse-display-controls.md`.
- `autoFollowPlayback`: mengatur auto scroll ayat aktif saat playback di Surah Detail. Default `true`. Lihat `docs/28-playback-settings.md`.
- `murotalEnabled`: mengaktifkan pemutaran tilawah berkelanjutan (ayat → ayat, surat → surat). Default `false`. Lihat `docs/29-murotal-mode-spec.md`.
- Dapat diperluas via migration tanpa mengubah primary key
- Phase: **MVP**

---

## 5.9 `downloadManifest`

### Purpose

Melacak surat yang sudah diunduh audionya untuk kebutuhan offline.

### Record Shape

```ts
interface DownloadManifestRecord {
  surahId: number;
  status: 'downloading' | 'ready' | 'failed';
  sizeBytes: number;
  ayahsCount: number;
  cachedAt: number;
  version: string;
}
```

### Keys & Index

- Primary key: `surahId`
- Index: `status`, `cachedAt`

### Notes

- Diperbarui oleh `download-manager.ts` setelah unduhan selesai
- Phase: **MVP**

---

## 5.10 `bookmarks`

### Purpose

Menyimpan penanda ayat spesifik yang ditandai pengguna.

### Record Shape

```ts
interface BookmarkRecord {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  note?: string;
  createdAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `surahId`, `createdAt`

### Notes

- Phase: **Growth**

---

## 5.11 `memorization_progress`

### Purpose

Menyimpan progress hafalan pengguna per surat.

### Record Shape

```ts
interface MemorizationProgressRecord {
  surahId: number;
  ayahsMemorized: number[];
  totalAyahs: number;
  percentComplete: number;
  lastSessionAt: number;
  updatedAt: number;
}
```

### Keys & Index

- Primary key: `surahId`
- Index: `percentComplete`, `lastSessionAt`, `updatedAt`

### Notes

- Phase: **Growth**

---

## 5.12 `murajaah_sessions`

### Purpose

Menyimpan riwayat sesi murajaah (pengulangan untuk mempertahankan hafalan).

### Record Shape

```ts
interface MurajaahSessionRecord {
  id: string; // UUID
  surahId: number;
  startAyah: number;
  endAyah: number;
  repeatCount: number;
  durationSeconds: number;
  completedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `surahId`, `completedAt`

### Notes

- Phase: **Growth**

---

## 5.13 `statistics`

### Purpose

Menyimpan statistik aktivitas hafalan pengguna.

### Record Shape

```ts
interface StatisticsRecord {
  date: string; // 'YYYY-MM-DD'
  totalAyahsPlayed: number;
  totalRepeatCycles: number;
  totalListeningSeconds: number;
  surahsOpened: number[];
}
```

### Keys & Index

- Primary key: `date`
- Index: `totalAyahsPlayed`

### Notes

- Satu record per hari
- Phase: **Growth**

---

## 5.14 `notes`

### Purpose

Menyimpan catatan hafalan pengguna per ayat.

### Record Shape

```ts
interface NoteRecord {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}
```

### Keys & Index

- Primary key: `id`
- Index: `surahId`, `updatedAt`

### Notes

- Phase: **Growth**

---

# 6. Cache Storage Design

## 6.1 `hanquran-audio-v1`

### Purpose

Menyimpan file audio MP3 per ayat yang pernah diputar atau diunduh.

### Key Pattern

```text
audio/{reciterId}/{surahId}/{ayahNumber}
```

### Notes

- File biner dikelola **hanya** oleh Service Worker
- Eviction mengikuti strategi LRU
- Metadata unduhan disimpan di `downloadManifest` tabel Dexie

---

## 6.2 `hanquran-data-v1`

### Purpose

Menyimpan response API yang di-cache Service Worker (opsional, sebagai fallback tambahan).

### Notes

- Sumber data utama runtime tetap Dexie, bukan cache ini
- Service Worker dapat menggunakan cache ini sebagai layer tambahan

---

## 6.3 `hanquran-static-v1`

### Purpose

Menyimpan aset statis aplikasi.

```text
JS, CSS, fonts, manifest, icons
```

Strategy:

```text
Cache First
```

---

# 7. Dexie Schema Definition

```ts
db.version(1).stores({
  surahs:                 'id, nameLatin, revelationPlace, cachedAt',
  ayahs:                  'id, surahId, [surahId+ayahNumber], cachedAt',
  translations:           'id, surahId, [surahId+ayahNumber], [resourceId+surahId], cachedAt',
  wordTimings:            'id, [surahId+ayahNumber], cachedAt',
  reciters:               'id, nameLatin, cachedAt',
  favorites:              'surahId, createdAt',
  lastRead:               'id',
  settings:               'id',
  downloadManifest:       'surahId, status, cachedAt',

  // Growth Phase (schema tersedia sejak v1 untuk migrasi bersih)
  bookmarks:              'id, surahId, createdAt',
  memorization_progress:  'surahId, percentComplete, lastSessionAt',
  murajaah_sessions:      'id, surahId, completedAt',
  statistics:             'date',
  notes:                  'id, surahId, updatedAt',
});
```

---

# 8. Indexing Strategy

## Prinsip

1. Index hanya dibuat untuk field yang benar-benar digunakan sebagai filter atau sort di query.
2. Compound index `[surahId+ayahNumber]` digunakan karena hampir semua query ayat melibatkan keduanya.
3. Hindari over-indexing — setiap index menambah overhead pada write.

## Index Utama

| Tabel | Index | Alasan |
|-------|-------|--------|
| `ayahs` | `surahId` | Filter semua ayat per surat |
| `ayahs` | `[surahId+ayahNumber]` | Lookup ayat spesifik |
| `translations` | `[surahId+ayahNumber]` | Fetch terjemahan per ayat |
| `translations` | `[resourceId+surahId]` | Fetch semua terjemahan satu sumber per surat |
| `memorization_progress` | `percentComplete` | Sort by progress |
| `murajaah_sessions` | `surahId`, `completedAt` | Filter riwayat per surat |
| `downloadManifest` | `status` | Filter surat yang sudah `ready` |

---

# 9. Migration Strategy

## Kapan Membuat Version Baru

Buat `db.version(N+1)` jika:

- Menambah tabel baru
- Mengubah primary key tabel yang ada
- Menambah index penting yang tidak ada sebelumnya
- Mengubah struktur record yang tidak backward compatible

## Cara Migration

```ts
db.version(2).stores({
  // Definisi tabel versi 2 (semua tabel, bukan hanya yang berubah)
  ...
}).upgrade(tx => {
  // Kode migrasi data jika diperlukan
  return tx.table('settings').toCollection().modify(record => {
    if (record.qariId === undefined) {
      record.qariId = 7; // default Mishary
    }
  });
});
```

## Likely Future Migrations (v2)

- Menambah field `qariId` ke `settings` (sudah termasuk sejak v1)
- Mengaktifkan tabel Growth Phase yang sudah didefinisikan di schema
- Menambah field `syncId` ke tabel user data untuk sinkronisasi cloud (Future Phase)

---

# 10. Versioning Strategy

## Schema Version

Dexie mengelola versi database secara otomatis. Version di-track di IndexedDB metadata.

```ts
const db = new Dexie('hanquran-db');
db.version(1).stores({...});
```

## App Version vs Schema Version

- **App Version** → `package.json` version
- **Schema Version** → Dexie `db.version(N)` → bertambah hanya saat schema berubah
- Schema version tidak harus sama dengan app version

## Rollback

IndexedDB tidak mendukung rollback versi. Jika versi baru bermasalah:

1. Deploy hotfix dengan schema yang benar di version baru (N+2)
2. Atau jalankan migration untuk memperbaiki data

---

# 11. Read / Write Rules

## Read Priority (Local First)

### Data Quran

```text
Dexie
↓
Data Ada?
↓
Ya → Tampilkan
Tidak → Muat dari public/data/* → Simpan Dexie → Tampilkan
```

### Audio

```text
Cache Storage (via caches.match)
↓
Ada?
↓
Ya → Play
Tidak → Download → Simpan Cache Storage → Play
```

---

## Write Triggers

| Data | Trigger |
|------|---------|
| `surahs` | Saat daftar surat berhasil di-fetch dari API |
| `ayahs` | Saat surat dibuka dan data dari API |
| `translations` | Saat terjemahan diminta dan belum ada di lokal |
| `wordTimings` | Saat audio/highlight diminta dan belum ada |
| `reciters` | Saat daftar qari di-fetch |
| `favorites` | Saat pengguna toggle favorit |
| `lastRead` | Saat pengguna pindah surat/ayat |
| `settings` | Saat pengguna mengubah preferensi |
| `downloadManifest` | Saat unduhan audio selesai/gagal |
| `bookmarks` | Saat pengguna menambah/hapus bookmark |
| `memorization_progress` | Saat sesi hafalan berakhir |
| `murajaah_sessions` | Saat sesi murajaah selesai |
| `statistics` | Setiap akhir sesi harian |
| `notes` | Saat pengguna simpan/edit catatan |

---

# 12. Evolusi Platform

## MVP (V1)

Tabel aktif: `surahs`, `ayahs`, `translations`, `wordTimings`, `reciters`, `favorites`, `lastRead`, `settings`, `downloadManifest`

Fitur:
- Membaca Al-Quran
- Audio + repeat
- Favorite surat
- Offline basic
- Lanjutkan hafalan

---

## Growth Phase (V2)

Tabel ditambahkan: `bookmarks`, `memorization_progress`, `murajaah_sessions`, `statistics`, `notes`

Fitur:
- Progress hafalan per surat
- Murajaah terjadwal
- Statistik aktivitas
- Catatan per ayat
- Bookmark ayat

---

## Future Phase (V3+)

Schema extension dengan sync fields:

```ts
// Field sync ditambahkan via migration
interface MemorizationProgressRecord {
  ...
  syncId?: string;       // untuk cloud sync
  syncedAt?: number;
  deviceId?: string;
}
```

Fitur:
- Akun pengguna
- Sinkronisasi cloud
- Multi-device
- Family profiles

---

# 13. Out of Scope (V1 MVP)

Schema berikut belum diperlukan di V1:

- `users`
- `sessions`
- `achievements`
- `mascotState`
- `cloudSyncQueue`
- `devices`

Tabel Growth Phase (`bookmarks`, `memorization_progress`, dll.) sudah ada dalam schema Dexie V1 agar migration V2 bersih, tetapi belum diisi data di MVP.
