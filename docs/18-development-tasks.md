# 18 — Daftar Pekerjaan Teknis HanQuran (Development Tasks)

Dokumen ini adalah **single source of truth** untuk seluruh backlog implementasi HanQuran menuju MVP. Berisi daftar pekerjaan teknis yang dapat langsung dikerjakan developer.

**Terakhir diperbarui:** 17 Juni 2026
**Status:** 🚧 Sprint 1 (Phase 0) Selesai — siap lanjut Phase 1
**Total Development Tasks:** 84 (7 Selesai, 77 Belum Dimulai)

---

## Legenda

**Tipe Task:**
- `[NEW]` — File atau komponen baru
- `[UPDATE]` — Komponen existing, perlu enhancement
- `[REFACTOR]` — Komponen existing, perlu cleanup
- `[TEST]` — Pengujian
- `[DOC]` — Dokumentasi

**Prioritas:**
- **P0** — Blocker MVP, harus selesai sebelum rilis
- **P1** — MVP lengkap, dibutuhkan untuk kualitas optimal
- **P2** — Nice to have, dapat dilakukan setelah MVP
- **P3** — Post-MVP, di luar scope rilis pertama

**Format Checklist:** `- [ ]` (belum dimulai) | `- [x]` (selesai)

---

# 📊 1. Ringkasan Eksekutif

## Keputusan Arsitektur Final (Tidak Dapat Diubah Tanpa Review)

| Aspek | Keputusan Final |
|-------|-----------------|
| Data Source (Production) | Dataset statis `public/data/*` + EveryAyah (audio) |
| Data Source (Development) | Mock Data lokal (`lib/mock-data/`) |
| Runtime State | Zustand |
| Persistent State | **Dexie** (IndexedDB) — `services/db/db.ts` |
| Audio File Cache | Cache Storage via Service Worker |
| Route State | URL Parameter — Next.js App Router |
| Focus Mode Route | `/focus/[id]` (contoh: `/focus/2?ayah=5`) |
| Bootstrap SW | Phase 0 (skeleton + registrasi awal) |
| Strategi Offline | Phase 5 (runtime caching, DownloadManager, manifest Dexie) |
| Data Strategy | Local First: Dexie first, API sebagai fallback |
| Repository Pattern | UI → Store → Repository → Dexie → API |

## Tabel Ringkasan Task per Phase

| Phase | Nama | Total | P0 | P1 | P2/P3 | Selesai | Status |
|-------|------|-------|----|----|--------|---------|--------|
| 0 | Persiapan & Setup Infrastructure | 7 | 7 | 0 | 0 | 7 | ✅ Selesai |
| 1 | Static Dataset & Data Integration | 8 | 6 | 1 | 1 | 0 | ⏳ Belum Dimulai |
| 2 | Audio Controller & State | 11 | 6 | 3 | 2 | 0 | ⏳ Belum Dimulai |
| 3 | Repeat Engine & Configuration | 9 | 6 | 2 | 1 | 0 | ⏳ Belum Dimulai |
| 4 | Focus Mode Refinement | 8 | 5 | 1 | 2 | 0 | ⏳ Belum Dimulai |
| 5 | Implementasi Strategi Offline | 11 | 7 | 3 | 1 | 0 | ⏳ Belum Dimulai |
| 6 | PWA & Packaging | 8 | 5 | 2 | 1 | 0 | ⏳ Belum Dimulai |
| 7 | Testing & Quality Assurance | 9 | 6 | 2 | 1 | 0 | ⏳ Belum Dimulai |
| 8 | Release & Monitoring | 11 | 6 | 3 | 2 | 0 | ⏳ Belum Dimulai |
| **TOTAL** | | **84** | **55** | **18** | **11** | **7** | |

> Catatan: Phase 7 (Testing & QA) berjalan **paralel** mulai Phase 1 — bukan sequential setelah Phase 6 selesai.

---

# 🖥️ 2. Status Implementasi Saat Ini

Codebase aktif berada di `hanquran-app/` (Next.js App Router). Komponen UI, primitif, dan utilitas dasar sudah tersedia. Belum ada integrasi data nyata, audio controller, state management (Zustand + Dexie), Repository Layer, atau service worker fungsional.

---

# 🗂️ 3. Existing Components

Komponen-komponen berikut **sudah ada** di codebase `hanquran-app/`. Ini bukan "development task selesai" — ini adalah inventarisasi komponen UI yang tersedia sebagai fondasi implementasi. Semua masih menggunakan data statis dan belum terhubung ke store atau service layer.

## Halaman (4 halaman)

| File | Route | Keterangan |
|------|-------|------------|
| `app/page.tsx` | `/` (Beranda) | ✓ Ada — UI statis |
| `app/surah/[id]/page.tsx` | `/surah/[id]` | ✓ Ada — UI statis |
| `app/focus/[id]/page.tsx` | `/focus/[id]` | ✓ Ada — UI statis |
| `app/settings/page.tsx` | `/settings` | ✓ Ada — UI statis |

## Komponen Layar (18 komponen)

`ActionBar` | `AudioPlayer` | `AyahCard` | `AyahWordHighlight` | `BottomNavigation` | `ContinueReading` | `Favorites` | `FilterChips` | `FocusModePlayer` | `Header` | `OfflineStatusBadge` | `RepeatSelector` | `RepeatSettingsDialog` | `RepeatStatus` | `SearchInput` | `SettingsSection` | `SurahCard` | `SurahDetailHeader`

