# API Integration

## HanQuran V1

---

# 1. Overview

HanQuran V1 menggunakan **dataset statis** untuk konten Al-Qur'an dan **EveryAyah** untuk audio tilawah.

Dokumen ini mendefinisikan:

- Sumber data yang digunakan
- Struktur dataset statis
- Kontrak repository
- Strategi fetch dan cache
- Error handling

HanQuran V1 tidak menggunakan backend sendiri dan **tidak memerlukan autentikasi OAuth**.

Integrasi berjalan langsung dari browser melalui:

- Dataset statis (`public/data/*`)
- EveryAyah CDN (audio)
- `data/reciters.json` (metadata qari)
- IndexedDB (Dexie)
- Cache Storage
- Service Worker

---

# 2. Integration Principles

## Static Dataset First

V1 menggunakan dataset yang dihasilkan sebelumnya dan disajikan sebagai aset statis:

```text
public/data/*
```

Ini menjaga implementasi tetap sederhana, offline-friendly, dan tanpa ketergantungan API eksternal untuk konten Quran.

---

## Local First

HanQuran menggunakan prinsip **Local First**, bukan Network First.

Setelah data tersimpan secara lokal di Dexie:

```text
Baca dari Dexie terlebih dahulu
↓
Hanya muat dari public/data/* jika data TIDAK ditemukan di lokal
```

Aplikasi **tidak boleh** memuat ulang seluruh dataset setiap kali dibuka.

---

## Repository First

Feature layer tidak boleh memanggil `fetch()` langsung ke sumber data.

Semua akses data harus melalui Repository Layer:

```text
UI
↓
Store (Zustand)
↓
Repository
↓
Dexie (IndexedDB)
↓
public/data/* (fallback)
```

Komponen tidak boleh mengakses Dexie atau sumber data secara langsung.

---

## Cache First

Untuk data Quran yang stabil:

```text
Dexie First
+ Fallback ke public/data/*
```

Untuk audio:

```text
Cache Storage First
+ Stream dari EveryAyah jika belum ada
```

---

## Offline Friendly

Jika data sudah pernah diambil sebelumnya, aplikasi harus tetap dapat bekerja tanpa koneksi internet.

Dexie memastikan data Quran tersedia offline setelah pertama kali dimuat.

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

## 3.2 Audio — EveryAyah

### Provider

```text
EveryAyah CDN
```

Audio tilawah per ayat di-stream dari EveryAyah. URL dibangun berdasarkan ID qari dari `data/reciters.json` dan kunci ayat (`surahId:ayahNumber`).

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

Berisi daftar qari yang didukung: `id` (slug EveryAyah), `name` (nama tampilan).

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
- `QuranRepository.getSurahList()`

### Cached In

- IndexedDB table `surahs`

---

## 5.2 Surah Detail

### Sumber

```text
public/data/quran/{id}.json
```

### Used By

- `US-002`
- `QuranRepository.getSurahDetail(id)`

### Cached In

- IndexedDB table `surahs`

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

- IndexedDB table `ayahs`

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

- IndexedDB table `wordTimings`

---

## 5.5 Translation

### Sumber

```text
public/data/translations/{lang}/{id}.json
```

### Used By

- `US-003`

### Cached In

- IndexedDB table `translations`

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

- Audio repository bootstrap
- Pemilihan qari di settings

### Cached In

- IndexedDB table `reciters`

---

## 5.7 Ayah Audio

### Sumber

```text
EveryAyah CDN (URL dibangun dari reciter id + ayah key)
```

### Used By

- `US-004`
- `US-006`
- `US-007`

### Cached In

- Cache Storage (`hanquran-audio-v1`)

---

# 6. Repository Contracts

## 6.1 QuranRepository

### Responsibilities

- Mengambil daftar surat
- Mengambil detail surat
- Mengambil ayat per surat
- Mengambil data kata per kata
- Mengambil terjemahan
- Melakukan mapping response dataset ke shape domain lokal
- Menyimpan hasil ke IndexedDB

### Suggested Methods

```ts
interface QuranRepository {
  getSurahList(): Promise<SurahRecord[]>;
  getSurahDetail(id: number): Promise<SurahRecord>;
  getSurahAyahs(id: number): Promise<AyahRecord[]>;
  getWordTimings(id: number): Promise<WordTimingRecord[]>;
  getTranslations(lang: string, surahId: number): Promise<TranslationRecord[]>;
}
```

---

## 6.2 AudioRepository

### Responsibilities

- Memuat daftar qari dari `data/reciters.json`
- Membangun URL audio EveryAyah per ayat
- Mengembalikan source audio yang siap diputar
- Menyimpan audio ke Cache Storage

