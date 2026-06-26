# 18 — Daftar Pekerjaan Teknis HanQuran (Development Tasks)

Dokumen ini adalah **single source of truth** untuk seluruh backlog implementasi HanQuran menuju MVP. Berisi daftar pekerjaan teknis yang dapat langsung dikerjakan developer.

**Terakhir diperbarui:** 25 Juni 2026
**Status:** 🚧 Sprint 2 — Growth `0.2.0`/`0.3.0` diimplementasi di kode; uji manual perangkat & tag rilis menunggu
**Total Development Tasks:** 97 (70 Selesai, 27 Belum)
**Arsitektur data:** `docs/23-static-dataset-architecture.md`

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


| Aspek                     | Keputusan Final                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Data Source (Production)  | Dataset statis `public/data/*` + CDN audio tilawah — **satu-satunya sumber konten Quran** |
| Data Source (Development) | Sama — `public/data/*` (tidak ada mock layer terpisah)                                    |
| Runtime State             | Zustand                                                                                   |
| Persistent State          | **Dexie** — **hanya data pengguna** (settings, favorites, lastRead, manifest offline)     |
| Quran Content Cache       | In-memory (`services/quran/`) + browser HTTP cache + SW (Phase 5)                         |
| Audio File Cache          | Cache Storage via Service Worker                                                          |
| Route State               | URL Parameter — Next.js App Router                                                        |
| Focus Mode Route          | `/focus/[id]` (contoh: `/focus/2?ayah=5`)                                                 |
| Bootstrap SW              | Phase 0 (skeleton + registrasi awal)                                                      |
| Strategi Offline          | Phase 5 (runtime caching, DownloadManager, manifest Dexie)                                |
| Data Strategy             | **Static Dataset First:** `public/data/*` → `services/quran/` → hooks → UI                |
| Service Layer             | UI → Hooks → `services/quran/` → `public/data/*`                                          |


## Tabel Ringkasan Task per Phase


| Phase     | Nama                              | Total  | P0     | P1     | P2/P3  | Selesai | Status                                       |
| --------- | --------------------------------- | ------ | ------ | ------ | ------ | ------- | -------------------------------------------- |
| 0         | Persiapan & Setup Infrastructure  | 7      | 7      | 0      | 0      | 7       | ✅ Selesai                                    |
| 1         | Static Dataset & Data Integration | 6      | 5      | 1      | 0      | 6       | ✅ Selesai                                    |
| 1b        | Bahasa Aplikasi (`next-intl`)     | 6      | 0      | 5      | 1      | 6       | ✅ Selesai (P2 a11y label tersisa)            |
| 1c        | Verse Display Controls            | 4      | 0      | 4      | 0      | 4       | ✅ Selesai                                    |
| 2         | Audio Controller & State          | 11     | 6      | 3      | 2      | 8       | 🟡 P1 persist posisi                         |
| 2b        | Media Session API                 | 5      | 0      | 4      | 1      | 4       | ✅ Implementasi selesai (uji manual tersisa)  |
| 2c        | Mode Murotal                      | 8      | 0      | 6      | 2      | 7       | ✅ Implementasi selesai (uji manual tersisa)  |
| 3         | Repeat Engine & Configuration     | 9      | 6      | 2      | 1      | 6       | 🟡 Keyboard shortcuts berikutnya             |
| 4         | Word Highlight (Focus Mode)       | 8      | 0      | 0      | 8      | 3       | ⏸️ Post-MVP — MVP fokus (audio/repeat/nav) ✅ |
| 5         | Implementasi Strategi Offline     | 11     | 7      | 3      | 1      | 9       | 🟡 E2E offline playback belum                |
| 6         | PWA & Packaging                   | 8      | 5      | 2      | 1      | 5       | 🟡 Uji manual PWA tersisa                    |
| 7         | Testing & Quality Assurance       | 9      | 6      | 2      | 1      | 2       | ⏳ Audio + repeat unit ✅                      |
| 8         | Release & Monitoring              | 11     | 6      | 3      | 2      | 3       | 🟡 Error tracking & rollout belum            |
| **TOTAL** |                                   | **97** | **48** | **31** | **18** | **70**  |                                              |


> Catatan: Phase 7 (Testing & QA) berjalan **paralel** mulai Phase 1 — bukan sequential setelah Phase 6 selesai.

---

# 🖥️ 2. Status Implementasi Saat Ini

Codebase aktif berada di `hanquran-app/` (Next.js App Router). **Konten Quran** dimuat dari `public/data/*` via `services/quran/`. **Data pengguna** persisten di Dexie via Zustand stores.

**Arsitektur resmi MVP:** `docs/23-static-dataset-architecture.md`  
**Scope Mode Fokus:** `docs/24-focus-mode-mvp-scope.md` (word-by-word **bukan** MVP V1)

**Belum selesai:**

- Uji manual lock screen Media Session (`docs/27` §8) — sebelum tag `v0.2.0`
- Uji manual Mode Murotal lintas surat — sebelum tag `v0.3.0`
- Persist posisi audio terakhir
- Word-by-word highlight (Post-MVP)
- E2E / verifikasi offline playback

---

# 🗂️ 3. Existing Components

Komponen-komponen berikut **sudah ada** di codebase `hanquran-app/`. Halaman utama sudah memuat data nyata via `services/quran/` dan hooks (`useSurahList`, `useSurah`, `useAyahAudioUrl`, `useReciters`). Preferensi bacaan & locale persisten di Dexie via `useUserStore`.

## Halaman (4 halaman)


| File                      | Route         | Keterangan                                                                           |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `app/page.tsx`            | `/` (Beranda) | ✓ Data nyata — `useSurahList`, Lanjutkan Hafalan, favorit persisten (`useUserStore`) |
| `app/surah/[id]/page.tsx` | `/surah/[id]` | ✓ Data nyata + audio + RepeatEngine terintegrasi                                     |
| `app/focus/[id]/page.tsx` | `/focus/[id]` | ✓ Baca fokus — ayat nyata, tanpa word highlight (MVP)                                |
| `app/settings/page.tsx`   | `/settings`   | ✓ Bahasa, qari, ukuran teks Arab, playback, aksesibilitas, status offline & cache    |


## Komponen Layar (19 komponen)

`VerseDisplayControls` (legacy: `ActionBar`) | `AudioPlayer` | `AyahCard` | `AyahWordHighlight` | `BottomNavigation` | `ContinueReading` | `Favorites` | `FilterChips` | `FocusModePlayer` | `Header` | `OfflineStatusBadge` | `RepeatSelector` | `RepeatSettingsDialog` | `RepeatStatus` | `SearchInput` | `SettingsSection` | `SurahCard` | `SurahDetailHeader` | `SurahDetailScrollSpacer`

## Komponen Bersama (1 komponen)

`components/shared/Logo.tsx`

## Providers (2 komponen)

`components/providers/app-providers.tsx` | `components/providers/intl-provider.tsx`

## UI Primitives (6 komponen)

`Button` | `Dialog` | `Drawer` | `SegmentedControl` | `Select` | `Switch`

## Service Layer — Quran (9 file)

`services/quran/data-loader.ts` | `mappers.ts` | `quran-service.ts` | `audio-service.ts` | `audio-config.ts` | `paths.ts` | `app-types.ts` | `dataset-types.ts` | `index.ts`

## Hooks (15 file)

`hooks/use-media-query.ts` | `use-surah-list.ts` | `use-surah.ts` | `use-reciters.ts` | `use-ayah-audio.ts` | `use-reading-display.ts` | `use-surah-detail-bottom-inset.ts` | `use-surah-repeat-playback.ts` | `use-arabic-text-size.ts` | `use-preferred-reciter.ts` | `use-surah-offline-download.ts` | `use-persist-last-viewed.ts` | `use-is-client.ts` | `use-install-prompt.ts` | `use-track-surah-opened.ts`