## Komponen Bersama (1 komponen)

`components/shared/Logo.tsx`

## UI Primitives (6 komponen)

`Button` | `Dialog` | `Drawer` | `SegmentedControl` | `Select` | `Switch`

## Hooks & Utilitas (5 file)

`hooks/use-media-query.ts` | `lib/routes.ts` | `lib/repeat-options.ts` | `lib/surahs-data.ts` | `lib/utils.ts`

## Aset Branding (2 aset)

`public/branding/logo.png` | `public/branding/logo-with-text.png`

**Total komponen yang sudah ada: 36 item**

> Semua komponen layar di atas sudah memiliki tampilan statis. Perlu dikoneksikan ke store, service layer, dan data nyata melalui development tasks di bawah.

---

# ✅ 4. Completed Tasks

**Total development task yang benar-benar selesai: 7** (seluruh Phase 0 — Sprint 1)

Phase 0 (Persiapan & Setup Infrastructure) selesai pada 17 Juni 2026:

1. ✅ Folder structure (`stores/`, `services/`, `types/`, `tests/`)
2. ✅ Dexie setup — `services/db/db.ts` + `services/db/migrations.ts` (schema v1, 14 store)
3. ✅ Zustand stores — `audioStore`, `userStore`, `repeatStore`, `offlineStore` (pola `init()` baca Dexie)
4. ✅ Base types — `types/quran.ts`, `types/audio.ts`, `types/offline.ts`, `types/repeat.ts`, `types/growth.ts`, `types/index.ts`
5. ✅ Service Worker skeleton — `public/sw.js` + registrasi via `components/shared/AppBootstrap.tsx`
6. ✅ Error boundary — `components/shared/ErrorBoundary.tsx` + `ErrorFallback.tsx`
7. ✅ Dokumentasi setup — `docs/SETUP.md` + update `README.md`

Pendukung: Vitest dikonfigurasi (`vitest.config.ts`, `tests/setup.ts` dengan `fake-indexeddb`) — menyelesaikan Blocker #3. Verifikasi: `typecheck`, `test` (8 test passing), dan `build` semua lulus.

---

# 🎯 5. Development Tasks per Phase

---

## Phase 0 — Persiapan & Setup Infrastructure

**Total: 7 tasks | P0: 7 | Ketergantungan: None**

> Fase ini harus selesai sebelum fase lain dapat dimulai. Service Worker di-bootstrap di sini — implementasi strategi caching dilakukan di Phase 5.

- [x] [NEW] Setup folder structure sesuai `docs/16-folder-structure.md`
  - File: Buat folder `stores/`, `services/`, `types/`, `tests/` di dalam `hanquran-app/`
  - Ketergantungan: None
  - Prioritas: P0

- [x] [NEW] Setup Dexie — inisialisasi database & schema
  - Tujuan: Setup Dexie dengan 13 tabel schema V1 sebagai fondasi seluruh persistensi aplikasi
  - File: `services/db/db.ts` (Dexie instance + schema), `services/db/migrations.ts`
  - Ketergantungan: Library `dexie` terinstall
  - Catatan: Schema V1 mencakup: `surahs`, `ayahs`, `translations`, `wordTimings`, `reciters`, `favorites`, `lastRead`, `settings`, `downloadManifest`, `bookmarks`, `memorization_progress`, `murajaah_sessions`, `statistics`, `notes`
  - Prioritas: P0

- [x] [NEW] Install & konfigurasi Zustand stores dengan akses Dexie
  - Tujuan: Setup empat store Zustand (Audio, Repeat, User, Offline) dengan pola `init()` untuk baca Dexie saat app start
  - File: `package.json`, `stores/audioStore.ts`, `stores/userStore.ts`, `stores/repeatStore.ts`, `stores/offlineStore.ts`
  - Ketergantungan: Dexie setup selesai
  - Prioritas: P0

- [x] [NEW] Buat base types & interfaces
  - File: `types/quran.ts`, `types/audio.ts`, `types/offline.ts`, `types/index.ts`
  - Ketergantungan: None
  - Prioritas: P0

- [x] [NEW] Bootstrap Service Worker — skeleton & registrasi
  - Tujuan: Daftarkan SW skeleton agar browser mengenali aplikasi sebagai PWA-ready. Implementasi strategi caching dilakukan di Phase 5.
  - File: `public/sw.js` (skeleton minimal), `app/layout.tsx` (registrasi SW)
  - Ketergantungan: None
  - Prioritas: P0

- [x] [NEW] Buat error boundary component
  - File: `components/shared/ErrorBoundary.tsx`, `components/shared/ErrorFallback.tsx`
  - Ketergantungan: React built-in
  - Prioritas: P0

- [x] [DOC] Dokumentasi setup process untuk developer baru
  - File: Update `README.md`, buat `docs/SETUP.md`
  - Ketergantungan: Folder structure selesai
  - Prioritas: P0

---

## Phase 1 — Static Dataset & Data Integration

**Total: 8 tasks | P0: 6 | P1: 1 | P3: 1**

