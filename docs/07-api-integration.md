# API Integration

## HanQuran V1

---

# 1. Overview

HanQuran V1 menggunakan **dataset statis** untuk konten Al-Qur'an dan **CDN audio tilawah** untuk playback per ayat.

Dokumen ini mendefinisikan:

- Sumber data yang digunakan
- Struktur dataset statis
- Kontrak repository
- Strategi fetch dan cache
- Error handling

HanQuran V1 tidak menggunakan backend sendiri dan **tidak memerlukan autentikasi OAuth**.

> **Bahasa UI vs terjemahan ayat:** `public/data/translations/{lang}/*` = konten terjemahan ayat. Bahasa **antarmuka aplikasi** dikelola terpisah via **`next-intl`** + `settings.appLocale` — lihat `docs/21-i18n-and-locale.md`.

Integrasi berjalan langsung dari browser melalui:

- Dataset statis (`public/data/*`)
- CDN audio tilawah (eksternal)
- `data/reciters.json` (metadata qari)
- IndexedDB (Dexie)
- Cache Storage
- Service Worker

---

# 2. Integration Principles

## Static Dataset First (Keputusan MVP)

V1 menggunakan dataset yang dihasilkan sebelumnya dan disajikan sebagai aset statis:

```text
public/data/*
```

Ini adalah **satu-satunya** sumber kebenaran konten Quran untuk MVP. Lihat **`docs/23-static-dataset-architecture.md`**.

```text
public/data/*
        ↓
services/quran/*
        ↓
Memory Cache (opsional)
        ↓
React Hooks
        ↓
UI
```

---

## Service Layer First

Feature layer tidak memanggil `fetch()` langsung ke path dataset.

Semua akses konten Quran melalui **`services/quran/`**:

```text
UI
↓
React Hooks (useSurahList, useSurah, …)
↓
services/quran/*
↓
public/data/*
```

Komponen tidak boleh mengakses `public/data/` atau Dexie secara langsung.

---

## Dexie — Hanya Data Pengguna

Dexie (IndexedDB) **tidak** menyimpan konten Quran (surat, ayat, terjemahan, word timings, qari).

Dexie dipakai untuk:

- `settings` — preferensi pengguna
- `favorites`, `lastRead`, `bookmarks`, `notes`
- `downloadManifest` — metadata audio offline

```text
UI → Zustand Store → Dexie
```

---

## Cache In-Memory (Sesi)

`services/quran/data-loader.ts` memakai `Map` in-memory agar fetch ulang dalam satu sesi tidak terjadi.

Browser juga meng-cache aset statis `public/data/*` via HTTP cache.

**Tidak** diperlukan seed atau hydrate Dexie untuk konten Quran.

---

## Audio — CDN tilawah + Cache Storage

```text
Cache Storage First (Phase 5)
+ Stream dari CDN audio jika belum ada
```

Metadata qari dari `data/reciters.json` — bukan Dexie.

---

## Offline Friendly

Konten Quran tersedia offline setelah Service Worker (Phase 5) meng-cache aset `public/data/*`, atau setelah browser HTTP cache terisi. **Bukan** via IndexedDB content tables.

---

# 3. Data Sources

## 3.1 Quran Content — Dataset Statis

### Lokasi

```text
public/data/
├── manifest.json
├── quran/
│   └── {surahId}.json        # 1–114
└── translations/
    ├── id/
    │   └── {surahId}.json
    └── en/
        └── {surahId}.json
```

### Manifest

`public/data/manifest.json` berisi metadata dataset: versi, jumlah surat/ayat, bahasa terjemahan yang tersedia.

### Autentikasi

```text
Tidak diperlukan
```

Dataset disajikan sebagai aset statis dari origin aplikasi.

---

## 3.2 Audio — CDN tilawah per ayat

### Provider

```text
CDN audio tilawah (konfigurasi: AYAH_AUDIO_BASE_URL)
```