## i18n (2 file + messages)

`i18n/config.ts` | `i18n/detection.ts` | `messages/id.json` | `messages/en.json`

## Stores (4 store + barrel)

`stores/audioStore.ts` | `userStore.ts` | `repeatStore.ts` | `offlineStore.ts` | `index.ts`

## Utilitas (7 file)

`lib/routes.ts` | `lib/repeat-options.ts` | `lib/surah-detail-chrome.ts` | `lib/utils.ts` | `lib/arabic-text-size.ts` | `lib/translation-language.ts` | `lib/format-bytes.ts` | `lib/install-prompt.ts` | `lib/pwa-splash.ts` | `lib/analytics/`

## Aset Branding & PWA (5 aset)

`public/branding/logo.png` | `public/branding/logo-with-text.png` | `public/manifest.json` | `public/offline.html` | `public/icons/icon-192.png` | `public/icons/icon-512.png`

**Total item inventaris: ~50+** (UI + service + hooks)

> Audio & repeat terintegrasi via `useAudio` / `useSurahRepeatPlayback` + Zustand stores. `lib/surahs-data.ts` sudah dihapus.

---

# ✅ 4. Completed Tasks

**Total development task yang benar-benar selesai: 70**

Pendukung: Vitest (`vitest.config.ts`, `tests/setup.ts`).

### Phase 0 — selesai (7/7, 24 Juni 2026) ✅

1. ✅ Folder structure (`stores/`, `services/`, `types/`, `tests/`)
2. ✅ Dexie setup — `services/db/db.ts` + `services/db/migrations.ts` (schema v2, data pengguna)
3. ✅ Zustand stores — `audioStore`, `userStore`, `repeatStore`, `offlineStore`
4. ✅ Base types — `types/index.ts`
5. ✅ Service Worker — `public/sw.js` + registrasi via `lib/register-service-worker.ts` di `AppProviders`
6. ✅ Error boundary — `components/shared/ErrorBoundary.tsx`, `ErrorFallback.tsx`
7. ✅ Dokumentasi setup — `docs/SETUP.md` + `README.md`

### Phase 1 — Static Dataset (6/6, 24 Juni 2026) ✅

1. ✅ Integrasi loader dataset statis `public/data/*`
2. ✅ Integrasi CDN audio tilawah — `audio-service.ts`
3. ✅ Migrasi dari `lib/surahs-data.ts`
4. ✅ TypeScript interfaces — `services/quran/app-types.ts`
5. ✅ Hooks + wire halaman (`useSurahList`, `useSurah`, dll.)
6. ✅ Fallback UI kegagalan load data — `DataLoadErrorFallback` + retry di hooks

**Dibatalkan (bukan MVP):** `QuranRepository` Dexie-first, seed/hydrate Dexie untuk konten Quran — lihat `docs/23-static-dataset-architecture.md`.

### Phase 1b — i18n (6/6, 24 Juni 2026) ✅

1. ✅ Setup `next-intl` — `i18n/config.ts`, `messages/id.json`, `messages/en.json`, `IntlProvider`
2. ✅ Deteksi bahasa first launch — `i18n/detection.ts`
3. ✅ Field `appLocale` di Dexie `settings`
4. ✅ Bagian Bahasa Aplikasi di `/settings`
5. ✅ Migrasi string UI — lihat `docs/i18n-migration-report.md`
6. ✅ Arti surat & terjemahan ayat mengikuti `appLocale` — `getSurahMeaning()`, `lib/translation-language.ts`, `hooks/use-surah.ts`

### Phase 1c — Verse Display Controls (4/4, 24 Juni 2026)

1. ✅ Komponen `VerseDisplayControls` — `components/verse-display-controls.tsx`
2. ✅ Hook `useReadingDisplay` + field `transliterationVisible` di Dexie
3. ✅ Wire Surah Detail & Focus Mode — lihat `docs/verse-display-controls-implementation.md`
4. ✅ Hapus section Terjemahan dari Settings

### Aksesibilitas Settings (24 Juni 2026)

1. ✅ Persist `contrastMode` & `smoothAnimation` via `useUserStore` di `/settings`
2. ✅ `AccessibilityProvider` — kontras tinggi (`data-contrast`) & animasi (`MotionConfig` + `data-motion`)
3. ✅ CSS global untuk mode kontras tinggi & reduced motion

### Tentang HanQuran (24 Juni 2026)

1. ✅ Spesifikasi layar — `docs/26-about-screen-spec.md`
2. ✅ Route `/settings/about` + `routes.settingsAbout()`
3. ✅ Metadata terpusat — `lib/app-about.ts`, credits — `data/about-credits.ts`
4. ✅ i18n namespace `about` (`id` / `en`)
5. ✅ Link navigasi di halaman Pengaturan

### Playback Settings (25 Juni 2026)

1. ✅ Spesifikasi — `docs/28-playback-settings.md`
2. ✅ Field `autoFollowPlayback` di `SettingsRecord` + backfill saat `init` (default `true`)
3. ✅ Section **Playback** di `/settings` dengan toggle Auto Follow Playback
4. ✅ Hook auto scroll ayat aktif di Surah Detail (`useAutoFollowPlayback`)
5. ✅ i18n namespace `settings.playback` (`id` / `en`)
6. ✅ Unit test perilaku auto follow & suspend saat scroll manual

### Mode Murotal (25 Juni 2026)

1. ✅ Spesifikasi — `docs/29-murotal-mode-spec.md`
2. ✅ Field `murotalEnabled` + migrasi Dexie
3. ✅ `services/murotal-resolver.ts` + integrasi `use-surah-repeat-playback`
4. ✅ Toggle UI + i18n di Settings
5. ✅ Analytics event murotal
6. ✅ Unit test resolver, pending play, orkestrasi

### Transport ⏮/⏭ audio (25 Juni 2026)

1. ✅ Spesifikasi aturan — `docs/29-murotal-mode-spec.md` §7.2, `docs/28-playback-settings.md` §4.6
2. ✅ `services/playback-track-navigation.ts` + `lib/surah-ayah-counts.ts`
3. ✅ `goToPreviousTrack` / `goToNextTrack` di `use-surah-repeat-playback`
4. ✅ Berlaku Surah Detail, Focus Mode, dan Media Session `previoustrack`/`nexttrack`
5. ✅ Unit test `playback-track-navigation`

### Media Session API (25 Juni 2026)

1. ✅ Spesifikasi — `docs/27-media-session-api-spec.md`
2. ✅ Service `services/media-session.ts` — metadata, play/pause, `setPositionState`, seek
3. ✅ Integrasi `AudioController` — lifecycle play/pause/ganti trek
4. ✅ Action handlers `previoustrack` / `nexttrack` via `use-surah-repeat-playback`
5. ✅ Unit test `tests/services/media-session.test.ts` + integrasi `audio-controller.test.ts`
6. ⏳ Checklist manual lock screen — `docs/27` §8 (wajib sebelum tag `v0.2.0`)

### Progress Repeat x/y (25 Juni 2026)

1. ✅ `RepeatProgressBadge` — badge `current/target` (mis. `2/5`, `3/∞`) di `RepeatSelector` inline
2. ✅ `lib/repeat-progress.ts` — formatter label
3. ✅ `RepeatStatus` — fraksi x/y di panel/dialog
4. ✅ Tampil saat `runtime.isActive` (termasuk pause di tengah siklus)
5. ✅ Berlaku Surah Detail & Focus Mode
6. ✅ Unit test `formatRepeatProgressLabel`

### Auto Follow — perbaikan landscape (25 Juni 2026)

1. ✅ `measureSurahDetailTopInset` — abaikan chrome static yang ter-scroll keluar layar
2. ✅ `getViewportHeight` — memakai `visualViewport` di mobile
3. ✅ `useSurahDetailBottomInset` — ukur chrome bawah dengan `visualViewport`
4. ✅ Pembaruan `docs/28-playback-settings.md` §4.4
5. ✅ Unit test chrome landscape