> Keputusan final: **Dataset statis `public/data/*`** adalah sumber konten Quran. **EveryAyah** untuk audio. **data/reciters.json** untuk metadata qari. Seluruh akses data menggunakan **Local-First** pattern: Dexie first, muat dari `public/data/*` sebagai fallback.
>
> Detail arsitektur: **`docs/07-api-integration.md`**.

### Wajib (P0)

- [ ] [NEW] Implementasi Repository Layer (QuranRepository + AudioRepository)
  - Tujuan: Implementasi Repository dengan Local-First pattern — baca Dexie dahulu, muat dari `public/data/*` hanya jika data belum ada
  - File: `services/api/QuranRepository.ts`, `services/api/AudioRepository.ts`, `services/api/dataLoader.ts`
  - Ketergantungan: Dexie setup selesai (Phase 0), Types tersedia
  - Catatan: `getSurahList()` tidak boleh fetch ulang jika tabel `surahs` di Dexie sudah terisi
  - Prioritas: P0

- [ ] [NEW] Integrasi loader dataset statis `public/data/*`
  - Tujuan: Muat surat, ayat, terjemahan, dan word timings dari file JSON di `public/data/`
  - File: `services/api/dataLoader.ts`, mapper di `services/api/mappers/`
  - Ketergantungan: Dataset `public/data/*` tersedia
  - Prioritas: P0

- [ ] [NEW] Integrasi EveryAyah untuk audio playback
  - Tujuan: Bangun URL audio per ayat dari slug qari (`data/reciters.json`) dan kunci ayat
  - File: `services/api/AudioRepository.ts`
  - Ketergantungan: `data/reciters.json` tersedia
  - Prioritas: P0

- [ ] [UPDATE] Migrate `lib/surahs-data.ts` ke dynamic loader
  - Tujuan: Replace data hardcoded dengan pemanggilan Repository yang memuat dari dataset statis
  - File: `lib/surahs-data.ts`, `app/page.tsx`, `app/surah/[id]/page.tsx`
  - Ketergantungan: Repository Layer sudah siap
  - Prioritas: P0

- [ ] [NEW] Definisikan TypeScript interfaces untuk data Quran
  - Tujuan: Standardisasi type definitions (`SurahData`, `AyahData`, `WordData`, dll.) di seluruh aplikasi
  - File: `types/quran.ts`
  - Ketergantungan: None
  - Prioritas: P0

- [ ] [NEW] Seed Dexie dari dataset statis saat first launch
  - Tujuan: Hydrate IndexedDB dari `public/data/*` agar kunjungan berikutnya tidak perlu fetch ulang
  - File: `services/api/QuranRepository.ts`, `components/shared/AppBootstrap.tsx`
  - Ketergantungan: Repository Layer, dataset tersedia
  - Prioritas: P0

### Disarankan (P1)

- [ ] [UPDATE] Tambah error boundary & fallback UI untuk kegagalan load data
  - Tujuan: Tangani kegagalan fetch dataset secara graceful
  - File: `components/shared/ErrorFallback.tsx`, halaman dengan data loader
  - Ketergantungan: Data loading sudah berjalan
  - Prioritas: P1

### Post-MVP (P3)

- [ ] [NEW] Implementasi search index untuk surat (full-text search)
  - Tujuan: Optimasi performa pencarian pada dataset besar
  - File: `lib/search-index.ts`
  - Ketergantungan: Data Quran sudah tersedia
  - Prioritas: P3

---

## Phase 2 — Audio Controller & State

**Total: 11 tasks | P0: 6 | P1: 3 | P2: 1 | P3: 1**

### Wajib (P0)

- [ ] [NEW] Buat `AudioController` service class
  - Tujuan: Layer abstraksi untuk kontrol audio element, decouple dari UI. Mengelola: play, pause, seek, track metadata, URL audio per-qari.
  - File: `services/audio-controller.ts`
  - Ketergantungan: Schema `useAudioStore` sudah terdefinisi
  - Prioritas: P0

- [ ] [NEW] Setup Zustand `useAudioStore`
  - Tujuan: Global state untuk status pemutaran audio
  - File: `stores/audioStore.ts`
  - State: `isPlaying`, `currentTrack`, `currentTime`, `duration`, `playbackRate`
  - Ketergantungan: None
  - Prioritas: P0

- [ ] [NEW] Buat `useAudio` hook
  - Tujuan: Expose audio store & controller ke components
  - File: `hooks/useAudio.ts`
  - Ketergantungan: `audioStore`, `AudioController`
  - Prioritas: P0

- [ ] [UPDATE] Integrasikan `AudioController` dengan komponen `AudioPlayer`
  - Tujuan: Hubungkan tombol play/pause/seek ke audio controller
  - File: `components/audio-player.tsx`
  - Ketergantungan: `useAudio` hook, `AudioController` sudah berjalan
  - Prioritas: P0

- [ ] [NEW] Implementasi single-tab leadership dengan `BroadcastChannel`
  - Tujuan: Mencegah lebih dari satu tab memutar audio bersamaan
  - File: `services/audio-controller.ts`, `stores/audioStore.ts`
  - Ketergantungan: Store & controller base implementation
  - Prioritas: P0

- [ ] [TEST] Uji audio play/pause/seek di desktop & mobile browser
  - Tujuan: Verifikasi perilaku audio lintas browser
  - File: Manual testing + `tests/services/audio-controller.test.ts`
  - Ketergantungan: Integrasi audio selesai
  - Prioritas: P0