Audio tilawah per ayat di-stream dari CDN eksternal. URL dibangun via `buildAyahAudioUrl()` berdasarkan ID qari dari `data/reciters.json` dan kunci ayat (`surahId:ayahNumber`).

> **Nilai MVP:** `AYAH_AUDIO_BASE_URL` = `https://everyayah.com/data` di `services/quran/audio-config.ts`. Dapat diganti tanpa mengubah pemanggil.

### Autentikasi

```text
Tidak diperlukan
```

---

## 3.3 Reciters — data/reciters.json

### Lokasi

```text
data/reciters.json
```

Berisi daftar qari yang didukung: `id` (slug pada CDN audio), `name` (nama tampilan).

Contoh:

```json
[
  { "id": "Alafasy_128kbps", "name": "Mishary Rashid Alafasy" }
]
```

---

# 4. Data Needed by HanQuran V1

## Quran Reader

- Daftar surat
- Detail surat
- Daftar ayat
- Teks Arab Uthmani

---

## Memorization

- Word timings
- Audio per ayat
- Repeat playback support
- Focus mode data

---

## Supporting Features

- Translation Indonesia (dan EN bila diaktifkan)
- Last read link generation
- Favorites filter
- Offline cache

---

# 5. Data Catalog

## 5.1 Surah List

### Sumber

```text
public/data/manifest.json + public/data/quran/*.json
```

atau metadata agregat dari file surat individual.

### Used By

- `US-001`
- `getSurahList()` — `services/quran/quran-service.ts`

### Cached In

- In-memory (`quran-service.ts`, `data-loader.ts`)
- Browser HTTP cache (aset statis)

---

## 5.2 Surah Detail

### Sumber

```text
public/data/quran/{id}.json
```

### Used By

- `US-002`
- `getSurah()` — `services/quran/quran-service.ts`

### Cached In

- In-memory per sesi

---

## 5.3 Ayat per Surat

### Sumber

```text
public/data/quran/{id}.json
```

### Used By

- `US-002`
- `US-008`
- `US-010`

### Cached In

- In-memory per sesi (`data-loader.ts`)

---

## 5.4 Word Timings

### Sumber

```text
public/data/quran/{id}.json (field word timings, bila tersedia)
```

### Used By

- `US-005`
- `US-007`

### Cached In

- In-memory; data embedded di file surat JSON

---

## 5.5 Translation

### Sumber

```text
public/data/translations/{lang}/{id}.json
```

### Used By

- `US-003`

### Cached In

- In-memory per sesi

### Notes

- Translation default hidden
- Visibility translation bukan urusan sumber data, tetapi setting lokal

---

## 5.6 Reciter List

### Sumber

```text
data/reciters.json
```

### Used By

- `audio-service.ts` — `getReciters()`
- Pemilihan qari di settings

### Cached In

- Modul in-memory (`audio-service.ts` import JSON)

---

## 5.7 Ayah Audio

### Sumber

```text
CDN audio tilawah (URL via `buildAyahAudioUrl`, reciter id + ayah key)
```

### Used By

- `US-004`
- `US-006`
- `US-007`

### Cached In

- Cache Storage (`hanquran-audio-v1`)

---

# 6. Service Layer Contracts

> **Catatan:** `QuranRepository` / `AudioRepository` Dexie-first **dibatalkan** untuk MVP.
> Implementasi aktif ada di `services/quran/`. Lihat `docs/23-static-dataset-architecture.md`.

## 6.1 Quran Service (`services/quran/quran-service.ts`)

### Responsibilities

- Mengambil daftar surat dari `public/data/quran/*.json`
- Mengambil detail surat + terjemahan
- Mapping response dataset ke shape domain (`app-types.ts`)
- Cache in-memory per sesi

### Methods (implementasi aktual)