### Suggested Methods

```ts
interface AudioRepository {
  getAvailableReciters(): Promise<ReciterSummary[]>;
  getAyahAudio(reciterId: string, ayahKey: string): Promise<AudioSource>;
  warmAyahAudio(reciterId: string, ayahKey: string): Promise<void>;
}
```

### Notes

- `ayahKey` dapat berbentuk `2:255`
- `reciterId` mengacu pada slug EveryAyah (mis. `Alafasy_128kbps`)
- `warmAyahAudio()` berguna untuk preload ringan ayat berikutnya

---

# 7. Integration Flow

## 7.1 Surah List Flow (Local First)

```text
App Start
      │
      ▼
useSurahList()
      │
      ▼
QuranRepository.getSurahList()
      │
      ▼
Dexie.surahs.count() > 0 ?
      │
      ├── Ya  → return dari Dexie (tanpa fetch)
      │
      └── Tidak → fetch public/data/quran/*.json
                      │
                      ▼
                  Simpan ke Dexie.surahs
                      │
                      ▼
                  return data
```

Setelah tersimpan, Home Screen berjalan **tanpa fetch ulang** pada kunjungan berikutnya.

---

## 7.2 Surah Page Flow (Local First)

```text
User opens /surah/[id]
      │
      ▼
useSurah(id)
      │
      ▼
QuranRepository.getSurahAyahs(id)
      │
      ▼
Dexie.ayahs.where('surahId').equals(id).count() > 0 ?
      │
      ├── Ya  → render dari Dexie (tanpa fetch)
      │
      └── Tidak → fetch public/data/quran/{id}.json
                      │
                      ▼
                  Simpan ke Dexie.ayahs
                      │
                      ▼
                  render data
```

---

## 7.3 Highlight Flow

```text
User plays ayah
      │
      ▼
useHighlight(surahId, ayahNumber)
      │
      ▼
QuranRepository.getWordTimings(surahId)
      │
      ├── Check IndexedDB.wordTimings
      ├── Load from public/data if missing
      └── Return normalized timing segments
```

---

## 7.4 Translation Flow

```text
Translation toggle ON
      │
      ▼
useTranslations(surahId)
      │
      ▼
QuranRepository.getTranslations(lang, surahId)
      │
      ├── Check IndexedDB.translations
      ├── Load from public/data/translations/{lang}/{id}.json if missing
      └── Return translation data
```

---

## 7.5 Audio Flow

```text
User taps play
      │
      ▼
useAudio()
      │
      ▼
AudioRepository.getAyahAudio(reciterId, ayahKey)
      │
      ├── Check Cache Storage
      │     ├── Found -> return cached source
      │     └── Missing -> stream from EveryAyah CDN
      │
      └── Save to Cache Storage
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
Dexie First
Fallback public/data/*
```

Stored in:

```text
IndexedDB
```

---

## 8.2 Audio Data

Resource:

- Ayah recitation audio

Strategy:

```text
Cache Storage First
Stream EveryAyah if missing
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

- Hindari fetch berulang untuk data yang stabil
- Gunakan IndexedDB sebagai read source utama setelah data tersedia
- Gunakan preload ringan hanya untuk ayat berikutnya bila perlu
- Jangan download audio massal secara default di V1

---

## Recommended Behaviors

- Home page muat daftar surat sekali lalu cache di Dexie
- Surah page muat ayat per surat saat dibuka
- Translation hanya diambil saat dibutuhkan
- Word timing hanya diambil saat diperlukan untuk playback/highlight
- Audio hanya di-stream saat user play atau saat preload ringan

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

Repository abstraction pada V1 disiapkan agar ekspansi tersebut tidak memaksa perubahan besar di feature layer.

---

# 14. Suggested File Mapping

```text
services/
├── api/
│   ├── QuranRepository.ts
│   ├── AudioRepository.ts
│   ├── dataLoader.ts
│   └── mappers/
│       ├── surahMapper.ts
│       ├── ayahMapper.ts
│       └── translationMapper.ts
├── db/
│   └── ...
data/
└── reciters.json
public/
└── data/
    ├── manifest.json
    ├── quran/
    └── translations/
```

---

# 15. Implementation Checklist

- [x] Dataset statis `public/data/*` tersedia
- [x] `data/reciters.json` tersedia
- [ ] Implementasi Repository Layer (Local First)
- [ ] Integrasi EveryAyah untuk audio playback
- [ ] Error boundary & fallback UI untuk kegagalan load data
- [ ] Service Worker caching untuk dataset & audio (Phase 5)

---

Dokumen ini disimpan sebagai `docs/07-api-integration.md`.