### Disarankan (P1)

- [ ] [UPDATE] Implementasi audio preloading & prefetch hints
  - Tujuan: Tingkatkan kelancaran pemutaran
  - File: `services/audio-controller.ts`, `lib/quran-service.ts`
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P1

- [ ] [UPDATE] Tambah kontrol kecepatan putar (0.75×, 1×, 1.25×, 1.5×)
  - Tujuan: Memungkinkan pengguna mengatur kecepatan audio
  - File: `components/audio-player.tsx`, `stores/audioStore.ts`
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P1

- [ ] [NEW] Persist posisi pemutaran terakhir per surat/ayat
  - Tujuan: Resume dari posisi terakhir pengguna berhenti (sumber data `lastViewed` di `useUserStore`)
  - File: `stores/audioStore.ts`, `stores/userStore.ts`
  - Ketergantungan: Store & persistence layer siap
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [NEW] Dukungan beberapa pilihan qari (audio reciter)
  - Tujuan: Memungkinkan pengguna memilih suara berbeda
  - File: `stores/userStore.ts`, `services/audio-controller.ts`, Settings UI
  - Ketergantungan: Audio playback berjalan, EveryAyah URL builder tersedia
  - Prioritas: P2

### Post-MVP (P3)

- [ ] [NEW] Visualisasi audio (waveform/frequency bars)
  - Tujuan: Umpan balik visual selama pemutaran
  - File: `components/audio-player.tsx` (tambah visualizer)
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P3

---

## Phase 3 — Repeat Engine & Configuration

**Total: 9 tasks | P0: 6 | P1: 2 | P3: 1**

### Wajib (P0)

- [ ] [NEW] Buat Zustand `useRepeatStore`
  - Tujuan: Store konfigurasi repeat (`count`, `target`, `range`) dan runtime state
  - File: `stores/repeatStore.ts`
  - State: `repeatCount`, `repeatTarget`, `rangeFrom`, `rangeTo`, `currentCycle`, `isActive`
  - Ketergantungan: None
  - Prioritas: P0

- [ ] [NEW] Implementasi `RepeatEngine` service (pure logic)
  - Tujuan: Logika pengulangan — lacak siklus, tentukan ayat berikutnya, berhenti saat selesai
  - File: `services/repeat-engine.ts`
  - Ketergantungan: Schema `repeatStore` sudah terdefinisi
  - Prioritas: P0

- [ ] [UPDATE] Integrasi `RepeatEngine` dengan `AudioController` & UI Repeat
  - Tujuan: Saat audio ayat selesai, repeat engine menentukan aksi berikutnya
  - File: `services/audio-controller.ts`, `components/repeat-selector.tsx`, `components/repeat-settings-dialog.tsx`
  - Ketergantungan: `AudioController`, `RepeatEngine`, `repeatStore`
  - Prioritas: P0

- [ ] [UPDATE] Implementasi persistensi `RepeatSettingsDialog` ke IndexedDB
  - Tujuan: Simpan preferensi repeat pengguna antar sesi
  - File: `stores/repeatStore.ts` (tambah persist middleware), `components/repeat-settings-dialog.tsx`
  - Ketergantungan: `repeatStore` dengan persist middleware
  - Prioritas: P0

- [ ] [UPDATE] Perbarui tampilan komponen `RepeatStatus`
  - Tujuan: Tampilkan status repeat saat ini (contoh: "Siklus 2/5")
  - File: `components/repeat-status.tsx`
  - Ketergantungan: `repeatStore`
  - Prioritas: P0

- [ ] [TEST] Unit tests untuk repeat engine logic
  - Tujuan: Verifikasi transisi repeat yang benar untuk semua target (`current_ayah`, `ayah_range`, `entire_surah`)
  - File: `tests/services/repeat-engine.test.ts`
  - Ketergantungan: `RepeatEngine` sudah diimplementasi
  - Prioritas: P0

### Disarankan (P1)

- [ ] [NEW] Tambah keyboard shortcuts untuk kontrol repeat
  - Tujuan: Tingkatkan aksesibilitas & pengalaman power user (Spasi = play/pause, R = toggle repeat)
  - File: `hooks/useKeyboardShortcuts.ts`, halaman `SurahDetail` / `FocusMode`
  - Ketergantungan: Repeat engine berjalan
  - Prioritas: P1

- [ ] [UPDATE] Implementasi riwayat konfigurasi repeat terbaru
  - Tujuan: Akses cepat ke pengaturan repeat yang sering digunakan
  - File: `stores/repeatStore.ts`, komponen UI
  - Ketergantungan: Repeat settings berjalan
  - Prioritas: P1

### Post-MVP (P3)

- [ ] [NEW] Tambah haptic feedback saat repeat selesai (mobile)
  - Tujuan: Notifikasi taktil pada perangkat mobile
  - File: `services/haptic.ts`
  - Ketergantungan: Repeat engine berjalan
  - Prioritas: P3

---

## Phase 4 — Word Highlight (Focus Mode)

**Total: 8 tasks | P0: 5 | P1: 1 | P2: 1 | P3: 1**

> Route yang digunakan: `/focus/[id]` sesuai `docs/14-routing-spec.md`. File halaman: `app/focus/[id]/page.tsx`. Query opsional: `?ayah=<number>`.

### Wajib (P0)