```ts
getManifest(): Promise<DatasetManifest>
getSurahList(): Promise<SurahSummary[]>
getSurah(id: string, language?: string): Promise<SurahData>
getSurahSummary(id: string): Promise<SurahSummary>
```

### Loaders (`services/quran/data-loader.ts`)

```ts
loadManifest()
loadSurahFile(surahNumber)
loadTranslationFile(surahNumber, language)
```

---

## 6.2 Audio Service (`services/quran/audio-service.ts`)

### Responsibilities

- Memuat daftar qari dari `data/reciters.json`
- Membangun URL audio tilawah per ayat (`buildAyahAudioUrl`)

### Methods (implementasi aktual)

```ts
getReciters(): Reciter[]
getDefaultReciterId(): string
getReciterById(id: string): Reciter | undefined
buildAyahAudioUrl(reciterId, surahNumber, ayahNumber): string
```

### Notes

- `reciterId` = slug qari pada CDN (mis. `Alafasy_128kbps`)
- Preload / Cache Storage ditangani Phase 5 (Service Worker)

---

# 7. Integration Flow

## 7.1 Surah List Flow

```text
App Start
      │
      ▼
useSurahList()
      │
      ▼
getSurahList()  [services/quran/quran-service.ts]
      │
      ├── Cache in-memory hit? → return
      │
      └── fetch public/data/manifest.json + public/data/quran/{n}.json
              │
              ▼
          map + cache in-memory
              │
              ▼
          return data
```

---

## 7.2 Surah Page Flow

```text
User opens /surah/[id]
      │
      ▼
useSurah(id)
      │
      ▼
getSurah(id, language)
      │
      ├── loadSurahFile(id)     → public/data/quran/{id}.json
      ├── loadTranslationFile → public/data/translations/{lang}/{id}.json
      └── mapSurahToDetail → render
```

---

## 7.3 Highlight Flow

```text
User plays ayah
      │
      ▼
Word timings dari field `words` di public/data/quran/{id}.json
      │
      └── Normalisasi di mapper / Focus Mode (Phase 4)
```

---

## 7.4 Translation Flow

```text
Translation toggle ON (Verse Display Controls)
      │
      ▼
getSurah(id, language) — terjemahan sudah di-merge di mapper
      │
      └── Render jika settings.translationVisible === true
```

---

## 7.5 Audio Flow

```text
User taps play
      │
      ▼
buildAyahAudioUrl(reciterId, surahNumber, ayahNumber)
      │
      ├── Phase 5: Check Cache Storage (SW)
      │     ├── Found → return cached source
      │     └── Missing → stream CDN audio
      │
      └── MVP: stream langsung dari `AYAH_AUDIO_BASE_URL`
```

---

# 8. Caching Strategy

## 8.1 Quran Data

Resource:

- Surahs
- Ayahs
- Translations
- Word timings

Strategy:

```text
In-memory cache (sesi)
+ Browser HTTP cache (aset statis)
+ Service Worker cache (Phase 5)
```

Stored in:

```text
Tidak di IndexedDB — lihat docs/23-static-dataset-architecture.md
```

---

## 8.2 Audio Data

Resource:

- Ayah recitation audio

Strategy:

```text
Cache Storage First
Stream CDN audio if missing
```

Stored in:

```text
Cache Storage
```

---

## 8.3 Static Assets

Strategy:

```text
Cache First (Service Worker)
```

Berlaku untuk file `public/data/*` dan aset aplikasi lainnya.

---

# 9. Normalized Data Contracts

## 9.1 Surah Domain

```ts
interface SurahSummary {
  id: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslation: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
}
```

---

## 9.2 Ayah Domain

```ts
interface Ayah {
  id: string; // 112:1
  surahId: number;
  ayahNumber: number;
  textUthmani: string;
}
```

---

## 9.3 Translation Domain

```ts
interface AyahTranslation {
  id: string;
  surahId: number;
  ayahNumber: number;
  text: string;
  lang: string;
}
```

---

## 9.4 Word Timing Domain

