# Module Catalog

## HanQuran V1

---

# 1. Purpose

Dokumen ini mendefinisikan modul-modul utama HanQuran V1, tanggung jawab masing-masing, batas antar modul, serta dependensi yang diizinkan.

Tujuan utamanya:

- Menjaga scope V1 tetap fokus
- Memudahkan implementasi feature-first
- Mengurangi coupling antar fitur
- Menjadi referensi sebelum membuat folder, hooks, dan komponen

---

# 2. Design Principles

## Feature First

Setiap fitur utama memiliki modul sendiri yang berisi:

- Components
- Hooks
- Domain models
- Types
- Business logic

---

## Loose Coupling

Satu modul tidak boleh mengakses internal modul lain secara langsung.

Interaksi antar modul harus melalui:

- Public hooks
- Shared types
- Infrastructure layer

---

## Offline First

Semua modul yang memakai data Quran harus siap bekerja dengan data lokal jika cache tersedia.

---

## Memorization First

Semua keputusan module boundary harus mendukung alur inti:

```text
Pilih surat
↓
Buka ayat
↓
Putar audio
↓
Repeat / fokus hafalan
```

---

# 3. Module Overview

| Module | Status V1 | Primary Responsibility |
|--------|-----------|------------------------|
| Quran | Core | Menampilkan surat, ayat, metadata, dan terjemahan |
| Audio | Core | Playback audio ayat dan kontrol player |
| Memorization | Core | Repeat, highlight, focus mode |
| Reading Resume | Core | Last read dan continue reading |
| Settings | Core | Font size, playback (auto follow), contrast, cache settings, **application language** |
| Offline | Core | Sinkronisasi cache, status offline, service worker integration |
| Visual Foundation | Supporting | Polishing UI ringan tanpa mengganggu fitur inti |
| Shared | Supporting | UI generik, constants, utils, common types |
| Infrastructure | Supporting | API, IndexedDB, Cache Storage, service worker |

---

# 4. Core Modules

## 4.1 Quran Module

### Responsibility

- Mengambil daftar surat
- Mengambil detail surat dan ayat
- Menampilkan teks Arab Uthmani
- Menampilkan metadata surat
- Menampilkan terjemahan dan transliterasi sesuai `VerseDisplayControls` / settings global
- Menyediakan filter `Semua` dan `Favorit` di home

### Owns

- `SurahListPage`
- `SurahPage`
- `SurahCard`
- `SurahHeader`
- `VerseDisplayControls`
- `AyahList`
- `AyahItem`
- `TranslationToggle`
- `TransliterationToggle`
- `FocusModeButton`
- `FavoriteButton`

### Public Hooks

- `useSurahList()`
- `useSurah(id)`
- `useTranslations(surahId)`
- `useFavoriteSurahs()`

### Depends On

- Infrastructure API repository
- Infrastructure DB repository
- Settings module
- Reading Resume module

### Must Not Own

- Audio playback state
- Repeat logic
- Word highlight timing logic

---

## 4.2 Audio Module

### Responsibility

- Play
- Pause
- Resume
- Next ayah
- Previous ayah
- Audio progress
- Active ayah playback state
- **Media Session** — metadata & kontrol lock screen OS (`docs/27`)

### Owns

- `AudioBar`
- `AudioControls`
- `AudioProgress`
- `useAudio()`
- `AudioEngine`
- `PlaylistEngine`
- `MediaSessionBridge` (`services/media-session.ts`)

### Public Hooks

- `useAudio()`
- `useAudioProgress()`
- `useActiveAyah()`

### Depends On

- Infrastructure audio repository
- Offline module
- Memorization module

### Must Not Own

- Surah rendering
- Favorites
- Last read persistence rules

---

## 4.3 Memorization Module

### Responsibility

- Repeat per ayat
- Repeat per range ayat
- Repeat per surat
- Word-by-word highlight
- Focus mode
- Counter repeat
- Minimal UI untuk hafalan

### Owns

- `RepeatSelector`
- `RepeatOption`
- `FocusPage`
- `FocusAyah`
- `FocusAudio`
- `FocusRepeat`
- `useRepeat()`
- `useHighlight()`
- `RepeatEngine`
- `HighlightEngine`

### Public Hooks

- `useRepeat()`
- `useHighlight()`
- `useFocusMode()`

### Depends On

- Audio module
- Quran module
- Settings module

### Must Not Own

- Global settings persistence
- Offline cache orchestration
- Decorative visual system

---

## 4.4 Reading Resume Module

### Responsibility

- Menyimpan posisi terakhir user
- Menampilkan entry point `Lanjutkan bacaan terakhir`
- Menyediakan deep link ke `/surah/[id]?ayah=[n]`

### Owns

- `ContinueReadingCard`
- `useLastRead()`
- `saveLastRead()`
- `getLastReadLink()`

