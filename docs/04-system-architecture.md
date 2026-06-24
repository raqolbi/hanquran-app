# System Architecture Document

## HanQuran V1

---

# 1. Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                           BROWSER                             │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                      NEXT.JS PWA APP                          │
│                                                               │
│  App Router                                                   │
│  React Components                                             │
│  TailwindCSS                                                  │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     FEATURE LAYER                             │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐      │
│  │ Quran      │  │ Audio      │  │ Memorization       │      │
│  │ Module     │  │ Module     │  │ Module             │      │
│  └────────────┘  └────────────┘  └────────────────────┘      │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐      │
│  │ Reading    │  │ Settings   │  │ Offline            │      │
│  │ Resume     │  │ Module     │  │ Module             │      │
│  └────────────┘  └────────────┘  └────────────────────┘      │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 VISUAL FOUNDATION LAYER                       │
│                                                               │
│  Color System                                                 │
│  Typography System                                            │
│  Motion System                                                │
│  Child-Friendly Iconography                                   │
│                                                               │
│  CSS Gradients / Patterns                                     │
│  Framer Motion                                                │
│  SVG Illustration                                             │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     ENGINE LAYER                              │
│                                                               │
│  AudioEngine                                                  │
│  RepeatEngine                                                 │
│  HighlightEngine                                              │
│  PlaylistEngine                                               │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                          │
│                                                               │
│  Static Dataset (public/data/*)                               │
│  CDN audio tilawah (eksternal)                                │
│  IndexedDB (Dexie)                                            │
│  Cache Storage                                                │
│  Service Worker                                               │
│  Workbox                                                      │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     LOCAL STORAGE                             │
│                                                               │
│  IndexedDB                                                    │
│   ├─ Settings                                                 │
│   ├─ Last Read                                                │
│   ├─ Favorites                                                │
│   ├─ Surahs                                                   │
│   ├─ Ayahs                                                    │
│   ├─ Translations                                             │
│   ├─ Word Timings                                             │
│   └─ UI Preferences                                           │
│                                                               │
│  Cache Storage                                                │
│   ├─ Audio Files                                              │
│   ├─ API Responses                                            │
│   └─ Static Assets                                            │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                       DATA SOURCES                            │
│                                                               │
│  public/data/quran/{id}.json                                  │
│  public/data/translations/{lang}/{id}.json                      │
│  data/reciters.json                                           │
│  CDN audio tilawah (per ayat)                                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

# 2. Tech Stack Detail

| Layer     | Technology                   | Reason                    |
| --------- | ---------------------------- | ------------------------- |
| Framework | Next.js 15 (App Router)      | SSG, routing, PWA-ready   |
| Language  | TypeScript                   | Type safety               |
| Styling   | TailwindCSS 4                | Utility-first, responsive |
| State     | Zustand                      | Runtime state lintas komponen |
| DB        | Dexie.js (IndexedDB wrapper) | Offline-first storage     |
| Audio     | HTML5 Audio API              | Native, no dependency     |
| Caching   | Workbox (Service Worker)     | PWA offline support       |
| Font      | Uthmani (web font)           | Standar mushaf            |
| Data      | Dataset statis `public/data/*` | Konten Quran & terjemahan |
| Audio     | CDN audio tilawah            | Tilawah per ayat          |
| Hosting   | Vercel / Cloudflare Pages    | Static export friendly    |
| i18n (UI) | next-intl                    | Lokalisasi antarmuka id/en |

> Spesifikasi bahasa aplikasi: `docs/21-i18n-and-locale.md`. Route MVP tetap tanpa prefix locale.

---

# 3. Visual Foundation (V1)

## Overview

HanQuran V1 tetap menargetkan visual yang bagus sejak awal, tetapi visual tersebut diposisikan sebagai enhancement ringan, bukan fitur terpisah yang memperluas scope produk.

Visual Foundation bertugas memberi suasana yang rapi, hangat, dan ramah anak tanpa menambah kompleksitas seperti achievement system, mascot interaktif, atau dunia hafalan yang belum ada di backlog V1.

```text
User
  │
  ▼
Quran Reader + Audio + Repeat
  │
  ▼
Visual Foundation
  │
  ▼
Readable, Calm, Polished Experience
```

---

## V1 Scope

Yang termasuk dalam Visual Foundation V1:

- Tipografi Arab dan Latin yang terasa rapi dan nyaman dibaca
- Warna, spacing, dan hierarchy yang konsisten
- Motion ringan untuk loading, toggle, dan transisi state
- Ikon repeat yang child-friendly
- Decorative background ringan pada halaman non-inti seperti home dan settings

Yang belum termasuk dalam V1:

- Achievement screen khusus
- Mascot interaktif
- Memorization tree
- Sleep mode khusus
- 3D scene berat

---

## Design Principles

### Memorization First

Seluruh elemen visual harus mendukung aktivitas hafalan.

Visual tidak boleh:

- Mengganggu pembacaan ayat
- Mengurangi keterbacaan teks Al-Qur'an
- Mengganggu audio yang sedang diputar

---

### Polished From Day One

Walaupun scope fitur V1 ramping, tampilan tidak boleh terasa seperti prototype.

Target visual V1:

- Bersih
- Tenang
- Hangat
- Ramah anak tanpa terlihat kekanak-kanakan

---

### Optional Enhancement

Jika elemen visual dekoratif gagal dimuat:

```text
HanQuran tetap berfungsi 100%
```

Fitur inti yang harus tetap normal:

- Membaca ayat
- Memutar audio
- Menggunakan repeat
- Membuka fokus hafalan

---

## Usage Rules

Visual Foundation boleh lebih terasa pada:

```text
Home
Settings
Loading / Empty State
Install Prompt
```

Visual Foundation harus minimal pada:

```text
Surah Reader
Focus Mode
Repeat Controls
Ayah List
```

Alasan:

Fitur inti hafalan harus tetap cepat, ringan, dan bebas distraksi.

---

## Technical Direction

V1 memprioritaskan teknik visual yang ringan:

- TailwindCSS
- CSS gradients / subtle patterns
- Framer Motion secukupnya
- SVG / lightweight illustration

Hindari sebagai default V1:

- React Three Fiber
- Three.js
- Lottie besar

Teknologi berat hanya boleh dipertimbangkan nanti jika benar-benar dibutuhkan dan lolos budget performa.

---

## Performance Budget

Visual Foundation harus mematuhi batas berikut:

- Tambahan bundle visual dijaga tetap kecil dan non-blocking
- Tidak memblokir render halaman Al-Qur'an
- Lazy loaded bila aset dekoratif cukup besar
- Dapat dimatikan atau dikurangi pada perangkat lemah
- Tidak mempengaruhi playback audio

---

## Future Expansion

Setelah V1 stabil, Visual Foundation dapat diperluas menjadi Experience Layer yang lebih kaya, misalnya:

- Seasonal theme
- Ramadan theme
- Mascot ringan
- Progress visualization

Prinsipnya tetap sama:

"Memorization First, Visual Second"

---

# 4. Route Design

## Route Overview

HanQuran menggunakan route yang sederhana dan berfokus pada pengalaman membaca serta hafalan Al-Qur'an.

Prinsip desain route:

- Mudah dipahami pengguna
- Mendukung deep linking
- Mendukung resume bacaan terakhir
- Mendukung fokus hafalan per ayat
- Tidak menambahkan route yang belum dibutuhkan pada MVP

---

## Routes

| Route | Description |
|---------|-------------|
| `/` | Daftar 114 surat |
| `/surah/[id]` | Detail surat beserta seluruh ayat |
| `/surah/[id]?ayah=[n]` | Membuka surat dan scroll ke ayat tertentu |
| `/focus/[id]` | Mode hafalan (contoh: `/focus/2?ayah=5`) |
| `/settings` | Pengaturan aplikasi |

---

## Route Details

### Home

```text
/
```

Menampilkan:

- Daftar 114 surat
- Filter `Semua` / `Favorit`
- Lanjutkan bacaan terakhir

---

### Surah Detail

```text
/surah/[id]
```

Contoh:

```text
/surah/112
```

Menampilkan:

- Informasi surat
- Daftar ayat
- Audio player
- Repeat control
- Verse Display Controls (Terjemahan, Transliterasi, Fokus)

---

### Deep Link Ayah

```text
/surah/[id]?ayah=[n]
```

Contoh:

```text
/surah/112?ayah=3
```

Digunakan untuk:

- Scroll ke ayat tertentu
- Resume posisi terakhir
- Share link ayat tertentu

---

### Focus Memorization Mode

```text
/focus/[id]
```

Contoh:

```text
/focus/112
/focus/112?ayah=1
/focus/2?ayah=255
```

Mode khusus hafalan yang menampilkan:

- Ayat ukuran besar (Arab + transliterasi + terjemahan sesuai preferensi aktif)
- Word-by-word highlight
- Audio player minimalis
- Repeat control
- Progress hafalan

> Mode Fokus mempertahankan state Terjemahan dan Transliterasi dari Surah Detail. Lihat `docs/22-verse-display-controls.md`.

---

### Settings

```text
/settings
```

Menampilkan:

- Font size
- Bahasa aplikasi (UI shell)
- Reciter / qari
- High contrast mode
- Cache management
- Offline settings

> Toggle terjemahan dan transliterasi ada di **Verse Display Controls** pada Surah Detail, bukan di `/settings`.

---

## Route Tree

```text
/
│
├── /surah/[id]
│
├── /surah/[id]?ayah=[n]
│
├── /focus/[id]
├── /focus/[id]?ayah=[n]
│
└── /settings
```

---

## Routing Decisions

### Focus Mode Route

Route Focus Mode yang digunakan adalah:

```text
/focus/[id]
```

dengan query opsional:

```text
/focus/[id]?ayah=[n]
```

Surat aktif dibaca dari segmen dinamis `[id]`. Ayat aktif dibaca dari query parameter `?ayah`. Jika `?ayah` tidak ada, mode fokus dimulai dari ayat 1.

Keuntungan:

- Konsisten dengan struktur route `/surah/[id]`
- Mendukung deep linking per surat maupun per ayat
- Mendukung bookmark hafalan
- Mendukung resume session
- File halaman: `app/focus/[id]/page.tsx`

---

## Router Strategy

HanQuran menggunakan Next.js App Router.

Alasan:

### React Server Components

Memungkinkan pre-render halaman yang tidak membutuhkan interaktivitas tinggi.

Contoh:

```text
/
/surah/[id]
```

---

### Client Components Only When Needed

Komponen interaktif menggunakan:

```tsx
'use client'
```

Contoh:

- Audio player
- Repeat control
- Word highlight
- Translation toggle

Hal ini membantu mengurangi ukuran bundle JavaScript.

---

### Nested Layout

Memungkinkan penggunaan layout yang konsisten untuk:

- Header
- Footer
- Navigation
- Settings

Tanpa perlu duplikasi kode pada setiap halaman.

---

### Future Scalability

App Router memudahkan pengembangan fitur di masa depan:

```text
/progress
/review
```

Tanpa perubahan besar pada struktur aplikasi.
---

# 5. Component Tree

```
<RootLayout>
├── <Header>
│   ├── <Logo />
│   ├── <NavLinks />              (Home, Settings)
│   └── <OfflineIndicator />      (status offline)
│
├── <Page>
│   │
│   ├── [Halaman: /]
│   │   └── <SurahListPage>
│   │       ├── <ContinueReadingCard />
│   │       ├── <FilterTabs />    (All, Favorites)
│   │       └── <SurahList>
│   │           └── <SurahCard /> (×114)
│   │               ├── <SurahNumber />
│   │               ├── <SurahName />     (Arab + Latin)
│   │               ├── <SurahMeta />     (ayat, turun)
│   │               └── <FavoriteButton />
│   │
│   ├── [Halaman: /surah/[id]]
│   │   └── <SurahPage>
│   │       ├── <SurahHeader>
│   │       │   ├── <SurahTitle />
│   │       │   ├── <Bismillah />
│   │       │   └── <SurahMeta />
│   │       ├── <VerseDisplayControls>
│   │       │   ├── <TranslationToggle />
│   │       │   ├── <TransliterationToggle />
│   │       │   └── <FocusModeButton />
│   │       ├── <AyahList>
│   │       │   └── <AyahItem /> (×n ayat)
│   │       │       ├── <AyahText />
│   │       │       │   └── <Word /> (×n kata)  ← highlight per kata
│   │       │       ├── <AyahTransliteration /> ← toggle show/hide
│   │       │       ├── <AyahTranslation />     ← toggle show/hide
│   │       │       └── <PlayButton />
│   │       └── <AudioBar>
│   │           ├── <AudioControls />   (play, pause, next, prev)
│   │           ├── <AudioProgress />
│   │           └── <RepeatSelector />
│   │               └── <RepeatOption /> (×6)
│   │
│   ├── [Halaman: /focus/[id]]
│   │   └── <FocusPage>
│   │       ├── <FocusAyah />       ← ayat besar; Arab + transliterasi + terjemahan sesuai settings
│   │       ├── <FocusAudio />      ← kontrol audio minimal
│   │       ├── <FocusRepeat />     ← repeat tetap ada
│   │       └── <FocusProgress />   ← progress hafalan
│   │
│   └── [Halaman: /settings]
│       └── <SettingsPage>
│           ├── <FontSizeSetting />
│           ├── <ContrastSetting />
│           └── <CacheManagement />
│
└── <Footer>
    ├── <NavigationTabs />          (mobile bottom nav)
    └── <AppVersion />
```

---

# 6. Data Flow

## 6.1 Read Flow (Cache First, Background Refresh)

```
User buka /surah/[id]
        │
        ▼
<SurahPage> mount
        │
        ▼
useSurah(id) hook
        │
        ├──► Cek IndexedDB ──► Ada? ──► Render dari cache
        │                              │
        │                              └──► Jika online, refresh di background
        │                                       │
        │                                       └──► Update cache
        │
        └──► Tidak ada? ──► Muat dari public/data/*
                                      │
                                      ▼
                              Simpan ke IndexedDB
                                      │
                                      ▼
                              Render ayat
```

## 6.2 Word Highlight Flow

```
Audio diputar
      │
      ▼
AudioElement.currentTime berubah
      │
      ▼
useHighlight(audioRef, wordTimings)
      │
      ├──► Iterasi wordTimings[]
      │
      ├──► Temukan kata dengan
      │    timestampStart ≤ currentTime ≤ timestampEnd
      │
      └──► Set activeWordIndex = index kata tersebut
                    │
                    ▼
              <Word className={isActive ? 'highlight' : ''} />
```

## 6.3 Repeat Flow

```
User pilih repeat 5x
      │
      ▼
useRepeat(5)
      │
      ├──► repeatCount = 5
      ├──► currentRepeat = 0
      │
      └──► Audio onEnd:
              │
              ├──► currentRepeat++
              ├──► Update counter UI ("4x tersisa")
              │
              ├──► currentRepeat < 5?
              │   └──► Ya ──► replay audio
              │
              └──► currentRepeat = 5?
                  └──► Ya ──► stop, lanjut ayat berikutnya
```

## 6.4 Offline Cache Flow

```
Pertama kali data di-fetch:
      │
      ▼
CacheManager.save(type, data)
      │
      ├──► Surah metadata  ──► IndexedDB.tables.surahs
      ├──► Ayah data        ──► IndexedDB.tables.ayahs
      ├──► Word timings     ──► IndexedDB.tables.timings
      ├──► Translation      ──► IndexedDB.tables.translations
      └──► Audio blob       ──► Cache Storage (via SW)

Saat offline dan data diminta:
      │
      ▼
Service Worker intercept fetch
      │
      └──► Return from Cache Storage (audio)

IndexedDB read:
      │
      └──► dexie.surahs.get(id)  ← langsung dari lokal
```

---

# 7. Audio Architecture

## Overview

Audio merupakan fitur inti HanQuran.

Karena itu logika audio tidak ditempatkan langsung di React Components maupun React Context.

Sebagai gantinya HanQuran menggunakan pendekatan Engine-Based Architecture.

Tujuan:

- Memisahkan business logic dari UI
- Memudahkan testing
- Mendukung fitur hafalan yang kompleks
- Memudahkan pengembangan di masa depan

---

## Architecture

```text
UI Components
      │
      ▼
Custom Hooks
      │
      ▼
Audio Engines
      │
      ▼
HTML Audio API
```

Contoh:

```text
<AudioBar />
      │
      ▼
useAudio()
      │
      ▼
AudioEngine
      │
      ▼
HTMLAudioElement
```

---

## Audio Engines

### AudioEngine

Bertanggung jawab atas playback audio.

Responsibilities:

- Play
- Pause
- Resume
- Stop
- Seek
- Playback Speed
- Audio State

---

### RepeatEngine

Bertanggung jawab atas pengulangan audio.

Responsibilities:

- Repeat 1x
- Repeat 5x
- Repeat 10x
- Repeat 25x
- Repeat 50x
- Infinite Repeat

State:

```ts
interface RepeatState {
  target: number | 'infinite';
  completed: number;
}
```

---

### HighlightEngine

Bertanggung jawab atas sinkronisasi audio dan kata.

Responsibilities:

- Membaca word timings
- Menentukan kata aktif
- Mengirim activeWordIndex ke UI

Flow:

```text
currentTime
      │
      ▼
wordTimings
      │
      ▼
activeWordIndex
      │
      ▼
Highlight UI
```

---

### PlaylistEngine

Digunakan untuk navigasi audio.

Responsibilities:

- Next Ayah
- Previous Ayah
- Auto Continue
- Murojaah Playlist (future)

---

## Hooks Layer

Engine tidak diakses langsung oleh UI.

Melainkan melalui hooks.

```text
useAudio()
useRepeat()
useHighlight()
```

Contoh:

```tsx
const {
  play,
  pause,
  currentTime,
  isPlaying
} = useAudio();
```

---

## Why Not Store Everything In Context?

Karena sebagian besar state audio bersifat sementara.

Contoh:

```text
currentTime
remainingRepeat
activeWord
playlistPosition
```

State tersebut lebih tepat dikelola oleh engine.

Daripada menyebabkan re-render global melalui Context.

---

## Future Extensions

Audio Architecture dirancang agar dapat mendukung:

- Multiple Reciters
- Audio Download
- Sleep Timer
- Murojaah Playlist
- Voice Recording
- AI Recitation Validation

Tanpa mengubah struktur dasar sistem audio.

---

# 8. State Management

## Overview

HanQuran menggunakan arsitektur state berlapis yang memisahkan tanggung jawab secara ketat.

Lihat `docs/15-state-management.md` untuk spesifikasi lengkap. Dokumen ini hanya memberikan gambaran arsitektur.

---

## Lima Lapisan State

| # | Lapisan | Teknologi | Penggunaan |
|---|---------|-----------|------------|
| 1 | Runtime State | **Zustand** | State client yang sering berubah, diakses lintas komponen |
| 2 | Persistent State | **Dexie** (IndexedDB) | Preferensi, favorit, progress hafalan, manifest cache |
| 3 | Audio Files | Cache Storage | File audio biner dikelola Service Worker |
| 4 | Route State | URL Parameter | Surat aktif, ayat aktif |
| 5 | Temporary UI State | React Local State | State ephemeral satu komponen |

---

## Zustand Stores (Runtime)

HanQuran menggunakan empat store Zustand resmi:

```text
useAudioStore    → isPlaying, currentTrack, currentTime, duration
useRepeatStore   → config (persisten), cycleIndex, isActive (runtime)
useUserStore     → favorites, qari, textSize, showTranslation, lastViewed (persisten)
useOfflineStore  → connectionStatus, downloadStatuses, manifestSummary
```

---

## Dexie (Persistent State)

Data persisten disimpan di IndexedDB melalui Dexie:

```text
settings           → preferensi UI pengguna
favorites          → surat favorit
bookmarks          → penanda ayat
last_read          → posisi terakhir dibaca
memorization_progress → progress hafalan per surat
download_manifest  → manifest audio yang sudah diunduh
surahs, ayahs, translations → cache data Quran
```

Lihat `docs/06-database-schema.md` untuk skema lengkap.

---

## Engine Managed State

State operasional dikelola langsung oleh engine, bukan store.

### AudioEngine
```text
currentTime, duration, playbackRate, bufferState
```

### RepeatEngine
```text
repeatTarget, repeatCompleted, remainingRepeat
```

### HighlightEngine
```text
activeWordIndex, activeSegment
```

### PlaylistEngine
```text
queue, currentTrack, playlistPosition
```

---

## Service Layer (Konten Quran)

Akses konten Quran mengikuti Static Dataset Architecture (`docs/23-static-dataset-architecture.md`):

```text
UI
↓
React Hooks
↓
services/quran/
↓
public/data/*
```

## Dexie (Data Pengguna)

```text
UI
↓
Store (Zustand)
↓
Dexie
```

Komponen tidak boleh mengakses Dexie atau `public/data/` secara langsung.

---

## Data Ownership

```text
UI Components       → props / Zustand selector
Zustand Stores      → runtime state
Dexie               → persistent state
Cache Storage       → audio files biner
URL Parameter       → surat & ayat aktif
Engine Layer        → operational state
```

---

# 9. IndexedDB Schema (Dexie)

```ts
//
// Quran Domain
//

interface SurahRecord {
  id: number;

  nameArabic: string;

  nameLatin: string;

  nameTranslation: string;

  versesCount: number;

  revelationPlace: "makkah" | "madinah";

  cachedAt: number;
}

interface AyahRecord {
  id: string; // 112:1

  surahId: number;

  ayahNumber: number;

  textUthmani: string;

  cachedAt: number;
}

interface TranslationRecord {
  id: string;

  surahId: number;

  ayahNumber: number;

  resourceId: number;

  text: string;

  cachedAt: number;
}

//
// Audio Domain
//

interface WordTimingRecord {
  id: string;

  surahId: number;

  ayahNumber: number;

  segments: [string, number, number][][];

  cachedAt: number;
}

interface AudioCacheRecord {
  id: string;

  surahId: number;

  ayahNumber: number;

  reciterId: number;

  url: string;

  cachedAt: number;

  size: number;
}

interface FavoriteRecord {
  surahId: number;

  createdAt: number;
}

interface LastReadRecord {
  surahId: number;

  ayahNumber: number;

  updatedAt: number;
}

interface SettingsRecord {
  fontSize: number;

  translationVisible: boolean;

  transliterationVisible: boolean;

  contrastMode: "default" | "high";

  updatedAt: number;
}
```

> `translationVisible` dan `transliterationVisible` dikontrol dari Verse Display Controls — lihat `docs/22-verse-display-controls.md`.

---

# 10. Offline & Service Worker Strategy

## Overview

HanQuran menggunakan pendekatan Offline First.

Tujuan utama:

- Hafalan tetap dapat dilakukan tanpa internet
- Audio yang pernah diputar tetap tersedia
- Pengalaman pengguna tetap konsisten pada jaringan lambat

Service Worker berfungsi sebagai lapisan cache dan sinkronisasi antara aplikasi, Cache Storage, dan sumber data eksternal (CDN audio tilawah).

---

## Caching Strategy

HanQuran menggunakan strategi cache yang berbeda untuk setiap jenis data.

| Resource Type | Strategy | Reason |
|--------------|----------|---------|
| Static Assets | Cache First | Jarang berubah |
| Quran Metadata | Cache First | Mengutamakan akses cepat dan offline |
| Ayah Content | Cache First | Data sangat stabil |
| Word Timings | Cache First | Data tidak berubah |
| Audio Files | Cache First | Mengutamakan pengalaman offline |
| Translation | Cache First | Data relatif stabil |
| Images & Icons | Cache First | Aset statis |

---

## Static Assets

Resource:

```text
JS
CSS
Fonts
Manifest
Icons
```

Strategy:

```text
Cache First
```

Assets diprecache saat Service Worker pertama kali diinstal.

---

## Quran Data

Resource:

```text
Surahs
Ayahs
Translations
Word Timings
```

Strategy:

```text
Cache First
Optional Background Refresh
```

Flow:

```text
Cache tersedia
      │
      └── Gunakan cache

Cache tidak tersedia
      │
      └── Ambil dari public/data/*
```

---

## Audio Files

Resource:

```text
Recitation Audio
```

Strategy:

```text
Cache First
```

Flow:

```text
Audio tersedia di cache
      │
      └── Putar langsung

Audio belum tersedia
      │
      └── Download
              │
              ├── Simpan ke Cache Storage
              └── Putar audio
```

---

## Cache Limits

Untuk menghindari penggunaan storage berlebihan.

### Static Assets

```text
30 MB
```

---

### API Responses

```text
20 MB
```

---

### Audio Files

```text
250 MB
```

Saat batas tercapai:

```text
Least Recently Used (LRU)
```

akan menghapus audio yang paling lama tidak digunakan.

---

## Service Worker Lifecycle

### Install

Saat Service Worker dipasang:

```text
Precache Static Assets
```

Contoh:

```text
JS
CSS
Fonts
Icons
Manifest
```

---

### Activate

Saat versi baru aktif:

```text
Membersihkan cache lama
Migrasi cache jika diperlukan
```

---

### Fetch

Setiap request akan dicek berdasarkan jenis resource.

```text
Static Assets
      ↓
Cache First

Quran Data
      ↓
Cache First + Background Refresh

Audio Files
      ↓
Cache First

Unknown Requests
      ↓
Network First
```

---

## Offline Behaviour

Saat perangkat offline:

### Supported

```text
Surah yang sudah pernah dibuka
Ayat yang sudah tersimpan
Audio yang sudah pernah diputar
Word Timings yang sudah tersimpan
Translation yang sudah tersimpan
```

---

### Not Supported

```text
Data yang belum pernah diunduh
Audio yang belum pernah dicache
```

---

## Future Enhancements

V2+

```text
Background Audio Download
Download Entire Surah
Download Entire Juz
Smart Cache Management
Offline Download Manager
```

---

## Technical Implementation

Technology:

```text
Workbox
Service Worker API
Cache Storage API
IndexedDB (Dexie)
```

Service Worker merupakan bagian dari Infrastructure Layer dan tidak memiliki business logic terkait hafalan.

---

# 11. Data Integration

## Overview

HanQuran menggunakan **dataset statis** (`public/data/*`) sebagai sumber konten Al-Qur'an dan **CDN audio tilawah** (`AYAH_AUDIO_BASE_URL`) untuk playback.

Data yang digunakan:

- Surah
- Ayah
- Word Data
- Word Timings
- Translation
- Recitation Audio
- Reciters (`data/reciters.json`)

Integrasi dilakukan melalui Infrastructure Layer dan tidak diakses langsung oleh UI Components.

---

## Architecture

```text
UI Components
      │
      ▼
React Hooks
      │
      ▼
services/quran/
      │
      ▼
public/data/*
```

Contoh:

```text
SurahPage
      │
      ▼
useSurah()
      │
      ▼
quran-service.ts
      │
      ▼
public/data/*
```

> Keputusan MVP: **bukan** `QuranRepository` Dexie-first. Lihat `docs/23-static-dataset-architecture.md`.

---

## Data Layer — Konten Quran

```text
services/quran/
├── quran-service.ts
├── data-loader.ts
├── mappers.ts
└── audio-service.ts
```

---

## Data Layer — Data Pengguna

```text
stores/
├── userStore.ts      → Dexie: settings, favorites, lastRead
├── repeatStore.ts    → Dexie: settings.repeatConfig
└── offlineStore.ts   → Dexie: downloadManifest
```

---

## Data Retrieval Flow (Konten Quran)

```text
Hook (useSurah, useSurahList)
      │
      ▼
services/quran/
      │
      ├── In-memory cache hit → return
      │
      └── fetch public/data/*
              │
              ▼
         Return data
```

---

## Caching Strategy

HanQuran menggunakan cache sebelum memuat dari dataset statis.

Flow:

```text
Request Data
      │
      ▼
Check IndexedDB
      │
      ├── Found
      │       ▼
      │   Return Cache
      │
      └── Not Found
              ▼
        Fetch API
              ▼
        Save Cache
              ▼
         Return Data
```

Tujuan:

- Mengurangi penggunaan bandwidth
- Mempercepat loading
- Mendukung offline mode

---

## API Endpoints

### Quran Metadata

| Endpoint | Purpose |
|----------|----------|
| `/v4/chapters` | Daftar surat |
| `/v4/chapters/{id}` | Detail surat |
| `/v4/verses/by_chapter/{id}` | Ayat dalam surat |

---

### Word Data

| Endpoint | Purpose |
|----------|----------|
| `/v4/verses/by_chapter/{id}?words=true` | Data kata per kata |

---

### Translation

| Endpoint | Purpose |
|----------|----------|
| `/v4/quran/translations/{resource}` | Terjemahan |

---

### Recitation

| Endpoint | Purpose |
|----------|----------|
| `/v4/resources/recitations` | Daftar qari |
| `/v4/chapter_recitations/{reciter}/{chapter}` | Audio surat |
| `/v4/recitations/{reciter}/by_ayah/{ayah}` | Audio ayat |

---

## Error Handling

Jika request gagal:

```text
Try Cache
      │
      ▼
Cache Available
      │
      ▼
Return Cached Data
```

Jika cache tidak tersedia:

```text
Show Error State
```

Contoh:

```text
Tidak dapat memuat surat.
Periksa koneksi internet Anda.
```

---

## Future Enhancements

V2+

```text
Multiple Quran Providers
CDN Audio Mirror
Self Hosted API Proxy
Background Sync
```

Dengan pendekatan repository, perubahan provider API tidak akan mempengaruhi Feature Layer.

---

# 12. Folder Structure

## Overview

HanQuran menggunakan struktur folder yang bersih dan scalable, sesuai dengan implementasi aktual di `hanquran-app/`. Lihat `docs/16-folder-structure.md` untuk spesifikasi lengkap.

---

## Project Structure

```text
hanquran-app/
│
├── app/                        ← Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── surah/[id]/page.tsx
│   ├── focus/[id]/page.tsx     ← Focus Mode: /focus/[id]?ayah=[n]
│   └── settings/page.tsx
│
├── components/
│   ├── ui/                     ← primitives (Button, Dialog, Drawer, Select, Switch)
│   ├── shared/                 ← brand + utilities (Logo, Header, OfflineBadge)
│   ├── screens/                ← screen-level components
│   └── atoms/                  ← sangat kecil, opsional
│
├── lib/                        ← utilities, data providers, route helpers
│
├── hooks/                      ← custom React hooks (useMediaQuery, useAudio)
│
├── services/
│   ├── audio-controller.ts     ← jembatan HTMLAudioElement ↔ useAudioStore
│   ├── download-manager.ts     ← unduh audio ke Cache Storage
│   ├── db/                     ← Dexie — data pengguna saja
│   │   ├── db.ts
│   │   └── migrations.ts
│   ├── quran/                  ← Static Dataset service layer
│   │   ├── quran-service.ts
│   │   ├── data-loader.ts
│   │   └── audio-service.ts
│   └── sw/                     ← Service Worker (Workbox)
│       └── service-worker.js
│
├── stores/                     ← Zustand stores
│   ├── audioStore.ts
│   ├── userStore.ts
│   ├── repeatStore.ts
│   └── offlineStore.ts
│
├── types/                      ← shared TypeScript interfaces
│
├── public/
│   ├── branding/
│   ├── icons/
│   └── fonts/
│
├── styles/                     ← Tailwind config, global CSS
│
└── tests/                      ← unit & integration tests
```

---

## Architecture Rules

### Static Dataset + Service Layer

Konten Quran: `UI → hooks → services/quran/ → public/data/*`

Data pengguna: `UI → Store → Dexie`

Komponen tidak boleh memanggil `fetch('/data/...')` atau Dexie secara langsung.

---

### Store Layer

State global dikelola oleh Zustand stores di `stores/`. Persistensi dilakukan melalui Dexie secara langsung dari action store.

---

### Service Layer

Semua akses ke platform (audio, cache, database) melewati `services/`:

```text
services/audio-controller.ts    → HTMLAudioElement
services/download-manager.ts   → Cache Storage via SW
services/db/                   → Dexie (IndexedDB)
services/api/                  → Repository (public/data/*, CDN audio)
services/sw/                   → Service Worker
i18n/ + messages/              → next-intl (UI locale id/en)
```

### Internationalization Layer

Lokalisasi **hanya untuk shell UI aplikasi** — bukan konten Quran.

```text
settings.appLocale (Dexie)
        │
        ▼
next-intl provider (layout)
        │
        ▼
useTranslations() di komponen
```

- First launch: `i18n/detection.ts` (browser locale + timezone)
- Setelah itu: `settings.appLocale` adalah sumber kebenaran
- Detail: `docs/21-i18n-and-locale.md`

---

### Component Layer

Komponen dibagi berdasarkan tanggung jawab:

```text
components/ui/       → primitives tanpa domain logic
components/shared/   → brand + shared utilities
components/screens/  → screen-level, boleh pakai stores
```

---

# 13. Build & Deployment

## Overview

HanQuran dirancang sebagai Progressive Web Application (PWA) yang mengutamakan:

- Fast First Load
- Offline First
- Global CDN Compatibility
- Self Hosting Support
- Open Source Deployment Flexibility

Deployment harus dapat berjalan pada:

- Vercel
- Cloudflare
- Self Hosted Server
- Docker Environment

tanpa perubahan kode aplikasi.

---

## Build Strategy

HanQuran menggunakan Next.js App Router dengan pendekatan Hybrid Rendering.

### Static Rendering (Preferred)

Digunakan untuk halaman yang jarang berubah.

Contoh:

```text
/
/surah/[id]
```

Strategy:

```text
Static Generation (SSG)
```

Keuntungan:

- Cepat
- SEO friendly
- Cocok untuk CDN

---

### Client Side Features

Digunakan untuk fitur interaktif.

Contoh:

```text
Audio Playback
Repeat Mode
Word Highlight
Favorites
Offline Cache
Settings
```

Semua fitur tersebut berjalan sepenuhnya di browser.

---

### Server Side Rendering

Saat ini tidak menjadi kebutuhan utama.

Status:

```text
Not Required for V1
```

Karena mayoritas data berasal dari:

```text
public/data/*
```

dan disimpan secara lokal menggunakan IndexedDB.

---

## Deployment Architecture

```text
User Browser
      │
      ▼
HanQuran PWA
      │
      ├── IndexedDB
      ├── Cache Storage
      └── Service Worker
      │
      ▼
public/data/* + CDN audio tilawah
```

HanQuran tidak membutuhkan backend sendiri pada V1.

---

## Development Environment

```bash
npm install

npm run dev
```

Environment:

```text
localhost:3000
```

Data source:

```text
public/data/* (konten) + CDN audio (tilawah)
```

---

## Production Build

```bash
npm run build
```

Output:

```text
Optimized Next.js Application
```

Target:

```text
PWA Ready
Production Ready
```

---

## Deployment Targets

### Vercel

Advantages:

- Setup sangat cepat
- Integrasi Next.js terbaik
- Preview Deployment

Suitable for:

```text
Demo
Testing
Community Preview
```

---

### Cloudflare Pages

Advantages:

- CDN global
- Free tier besar
- Performa tinggi

Suitable for:

```text
Public Production
```

---

### Self Hosted

Advantages:

- Kontrol penuh
- Tanpa vendor lock-in
- Cocok untuk komunitas dan organisasi

Suitable for:

```text
Pesantren
Sekolah
Organisasi Islam
```

Deployment:

```text
Docker
Nginx
Node.js Runtime
```

---

## Docker Deployment

Reference Architecture:

```text
Internet
    │
    ▼
Nginx
    │
    ▼
HanQuran Container
```

Container bertanggung jawab untuk:

```text
Next.js Runtime
PWA Assets
Service Worker
```

---

## Environment Variables

MVP tidak memerlukan environment variable untuk sumber data Quran. Konten disajikan dari `public/data/*`; audio dari CDN tilawah (`audio-config.ts`); qari dari `data/reciters.json`.

Lihat `docs/07-api-integration.md` untuk detail arsitektur data.

---

## Future Architecture

Jika diperlukan pada V2/V3:

```text
User Browser
      │
      ▼
HanQuran API (opsional)
      │
      ▼
CDN / dataset mirror
```

Kemungkinan penggunaan:

- Rate limiting
- Analytics
- Cloud Sync
- Family Profiles
- AI Murajaah

Status:

```text
Future Consideration
Not Included in V1
```

---

## Deployment Philosophy

HanQuran harus tetap dapat dijalankan oleh siapa pun dengan:

```text
Git Clone
↓
npm install
↓
npm run build
↓
Deploy
```

tanpa ketergantungan pada layanan proprietary tertentu.

---

# 14. Performance Strategy

## Overview

Performance merupakan salah satu prinsip utama HanQuran.

Target utama:

- Aplikasi dapat digunakan pada perangkat kelas menengah ke bawah
- Tetap nyaman digunakan pada jaringan lambat
- Tetap responsif saat audio diputar
- Tetap berjalan saat offline

Prinsip:

```text
Fast First Load
Fast Interaction
Offline First
Battery Friendly
```

---

## Performance Targets

| Metric | Target |
|----------|----------|
| First Contentful Paint (FCP) | < 2s |
| Largest Contentful Paint (LCP) | < 3s |
| Time To Interactive (TTI) | < 3s |
| Lighthouse Performance | ≥ 90 |
| Lighthouse PWA | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |

---

## Rendering Strategy

### Home Page

```text
/
```

Strategy:

```text
Static Generation (SSG)
```

Reason:

- Daftar surat jarang berubah
- Cocok untuk CDN
- Mempercepat first load

---

### Surah Page

```text
/surah/[id]
```

Strategy:

```text
Static Generation + Client Hydration
```

Reason:

- Data surat relatif statis
- Audio dan interaksi berjalan di client

---

### Focus Mode

```text
/focus/[id]
```

Strategy:

```text
Client Side Interactive
```

Reason:

- Audio playback
- Word highlight
- Repeat engine

memerlukan state real-time.

---

## Bundle Optimization

### Dynamic Imports

Komponen berat harus dimuat secara lazy.

Contoh:

```text
Audio Player
Decorative Visual Assets
Large Illustration Packs
```

Menggunakan:

```ts
dynamic(() => import(...))
```

---

### Visual Foundation Isolation

Seluruh komponen visual tambahan harus dipisahkan dari fitur inti.

Contoh:

```text
Background Gradient
Illustration Layer
Decorative Motion
```

Tidak boleh masuk bundle awal halaman Al-Qur'an.

---

## Audio Performance

Audio merupakan fitur paling kritikal.

### Preload Strategy

Saat ayat diputar:

```text
Current Ayah
      │
      ▼
Preload Next Ayah
```

Tujuan:

- Mengurangi jeda antar ayat
- Meningkatkan pengalaman repeat

---

### Cache Strategy

Audio yang pernah diputar:

```text
Cache Storage
```

akan digunakan kembali tanpa download ulang.

---

## Data Loading Strategy

HanQuran menggunakan Progressive Loading.

### Initial Load

```text
Surah
Ayah
```

---

### On Demand

```text
Audio
Word Timing
Translation
```

baru dimuat ketika dibutuhkan.

---

## Scrolling Performance

Virtual scrolling tidak digunakan pada V1.

Alasan:

```text
Surat terpanjang:
286 ayat
```

masih dapat ditangani dengan baik oleh browser modern.

Menjaga implementasi tetap sederhana lebih penting dibanding optimasi prematur.

---

## Offline Performance

Prioritas cache:

```text
Ayah Data
↓
Word Timing
↓
Audio
↓
Translation
```

Tujuan:

- Surat tetap dapat dibuka tanpa internet
- Hafalan tetap dapat berjalan saat offline

---

## Mobile Performance

HanQuran dioptimalkan untuk:

```text
Android
iPhone
Tablet
```

Target minimum:

```text
RAM 3 GB
CPU Mid Range
```

---

## Battery Efficiency

HanQuran harus tetap hemat baterai.

### Rules

Decorative assets:

```text
Lazy Load
```

---

Animations:

```text
Pause When Hidden
```

---

Audio:

```text
Single Audio Instance
```

---

Background Tasks:

```text
Minimize CPU Usage
```

---

## Future Optimization

V2+

```text
Audio Download Manager
Background Prefetch
Predictive Caching
Smart Offline Mode
Adaptive Quality Audio
```

Status:

```text
Not Required For V1
```
---

## Next Steps

- [x] 05-module-catalog.md
- [x] 06-database-schema.md
- [x] 07-api-integration.md
- [x] 08-ui-ux-wireframe.md