```ts
interface WordTiming {
  id: string; // 112:1
  surahId: number;
  ayahNumber: number;
  segments: [string, number, number][][];
}
```

---

## 9.5 Audio Domain

```ts
interface AudioSource {
  ayahKey: string; // 112:1
  reciterId: string; // Alafasy_128kbps
  url: string;
}
```

---

# 10. Error Handling

## Read Flow

Jika fetch dataset gagal:

```text
Try Dexie cache
      │
      ▼
Cache Available
      │
      ├── Yes -> return cached data
      └── No  -> show error state
```

---

## UI Error Messages

Contoh error yang user-facing:

- `Tidak dapat memuat daftar surat.`
- `Tidak dapat memuat ayat surat ini.`
- `Audio tidak tersedia saat ini.`
- `Terjemahan belum tersedia secara offline.`

Pesan error harus:

- Ringkas
- Jelas
- Tidak menampilkan detail teknis mentah

---

## Logging

Error teknis dapat dicatat untuk debugging internal, tetapi:

- Tidak ditampilkan mentah ke user
- Tidak boleh merusak flow membaca yang sudah memiliki cache

---

# 11. Performance Considerations

## Principles

- Hindari fetch berulang dalam satu sesi (in-memory cache)
- Andalkan browser HTTP cache + Service Worker untuk aset statis
- Gunakan preload ringan hanya untuk ayat berikutnya bila perlu
- Jangan download audio massal secara default di V1

---

## Recommended Behaviors

- Home page muat daftar surat via `getSurahList()` — cache in-memory
- Surah page muat ayat per surat saat dibuka
- Translation hanya di-render saat toggle aktif
- Word timing dari field `words` di JSON surat
- Audio di-stream dari URL `buildAyahAudioUrl()`

---

# 12. Security and Privacy

## Privacy

HanQuran V1 tidak mengirim data akun pengguna karena:

- Tidak ada login
- Tidak ada profile user
- Tidak ada backend aplikasi sendiri

Data lokal seperti favorites, settings, dan last read tetap berada di perangkat user.

---

## Security Considerations

- Validasi shape response sebelum dipakai UI
- Tangani response kosong atau tidak lengkap
- Hindari mengandalkan field opsional tanpa fallback
- Tidak ada secret atau token yang perlu dikelola

---

# 13. Future Extensions

V2+ kemungkinan dapat menambahkan:

- CDN audio mirror tambahan
- Self-hosted dataset mirror
- Background sync
- Bulk audio download manager

Repository abstraction pada V1 **tidak** digunakan untuk konten Quran — service layer `services/quran/` cukup untuk MVP.

---

# 14. Suggested File Mapping

```text
services/
├── quran/
│   ├── quran-service.ts
│   ├── data-loader.ts
│   ├── mappers.ts
│   ├── audio-service.ts
│   ├── app-types.ts
│   └── dataset-types.ts
├── db/
│   └── db.ts          # hanya data pengguna
data/
└── reciters.json
public/
└── data/
    ├── manifest.json
    ├── quran/
    └── translations/
hooks/
├── use-surah-list.ts
├── use-surah.ts
├── use-ayah-audio.ts
└── use-reciters.ts
```

---

# 15. Implementation Checklist

- [x] Dataset statis `public/data/*` tersedia
- [x] `data/reciters.json` tersedia
- [x] Service layer `services/quran/` — loader, mapper, quran-service, audio-service
- [x] Hooks React (`useSurahList`, `useSurah`, `useAyahAudioUrl`, `useReciters`)
- [x] Integrasi CDN audio tilawah untuk playback (`buildAyahAudioUrl`, `AYAH_AUDIO_BASE_URL`)
- [ ] Error boundary & fallback UI untuk kegagalan load data
- [ ] Service Worker caching untuk dataset & audio (Phase 5)

---

Dokumen ini disimpan sebagai `docs/07-api-integration.md`.