### Lanjutkan Hafalan (24 Juni 2026)

1. ✅ `usePersistLastViewed` — simpan surat/ayat aktif ke Dexie `lastRead` dari Surah Detail & Focus
2. ✅ `ContinueReadingSection` di Beranda — kartu hanya tampil jika `lastViewed` ada; link ke `/surah/[id]?ayah=`

### Favorit Surat (24 Juni 2026)

1. ✅ Beranda — filter Favorit & toggle heart via `useUserStore.toggleFavorite` (Dexie `favorites`, key `surahId`)
2. ✅ Surah Detail — tombol favorit di header ter-wire ke store yang sama

### PWA Manifest (24 Juni 2026)

1. ✅ `public/manifest.json` — metadata installable PWA (`standalone`, `theme_color`, ikon)
2. ✅ Link manifest & `themeColor` di `app/layout.tsx` selaras design system (`#0F766E`)
3. ✅ Ikon PWA sementara `public/icons/icon-192.png` & `icon-512.png` (derivasi logo branding)
4. ✅ `useInstallPrompt` + `InstallBanner` — deteksi `beforeinstallprompt` & petunjuk iOS Safari

### Offline Shell (24 Juni 2026)

1. ✅ `public/offline.html` — halaman fallback statis (Bahasa Indonesia, branding, muat ulang)
2. ✅ Cache `hanquran-shell-v1` — precache offline shell + strategi network-first navigasi di `sw.js`
3. ✅ Prefetch `/offline.html` di `app/layout.tsx`

### Offline First Sejati (26 Juni 2026)

Acuan: `docs/30-offline-behavior-spec.md` §6. Tujuan: PWA berfungsi penuh tanpa
jaringan sejak SW terpasang (termasuk cold start), jaringan hanya untuk audio.

1. ✅ `scripts/generate-sw-precache.mjs` + `postbuild` — generate daftar precache
   (`/_next/static/*` ber-hash + seluruh `/data/*` + ikon) ke
   `public/sw-precache-manifest.js`.
2. ✅ `sw.js` `precacheOnInstall()` — precache app shell + static + dataset penuh
   saat event `install` (cache dinaikkan ke `*-v2`).
3. ✅ App-shell route dinamis — `parseSurahIdFromPathname()`; halaman
   `/surah/[id]` & `/focus/[id]` membaca id dari URL, satu shell melayani semua id.
4. ✅ `sw.js` `handleNavigation()` / `handleAppRouter()` — fallback app-shell
   (bukan `offline.html`) untuk `/surah/*` & `/focus/*` saat offline.
5. ✅ Hapus precache berbasis online (`offline-app-precache.ts`) — digantikan
   precache `install`.

**Belum selesai:**

- Verifikasi manual di perangkat: install SW saat online sekali → matikan
  jaringan → cold start PWA, buka Beranda/about/focus/surat-belum-unduh, batas
  Murotal offline (`docs/30` §8).

### PWA Splash Screen (24 Juni 2026)

1. ✅ Overlay splash statis di `app/layout.tsx` — logo + warna `#FAFAF8` / `#0F172A` (dark)
2. ✅ Inline script deteksi `display-mode: standalone` untuk cold start instan
3. ✅ `PwaSplashDismisser` — tutup splash setelah `load` (min 500 ms)
4. ✅ Manifest — ikon maskable 192 & warna splash selaras design system

### Deploy & Release (24 Juni 2026)

1. ✅ `docs/25-deployment-vercel.md` — staging/preview/production di Vercel, checklist QA, rollback
2. ✅ `RELEASE.md` — template catatan rilis + draf MVP `0.1.0`
3. ✅ `docs/SETUP.md` §10 — ringkasan deploy + link ke panduan

### Vercel Analytics (24 Juni 2026)

1. ✅ `lib/analytics/` — abstraction custom events type-safe
2. ✅ Wire ke surat, audio, favorit, last read, repeat
3. ✅ `docs/analytics.md` — katalog event & panduan menambah event

### Store & offline (terintegrasi)

- `audioStore` — terintegrasi ke `AudioPlayer` via `useAudio`
- `repeatStore` — terintegrasi ke Surah Detail & Focus via `useSurahRepeatPlayback` + `RepeatEngine`
- `offlineStore` — `DownloadManager`, manifest reciter-aware, badge; di-init via `initStores()` di `AppProviders`

Verifikasi: `npm run build` dan `npm run test` (128 test) lulus.

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
  - File: `types/index.ts` (konsolidasi domain + audio + repeat + offline)
  - Ketergantungan: None
  - Prioritas: P0

- [x] [NEW] Bootstrap Service Worker — skeleton & registrasi
  - File: `public/sw.js`, `lib/register-service-worker.ts`, `components/providers/app-providers.tsx`
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

**Total: 6 tasks | P0: 5 | P1: 1**

> Keputusan final MVP: `**public/data/*`** adalah sumber kebenaran konten Quran.
> Akses via `**services/quran/`** — **bukan** Dexie, **bukan** `QuranRepository`.
> Detail: `**docs/23-static-dataset-architecture.md`**, `**docs/07-api-integration.md`**.

### Wajib (P0)

- [x] [NEW] Integrasi loader dataset statis `public/data/*`
  - File: `services/quran/data-loader.ts`, `services/quran/mappers.ts`
  - Prioritas: P0

- [x] [NEW] Integrasi CDN audio tilawah untuk playback
  - File: `services/quran/audio-service.ts`, `hooks/use-ayah-audio.ts`
  - Prioritas: P0

- [x] [UPDATE] Migrate `lib/surahs-data.ts` ke dynamic loader
  - File: dihapus; `hooks/use-surah-list.ts`, `hooks/use-surah.ts`, halaman
  - Prioritas: P0

- [x] [NEW] Definisikan TypeScript interfaces untuk data Quran
  - File: `services/quran/app-types.ts`, `services/quran/dataset-types.ts`
  - Prioritas: P0

- [x] [NEW] React hooks untuk konten Quran
  - File: `hooks/use-surah-list.ts`, `hooks/use-surah.ts`, `hooks/use-reciters.ts`
  - Prioritas: P0

### Disarankan (P1)

- [x] [UPDATE] Tambah error boundary & fallback UI untuk kegagalan load data
  - File: `components/shared/ErrorFallback.tsx` (`DataLoadErrorFallback`), `hooks/use-surah-list.ts`, `hooks/use-surah.ts`, `app/page.tsx`, `app/surah/[id]/page.tsx`, `app/focus/[id]/page.tsx`
  - Prioritas: P1

### Post-MVP (P3)

- [ ] [NEW] Implementasi search index — gunakan `public/data/search/*` bila generator menyediakan
  - File: `services/quran/search-service.ts` (usulan)
  - Catatan: **jangan** pakai Dexie untuk search index
  - Prioritas: P3

---

## Phase 1b — Bahasa Aplikasi (`next-intl`)

**Total: 6 tasks | P0: 0 | P1: 5 | P2: 1**

> Spesifikasi: `**docs/21-i18n-and-locale.md`**. Framework: `**next-intl`** (bukan i18next). Route MVP tetap tanpa prefix locale.

### Disarankan (P1)

- [x] [NEW] Setup `next-intl` untuk App Router
  - File: `i18n/config.ts`, `messages/id.json`, `messages/en.json`, `components/providers/intl-provider.tsx`
  - Catatan: tanpa `i18n/request.ts` — locale client-side via `IntlProvider` + `useUserStore`
  - Prioritas: P1

- [x] [NEW] Implementasi deteksi bahasa first launch
  - Tujuan: Browser locale + timezone Indonesia → default `id`, else `en`
  - File: `i18n/detection.ts`
  - Prioritas: P1

