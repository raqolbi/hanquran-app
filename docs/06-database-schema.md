# Database Schema

## HanQuran V1

**Terakhir disinkronkan dengan kode:** 2 November 2026 — `services/db/migrations.ts` (schema **v5**), `types/index.ts`, `public/sw.js` (**v4**).

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
Version: 5
```

| Versi | Perubahan |
|-------|-----------|
| v1 | Termasuk tabel konten Quran (`surahs`, `ayahs`, `translations`, `wordTimings`, `reciters`) — tidak pernah dipakai runtime |
| v2 | Tabel konten Quran dihapus; hanya data pengguna + manifest offline |
| v3 | Cadangkan `downloadManifest` lama ke `downloadManifestLegacy` |
| v4 | Hapus `downloadManifest` lama (Dexie tidak bisa mengubah primary key in-place) |
| v5 | `downloadManifest` baru dengan PK `[surahId+reciterId]` (per surat **dan** qari), data cadangan dipulihkan |

Sumber kebenaran: `services/db/migrations.ts`.

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
- Phase: ~~MVP~~ — **dihapus di v2** (konten dari `public/data/*`)

---

## 5.2 `ayahs` — ⚠️ DIHAPUS (v2)

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

- Phase: ~~MVP~~ — **dihapus di v2** (konten dari `public/data/*`)

---

## 5.3 `translations` — ⚠️ DIHAPUS (v2)

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
- Phase: ~~MVP~~ — **dihapus di v2** (konten dari `public/data/*`)

---

## 5.4 `wordTimings` — ⚠️ DIHAPUS (v2)

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

- Phase: ~~MVP~~ — **dihapus di v2** (konten dari `public/data/*`)

---

## 5.5 `reciters` — ⚠️ DIHAPUS (v2)

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
- Phase: ~~MVP~~ — **dihapus di v2** (konten dari `public/data/*`)

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
  /** Cache audio ayat saat diputar (online). Default: false. Lihat docs/31. */
  autoDownloadOnPlay: boolean;
  /** Slug qari dari `data/reciters.json` (mis. `Alafasy_128kbps`). */
  reciterId: string;
  /** Konfigurasi repeat hafalan (dikelola `useRepeatStore`). */
  repeatConfig?: RepeatConfig;
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
- `autoDownloadOnPlay`: mengaktifkan cache otomatis file MP3 ayat yang diputar saat online. Default `false`. Lihat `docs/31-auto-download-audio-spec.md`.
- `reciterId` menggantikan `qariId` (angka) lama; `qariId` dihapus otomatis saat `init()`.
- Field baru **tidak** butuh versi Dexie baru: `normalizeStoredSettings()` di `stores/userStore.ts` melengkapi field yang hilang dari `defaultSettings` (`services/db/db.ts`).
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
  /** Slug qari — bagian dari primary key bersama `surahId`. */
  reciterId: string;
  status: 'downloading' | 'ready' | 'failed';
  sizeBytes: number;
  ayahsCount: number;
  cachedAt: number;
  version: string;
}
```

### Keys & Index

- Primary key: `[surahId+reciterId]` (sejak v5)
- Index: `surahId`, `reciterId`, `status`, `cachedAt`

### Notes

- Satu surat bisa "siap offline" untuk satu qari tetapi belum untuk qari lain.
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

Nama cache aktif (sumber: `public/sw.js`, `SW_VERSION = 'v4'`). Saat aktivasi SW, cache `hanquran-*` yang tidak ada di daftar ini dihapus.

| Cache | Isi | Strategi |
|-------|-----|----------|
| `hanquran-static-v2` | JS/CSS/font ber-hash (`/_next/static/*`), ikon, `manifest.json`, `offline.html` | Precache saat install + stale-while-revalidate |
| `hanquran-shell-v2` | Dokumen HTML + payload RSC rute (`/`, `/settings`, `/surah/1` sebagai app-shell, dst.) | Network-first untuk navigasi; app-shell untuk id surat apa pun saat offline |
| `hanquran-data-v3` | Dataset `public/data/*` | Precache saat install + cache-first |
| `hanquran-audio-v1` | MP3 per ayat dari CDN `everyayah.com` | Cache-first |

## 6.1 `hanquran-audio-v1`

- Key = **URL lengkap** MP3, mis. `https://everyayah.com/data/{reciterId}/{SSSAAA}.mp3` (`services/quran/audio-service.ts`).
- Ditulis oleh: Service Worker (Simpan Offline, `prefetch-surah`), dan main thread untuk **Auto Download saat putar** (`services/audio-play-cache.ts`) serta fallback `download-manager` saat SW tidak tersedia.
- Tidak ada eviction otomatis; dihapus lewat **Hapus Cache** di Pengaturan.
- Metadata unduhan per surat + qari ada di tabel Dexie `downloadManifest`.

## 6.2 `hanquran-data-v3`

- Salinan dataset Qur'an untuk offline. Nomor versi dinaikkan saat isi dataset berubah agar salinan lama tidak dipakai (lihat juga fingerprint dataset di `scripts/generate-sw-precache.mjs`).

## 6.3 `hanquran-static-v2` & `hanquran-shell-v2`

- Daftar aset diambil dari `public/sw-precache-manifest.js` yang di-generate saat build. Rincian perilaku offline: `docs/30-offline-behavior-spec.md`.

---

# 7. Dexie Schema Definition

Schema aktif (v5) — lihat `SCHEMA_V3` + `applyMigrations()` di `services/db/migrations.ts`:

```ts
db.version(5).stores({
  favorites:             'surahId, createdAt',
  lastRead:              'id',
  settings:              'id',
  downloadManifest:      '[surahId+reciterId], surahId, reciterId, status, cachedAt',

  // Growth Phase (schema tersedia, belum diisi di MVP)
  bookmarks:             'id, surahId, createdAt',
  memorization_progress: 'surahId, percentComplete, lastSessionAt',
  murajaah_sessions:     'id, surahId, completedAt',
  statistics:            'date',
  notes:                 'id, surahId, updatedAt',

  downloadManifestLegacy: null, // tabel sementara v3–v4, dihapus di v5
});
```

Setiap `version()` mendefinisikan **seluruh** tabel. Versi lama (v1–v4) tetap dideklarasikan agar pengguna lama bisa naik bertahap.

---

# 8. Indexing Strategy

## Prinsip

1. Index hanya dibuat untuk field yang benar-benar digunakan sebagai filter atau sort di query.
2. Compound index `[surahId+ayahNumber]` digunakan karena hampir semua query ayat melibatkan keduanya.
3. Hindari over-indexing — setiap index menambah overhead pada write.

## Index Utama

| Tabel | Index | Alasan |
|-------|-------|--------|
| `downloadManifest` | `[surahId+reciterId]` (PK) | Status offline per surat **dan** qari |
| `favorites` | `createdAt` | Urutan favorit |
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
});
```

Contoh nyata: v3→v5 (`downloadManifest` ganti primary key) di `services/db/migrations.ts`.

**Field baru pada record yang sudah ada** (mis. `settings.autoDownloadOnPlay`) tidak memerlukan versi baru — default diisi saat `init()` oleh `normalizeStoredSettings()`.

## Kemungkinan Migrasi Berikutnya

- Mengaktifkan tabel Growth Phase yang sudah didefinisikan di schema
- Menambah field `syncId` ke tabel user data untuk sinkronisasi cloud (Future Phase)

---

# 10. Versioning Strategy

## Schema Version

Dexie mengelola versi database secara otomatis. Version di-track di IndexedDB metadata.

```ts
// services/db/db.ts
class HanQuranDB extends Dexie {
  constructor() {
    super('hanquran-db');
    applyMigrations(this); // v1 … v5
  }
}
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

Tidak lewat Dexie (lihat `docs/23`):

```text
Seed server (SSG) bila cocok
↓ tidak
cache memori services/quran/
↓ tidak ada
fetch /data/quran/*.json (SW: cache-first hanquran-data-v3)
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

Tabel aktif: `favorites`, `lastRead`, `settings`, `downloadManifest` (konten Quran dari `public/data/*`)

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

Tabel Growth Phase (`bookmarks`, `memorization_progress`, dll.) sudah ada dalam schema Dexie sejak v1 agar migrasi bersih, tetapi belum diisi data di MVP.
