# System Architecture Document

## HanQuran V1

**Terakhir disinkronkan dengan kode:** 2 November 2026 (versi `0.6.0`).

> **Cara membaca dokumen ini.** Dokumen ini ditulis sebagai arsitektur **rancangan** V1. Sejak itu beberapa keputusan berubah (dataset statis, Service Worker manual, SSG, Android). Bagian **0** di bawah adalah ringkasan arsitektur **aktual** dan berlaku bila ada perbedaan dengan bagian lain. Bagian yang sudah tidak berlaku diberi tanda dan dialihkan ke dokumen yang benar.

---

# 0. Ringkasan Arsitektur Aktual

| Area | Implementasi saat ini | Dokumen acuan |
|------|------------------------|---------------|
| Framework | Next.js **16** App Router, React 19, TypeScript, Tailwind CSS v4 | `package.json` |
| Rendering | Beranda & Surah Detail **SSG** (server component + seed ke client component); Mode Fokus & Pengaturan client page | `docs/35`, `docs/36` |
| Konten Qur'an | Dataset statis `public/data/*` via `services/quran/` (**tidak** di Dexie) | `docs/23` |
| Audio | HTML5 Audio di web; plugin native audio di Android; MP3 per ayat dari CDN `everyayah.com` | `docs/07`, `docs/27`, `docs/32` |
| State | Zustand (`stores/`) + Dexie langsung dari action store | `docs/15` |
| Penyimpanan pengguna | Dexie schema **v5** (`favorites`, `lastRead`, `settings`, `downloadManifest`, tabel Growth) | `docs/06` |
| Offline | Service Worker **manual** (`public/sw.js`, bukan Workbox), precache saat install, app-shell untuk rute dinamis | `docs/30`, `docs/06` §6 |
| i18n | `next-intl` client-side, tanpa prefix URL; teks bilingual pra-paint | `docs/21` |
| Font Qur'an | Amiri Quran self-host (`next/font/local`) | `docs/09` §4 |
| Platform | PWA di Vercel (utama) + APK/AAB Android via Capacitor (static export) | `docs/25`, `docs/32` |
| SEO | Metadata per halaman, sitemap, robots, JSON-LD | `docs/35` |

### Peta Status Bagian Dokumen Ini

| Bagian | Status |
|--------|--------|
| 1. Architecture Overview | Diagram konseptual; blok penyimpanan & infrastruktur sudah diperbarui |
| 2. Tech Stack | ✅ Diperbarui |
| 3. Visual Foundation | Berlaku sebagai arahan visual; detail di `docs/09`, `docs/10` |
| 4. Route Design | Konseptual — rute aktual di `docs/14` |
| 5. Component Tree | ⚠️ Usang → `docs/13` |
| 6. Data Flow | 6.1 usang (konten tidak lewat Dexie, lihat `docs/23`); 6.2 Post-MVP; 6.3–6.4 konseptual |
| 7. Audio Architecture | Konseptual — implementasi `services/audio-controller.ts`, `docs/27`, `docs/29` |
| 8. State Management | Konseptual — acuan `docs/15` |
| 9. IndexedDB Schema | ⚠️ Usang → `docs/06` |
| 10. Offline & Service Worker | Konseptual — acuan `docs/30`, `docs/06` §6 |
| 11. Data Integration | Sebagian berlaku — acuan `docs/07`, `docs/23` |
| 12. Folder Structure | ⚠️ Usang → `docs/16` |
| 13. Build & Deployment | Sebagian berlaku — acuan `docs/25`, `docs/32` (Docker belum tersedia) |
| 14. Performance Strategy | Arahan; hasil terukur di `docs/36` |

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
│  Service Worker (manual: public/sw.js)                        │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     LOCAL STORAGE                             │
│                                                               │
│  IndexedDB (Dexie v5)                                         │
│   ├─ Settings                                                 │
│   ├─ Last Read                                                │
│   ├─ Favorites                                                │
│   └─ Download Manifest (per surat + qari)                     │
│                                                               │
│  Cache Storage                                                │
│   ├─ Audio Files (hanquran-audio-v1)                          │
│   ├─ Dataset Qur'an (hanquran-data-v3)                        │
│   ├─ App shell (hanquran-shell-v2) + RSC (hanquran-rsc-v1)    │
│   └─ Static Assets (hanquran-static-v2)                       │
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
| Framework | Next.js 16 (App Router)      | SSG, routing, PWA-ready   |
| Language  | TypeScript                   | Type safety               |
| Styling   | TailwindCSS 4                | Utility-first, responsive |
| State     | Zustand                      | Runtime state lintas komponen |
| DB        | Dexie.js (IndexedDB wrapper) | Offline-first storage     |
| Audio     | HTML5 Audio API              | Native, no dependency     |
| Caching   | Service Worker manual (`public/sw.js`) | PWA offline support (bukan Workbox) |
| Font      | Amiri Quran (self-host, `next/font/local`) | Mendukung rasm Utsmani (`docs/09` §4) |
| Data      | Dataset statis `public/data/*` | Konten Quran & terjemahan |
| Audio     | CDN audio tilawah            | Tilawah per ayat          |
| Hosting   | Vercel (PWA) + Capacitor Android (static export) | `docs/25`, `docs/32` |
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
- Playback (Ikuti Ayat yang Diputar, Mode Murotal)
- High contrast mode
- Cache management
- Offline settings