- [x] [NEW] Field `appLocale` di schema `settings` (Dexie)
  - Prioritas: P1

- [x] [NEW] Bagian **Bahasa Aplikasi** di `/settings`
  - Prioritas: P1

- [x] [UPDATE] Migrasi string UI ke `messages/id.json` & `messages/en.json`
  - Prioritas: P1

### Opsional (P2)

- [ ] [NEW] Verifikasi aksesibilitas label per locale
  - Prioritas: P2

---

## Phase 1c — Verse Display Controls

**Total: 4 tasks | P1: 4**

> Spesifikasi: `**docs/22-verse-display-controls.md`**. Laporan implementasi: `**docs/verse-display-controls-implementation.md`**.

- [x] [NEW] Komponen `VerseDisplayControls` (Terjemahan / Transliterasi / Fokus)
  - File: `components/verse-display-controls.tsx` (alias legacy: `action-bar.tsx`)
  - Prioritas: P1

- [x] [NEW] Hook preferensi baca persisten + schema `transliterationVisible`
  - File: `hooks/use-reading-display.ts`, `types/index.ts`, `stores/userStore.ts`, `services/db/db.ts`
  - Prioritas: P1

- [x] [UPDATE] Wire Surah Detail & Focus Mode ke preferensi persisten
  - File: `app/surah/[id]/page.tsx`, `app/focus/[id]/page.tsx`, `components/ayah-card.tsx`
  - Prioritas: P1

- [x] [UPDATE] Hapus kontrol terjemahan dari Settings
  - File: `app/settings/page.tsx`
  - Prioritas: P1

---

## Phase 1d — Lanjutkan Hafalan (PB-008)

**Total: 2 tasks | P1: 2**

### Disarankan (P1)

- [x] [NEW] Hook `usePersistLastViewed` — simpan posisi terakhir ke Dexie `lastRead`
  - File: `hooks/use-persist-last-viewed.ts`, `stores/userStore.ts`, `app/surah/[id]/page.tsx`, `app/focus/[id]/page.tsx`
  - Prioritas: P1
  - **Ringkasan:** Dipanggil saat ayat aktif berubah di Surah Detail & Focus Mode

- [x] [UPDATE] Wire kartu Lanjutkan Hafalan di Beranda ke `lastViewed`
  - File: `components/continue-reading.tsx` (`ContinueReadingSection`), `app/page.tsx`
  - Prioritas: P1
  - **Ringkasan:** Kartu hanya tampil jika data `lastRead` tersedia; navigasi ke posisi tersimpan

---

## Phase 1e — Favorit Surat (PB-009)

**Total: 2 tasks | P2: 2**

### Nice to Have (P2)

- [x] [UPDATE] Wire favorit persisten di Beranda ke `useUserStore`
  - File: `app/page.tsx`, `components/surah-card.tsx`
  - Prioritas: P2
  - **Ringkasan:** Filter `Favorit` memakai `favorites: number[]` dari Dexie; toggle heart memanggil `toggleFavorite(surahId)`

- [x] [UPDATE] Wire tombol favorit di Surah Detail ke `useUserStore`
  - File: `app/surah/[id]/page.tsx`, `components/surah-detail-header.tsx`
  - Prioritas: P2
  - **Ringkasan:** Status favorit sinkron dengan Beranda & persisten antar sesi

---

## Phase 2 — Audio Controller & State

**Total: 11 tasks | P0: 6 | P1: 3 | P2: 1 | P3: 1**

### Wajib (P0)

- [x] [NEW] Buat `AudioController` service class
  - File: `services/audio-controller.ts`
  - Prioritas: P0

- [x] [NEW] Setup Zustand `useAudioStore`
  - Tujuan: Global state untuk status pemutaran audio
  - File: `stores/audioStore.ts`
  - State: `isPlaying`, `currentTrack`, `currentTime`, `duration`, `playbackRate`
  - Ketergantungan: None
  - Prioritas: P0
  - **Catatan:** store ✅; terintegrasi ke `AudioPlayer` via `useAudio`

- [x] [NEW] Buat `useAudio` hook
  - File: `hooks/use-audio.ts` (+ `useAudioOnEnded`)
  - Prioritas: P0

- [x] [UPDATE] Integrasikan `AudioController` dengan komponen `AudioPlayer`
  - File: `components/audio-player.tsx`, `app/surah/[id]/page.tsx`
  - Prioritas: P0

- [x] [NEW] Implementasi single-tab leadership dengan `BroadcastChannel`
  - Tujuan: Mencegah lebih dari satu tab memutar audio bersamaan
  - File: `services/audio-controller.ts`, `services/audio-tab-sync.ts`
  - Ketergantungan: Store & controller base implementation
  - Prioritas: P0

- [x] [TEST] Uji audio play/pause/seek di desktop & mobile browser
  - Tujuan: Verifikasi perilaku audio lintas browser
  - File: Manual testing + `tests/services/audio-controller.test.ts`, `tests/hooks/use-audio.test.ts`
  - Ketergantungan: Integrasi audio selesai
  - Prioritas: P0
  - **Hasil otomatis:** 22 test `AudioController`, 5 test `useAudio`, 4 test `AudioTabSync` — semua passing
  - **Checklist manual** (jalankan di browser nyata sebelum rilis):


| #   | Skenario                                                        | Desktop (Chrome/Firefox) | Mobile (Safari/Chrome) | ✓   |
| --- | --------------------------------------------------------------- | ------------------------ | ---------------------- | --- |
| 1   | Buka `/surah/1`, tap play ayat 1 — audio terdengar              | ✓                        | ✓                      | ✓   |
| 2   | Tap pause — audio berhenti, ikon berubah                        | ✓                        | ✓                      | ✓   |
| 3   | Tap play lagi — melanjutkan dari posisi terakhir                | ✓                        | ✓                      | ✓   |
| 4   | Geser slider seek — posisi audio & label waktu berubah          | ✓                        | ✓                      | ✓   |
| 5   | Tap play ayat 2 — trek berganti, ayat 1 berhenti                | ✓                        | ✓                      | ✓   |
| 6   | Buka tab kedua `/surah/1`, play di tab 2 — tab 1 otomatis pause | ✓                        | ✓                      | ✓   |
| 7   | Putar sampai selesai — status kembali ke pause                  | ✓                        | ✓                      | ✓   |


- **Perintah:** `npm run test` (unit) · `npm run dev` lalu uji di `http://localhost:3000/surah/1`

### Disarankan (P1)

- [x] [UPDATE] Implementasi audio preloading & prefetch hints
  - Tujuan: Tingkatkan kelancaran pemutaran
  - File: `services/audio-controller.ts`, `services/audio-prefetch.ts`, `services/quran/audio-service.ts`, `hooks/use-audio.ts`, `app/surah/[id]/page.tsx`
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P1
  - **Ringkasan:** prefetch ayat berikutnya via `<link rel="prefetch">` + `AudioPrefetchBuffer`; dipicu saat ganti ayat & setelah play

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

- [x] [NEW] Dukungan beberapa pilihan qari (audio reciter)
  - Tujuan: Memungkinkan pengguna memilih suara berbeda
  - File: `stores/userStore.ts`, `hooks/use-preferred-reciter.ts`, `app/settings/page.tsx`, `hooks/use-audio.ts`
  - Ketergantungan: Audio playback berjalan, URL builder ayat tersedia
  - Prioritas: P2
  - **Ringkasan:** Pilihan qari di Pengaturan persisten (`settings.reciterId`); dipakai di Surah Detail & `useAudio`

### Post-MVP (P3)

- [ ] [NEW] Visualisasi audio (waveform/frequency bars)
  - Tujuan: Umpan balik visual selama pemutaran
  - File: `components/audio-player.tsx` (tambah visualizer)
  - Ketergantungan: Audio playback berjalan
  - Prioritas: P3