- [ ] [REFACTOR] Perhalus komponen `AyahWordHighlight` untuk transisi highlight state
  - Tujuan: Pastikan transisi visual halus saat highlight kata berubah
  - File: `components/ayah-word-highlight.tsx`
  - Ketergantungan: Komponen sudah ada
  - Prioritas: P0

- [ ] [UPDATE] Implementasi logika timing kata-per-kata di FocusMode
  - Tujuan: Otomasi perpindahan highlight kata (interval berbasis milidetik)
  - File: `app/focus/[id]/page.tsx`
  - Ketergantungan: Komponen `AyahWordHighlight` sudah berfungsi
  - Prioritas: P0

- [ ] [UPDATE] Integrasi FocusMode dengan repeat engine
  - Tujuan: Dukung repeat target dalam focus mode (ulang ayat saat ini, range, seluruh surat)
  - File: `app/focus/[id]/page.tsx`, `services/repeat-engine.ts`
  - Ketergantungan: FocusMode berjalan, `RepeatEngine` sudah siap
  - Prioritas: P0

- [ ] [UPDATE] Tambah tombol play/pause & progress bar untuk FocusMode
  - Tujuan: Kontrol penuh dari focus mode
  - File: `components/focus-mode-player.tsx`
  - Ketergantungan: Struktur halaman FocusMode
  - Prioritas: P0

- [ ] [UPDATE] Implementasi navigasi panah (prev/next ayat) di FocusMode
  - Tujuan: Pindah antar ayat tanpa keluar dari focus mode
  - File: `app/focus/[id]/page.tsx`
  - Ketergantungan: Halaman FocusMode
  - Prioritas: P0

### Disarankan (P1)

- [ ] [UPDATE] Aksesibilitas: keyboard navigation & dukungan screen reader untuk word highlight
  - Tujuan: Pastikan focus mode dapat digunakan oleh pengguna berkebutuhan khusus
  - File: `components/ayah-word-highlight.tsx`, `app/focus/[id]/page.tsx`
  - Ketergantungan: FocusMode berjalan
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [UPDATE] Dukungan sinkronisasi audio untuk timing highlight (fallback ke fixed timing)
  - Tujuan: Highlight dapat mengikuti pemutaran audio secara real-time
  - File: `app/focus/[id]/page.tsx`, `services/audio-controller.ts`
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P2

### Post-MVP (P3)

- [ ] [NEW] Tambah toggle tanda baca (diacritical marks) untuk teks Arab
  - Tujuan: Pengguna dapat menyembunyikan/menampilkan tanda baca di FocusMode
  - File: `app/focus/[id]/page.tsx`, Settings
  - Ketergantungan: FocusMode berjalan
  - Prioritas: P3

---

## Phase 5 — Implementasi Strategi Offline

**Total: 11 tasks | P0: 7 | P1: 3 | P2: 1**

> Service Worker sudah di-bootstrap di Phase 0. Phase ini fokus pada implementasi strategi caching, `DownloadManager`, manifest IndexedDB, dan alur offline end-to-end.

### Wajib (P0)

- [ ] [NEW] Buat `DownloadManager` service untuk caching audio
  - Tujuan: Orkestrasi unduhan audio ke Cache Storage via Service Worker
  - File: `services/download-manager.ts`
  - Ketergantungan: Service Worker sudah terdaftar (Phase 0)
  - Prioritas: P0

- [ ] [UPDATE] Implementasi runtime caching strategy di Service Worker
  - Tujuan: Cache respons API dan file audio — `stale-while-revalidate` untuk aset, `cache-first` untuk data Quran (`hanquran-data-v1`), dan runtime caching untuk audio (`hanquran-audio-v1`)
  - File: `public/sw.js`
  - Ketergantungan: SW skeleton dari Phase 0 sudah siap
  - Prioritas: P0

- [ ] [UPDATE] Implementasi manifest unduhan di Dexie tabel `downloadManifest`
  - Tujuan: Mengetahui surat/ayat mana yang sudah tersedia offline via Dexie `downloadManifest`
  - File: `services/api/AudioRepository.ts` (update manifest setelah download), `stores/offlineStore.ts` (baca manifest dari Dexie)
  - Ketergantungan: Dexie setup selesai (Phase 0)
  - Prioritas: P0

- [ ] [NEW] Setup Zustand `useOfflineStore`
  - Tujuan: Lacak status koneksi, progres unduhan, dan ringkasan manifest cache
  - File: `stores/offlineStore.ts`
  - State: `connectionStatus`, `downloadStatuses`, `manifestSummary`
  - Ketergantungan: None
  - Prioritas: P0

- [ ] [NEW] Implementasi messaging SW ↔ Client (`BroadcastChannel` / `postMessage`)
  - Tujuan: SW menginformasikan client tentang progres unduhan & completion
  - File: `public/sw.js`, `services/download-manager.ts`
  - Ketergantungan: SW terdaftar, `offlineStore` siap
  - Prioritas: P0

- [ ] [UPDATE] Tambah indikator offline (`OfflineStatusBadge`) di Header & Settings
  - Tujuan: Tampilkan status koneksi kepada pengguna
  - File: `components/offline-status-badge.tsx`, `components/header.tsx`
  - Ketergantungan: `offlineStore` berjalan
  - Prioritas: P0