### Depends On

- Infrastructure DB layer
- Quran route conventions

### Must Not Own

- History browser
- Session analytics
- Cloud sync

---

## 4.5 Settings Module

### Responsibility

- Font size
- Application language (`id` / `en` via `next-intl`)
- Playback preferences (Auto Follow Playback)
- High contrast mode
- Cache management trigger
- Settings screen state
- Navigasi ke layar Tentang HanQuran (`/settings/about`)

> Toggle terjemahan dan transliterasi **bukan** bagian Settings module — dikelola di `VerseDisplayControls` (`docs/22-verse-display-controls.md`).  
> Spesifikasi Playback: `docs/28-playback-settings.md`.

### Owns

- `SettingsPage`
- `AboutPage` (`app/settings/about/page.tsx`)
- `FontSizeSetting`
- `LanguageSetting`
- `ContrastSetting`
- `CacheManagement`
- `useSettings()`
- `SettingsContext`

### Public Hooks

- `useSettings()`

### Depends On

- Infrastructure DB layer
- Offline module

### Must Not Own

- Surah data
- Audio queue
- Highlight timing

---

## 4.6 Offline Module

### Responsibility

- Menyimpan data Quran ke IndexedDB
- Menyimpan audio ke Cache Storage
- Menyediakan status offline
- Mengatur cache strategy
- Berintegrasi dengan service worker

### Owns

- `OfflineIndicator`
- `useOfflineStatus()`
- `useCacheStatus()`
- `cacheManager`
- `audioCache`
- Workbox/service worker integration

### Depends On

- Infrastructure cache layer
- Infrastructure DB layer
- Infrastructure API layer

### Must Not Own

- UI ayat
- Repeat logic
- Visual styling decisions

---

# 5. Supporting Modules

## 5.1 Visual Foundation Module

### Purpose

Membuat HanQuran V1 terasa polished sejak awal tanpa memperluas scope fitur.

### Includes

- Color tokens
- Typography tokens
- Background gradients ringan
- Decorative patterns
- Motion ringan untuk loading dan toggle
- Repeat iconography yang child-friendly

### Allowed Usage

Lebih terasa pada:

- Home
- Settings
- Empty state
- Install prompt

Harus minimal pada:

- Surah reader
- Focus mode
- Audio controls
- Ayah list

### Must Not Become

- Achievement system
- Mascot system
- Sleep mode system
- 3D scene system

---

## 5.2 Shared Module

### Responsibility

- Reusable button
- Modal
- Sheet
- Typography primitives
- Utility function
- Constants
- Shared types

### Rule

Tidak boleh berisi business logic domain.

---

## 5.3 Infrastructure Module

### Responsibility

- Quran content dataset access (`public/data/*`)
- Akses audio tilawah (CDN eksternal)
- Dexie / IndexedDB access
- Cache Storage access
- Service worker registration

### Main Parts

- `api/`
- `db/`
- `cache/`
- `sw/`

### Rule

Semua modul fitur harus mengakses storage dan network melalui modul ini.

---

# 6. Cross-Module Interaction

## Allowed Flows

```text
Quran Module
  └── reads via Infrastructure

Audio Module
  └── requests ayah audio via Infrastructure

Memorization Module
  └── uses Audio state + Quran word timing

Reading Resume Module
  └── stores last read via Infrastructure DB

Settings Module
  └── stores preferences via Infrastructure DB

Offline Module
  └── coordinates cache policy for Quran and Audio
```

---

## Disallowed Flows

```text
Quran Module -> directly manipulates AudioEngine internals
Memorization Module -> directly writes arbitrary IndexedDB tables
Visual Foundation -> controls playback or repeat logic
Shared Module -> contains Quran business rules
```

---

# 7. Suggested Folder Mapping

```text
src/
├── features/
│   ├── quran/
│   ├── audio/
│   ├── memorization/
│   ├── reading-resume/
│   ├── settings/
│   └── offline/
├── visual/
├── infrastructure/
├── context/
└── shared/
```

---

# 8. Out of Scope for V1

Modul berikut belum perlu dibuat sebagai first-class module pada V1:

- Achievement
- Mascot
- Progress dashboard
- Sleep mode
- Cloud sync
- Family account

Jika nanti dibutuhkan, modul-modul tersebut ditambahkan sebagai ekspansi setelah V1 stabil.

---

# 9. Checklist Before Implementation

Sebelum membuat modul baru, pastikan:

1. Modul tersebut memang dibutuhkan oleh backlog V1
2. Tanggung jawabnya tidak tumpang tindih dengan modul yang sudah ada
3. Data ownership-nya jelas
4. Akses storage dan API tetap lewat infrastructure
5. Tidak menambah distraksi pada alur hafalan inti