---

## Phase 2b — Media Session API

**Total: 5 tasks | P0: 0 | P1: 4 | P2: 1**

> Spesifikasi: `docs/27-media-session-api-spec.md` · Versi target: **0.2.0** · Bukan blocker MVP `0.1.0`

### Disarankan (P1)

- [x] [DOC] Tulis spesifikasi Media Session API
  - File: `docs/27-media-session-api-spec.md`, pembaruan dokumen terkait
  - Prioritas: P1
  - **Ringkasan:** scope, arsitektur, kriteria penerimaan, dukungan platform, rencana rilis 0.2.0

- [x] [NEW] Buat service `media-session.ts`
  - Tujuan: Metadata surat/ayat/qari + action handlers Play/Pause
  - File: `services/media-session.ts`
  - Ketergantungan: `AudioController` berjalan
  - Prioritas: P1
  - **Ringkasan:** metadata, `playbackState`, `setPositionState`, `seekto`, fallback no-op

- [x] [UPDATE] Integrasikan Media Session ke `AudioController`
  - Tujuan: Sinkron lifecycle play/pause/trek dengan `navigator.mediaSession`
  - File: `services/audio-controller.ts`, `services/media-session.ts`
  - Ketergantungan: Service `media-session.ts`
  - Prioritas: P1

- [x] [TEST] Unit test Media Session
  - Tujuan: Verifikasi metadata, position state, handlers play/pause/seek
  - File: `tests/services/media-session.test.ts`, `tests/services/audio-controller.test.ts`
  - Ketergantungan: Integrasi selesai
  - Prioritas: P1
  - **Catatan:** uji manual lock screen mobile — checklist `docs/27` §8 (belum diisi)

### Nice to Have (P2)

- [x] [UPDATE] Action handlers `previoustrack` / `nexttrack` dari lock screen
  - Tujuan: Navigasi ayat tanpa membuka aplikasi
  - File: `services/media-session.ts`, `hooks/use-surah-repeat-playback.ts`
  - Ketergantungan: Media Session dasar selesai
  - Prioritas: P2
  - **Ringkasan:** mengikuti aturan transport `docs/29` §7.2 (lintas surat jika Murotal ON)

### Uji manual (wajib sebelum tag `v0.2.0`)

- [x] [TEST] Uji kontrol lock screen & background playback (mobile)
  - Tujuan: Verifikasi metadata + Play/Pause di Android Chrome & iOS Safari (tab & PWA)
  - File: Checklist `docs/27-media-session-api-spec.md` §8
  - Ketergantungan: Integrasi selesai
  - Prioritas: P1

---

## Phase 2c — Mode Murotal

**Total: 8 tasks | P0: 0 | P1: 6 | P2: 2**

> Spesifikasi: `docs/29-murotal-mode-spec.md` · Versi target: **0.3.0** · Bukan blocker MVP `0.1.0`

### Disarankan (P1)

- [x] [DOC] Tulis spesifikasi Mode Murotal
  - File: `docs/29-murotal-mode-spec.md`, pembaruan dokumen terkait
  - Prioritas: P1

- [x] [NEW] Buat service `murotal-resolver.ts`
  - Tujuan: Pure functions — tentukan aksi setelah ayat selesai saat murotal ON
  - File: `services/murotal-resolver.ts`, `tests/services/murotal-resolver.test.ts`
  - Prioritas: P1

- [x] [UPDATE] Integrasikan murotal ke `use-surah-repeat-playback.ts`
  - Tujuan: Setelah RepeatEngine `stop`, evaluasi murotal dan advance ayat/surat
  - File: `hooks/use-surah-repeat-playback.ts`, `app/surah/[id]/page.tsx`, `app/focus/[id]/page.tsx`
  - Ketergantungan: `murotal-resolver.ts`, RepeatEngine
  - Prioritas: P1

- [x] [UPDATE] Toggle Mode Murotal di Settings
  - Tujuan: `settings.murotalEnabled` persisten + UI Switch di section Playback
  - File: `app/settings/page.tsx`, `stores/userStore.ts`, migrasi Dexie
  - Prioritas: P1

- [x] [UPDATE] i18n `settings.playback.murotalEnabled`
  - File: `messages/id.json`, `messages/en.json`
  - Prioritas: P1

- [x] [NEW] Aturan tombol ⏮/⏭ transport audio
  - Tujuan: Prev/next dalam surat (default); lintas surat jika Murotal ON
  - File: `services/playback-track-navigation.ts`, `lib/surah-ayah-counts.ts`, `hooks/use-surah-repeat-playback.ts`
  - Prioritas: P1
  - **Spesifikasi:** `docs/29-murotal-mode-spec.md` §7.2

- [x] [TEST] Unit test navigasi transport & murotal
  - File: `tests/services/playback-track-navigation.test.ts`, `tests/services/murotal-resolver.test.ts`, `tests/services/playback-murotal-orchestration.test.ts`
  - Prioritas: P1

### Nice to Have (P2)

- [x] [TEST] Uji manual tilawah berkelanjutan lintas surat
  - Tujuan: Al-Fatihah → Al-Baqarah; repeat 5× + murotal ON
  - Prioritas: P2

---

## Phase 3 — Repeat Engine & Configuration

**Total: 9 tasks | P0: 6 | P1: 2 | P3: 1**

### Wajib (P0)

- [x] [NEW] Buat Zustand `useRepeatStore`
  - Tujuan: Store konfigurasi repeat (`count`, `target`, `range`) dan runtime state
  - File: `stores/repeatStore.ts`
  - State: `repeatCount`, `repeatTarget`, `rangeFrom`, `rangeTo`, `currentCycle`, `isActive`
  - Ketergantungan: None
  - Prioritas: P0
  - **Catatan:** store + persist config ✅; `initStores()` di `AppProviders`; halaman surat via `useSurahRepeatPlayback`

- [x] [NEW] Implementasi `RepeatEngine` service (pure logic)
  - Tujuan: Logika pengulangan — lacak siklus, tentukan ayat berikutnya, berhenti saat selesai
  - File: `services/repeat-engine.ts`, `tests/services/repeat-engine.test.ts`
  - Ketergantungan: Schema `repeatStore` sudah terdefinisi
  - Prioritas: P0

- [x] [UPDATE] Integrasi `RepeatEngine` dengan `AudioController` & UI Repeat
  - Tujuan: Saat audio ayat selesai, repeat engine menentukan aksi berikutnya
  - File: `hooks/use-surah-repeat-playback.ts`, `app/surah/[id]/page.tsx`, `components/audio-player.tsx`, `stores/repeatStore.ts`
  - Ketergantungan: `AudioController`, `RepeatEngine`, `repeatStore`
  - Prioritas: P0
  - **Catatan:** `onEnded` → `computeNextOnAyahEnd`; replay/advance/stop; selesai scope → stop (tanpa lanjut surat berikutnya)

- [x] [UPDATE] Implementasi persistensi `RepeatSettingsDialog` ke IndexedDB
  - Tujuan: Simpan preferensi repeat pengguna antar sesi
  - File: `stores/repeatStore.ts` (`applyConfig`, `patchConfig` → Dexie `settings.repeatConfig`)
  - Ketergantungan: `repeatStore`
  - Prioritas: P0

- [x] [UPDATE] Perbarui tampilan komponen `RepeatStatus`
  - Tujuan: Tampilkan status repeat saat ini (contoh: "Siklus 2/5")
  - File: `components/repeat-status.tsx`, `hooks/use-surah-repeat-playback.ts`
  - Ketergantungan: `repeatStore`, `getDisplayCycle`
  - Prioritas: P0

- [x] [TEST] Unit tests untuk repeat engine logic
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

## Phase 4 — Word Highlight (Post-MVP)

**Total: 8 tasks | Status: ⏸️ Ditunda — bukan blocker MVP V1**