- [ ] [TEST] Uji pemutaran offline: unduh 1 surat, putuskan koneksi, putar audio
  - Tujuan: Verifikasi alur offline end-to-end
  - File: Manual + `tests/e2e/offline-flow.e2e.ts`
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P0

### Disarankan (P1)

- [ ] [NEW] Implementasi selective download: pengguna memilih surat yang ingin disimpan offline
  - Tujuan: Hemat bandwidth, beri pengguna kontrol atas penyimpanan
  - File: Komponen UI baru atau enhancement halaman Settings
  - Ketergantungan: `DownloadManager` & `offlineStore` berjalan
  - Prioritas: P1

- [ ] [NEW] Tambah manajemen ukuran cache & pembersihan
  - Tujuan: Cegah kuota habis, izinkan pengguna menghapus item yang di-cache
  - File: `services/cache-manager.ts`, Settings UI
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P1

- [ ] [UPDATE] Tampilkan progres unduhan (%) kepada pengguna
  - Tujuan: Umpan balik visual selama unduhan berlangsung
  - File: Komponen UI, `offlineStore`
  - Ketergantungan: `DownloadManager` berjalan
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [NEW] Auto-download surat favorit saat online
  - Tujuan: Fitur kenyamanan agar pengguna tidak perlu unduh manual
  - File: `services/download-manager.ts`, background sync
  - Ketergantungan: `userStore` (favorites), infrastruktur offline
  - Prioritas: P2

---

## Phase 6 — PWA & Packaging

**Total: 8 tasks | P0: 5 | P1: 2 | P2: 1**

### Wajib (P0)

- [ ] [NEW] Buat web app manifest (`manifest.json`)
  - Tujuan: Definisikan metadata aplikasi, ikon, start URL
  - File: `public/manifest.json`, `app/layout.tsx` (link manifest)
  - Ketergantungan: None
  - Prioritas: P0

- [ ] [NEW] Buat & tambahkan ikon PWA (minimal 192×192 dan 512×512)
  - Tujuan: Tampilan install prompt & homescreen
  - File: `public/icons/`
  - Ketergantungan: Aset branding tersedia
  - Prioritas: P0

- [ ] [NEW] Tambah deteksi installability & UI install prompt
  - Tujuan: Sarankan pengguna untuk menginstal aplikasi
  - File: `hooks/useInstallPrompt.ts`, `components/shared/install-banner.tsx`
  - Ketergantungan: Manifest siap
  - Prioritas: P0

- [ ] [UPDATE] Pastikan offline shell dapat dimuat (basic HTML + fallback UI)
  - Tujuan: Aplikasi berjalan meski jaringan gagal saat pertama kali load
  - File: `app/layout.tsx`, `public/sw.js`
  - Ketergantungan: Service Worker siap
  - Prioritas: P0

- [ ] [TEST] Uji PWA di mobile (iOS Safari, Android Chrome)
  - Tujuan: Verifikasi install & perilaku offline di perangkat nyata
  - File: N/A (manual testing)
  - Ketergantungan: Setup PWA selesai
  - Prioritas: P0

### Disarankan (P1)

- [ ] [UPDATE] Implementasi splash screen untuk peluncuran PWA
  - Tujuan: Pengalaman loading bermerek saat pengguna membuka aplikasi yang terinstall
  - File: `app/layout.tsx`, CSS, `public/manifest.json`
  - Ketergantungan: Manifest PWA siap
  - Prioritas: P1

- [ ] [UPDATE] Tambah `theme-color` untuk URL bar (mobile)
  - Tujuan: Konsistensi visual pada browser mobile
  - File: `app/layout.tsx` (meta tags)
  - Ketergantungan: Setup PWA
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [UPDATE] Konfigurasi app shortcuts (contoh: "Buka Surat Terakhir", "Mode Fokus")
  - Tujuan: Akses cepat dari homescreen
  - File: `public/manifest.json`
  - Ketergantungan: PWA siap
  - Prioritas: P2

---

## Phase 7 — Testing & Quality Assurance

**Total: 9 tasks | P0: 6 | P1: 2 | P2: 1**

> Phase ini berjalan **paralel** mulai Phase 1 — bukan sequential setelah Phase 6 selesai.

### Wajib (P0)

- [ ] [TEST] Unit tests untuk repeat engine
  - Tujuan: Verifikasi ketepatan logika repeat
  - File: `tests/services/repeat-engine.test.ts`
  - Ketergantungan: `RepeatEngine` sudah diimplementasi
  - Prioritas: P0

- [ ] [TEST] Unit tests untuk audio controller
  - Tujuan: Verifikasi perintah play/pause/seek
  - File: `tests/services/audio-controller.test.ts`
  - Ketergantungan: `AudioController` sudah diimplementasi
  - Prioritas: P0

- [ ] [TEST] Integration test: buka surat → repeat ayat 3 kali → pindah ke ayat berikutnya
  - Tujuan: Alur repeat end-to-end berfungsi
  - File: `tests/integration/repeat-flow.test.ts`
  - Ketergantungan: Audio & repeat berjalan
  - Prioritas: P0

- [ ] [TEST] E2E test: buka aplikasi → unduh surat → offline → putar audio
  - Tujuan: Alur offline-first berfungsi
  - File: `tests/e2e/offline-flow.e2e.ts`
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P0