> Toggle terjemahan dan transliterasi ada di **Verse Display Controls** pada Surah Detail, bukan di `/settings`.  
> Spesifikasi Playback: `docs/28-playback-settings.md`, `docs/29-murotal-mode-spec.md`.

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

> ⚠️ **Usang.** Pohon komponen rancangan awal (`SurahListPage`, `AyahItem`, `<Word/>`, `NavigationTabs`, dll.) tidak dipakai. Pohon komponen aktual: **`docs/13-component-tree.md`**.

---

# 6. Data Flow

## 6.1 Read Flow (Cache First, Background Refresh)

> ⚠️ **Usang untuk konten Qur'an.** Konten dibaca dari seed SSG / `public/data/*` via `services/quran/`, bukan Dexie. Lihat `docs/23` dan `docs/06` §11.

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

> ⏸️ **Post-MVP** — tidak diimplementasikan di V1 (`docs/24`). Alur di bawah adalah rancangan.

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
- **Media Session** — metadata surat/ayat/qari & kontrol OS (`navigator.mediaSession`)

---

### MediaSessionBridge

Bertanggung jawab atas integrasi Media Session API dengan pemutaran audio.

Responsibilities:

- Set `MediaMetadata` (title, artist, album, artwork)
- Sinkron `playbackState` (`playing` / `paused` / `none`)
- Daftarkan action handlers `play`, `pause` (opsional: `previoustrack`, `nexttrack`)
- Fallback no-op jika API tidak tersedia

Implementasi: `services/media-session.ts`, dipanggil dari `AudioController`.

Spesifikasi: `docs/27-media-session-api-spec.md`

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

> ⚠️ **Usang.** Rancangan awal menyimpan surat/ayat/terjemahan di IndexedDB; keputusan MVP memindahkan konten ke dataset statis. Schema aktual (v5): **`docs/06-database-schema.md`**, sumber kode `services/db/migrations.ts`.

---

# 10. Offline & Service Worker Strategy

## Overview

HanQuran menggunakan pendekatan Offline First.

Tujuan utama:

- Hafalan tetap dapat dilakukan tanpa internet
- Audio yang pernah diputar tetap tersedia
- Pengalaman pengguna tetap konsisten pada jaringan lambat

Service Worker berfungsi sebagai lapisan cache dan sinkronisasi antara aplikasi, Cache Storage, dan sumber data eksternal (CDN audio tilawah).

> Bagian ini konseptual. Implementasi aktual (nama cache, strategi per jenis request, app-shell, pesan unduhan): **`docs/30-offline-behavior-spec.md`** dan **`docs/06` §6**. SW ditulis manual di `public/sw.js` (bukan Workbox).

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
Service Worker API (manual, public/sw.js — tanpa Workbox)
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

> ⚠️ **Usang.** Struktur folder aktual: **`docs/16-folder-structure.md`**.

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

> **Status aktual:** yang dipakai & diuji hanya **Vercel** (PWA) dan **Capacitor Android** (static export, `docs/32`). Belum ada `Dockerfile`; Cloudflare / self-host / Docker masih rencana.

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

Env opsional yang dipakai kode: `NEXT_PUBLIC_SITE_URL` (SEO) dan `NEXT_PUBLIC_AUTHOR_*` / `NEXT_PUBLIC_ORGANIZATION_URL` (tautan pembuat) — lihat `README.md` dan `docs/26` §4.5. Build Android memakai `HANQURAN_TARGET=android`.

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