> **Keputusan 24 Juni 2026:** `docs/24-focus-mode-mvp-scope.md`. Dataset `word_by_word` kosong; simulasi interval dihapus dari kode. Mode Fokus MVP = layar baca bebas distraksi tanpa highlight kata.

> Route: `/focus/[id]` — `app/focus/[id]/page.tsx`. Query opsional: `?ayah=<number>`.

### Post-MVP (seluruh task Phase 4)

- [ ] [REFACTOR] Perhalus komponen `AyahWordHighlight` untuk transisi highlight state
  - Prioritas: Post-MVP

- [ ] [UPDATE] Implementasi logika timing kata-per-kata di FocusMode (sinkron audio, bukan interval mock)
  - Prioritas: Post-MVP

- [x] [UPDATE] Integrasi FocusMode dengan repeat engine + audio
  - Prioritas: MVP ✅ — `app/focus/[id]/page.tsx` + `useSurahRepeatPlayback`

- [x] [UPDATE] Play/pause & progress bar FocusMode terhubung audio nyata
  - Prioritas: MVP ✅ — `AudioPlayer` + `RepeatSelector` inline + `useSurahRepeatPlayback`

- [x] [UPDATE] Navigasi prev/next ayat di FocusMode
  - Prioritas: MVP ✅ — `navigateAyah` di `app/focus/[id]/page.tsx`

### Disarankan (P1) — Post-MVP

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

- [x] [NEW] Buat `DownloadManager` service untuk caching audio
  - Tujuan: Orkestrasi unduhan audio ke Cache Storage via Service Worker
  - File: `services/download-manager.ts`, `services/download-manager-types.ts`, `services/audio-cache-constants.ts`
  - Ketergantungan: Service Worker sudah terdaftar (Phase 0)
  - Prioritas: P0
  - **Catatan:** `downloadSurah()` ✅; fallback client Cache API saat SW tidak aktif (dev); unit test ✅

- [x] [UPDATE] Implementasi runtime caching strategy di Service Worker
  - Tujuan: Cache respons API dan file audio — `stale-while-revalidate` untuk aset, `cache-first` untuk data Quran (`hanquran-data-v1`), dan runtime caching untuk audio (`hanquran-audio-v1`)
  - File: `public/sw.js`, `public/sw-helpers.js`
  - Ketergantungan: SW skeleton dari Phase 0 sudah siap
  - Prioritas: P0
  - **Catatan:** handler `fetch` ✅; lookup audio mengabaikan header Range; unit test `sw-helpers` ✅

- [x] [UPDATE] Implementasi manifest unduhan di Dexie tabel `downloadManifest`
  - Tujuan: Mengetahui surat/ayat mana yang sudah tersedia offline via Dexie `downloadManifest`
  - File: `services/download-manager.ts` (tulis manifest), `stores/offlineStore.ts` (baca manifest dari Dexie)
  - Ketergantungan: Dexie setup selesai (Phase 0)
  - Prioritas: P0
  - **Catatan:** status `downloading` / `ready` / `failed` diperbarui oleh DownloadManager; `offlineStore.refreshManifest()` sinkron

- [x] [NEW] Setup Zustand `useOfflineStore`
  - Tujuan: Lacak status koneksi, progres unduhan, dan ringkasan manifest cache
  - File: `stores/offlineStore.ts`
  - State: `connectionStatus`, `downloadStatuses`, `manifestSummary`
  - Ketergantungan: None
  - Prioritas: P0
  - **Catatan:** store ✅; di-init via `initStores()` di `AppProviders`; terhubung ke `DownloadManager`

- [x] [NEW] Implementasi messaging SW ↔ Client (`BroadcastChannel` / `postMessage`)
  - Tujuan: SW menginformasikan client tentang progres unduhan & completion
  - File: `public/sw.js`, `services/download-manager.ts`
  - Ketergantungan: SW terdaftar, `offlineStore` siap
  - Prioritas: P0
  - **Catatan:** `prefetch-surah` → `download-progress` / `download-complete` / `download-failed` via `postMessage`; listener di-attach dari `initStores()`

- [x] [UPDATE] Tambah indikator offline (`OfflineStatusBadge`) di Header & Settings
  - Tujuan: Tampilkan status koneksi kepada pengguna
  - File: `components/offline-status-badge.tsx`, `components/header.tsx`, `app/settings/page.tsx`
  - Ketergantungan: `offlineStore` berjalan
  - Prioritas: P0
  - **Catatan:** `ConnectionIndicator` (3 state) di Header; `OfflineStatusBadge` (5 state) di Settings; listener `online`/`offline` di `offlineStore.init()`

- [x] [TEST] Uji pemutaran offline: unduh 1 surat, putuskan koneksi, putar audio
  - Tujuan: Verifikasi alur offline end-to-end
  - File: Manual + `tests/e2e/offline-flow.e2e.ts`
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P0

### Disarankan (P1)

- [x] [NEW] Implementasi selective download: pengguna memilih surat yang ingin disimpan offline
  - Tujuan: Hemat bandwidth, beri pengguna kontrol atas penyimpanan
  - File: `components/surah-offline-download.tsx`, `hooks/use-surah-offline-download.ts`, `app/surah/[id]/page.tsx`
  - Ketergantungan: `DownloadManager` & `offlineStore` berjalan
  - Prioritas: P1
  - **Ringkasan:** MVP Opsi A — tombol **Simpan Offline** per surat di Surah Detail; manifest reciter-aware (`[surahId+reciterId]`)

- [x] [NEW] Tambah manajemen ukuran cache & pembersihan
  - Tujuan: Cegah kuota habis, izinkan pengguna menghapus item yang di-cache
  - File: `services/cache-manager.ts`, `services/audio-cache-stats.ts`, Settings UI
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P1
  - **Ringkasan:** Tampilan ukuran cache audio (MB) + `clearOfflineAudioCache()` menghapus `hanquran-audio-v1` & `downloadManifest`; preferensi pengguna tidak disentuh

- [x] [UPDATE] Tampilkan progres unduhan kepada pengguna
  - Tujuan: Umpan balik visual selama unduhan berlangsung
  - File: `components/surah-offline-download.tsx`, `offlineStore`, `download-manager`
  - Ketergantungan: `DownloadManager` berjalan
  - Prioritas: P1
  - **Ringkasan:** Label `completed/total` ayat saat unduhan (`offlineDownloadProgress`)

### Nice to Have (P2)

- [ ] [NEW] Auto-download surat favorit saat online
  - Tujuan: Fitur kenyamanan agar pengguna tidak perlu unduh manual seluruh surat favorit
  - File: `services/download-manager.ts`, background sync
  - Ketergantungan: `userStore` (favorites), infrastruktur offline
  - Prioritas: P2
  - **Catatan:** Berbeda dari **Auto Download Audio saat play** (`docs/31`) — fitur ini unduh seluruh surat favorit, bukan per ayat saat diputar

### Post-MVP (P1)

- [ ] [NEW] Auto Download Audio saat play ayat (opt-in)
  - Tujuan: Cache otomatis file MP3 ayat yang diputar agar tersedia offline nanti — default OFF
  - File: `app/settings/page.tsx`, `services/download-manager.ts` (method `cacheAyahOnPlay`), hook pemutaran audio, migration Dexie `autoDownloadOnPlay`
  - Ketergantungan: Infrastruktur offline & SW audio cache
  - Prioritas: P1
  - Spesifikasi: `docs/31-auto-download-audio-spec.md`

---

## Phase 6 — PWA & Packaging

**Total: 8 tasks | P0: 5 | P1: 2 | P2: 1**

### Wajib (P0)

- [x] [NEW] Buat web app manifest (`manifest.json`)
  - Tujuan: Definisikan metadata aplikasi, ikon, start URL
  - File: `public/manifest.json`, `app/layout.tsx` (link manifest)
  - Ketergantungan: None
  - Prioritas: P0
  - **Ringkasan:** `manifest.json` + `metadata.manifest`; `themeColor` `#0F766E` / `#0F172A`