- [ ] [TEST] Automated accessibility scan (axe-core) untuk halaman kritis
  - Tujuan: Deteksi masalah aksesibilitas secara otomatis
  - File: `tests/a11y/`
  - Ketergantungan: Komponen sudah dibangun
  - Prioritas: P0

- [ ] [TEST] Performance testing: ukur bundle size & skor Lighthouse
  - Tujuan: Pastikan aplikasi memenuhi target performa (Lighthouse ≥ 80)
  - File: CI/build config, Lighthouse CI
  - Ketergantungan: Build berjalan
  - Prioritas: P0

### Disarankan (P1)

- [ ] [TEST] Cross-browser testing manual (browser utama)
  - Tujuan: Verifikasi paritas fitur lintas browser
  - File: N/A (manual)
  - Ketergantungan: Aplikasi siap untuk pengujian
  - Prioritas: P1

- [ ] [TEST] User feedback testing (grup beta)
  - Tujuan: Kumpulkan umpan balik pengguna nyata sebelum rilis penuh
  - File: Feedback collection UI (opsional)
  - Ketergantungan: Alpha aplikasi siap
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [NEW] Visual regression testing (Percy, Chromatic)
  - Tujuan: Deteksi regresi UI secara otomatis
  - File: Konfigurasi CI
  - Ketergantungan: Setup E2E
  - Prioritas: P2

---

## Phase 8 — Release & Monitoring

**Total: 11 tasks | P0: 6 | P1: 3 | P2: 2**

### Wajib (P0)

- [ ] [NEW] Setup staging environment (identik dengan production)
  - Tujuan: Uji proses rilis sebelum ke production
  - File: Deployment config (Vercel, dll.)
  - Ketergantungan: Aplikasi siap untuk di-deploy
  - Prioritas: P0

- [ ] [DOC] Buat template release notes
  - Tujuan: Dokumentasi perubahan untuk pengguna
  - File: `RELEASE.md` atau changelog
  - Ketergantungan: Version scheme ditentukan
  - Prioritas: P0

- [ ] [NEW] Implementasi error tracking / crash reporting (Sentry atau serupa)
  - Tujuan: Deteksi dan perbaiki masalah di production
  - File: `lib/sentry-init.ts`, `app/layout.tsx` (inisialisasi)
  - Ketergantungan: Akun Sentry setup
  - Prioritas: P0

- [ ] [NEW] Setup analytics dasar (Plausible atau serupa)
  - Tujuan: Lacak perilaku pengguna & penggunaan fitur secara privacy-friendly
  - File: `lib/analytics.ts`, page events
  - Ketergantungan: Akun analytics setup
  - Prioritas: P0

- [ ] [DOC] Susun strategi staged rollout: 10% → 50% → 100%
  - Tujuan: Deteksi masalah lebih awal, rollback cepat jika diperlukan
  - File: Deployment config
  - Ketergantungan: Monitoring setup
  - Prioritas: P0

- [ ] [DOC] Siapkan prosedur rollback
  - Tujuan: Pemulihan cepat jika terjadi critical issue
  - File: Deployment runbook
  - Ketergantungan: Deployment automation siap
  - Prioritas: P0

### Disarankan (P1)

- [ ] [NEW] Setup automated health checks (uptime monitoring)
  - Tujuan: Alert jika aplikasi down
  - File: Monitoring config (Uptime Robot, dll.)
  - Ketergantungan: Production ter-deploy
  - Prioritas: P1

- [ ] [NEW] Buat mekanisme feedback pengguna (email/form)
  - Tujuan: Kumpulkan feature request & laporan bug
  - File: `components/shared/feedback-form.tsx`
  - Ketergantungan: MVP ter-rilis
  - Prioritas: P1

- [ ] [DOC] Dokumentasi onboarding flow untuk developer baru
  - Tujuan: Permudah onboarding anggota tim baru
  - File: `CONTRIBUTING.md`, developer guide
  - Ketergantungan: Kode stabil
  - Prioritas: P1

### Nice to Have (P2)

- [ ] [NEW] Implementasi feature flags untuk A/B testing
  - Tujuan: Uji fitur baru dengan subset pengguna
  - File: `lib/feature-flags.ts`
  - Ketergantungan: Analytics siap
  - Prioritas: P2

- [ ] [NEW] Setup automated dependency updates (Dependabot)
  - Tujuan: Jaga paket tetap aman & terbaru
  - File: GitHub config
  - Ketergantungan: Repo siap
  - Prioritas: P2

---

# 🏁 6. MVP Checklist

Gunakan checklist ini untuk tracking progress sprint. Copy ke project management tool (GitHub Issues, Jira, Notion, dll.).