- [x] [NEW] Buat & tambahkan ikon PWA (minimal 192×192 dan 512×512)
  - Tujuan: Tampilan install prompt & homescreen
  - File: `public/icons/`
  - Ketergantungan: Aset branding tersedia
  - Prioritas: P0
  - **Ringkasan:** `icon-192.png` & `icon-512.png` dari `public/branding/logo.png` (derivasi sementara MVP)

- [x] [NEW] Tambah deteksi installability & UI install prompt
  - Tujuan: Sarankan pengguna untuk menginstal aplikasi
  - File: `hooks/use-install-prompt.ts`, `components/shared/install-banner.tsx`, `app/page.tsx`
  - Ketergantungan: Manifest siap
  - Prioritas: P0
  - **Ringkasan:** `beforeinstallprompt` + banner Beranda; petunjuk manual Safari iOS; dismiss 7 hari via `localStorage`

- [x] [UPDATE] Pastikan offline shell dapat dimuat (basic HTML + fallback UI)
  - Tujuan: Aplikasi berjalan meski jaringan gagal saat pertama kali load
  - File: `app/layout.tsx`, `public/sw.js`, `public/offline.html`, `public/sw-helpers.js`
  - Ketergantungan: Service Worker siap
  - Prioritas: P0
  - **Ringkasan:** `hanquran-shell-v1` precache `/offline.html`; navigasi network-first dengan fallback shell statis

- [x] [TEST] Uji PWA di mobile (iOS Safari, Android Chrome)
  - Tujuan: Verifikasi install & perilaku offline di perangkat nyata
  - File: N/A (manual testing)
  - Ketergantungan: Setup PWA selesai
  - Prioritas: P0
  - **Catatan:** ulangi uji lock screen di checklist `docs/27` §8 saat QA PWA mobile

### Disarankan (P1)

- [x] [UPDATE] Implementasi splash screen untuk peluncuran PWA
  - Tujuan: Pengalaman loading bermerek saat pengguna membuka aplikasi yang terinstall
  - File: `app/layout.tsx`, `app/globals.css`, `public/manifest.json`, `lib/pwa-splash.ts`, `components/shared/pwa-splash-dismisser.tsx`
  - Ketergantungan: Manifest PWA siap
  - Prioritas: P1
  - **Ringkasan:** overlay statis + inline script standalone; dismiss setelah `window.load`; manifest ikon maskable

- [ ] [UPDATE] Tambah `theme-color` untuk URL bar (mobile)
  - Tujuan: Konsistensi visual pada browser mobile
  - File: `app/layout.tsx` (meta tags)
  - Ketergantungan: Setup PWA
  - Prioritas: P1
  - **Catatan:** `viewport.themeColor` & `manifest.json` memakai `#0F766E` (light) / `#0F172A` (dark)

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

- [x] [TEST] Unit tests untuk repeat engine
  - Tujuan: Verifikasi ketepatan logika repeat
  - File: `tests/services/repeat-engine.test.ts`
  - Ketergantungan: `RepeatEngine` sudah diimplementasi
  - Prioritas: P0

- [x] [TEST] Unit tests untuk audio controller
  - Tujuan: Verifikasi perintah play/pause/seek
  - File: `tests/services/audio-controller.test.ts`, `tests/hooks/use-audio.test.ts`
  - Ketergantungan: `AudioController` sudah diimplementasi
  - Prioritas: P0

- [x] [TEST] Integration test: buka surat → repeat ayat 3 kali → pindah ke ayat berikutnya
  - Tujuan: Alur repeat end-to-end berfungsi
  - File: `tests/integration/repeat-flow.test.ts`
  - Ketergantungan: Audio & repeat berjalan
  - Prioritas: P0

- [x] [TEST] E2E test: buka aplikasi → unduh surat → offline → putar audio
  - Tujuan: Alur offline-first berfungsi
  - File: `tests/e2e/offline-flow.e2e.ts`
  - Ketergantungan: Infrastruktur offline siap
  - Prioritas: P0

- [x] [TEST] Automated accessibility scan (axe-core) untuk halaman kritis
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

- [x] [NEW] Setup staging environment (identik dengan production)
  - Tujuan: Uji proses rilis sebelum ke production
  - File: `docs/25-deployment-vercel.md`, `docs/SETUP.md` §10
  - Ketergantungan: Aplikasi siap untuk di-deploy
  - Prioritas: P0
  - **Ringkasan:** workflow Vercel Preview + opsi branch `staging`; checklist QA; eksekusi saat connect repo

- [x] [DOC] Buat template release notes
  - Tujuan: Dokumentasi perubahan untuk pengguna
  - File: `RELEASE.md`
  - Ketergantungan: Version scheme ditentukan
  - Prioritas: P0
  - **Ringkasan:** SemVer `0.x` pre-MVP; template + draf entri `0.1.0`

- [ ] [NEW] Implementasi error tracking / crash reporting (Sentry atau serupa)
  - Tujuan: Deteksi dan perbaiki masalah di production
  - File: `lib/sentry-init.ts`, `app/layout.tsx` (inisialisasi)
  - Ketergantungan: Akun Sentry setup
  - Prioritas: P0

- [x] [NEW] Setup analytics dasar (Vercel Analytics + custom events)
  - Tujuan: Lacak perilaku pengguna & penggunaan fitur
  - File: `lib/analytics/`, `docs/analytics.md`, `app/layout.tsx`
  - Ketergantungan: Deploy Vercel
  - Prioritas: P0
  - **Ringkasan:** 5 custom events; helper type-safe; dokumentasi `docs/analytics.md`

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
- [x] Dexie setup (`services/db/db.ts`) — schema v2 (data pengguna)
- [x] Zustand stores dikonfigurasi dengan akses Dexie langsung
- [x] Base types terdefinisi (`types/index.ts`)
- [x] Service Worker skeleton terdaftar (`registerServiceWorker` di `AppProviders`)
- [x] Error boundary tersedia
- [x] Vitest dikonfigurasi (`npm run test`)

### Phase 1 — Data ✅
- [x] Service layer `services/quran/` — loader, mapper, quran-service, audio-service
- [x] Hooks React (`useSurahList`, `useSurah`, `useAyahAudioUrl`, `useReciters`)
- [x] `lib/surahs-data.ts` dimigrasikan / dihapus
- [x] TypeScript interfaces (`services/quran/app-types.ts`)
- [x] Error boundary untuk kegagalan load data (`DataLoadErrorFallback`)

### Phase 1b — i18n ✅
- [x] `next-intl` + messages id/en
- [x] Deteksi bahasa first launch
- [x] `appLocale` di Dexie
- [x] Bagian Bahasa Aplikasi di Settings
- [x] Migrasi string UI
- [x] Arti surat & terjemahan ayat mengikuti `appLocale`

### Phase 1c — Verse Display Controls ✅
- [x] `VerseDisplayControls` (3 kontrol satu baris)
- [x] Preferensi terjemahan & transliterasi persisten
- [x] Surah Detail & Focus Mode ter-wire
- [x] Section Terjemahan dihapus dari Settings
- [x] Aksesibilitas Settings — persist & terapkan global (`AccessibilityProvider`)
- [x] Lanjutkan Hafalan — `lastRead` persist + `ContinueReadingSection` di Beranda
- [x] Favorit surat persisten — `toggleFavorite` di Beranda & Surah Detail