```
## Checklist MVP HanQuran

### Phase 0 — Setup ✅
- [x] Folder structure dibuat
- [x] Dexie setup (`services/db/db.ts`) — 14 store schema v1 (9 MVP + 5 Growth)
- [x] Zustand stores dikonfigurasi dengan akses Dexie langsung
- [x] Base types terdefinisi
- [x] Service Worker skeleton terdaftar
- [x] Error boundary tersedia

### Phase 1 — Data
- [ ] Repository Layer (QuranRepository + AudioRepository) dengan Local-First pattern
- [ ] Mock data layer tersedia untuk development
- [ ] surahs-data.ts dimigrasikan ke dynamic loader (via Repository)
- [ ] TypeScript interfaces untuk data Quran terdefinisi

### Phase 2 — Audio
- [ ] AudioController service selesai
- [ ] useAudioStore (Zustand) siap
- [ ] useAudio hook tersedia
- [ ] AudioPlayer UI terintegrasi dengan controller
- [ ] BroadcastChannel multi-tab logic diimplementasi
- [ ] Cross-browser audio testing selesai

### Phase 3 — Repeat
- [ ] useRepeatStore dibuat
- [ ] RepeatEngine service selesai
- [ ] Integrasi dengan audio & UI selesai
- [ ] Persistensi konfigurasi ke Dexie (`settings` tabel) berjalan
- [ ] Unit tests passing

### Phase 4 — Focus Mode
- [ ] AyahWordHighlight component diperhalus
- [ ] Logika timing FocusMode diimplementasi
- [ ] Integrasi FocusMode + repeat selesai
- [ ] Play/pause & navigasi berfungsi
- [ ] Route /focus/[id] konsisten di seluruh codebase

### Phase 5 — Offline
- [ ] DownloadManager service berjalan
- [ ] Runtime caching strategy di SW diimplementasi
- [ ] Dexie `downloadManifest` tracking berjalan
- [ ] useOfflineStore dibuat (baca manifest dari Dexie)
- [ ] SW ↔ Client messaging diimplementasi
- [ ] Pemutaran offline berhasil diuji

### Phase 6 — PWA
- [ ] manifest.json dibuat
- [ ] Ikon PWA dibuat & ditambahkan
- [ ] Install prompt berfungsi
- [ ] Offline shell dapat dimuat
- [ ] Mobile PWA testing selesai

### Phase 7 — Testing
- [ ] Unit tests untuk repeat & audio passing
- [ ] Integration & E2E tests passing
- [ ] Accessibility scan passed
- [ ] Performance metrics memenuhi target (Lighthouse >= 80)

### Phase 8 — Release
- [ ] Staging environment siap
- [ ] Release notes ditulis
- [ ] Error tracking terpasang
- [ ] Analytics diimplementasi
- [ ] Staged rollout plan siap
- [ ] MVP ter-rilis!
```

---

# 🚧 7. Blocker Sprint Saat Ini

**Blocker yang sudah diselesaikan:**
- ~~Keputusan data source (API eksternal vs JSON lokal)~~ → **Selesai**: Dataset statis `public/data/*` untuk konten, EveryAyah untuk audio.

**Blocker yang masih aktif:**

| # | Blocker | Phase Terdampak | Tindakan yang Diperlukan |
|---|---------|-----------------|--------------------------|
| 1 | ~~Phase 0 belum dimulai~~ → **Selesai** 17 Juni 2026 | — | ✅ Phase 0 selesai, lanjut Phase 1 |
| 2 | ~~Verifikasi auth Quran Foundation API~~ | — | **Dibatalkan** — tidak lagi menggunakan Quran.com / Quran Foundation API |
| 3 | ~~Test framework belum dikonfigurasi~~ → **Vitest selesai** (Playwright menyusul Phase 7) | Phase 7 | ✅ Vitest + jsdom + fake-indexeddb dikonfigurasi di Phase 0 |
| 4 | Platform deployment belum ditentukan | Phase 8 | Tentukan Vercel/Netlify/self-hosted sebelum Phase 8 dimulai |

---

# ✔️ 8. Definisi Selesai MVP

MVP HanQuran dianggap **selesai** ketika seluruh kondisi berikut terpenuhi:

## Core Flows
- [ ] Pengguna dapat membuka daftar surat dan menavigasi ke surat manapun
- [ ] Pengguna dapat memutar audio per ayat dengan play/pause/seek yang reliabel
- [ ] Pengguna dapat mengaktifkan repeat (1×/3×/5×/∞) untuk ayat saat ini, range ayat, atau seluruh surat
- [ ] Focus Mode menampilkan highlight kata-per-kata dan dapat di-pause/dilanjutkan
- [ ] Navigasi antar ayat di Focus Mode (`/focus/[id]`) berfungsi tanpa keluar dari mode

## Data & State
- [ ] Data surat dimuat via Local-First pattern: dari Dexie jika sudah ada, dari `public/data/*` hanya jika belum di-cache
- [ ] Preferensi pengguna (qari, ukuran teks, terjemahan, favorit, konfigurasi repeat) tersimpan di Dexie
- [ ] Surat/ayat terakhir dilihat tersimpan di Dexie `lastRead` sebagai "Lanjutkan Hafalan"

## Offline & PWA
- [ ] Minimal 1 surat dapat diunduh dan diputar saat offline
- [ ] Aplikasi dapat di-install sebagai PWA di perangkat mobile
- [ ] Offline shell dapat dimuat tanpa koneksi internet

## Kualitas
- [ ] Semua P0 tasks di Phase 1–6 sudah selesai
- [ ] Unit tests & integration tests untuk core flows passing
- [ ] Tidak ada critical regressions
- [ ] Skor Lighthouse ≥ 80 (Performance, Accessibility, Best Practices, PWA)

---

Dokumen ini disimpan sebagai `docs/18-development-tasks.md`. Perbarui dokumen ini setiap kali task dimulai atau diselesaikan. Gunakan checklist di Bagian 6 untuk tracking progress sprint.