### Phase 2 — Audio
- [x] AudioController service selesai — class, integrasi UI, BroadcastChannel ✅
- [x] useAudioStore terintegrasi ke `AudioPlayer` via `useAudio` ✅
- [x] useAudio hook tersedia (`hooks/use-audio.ts`)
- [x] AudioPlayer UI terintegrasi dengan controller
- [x] BroadcastChannel multi-tab logic diimplementasi (`services/audio-tab-sync.ts`)
- [x] Audio preloading & prefetch hints (`services/audio-prefetch.ts`)
- [x] Dukungan multi-qari via Pengaturan (`settings.reciterId`, `usePreferredReciterId`)
- [x] Cross-browser audio testing — unit test ✅; checklist manual di Phase 2 P0
- [x] Media Session API — diimplementasi (`docs/27`); uji manual lock screen tersisa sebelum tag `v0.2.0`

### Phase 2b — Media Session
- [x] Spesifikasi & dokumen terkait (`docs/27`)
- [x] Service `media-session.ts`
- [x] Integrasi `AudioController`
- [x] Unit test metadata, position state, handlers
- [x] Action handlers `previoustrack` / `nexttrack`
- [ ] Uji lock screen mobile (`docs/27` §8)

### Phase 2c — Mode Murotal
- [x] Spesifikasi & dokumen terkait (`docs/29`)
- [x] Service `murotal-resolver.ts`
- [x] Integrasi `use-surah-repeat-playback`
- [x] Toggle UI + migrasi Dexie `murotalEnabled`
- [x] i18n + unit test
- [x] Aturan transport ⏮/⏭ (`playback-track-navigation.ts`)
- [ ] Uji manual lintas surat

### Progress Repeat x/y
- [x] `RepeatProgressBadge` + `lib/repeat-progress.ts`
- [x] Integrasi `RepeatSelector` inline & `RepeatStatus`
- [x] Unit test formatter

### Auto Follow landscape
- [x] Perbaikan pengukuran chrome atas/bawah di `short-landscape`
- [x] Unit test + pembaruan `docs/28` §4.4

### Phase 3 — Repeat
- [x] useRepeatStore dibuat — config + runtime
- [x] RepeatEngine service selesai (`services/repeat-engine.ts`)
- [x] Unit tests repeat engine (14 test)
- [x] Integrasi dengan audio & UI surat selesai (`useSurahRepeatPlayback`)
- [x] Persistensi konfigurasi ke Dexie (`settings.repeatConfig`) end-to-end di UI
- [x] Unit tests passing (128 test)

### Phase 4 — Focus Mode / Word Highlight (Post-MVP)
- [x] Mode Fokus MVP — layar baca bebas distraksi, ayat nyata, navigasi ayat
- [ ] Word-by-word highlight + sinkron audio
- [x] Integrasi FocusMode + RepeatEngine + audio (`useSurahRepeatPlayback`)
- [x] Navigasi antar ayat di `/focus/[id]` berfungsi
- [x] Ukuran teks Arab diterapkan di Focus Mode (`useArabicTextSize`)

### Phase 5 — Offline
- [x] DownloadManager service berjalan
- [x] Runtime caching strategy di SW diimplementasi
- [x] Dexie `downloadManifest` tracking berjalan (reciter-aware, migrasi v5)
- [x] useOfflineStore dibuat — di-init via `initStores()` di `AppProviders`
- [x] SW ↔ Client messaging diimplementasi (`prefetch-surah` + progress events)
- [x] Selective download per surat (Surah Detail)
- [x] Progres unduhan ditampilkan (`completed/total`)
- [ ] Pemutaran offline berhasil diuji (E2E / manual)

### Phase 6 — PWA
- [x] manifest.json dibuat
- [x] Ikon PWA dibuat & ditambahkan (`public/icons/`)
- [x] Install prompt berfungsi (`InstallBanner` + `useInstallPrompt`)
- [x] Offline shell dapat dimuat (`public/offline.html` + `hanquran-shell-v1`)
- [ ] Mobile PWA testing selesai

### Phase 7 — Testing
- [x] Unit tests untuk repeat passing · repeat engine ✅ · audio controller ✅
- [ ] Integration & E2E tests passing
- [ ] Accessibility scan passed
- [ ] Performance metrics memenuhi target (Lighthouse >= 80)

### Phase 8 — Release
- [x] Staging environment — panduan Vercel (`docs/25-deployment-vercel.md`)
- [x] Template release notes (`RELEASE.md`)
- [ ] Error tracking terpasang
- [x] Analytics diimplementasi (`@vercel/analytics` + `lib/analytics/`)
- [ ] Staged rollout plan siap
- [ ] MVP ter-rilis!
```

---

# 🚧 7. Blocker Sprint Saat Ini

**Blocker yang sudah diselesaikan:**

- ~~Keputusan data source~~ → Dataset statis `public/data/`* + CDN audio tilawah
- ~~Integrasi dataset Quran ke UI~~ → `services/quran/` + hooks
- ~~Arsitektur penyimpanan konten Quran~~ → Static Dataset (bukan Dexie) — `docs/23-static-dataset-architecture.md`
- ~~i18n shell aplikasi~~ → `next-intl` + `appLocale`

**Blocker yang masih aktif:**


| #   | Blocker                                                    | Phase | Tindakan                                      |
| --- | ---------------------------------------------------------- | ----- | --------------------------------------------- |
| 1   | ~~Service Worker tidak terdaftar~~ → **Selesai**           | —     | ✅ `registerServiceWorker()` di `AppProviders` |
| 2   | ~~ErrorBoundary belum ada~~ → **Selesai**                  | —     | ✅ `ErrorBoundary` + `ErrorFallback`           |
| 3   | ~~`repeatConfig` belum di `SettingsRecord`~~ → **Selesai** | —     | ✅ Field `repeatConfig` di `types/index.ts`    |
| 4   | Platform deployment belum ditentukan                       | 8     | Tentukan sebelum Phase 8                      |


---

# ✔️ 8. Definisi Selesai MVP

MVP HanQuran dianggap **selesai** ketika seluruh kondisi berikut terpenuhi:

## Core Flows

- [x] Pengguna dapat membuka daftar surat dan menavigasi ke surat manapun
- [x] Pengguna dapat memutar audio per ayat dengan play/pause/seek yang reliabel
- [x] Pengguna dapat mengaktifkan repeat (1×/3×/5×/∞) untuk ayat saat ini, range ayat, atau seluruh surat
- [x] Focus Mode menampilkan satu ayat dalam layout bebas distraksi (tanpa word highlight MVP)
- [x] Navigasi antar ayat di Focus Mode (`/focus/[id]`) berfungsi tanpa keluar dari mode

## Data & State

- [x] Data surat dimuat dari `public/data/`* via `services/quran/` (Static Dataset Architecture)
- [x] Preferensi pengguna (locale, ukuran teks, terjemahan/transliterasi visible) tersimpan di Dexie
- [x] Surat/ayat terakhir dilihat tersimpan di Dexie `lastRead` — `usePersistLastViewed` + `ContinueReadingSection`
- [x] Favorit surat persisten — `useUserStore.toggleFavorite` di Beranda & Surah Detail

## Offline & PWA

- [ ] Minimal 1 surat dapat diunduh dan diputar saat offline — unduh ✅; verifikasi playback offline belum
- [ ] Aplikasi dapat di-install sebagai PWA di perangkat mobile
- [ ] Offline shell dapat dimuat tanpa koneksi internet
- [x] Indikator status offline tersedia di UI (`ConnectionIndicator`, `OfflineStatusBadge`)

## Kualitas

- [ ] Semua P0 tasks di Phase 1–6 sudah selesai
- [x] Unit tests untuk audio controller & repeat engine passing (128 test)
- [ ] Integration tests untuk core flows passing
- [ ] Tidak ada critical regressions
- [ ] Skor Lighthouse ≥ 80 (Performance, Accessibility, Best Practices, PWA)

---

Dokumen ini disimpan sebagai `docs/18-development-tasks.md`. Perbarui dokumen ini setiap kali task dimulai atau diselesaikan. Gunakan checklist di Bagian 6 untuk tracking progress sprint.