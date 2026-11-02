# 18 — Daftar Pekerjaan Teknis HanQuran (Development Tasks)

Dokumen ini adalah **single source of truth** untuk seluruh backlog implementasi HanQuran menuju MVP. Berisi daftar pekerjaan teknis yang dapat langsung dikerjakan developer.

**Terakhir diperbarui:** 2 November 2026
**Status:** 🚧 Menuju rilis `0.6.0` (lihat `RELEASE.md`) — `0.2.0`–`0.5.0` sudah diimplementasi; uji manual perangkat & tag Git belum dibuat; Phase 9 Android (Capacitor) ✅ diimplementasi (checklist `docs/32` §13); Phase 10 SEO ✅ selesai; Phase 10b hardening ✅ selesai; Phase 11 performa beranda ✅ selesai; Phase 11b LCP Threads Gate ✅ selesai; Phase 12 locale paint pertama (F8) ✅ selesai; Phase 12b audit bug & hardening ✅ selesai; Phase 13 sorot kata ✅ selesai; Phase 14 perbaikan lanjutan audit 📋; Phase 15 ulang kata 📋
**Total Development Tasks:** 97 + Phase 9 Android (lihat `docs/32` §13) + Phase 10 SEO (lihat `docs/35-seo-spec.md` §4) + Phase 10b Hardening (lihat `docs/35` §8–§9) + Phase 11 Performa Beranda (lihat `docs/36-performance-cwv.md`) + Phase 11b LCP Threads Gate (lihat `docs/34` §8) + Phase 12 Locale Paint Pertama (lihat `docs/21` §5.6) + Phase 12b Audit Bug & Hardening + Phase 13 Sorot Kata (lihat `docs/37`) + Phase 14 Perbaikan Lanjutan (`docs/39`) + Phase 15 Ulang Kata (`docs/38`)
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
| 4         | Word Highlight (Focus Mode)       | 8      | 0      | 0      | 8      | 3       | ✅ Diganti Phase 13 (sorot kata, `docs/37`) |
| 5         | Implementasi Strategi Offline     | 11     | 7      | 3      | 1      | 9       | 🟡 E2E offline playback belum                |
| 6         | PWA & Packaging                   | 8      | 5      | 2      | 1      | 5       | 🟡 Uji manual PWA tersisa                    |
| 7         | Testing & Quality Assurance       | 9      | 6      | 2      | 1      | 2       | ⏳ Audio + repeat unit ✅                      |
| 8         | Release & Monitoring              | 11     | 6      | 3      | 2      | 3       | 🟡 Error tracking & rollout belum            |
| 9         | Platform Android (Capacitor)      | —      | —      | —      | —      | —       | ✅ Diimplementasi Agu 2026 — checklist di `docs/32` §13 |
| 10        | SEO & Discoverability             | 9      | 4      | 3      | 2      | 9       | ✅ Selesai (T1–T9) — follow-up perf → Phase 11 ✅ |
| 10b       | SEO Hardening (pasca-audit)       | 9      | 4      | 3      | 2      | 9       | ✅ Selesai (H1–H9) — 29 Okt 2026             |
| 11        | Performa Beranda & CWV            | 6      | 2      | 3      | 1      | 6       | ✅ Selesai (P11-1–P11-6) — 29 Okt 2026       |
| 11b       | LCP Threads Gate (SSR pra-paint)  | 3      | 0      | 3      | 0      | 3       | ✅ Selesai (P11b-1–P11b-3) — 31 Okt 2026     |
| 12        | Locale Paint Pertama (F8)         | 4      | 0      | 0      | 4      | 4       | ✅ Selesai (P12-1–P12-4) — 1 Nov 2026        |
| 12b       | Audit Bug & Hardening             | 13     | 3      | 7      | 3      | 13      | ✅ Selesai (P12b-1–P12b-13) — 2 Nov 2026     |
| 13        | Sorot Kata (quran-align)          | 10     | 0      | 8      | 2      | 10      | ✅ Selesai (P13-1–P13-10) — 2 Nov 2026       |
| 14        | Perbaikan Lanjutan Audit          | 10     | 0      | 5      | 5      | 3       | 🚧 Berjalan (`docs/39`)                       |
| 15        | Ulang Kata (Hafalan per Kata)     | 12     | 0      | 10     | 2      | 0       | 📋 Belum dimulai (`docs/38`)                  |
| **TOTAL** |                                   | **110** | **50** | **37** | **23** | **83**  | (+ Phase 9; + Phase 10 SEO; + Phase 10b hardening; + Phase 11 CWV; + Phase 11b LCP gate; + Phase 12 F8; + Phase 12b audit) |


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

Pendukung: Vitest (`vitest.config.ts`, `tests/setup.ts`; saat itu 222 test — kini 476).

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

> ✅ **Diimplementasi 2 Nov 2026 lewat Phase 13** dengan data quran-align (`docs/37`). Task di bawah adalah rencana lama dan tidak dikerjakan apa adanya.

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

- [x] [NEW] Auto Download Audio saat play ayat (opt-in)
  - Tujuan: Cache otomatis file MP3 ayat yang diputar agar tersedia offline nanti — default OFF
  - File: `app/settings/page.tsx`, `services/audio-play-cache.ts`, `services/audio-controller.ts`, migration Dexie `autoDownloadOnPlay`
  - Ketergantungan: Infrastruktur offline & SW audio cache
  - Prioritas: P1
  - Spesifikasi: `docs/31-auto-download-audio-spec.md`
  - **Ringkasan:** Dirilis `0.5.0` — toggle Offline & Cache, cache per ayat saat play, gate offline per ayat

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

# 📱 Phase 9 — Platform Android (CapacitorJS)

**Status:** ✅ Diimplementasi (1 Agustus 2026) — status per task di `docs/32` §13 (beberapa uji perangkat masih terbuka)  
**Spek & daftar task lengkap:** [`docs/32-capacitor-android-platform.md`](./32-capacitor-android-platform.md) §3.4 (solusi PWA-safe), §6.5 (dual pipeline), **§13 (checklist task)**

**Kontrak produk:**

- PWA/Vercel tetap jalur utama — **tanpa perubahan perilaku** pada build default
- Android = saluran tambahan Play Store dari **repo yang sama**
- Semua cabang native hanya aktif via `HANQURAN_TARGET=android` atau `Capacitor.isNativePlatform()`

## Ringkasan urutan (salin dari docs/32 §13)

| Sub-phase | Fokus | Gate |
|-----------|--------|------|
| **A0** | Spike: branch config, static export, Capacitor init, 1 ayat di emulator | `build:android` + WebView hidup |
| **A1** | Isolasi PWA: guard Analytics, SW, InstallBanner + regressi web | PWA preview hijau |
| **A2** | Paritas baca/settings, StatusBar, Splash, Back | Cold start offline baca OK |
| **A3** | Audio CDN + Simpan Offline | Airplane + putar surat tersimpan |
| **A4** | Background audio / Media Session (keputusan produk) | Ekspektasi terdokumentasi atau dimitigasi |
| **A5** | Signing, CI AAB, Play Console | Store-ready |

## Task pointer (jangan duplikasi checklist panjang di sini)

Kerjakan dan centang task di **`docs/32` §13**. Di dokumen ini cukup lacak status phase:

- [x] A0 Spike & fondasi selesai
- [x] A1 Zero regression PWA selesai
- [x] A2 Paritas baca & settings selesai
- [x] A3 Audio & offline audio selesai
- [x] A4 Background audio (sesuai keputusan) selesai
- [ ] A5 CI & Play Store selesai

### Task pembuka yang disarankan duluan

- [ ] [NEW] `lib/platform.ts`
- [ ] [UPDATE] `next.config.mjs` branch `HANQURAN_TARGET` (default = PWA sekarang)
- [ ] [NEW] script `build:android`
- [ ] [NEW] `generateStaticParams` untuk `/surah/[id]` & `/focus/[id]`
- [ ] [NEW] Capacitor init + `android/`
- [ ] [TEST] Regressi: `npm run build` tanpa env android tetap OK

---

# 🔍 Phase 10 — SEO & Discoverability

**Status:** ✅ Selesai — T1–T9 terimplementasi & terverifikasi (27–29 Okt 2026); follow-up performa home diselesaikan di Phase 11 (`docs/36`)  
**Spek lengkap & hasil audit:** [`docs/35-seo-spec.md`](./35-seo-spec.md)  
**Prioritas konten:** T2+T3+T7 (discovery) → T1 (server-render surat = nilai terbesar) → T4+T6 → T9 → T5+T8

Ringkasan temuan audit (27 Okt 2026): konten ayat **tidak ada di HTML awal** (semua halaman CSR), tidak ada `sitemap.xml`/`robots.txt`, metadata identik di semua halaman, tanpa OG/Twitter/JSON-LD, dan `/focus`+`/settings` belum `noindex`. Detail + bukti di `docs/35` §2.

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| T1 | Server-render konten Surah Detail + `generateMetadata` per surat (split ke `surah-detail-client.tsx`) | [REFACTOR] | P0 | `docs/35` §4 T1 |
| T2 | `app/robots.ts` — allow `/`, disallow `/focus`, `/settings` | [NEW] | P0 | `docs/35` §4 T2 |
| T3 | `app/sitemap.ts` — `/` + 114 surat, `lastmod` dari `dataHash` | [NEW] | P0 | `docs/35` §4 T3 |
| T4 | Metadata root: `metadataBase`, OG, Twitter Card, template title, hapus `generator: 'v0.app'` | [UPDATE] | P1 | `docs/35` §4 T4 |
| T5 | OG image 1200×630 (`public/og/og-default.png`) | [NEW] | P2 | `docs/35` §4 T5 |
| T6 | JSON-LD `WebSite` + `ContentPage`/`BreadcrumbList` per surat | [NEW] | P1 | `docs/35` §4 T6 |
| T7 | `noindex, follow` untuk `/focus/[id]` & `/settings/*` | [UPDATE] | P0 | `docs/35` §4 T7 |
| T8 | Hygiene: favicon App Router, risiko `images.unoptimized` dicatat | [UPDATE] | P2 | `docs/35` §4 T8 |
| T9 | Verifikasi curl + Rich Results Test + regressi `build:android` & unit test | [TEST] | P0 | `docs/35` §4 T9 |

- [x] [DOC] Spek & audit SEO — `docs/35-seo-spec.md` (27 Okt 2026)
- [x] [NEW] `app/robots.ts` + `noindex` focus/settings (T2+T7) — selesai 27 Okt 2026, terverifikasi build
- [x] [NEW] `app/sitemap.ts` (T3) — selesai 27 Okt 2026, 115 URL + `lastmod` tersedia di XML
- [x] [REFACTOR] Server-render Surah Detail + `generateMetadata` per surat (T1) — selesai 27 Okt 2026, konten ayat terverifikasi di HTML
- [x] [UPDATE] `app/layout.tsx` — `metadataBase` + OG/Twitter + template title (T4) — selesai 29 Okt 2026, OG/Twitter per surat terverifikasi di HTML
- [x] [NEW] JSON-LD structured data (T6) — `lib/schema-org.ts` + `components/json-ld.tsx`, `tests/lib/schema-org.test.ts`
- [x] [TEST] Verifikasi SEO menyeluruh + regressi web & Android (T9) — selesai 29 Okt 2026; Lighthouse SEO 100/100/66 (settings noindex by design)
- [x] [NEW] OG image 1200×630 (T5) — `public/og/og-default.png`, generator `npm run gen:og`
- [x] [UPDATE] Favicon & catatan optimizer (T8) — selesai 29 Okt 2026, `app/icon.png` + `app/apple-icon.png`, `npm run gen:favicon`

> Kontrak non-regresi: `generateStaticParams` di `app/surah/[id]/layout.tsx` tetap ada; pipeline `output: 'export'` Android & app-shell offline (`docs/30`, `docs/32`) tidak berubah. Detail dampak di `docs/35` §3.

---

# 🔧 Phase 10b — SEO Hardening (Pasca-Audit)

**Status:** ✅ Selesai 29 Okt 2026 — seluruh H1–H9 diimplementasi & terverifikasi (build web + export Android hijau, 399 test lulus)
**Sumber temuan:** audit kritis atas hasil Phase 10 → [`docs/35` §8](./35-seo-spec.md) (F1–F13)
**Rencana & urutan:** [`docs/35` §9](./35-seo-spec.md) (H1–H9)

Konteks: Phase 10 tuntas & terverifikasi (build web + Android hijau, 370 test, Lighthouse SEO 100), tetapi audit lanjutan menemukan 4 isu berprioritas tinggi yang perlu dibereskan sebelum rilis produksi: reaktivitas `?ayah` (regresi), payload ganda (SSR + refetch + prefetch), konten SSR tak terlihat sebelum hidrasi, dan fallback host canonical/sitemap.

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| H1 | `?ayah` reaktif kembali: leaf `<StartAyahSync />` + `useSearchParams` di dalam `<Suspense fallback={null}>` (konten di luar boundary tetap prerendered) | [FIX] | P0 | F1 |
| H2 | `useSurah`: skip refetch bila seed cocok & bahasa terjemahan `id` | [PERF] | P0 | F2 |
| H3 | `SurahCard`/`NativeAwareLink`: `prefetch={false}` (atau hover-only) untuk halaman surat | [PERF] | P0 | F2 |
| H4 | Wrapper daftar ayat `initial={false}` / fade CSS default-visible | [FIX] | P1 | F3 |
| H5 | `lib/site-url.ts`: fallback `VERCEL_PROJECT_PRODUCTION_URL` + wajib `NEXT_PUBLIC_SITE_URL` di Vercel Production | [FIX] | P0 | F4 |
| H6 | Escape `<` → `\u003c` pada inject JSON-LD | [HARDEN] | P2 | F6 |
| H7 | Clamp `?ayah` ke `1..ayahCount` + scroll ke ayat aktif setelah sync | [FIX] | P1 | F7, F9 |
| H8 | `dynamicParams=false` `/focus/[id]`; mitigasi `/surah/0` (redirect/404) | [FIX] | P2 | F5 |
| H9 | Test: seed `useSurah`, reaktivitas query, XML `robots`/`sitemap`, 404 dynamic params | [TEST] | P1 | F12 |

- [x] [FIX] H1 — reaktivitas `?ayah` (P0) — leaf `StartAyahSync` + Suspense
- [x] [PERF] H2 — hilangkan refetch dataset saat seed cocok (P0) — 0 request dataset saat buka surat
- [x] [PERF] H3 — matikan prefetch RSC kartu surat (P0) — `prefetch={false}`
- [x] [FIX] H5 — fallback host produksi `SITE_URL` (P0) — `VERCEL_PROJECT_PRODUCTION_URL`
- [x] [FIX] H4 — konten SSR terlihat tanpa JS (P1) — `initial={false}` pada header, list, `AyahCard`
- [x] [FIX] H7 — clamp & scroll `?ayah` (P1) — `lib/ayah-param.ts` + `lib/ayah-scroll.ts`
- [x] [TEST] H9 — test hardening (P1) — 8 file test, total 399 test
- [x] [HARDEN] H6 — escape JSON-LD (P2) — `serializeJsonLd`
- [x] [FIX] H8 — status 404 rapi `/focus/[id]` & `/surah/0` (P2) — `dynamicParams=false` + redirect Vercel

**Urutan kerja:** H1 → H2 → H3 → H5 → H4 → H7 → H9 → H6 → H8.

**DoD Phase 10b:**

- Navigasi back/forward antar `?ayah` memperbarui ayat aktif & highlight.
- Buka `/surah/2`: tanpa refetch JSON duplikat (kecuali locale ≠ `id`), tanpa prefetch kartu yang memboroskan.
- Dengan JS dimatikan, teks ayat tetap terlihat.
- `canonical`/sitemap menunjuk domain produksi walau env hanya menyediakan `VERCEL_PROJECT_PRODUCTION_URL`.
- Semua test lama + 4 test baru hijau; build web & export Android hijau; Lighthouse SEO tidak turun.

**Hasil verifikasi (29 Okt 2026):** seluruh DoD terpenuhi — reaktivitas query-only terbukti di browser, 0 fetch dataset pada `/surah/2` & navigasi kartu, 0 prefetch `/surah/*` dari home, teks ayat tampil dengan JS dimatikan, 399 test lulus, build web & Android hijau, Lighthouse SEO 100/100/66 (settings noindex by design), perf surah-1 73 → 87. Rincian bukti per item di [`docs/35` §9.1](./35-seo-spec.md).

**Backlog terpisah dari phase ini:** F8 (flash terjemahan/locale → ikut i18n routing), F11 (server-render home + CWV → Phase 11 ✅), F13 (validasi eksternal & Search Console setelah deploy). F10 (import `React` tak terpakai) ikut beres saat H1.

---

# ⚡ Phase 11 — Performa Beranda & Core Web Vitals

**Status:** ✅ Selesai 29 Okt 2026 — beranda di-SSG, daftar 114 surat ada di HTML awal (build web + export Android hijau, 406 test lulus)  
**Sumber temuan:** audit SEO [`docs/35` §8 F11](./35-seo-spec.md)  
**Bukti, angka sebelum/sesudah & backlog:** [`docs/36-performance-cwv.md`](./36-performance-cwv.md)

Konteks: Phase 10 sudah men-server-render halaman surat, tetapi beranda masih `'use client'` — HTML awal hanya berisi shell + "Memuat daftar surat", lalu klien mengunduh 114 file JSON. Lighthouse mobile mencatat performance **59**, TBT 680 ms, CLS 0,239 (placeholder `LazySurahCard` berganti kartu).

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P11-1 | `readSurahListForServer()` — loader server ringkasan 114 surat (metadata saja) | [NEW] | P0 | `docs/36` §2 |
| P11-2 | `app/page.tsx` jadi server component (SSG) + canonical `/`; UI interaktif pindah ke `HomeClient` | [REFACTOR] | P0 | `docs/36` §2 |
| P11-3 | `useSurahList(initialSurahs)` memakai seed server; skip fetch dataset untuk locale `id`, tetap fetch untuk locale lain/retry | [PERF] | P1 | `docs/36` §2 |
| P11-4 | `LazySurahCard` selalu render kartu + `content-visibility: auto` & `contain-intrinsic-size` | [PERF] | P1 | `docs/36` §2 |
| P11-5 | Chrome beranda default-visible (`initial={false}`) pada header, search, filter | [FIX] | P1 | `docs/36` §2 |
| P11-6 | `ContinueReadingSection` menerima daftar surat dari induk (hapus fetch daftar kedua) | [REFACTOR] | P2 | `docs/36` §2 |

- [x] [NEW] P11-1 — loader server ringkasan surat (P0) — `readSurahListForServer`
- [x] [REFACTOR] P11-2 — beranda SSG + `HomeClient` (P0) — 114 tautan surat di HTML awal
- [x] [PERF] P11-3 — seed daftar surat tanpa fetch dataset locale `id` (P1) — 0 request dataset
- [x] [PERF] P11-4 — kartu surat SSR-visible + `content-visibility` (P1) — CLS 0
- [x] [FIX] P11-5 — animasi masuk tidak menyembunyikan konten pra-hidrasi (P1)
- [x] [REFACTOR] P11-6 — satu sumber daftar surat untuk kartu Lanjutkan Hafalan (P2)

**Urutan kerja:** P11-1 → P11-2 → P11-3 → P11-4 → P11-5 → P11-6.

**DoD Phase 11:**

- HTML awal beranda berisi tautan & nama 114 surat; dengan JS dimatikan daftar tetap terlihat.
- Locale `id` tidak mengunduh dataset JSON saat membuka beranda; locale `en` tetap berperilaku seperti sebelumnya.
- CLS tidak naik dan animasi masuk tidak menunda konten yang sudah di-SSR.
- Build web & export Android hijau; seluruh test hijau; Lighthouse SEO tidak turun.

**Hasil verifikasi (29 Okt 2026):** seluruh DoD terpenuhi — performance home 59 → **85**, TBT 680 → 200 ms, CLS 0,239 → **0**, Speed Index 1,9 → 1,4 s, SEO tetap 100; 114 tautan surat di HTML (264 KB raw / 17,3 KB gzip), 0 request dataset locale `id`, 85 file / 406 test lulus, build web & export Android hijau. LCP first-visit masih 3,9 s karena overlay Threads Gate yang dirender setelah hidrasi — dicatat sebagai backlog `docs/34`, bukan regresi beranda. Rincian di [`docs/36`](./36-performance-cwv.md).

## 11b — LCP Threads Gate (SSR pra-paint)

**Status:** ✅ Selesai 31 Okt 2026 — overlay Threads Gate ikut HTML awal; pengguna yang sudah menyelesaikan gate tidak melihat kedipan overlay  
**Spek perilaku:** [`docs/34` §8](./34-threads-gate-spec.md)  
**Temuan asal:** `docs/36` §3.3 (LCP first-visit = paragraf gate yang baru muncul setelah hidrasi)

Konteks: Phase 11 menurunkan LCP beranda, tetapi pengunjung **baru** tetap mendapat LCP ±3,9 s karena overlay gate baru di-mount setelah hidrasi. Solusinya bukan menghapus gate, melainkan mengirim overlay di HTML awal dan mengatur visibilitasnya **sebelum paint** lewat skrip inline + atribut `<html>`.

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P11b-1 | Overlay gate dirender di HTML awal; status awal selalu `pending` agar SSR = render pertama klien | [REFACTOR] | P1 | `docs/34` §8 |
| P11b-2 | Skrip inline pra-paint membaca flag `completed` dan menandai `<html>`; CSS menyembunyikan overlay; `<noscript>` menghindari gate mati tanpa JS | [NEW] | P1 | `docs/34` §8 |
| P11b-3 | Test skrip init (valid/rusak/kosong, read-only) + smoke fresh/returning/no-JS + Lighthouse | [TEST] | P1 | `docs/36` §3.3 |

- [x] [REFACTOR] P11b-1 — overlay gate di HTML awal (P1)
- [x] [NEW] P11b-2 — skrip pra-paint + CSS + `noscript` (P1)
- [x] [TEST] P11b-3 — 3 test skrip init + smoke + Lighthouse (P1)

**DoD Phase 11b:**

- Pengunjung baru melihat gate pada paint pertama (tidak ada pop-in setelah hidrasi) dan alur Threads → 5 detik → Lanjut tetap sama.
- Pengunjung yang sudah menyelesaikan gate tidak pernah melihat overlay, termasuk sebelum hidrasi.
- Tanpa JS, gate disembunyikan dan konten/daftar surat tetap dapat dibaca.
- Tidak ada hydration mismatch; scroll lock & fokus hanya aktif saat overlay benar-benar tampil.
- Build web & export Android hijau; test hijau; Lighthouse SEO tidak turun.

**Hasil verifikasi (31 Okt 2026):** observed LCP first-visit **±3,9 s → 0,10–0,15 s** (PerformanceObserver/Lighthouse trace); skor performance Lighthouse 82–92 pada tiga run (variasi TBT mesin), tetap ≥80; SEO 100, CLS 0. Gate terverifikasi di `domcontentloaded` (fresh: `display:flex`; returning: `display:none` + atribut `<html>`), alur 5 detik + Lanjut menutup overlay dan menyimpan flag, `noscript` menyembunyikan gate, 85 file / **409 test** lulus, build web & export Android hijau (114 tautan surat utuh). Catatan: LCP **simulasi** Lantern masih ±3,0–3,3 s karena model main-thread, berbeda dari observed LCP; angka observed dipakai untuk menilai dampak nyata. Rincian di [`docs/36` §3.3](./36-performance-cwv.md).

---

# 🎨 Phase 12 — Locale Paint Pertama (F8)

**Status:** ✅ Selesai 1 November 2026 — pengguna `en` tidak lagi melihat teks `id` pada paint pertama  
**Spek mekanisme:** [`docs/21` §5.6](./21-i18n-and-locale.md)  
**Temuan asal:** `docs/35` §8.1 (F8 — seed server selalu terjemahan `id`)

Konteks: `next-intl` baru memakai locale tersimpan setelah Dexie selesai dibaca, sehingga pengguna `en` melihat arti surat, placeholder, dan label filter berbahasa Indonesia selama ±100–386 ms. Routing locale/cookie SSR tidak dipakai karena akan merusak SSG/export Android. Solusinya: cache locale sinkron untuk skrip pra-paint + konten bilingual yang dipilih CSS.

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P12-1 | Cache locale `localStorage` + skrip inline pra-paint (<html data-app-locale> + lang); sinkron dari `userStore.init()`/`updateSettings` | [NEW] | P2 | `docs/21` §5.6 |
| P12-2 | Teks bilingual pra-paint: arti kartu, label ayat/Makkiyah, placeholder pencarian, filter, overlay gate | [NEW] | P2 | F8 |
| P12-3 | Seed `meaningTranslations {id,en}` + skip refetch daftar saat `en`; sembunyikan terjemahan ayat yang tidak cocok via `data-content-locale` | [REFACTOR] | P2 | F8 |
| P12-4 | Test helper locale/skrip init, mapper, hook daftar/surat, pencarian dua bahasa, gate, cache store | [TEST] | P2 | F8 |
| P12-5 | Tindak lanjut audit: atribut `<html>` diterapkan sinkron dari store; mode fokus ikut `data-content-locale` | [REFACTOR] | P2 | F8 |
| P12-6 | Label pra-paint di atas lipatan (kontrol baca, header surat, unduh offline, banner install) + prefetch terjemahan + resync bfcache/multi-tab | [REFACTOR] | P2 | F8 |

- [x] [NEW] P12-1 — cache + skrip pra-paint + sinkronisasi store/provider (P2)
- [x] [NEW] P12-2 — komponen `LocaleText` + label bilingual (P2)
- [x] [REFACTOR] P12-3 — seed bilingual + `data-content-locale` (P2)
- [x] [TEST] P12-4 — 13 test baru (P2)
- [x] [REFACTOR] P12-5 — sinkronisasi atribut sebelum render + mode fokus (P2)
- [x] [REFACTOR] P12-6 — label atas lipatan, prefetch terjemahan, resync locale (P2)

**DoD Phase 12:**

- Pengguna `en` melihat arti kartu, placeholder, filter, dan gate dalam bahasa Inggris sejak paint pertama (sebelum Dexie selesai).
- Terjemahan ayat `id` tidak terlihat selama locale `en` menunggu data `en`; tidak ada layout shift.
- Pengguna `id` dan pengguna tanpa cache tetap melihat perilaku lama; tanpa JS teks `id` tetap tampil.
- Tidak ada hydration mismatch; routing URL tidak berubah; app-shell offline/SW dan export Android tidak berubah.
- Build web & Android hijau; seluruh test hijau; Lighthouse SEO tidak turun.

**Hasil verifikasi (1 Nov 2026):** pada `domcontentloaded`, `<html data-app-locale="en">` dan kartu surat 1 menampilkan `The Opening` / `verses` / `Meccan`, placeholder `Search surahs...`; tidak ada teks `id` yang terlihat. Surah 1: saat fetch terjemahan `en` ditahan, paragraf `data-content-locale="id"` berstatus `visibility:hidden`; setelah data tiba, `en` tampil. Kembali ke `id`: kartu menampilkan `Pembukaan` / `ayat` / `Makkiyah`. Tidak ada pesan hydration mismatch. 89 file / **435 test** lulus; build web & export Android hijau (114 tautan, atribut+skrip locale ada); Lighthouse home performance **91**, SEO **100**, CLS **0**. HTML beranda 267 → 298 KB raw (+1,9 KB gzip) karena teks bilingual. Residual: label di bawah lipatan (footer) dan komponen yang baru dirender setelah Dexie siap (kartu Lanjutkan Hafalan) belum dual-render tetapi tidak tampil pada paint pertama; `aria-label` masih mengikuti `next-intl`.

**Tindak lanjut (2 Nov 2026):** audit pasca-rilis menemukan lima celah kecil yang sudah diperbaiki — (1) atribut `<html>` sebelumnya baru diperbarui di `useEffect` setelah paint, sehingga pada toggle bahasa atau cache basi ada satu frame campuran bahasa; kini `applyAppLocaleToDocument()` dipanggil sinkron dari `userStore.init()`/`updateSettings()` **sebelum** `set()`; (2) mode fokus belum memakai `data-content-locale`, sehingga terjemahan bahasa lama masih tampil saat locale berganti di tengah sesi; (3) label di atas lipatan (kontrol baca, `ayat`/`Makkiyah`, `Siap Offline`, Simpan Offline, banner install) belum dual-render sehingga masih berkedip; kini memakai `LocaleText`, dan `getLocalePair` mendukung interpolasi `{token}`; (4) ganti bahasa di Surah Detail sempat menampilkan area terjemahan kosong menunggu jaringan; kini terjemahan bahasa lain dipanaskan di latar (`prefetchSurahTranslation`, idle) sehingga selesai dalam satu microtask; (5) halaman yang dipulihkan dari bfcache atau tab yang bahasanya diubah di tab lain membawa locale lama; `IntlProvider` kini memuat ulang locale lewat `pageshow` (`persisted`) dan event `storage`.

Verifikasi browser: dengan request terjemahan `en` ditahan, **286/286** paragraf terjemahan surah 2 berstatus `visibility:hidden` dan tidak ada teks `id` yang terlihat; cache `en` + Dexie `id` terkoreksi ke `id` setelah `init()` tanpa sisa teks `en`; pengguna `en` di `domcontentloaded` melihat `7 verses`, `Meccan`, `Save Offline`, `Translation`, `Transliteration`, `Focus`; setelah surah tampil, `translations/id/001.json` diminta di latar; kembali dari `/settings` setelah ganti ke `id` (restore bfcache) menghasilkan `data-app-locale="id"` dan terjemahan `id` tanpa jeda kosong.

Catatan lingkungan: `npm run lint` tidak dapat dijalankan karena ESLint bukan dependency repo (gap lama, bukan regresi); verifikasi memakai `tsc --noEmit` + suite test.


---

# 🛠️ Phase 12b — Audit Bug & Hardening (2 Nov 2026)

**Status:** ✅ Selesai 2 November 2026  
**Temuan asal:** laporan hydration mismatch ikon favorit di Beranda + audit kode menyeluruh (bug, keamanan, UI/UX, logika)

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P12b-1 | Hydration mismatch ikon hati: `HomeClient` menurunkan `isFavorited` dari slice `favorites`, bukan `isFavorite()` (yang membaca `get()` saat hidrasi) | [FIX] | P0 | `docs/15` §13 |
| P12b-2 | Gate Threads tidak mengunci pengguna bila `localStorage` diblokir: `completeThreadsGate()` aman & mengembalikan `boolean` | [FIX] | P1 | `docs/34` §14 |
| P12b-3 | Mode fokus: `?ayah` divalidasi `parseAyahParam` + `clampAyahNumber` (sebelumnya `?ayah=abc` → `NaN`) | [FIX] | P1 | `docs/35` H7 |
| P12b-4 | `userStore.init()`: `normalizeStoredSettings()` melengkapi semua field settings lama sekaligus (ganti rantai `else if`) | [FIX] | P1 | `docs/15` §5.2 |
| P12b-5 | SW: pesan unduhan dibungkus `event.waitUntil`; `prefetch-surah` hanya menerima URL audio CDN, pesan cache offline hanya path se-origin; `SW_VERSION` → `v4` | [FIX]/[HARDEN] | P1 | `docs/15` §12.4 |
| P12b-6 | `init()` store tahan gagal Dexie (`try/catch`) + `initStores()` memakai `Promise.allSettled` | [FIX] | P1 | `docs/15` §12.5 |
| P12b-7 | `SurahCard`: tombol favorit jadi saudara tautan (bukan `<button>` di dalam `<a>`); tanpa tab stop ganda | [FIX] | P1 | `docs/12` §4 |
| P12b-8 | Tautan pembuat dapat diganti env `NEXT_PUBLIC_AUTHOR_*` / `NEXT_PUBLIC_ORGANIZATION_URL` (hanya `https://`); tidak dipasang → bawaan, dikosongkan/`-` → disembunyikan (URL Threads kosong mematikan gate); handle di teks gerbang diturunkan dari URL | [NEW] | P2 | `docs/26` §4.5, `docs/34` §5 |
| P12b-9 | Test: settings lama multi-field, storage gate diblokir, struktur `SurahCard`, validasi env | [TEST] | P1 | — |
| P12b-10 | Hydration mismatch atribut `disabled` tombol Simpan Offline: cek `caches` baru setelah hidrasi (`useIsClient`) | [FIX] | P0 | `docs/15` §13 |
| P12b-11 | Teks ayat tampil kotak (tofu) di sebagian sistem: font Amiri Quran self-host (`lib/quran-font.ts`) untuk ayat, Mode Fokus, pratinjau Pengaturan | [FIX] | P0 | `docs/09` §4 |
| P12b-12 | Degraded mode: `persistenceAvailable` di `userStore` + pemberitahuan di Pengaturan; aksi tetap jalan di memori | [NEW] | P2 | `docs/15` §12.5 |
| P12b-13 | URL Threads bawaan diganti ke `https://www.threads.com/@qolcore` | [CHORE] | P2 | `docs/34` §5 |

- [x] [FIX] P12b-1 — hydration favorit (P0)
- [x] [FIX] P12b-2 — gate aman storage diblokir (P1)
- [x] [FIX] P12b-3 — `?ayah` mode fokus (P1)
- [x] [FIX] P12b-4 — normalisasi settings lama (P1)
- [x] [FIX] P12b-5 — SW `waitUntil` + allowlist URL (P1)
- [x] [FIX] P12b-6 — `init()` tahan gagal Dexie (P1)
- [x] [FIX] P12b-7 — struktur DOM `SurahCard` (P1)
- [x] [NEW] P12b-8 — env tautan pembuat (P2)
- [x] [TEST] P12b-9 — test baru (P1)
- [x] [FIX] P12b-10 — hydration tombol Simpan Offline (P0)
- [x] [FIX] P12b-11 — font Al-Qur'an Amiri Quran (P0)
- [x] [NEW] P12b-12 — indikator degraded mode (P2)
- [x] [CHORE] P12b-13 — default Threads @qolcore (P2)

**Hasil verifikasi (2 Nov 2026):** dev server + Playwright — dengan kode lama, 4/4 reload setelah memfavoritkan surat memunculkan "A tree hydrated but some attributes…"; setelah P12b-1, **0** error dan status favorit tetap tersimpan. `document.querySelectorAll('a button').length === 0`. `/focus/1?ayah=abc` → "Ayat 1 / 7". Env `NEXT_PUBLIC_AUTHOR_THREADS_URL=https://www.threads.com/@akuncoba` → teks gerbang "Ikuti @akuncoba…" dan tautan gerbang/footer berubah; `NEXT_PUBLIC_AUTHOR_X_URL=javascript:…` ditolak. Build production dengan `NEXT_PUBLIC_AUTHOR_THREADS_URL=` dan `NEXT_PUBLIC_AUTHOR_X_URL=-` → overlay gate tidak ada di DOM, scroll tidak terkunci, footer hanya menampilkan nama + Qolcore (env yang tidak dipasang tetap bawaan). Build web hijau; suite test **427 lulus / 15 gagal (442)** — ke-15 kegagalan sudah ada sebelumnya (lingkungan jsdom, lihat residual).

**Tambahan verifikasi (2 Nov 2026, laporan pengguna kedua):** `/surah/1` dan `/surah/2` — 0 hydration mismatch dalam 3 kali muat ulang; tombol Simpan Offline aktif setelah hidrasi; `getComputedStyle` teks ayat = `quranFont`, font berstatus `loaded`, alif wasla & tanda waqaf tampil benar di desktop dan lebar 430 px (ayat panjang terbungkus tanpa terpotong).

**Residual / backlog:** → dipindah menjadi task **Phase 14** (`docs/39`), kecuali yang ditandai selesai.

<details><summary>Daftar residual awal</summary>


- 15 test Cache Storage gagal karena `new Response(new Blob())` di jsdom melempar `object.stream is not a function` — perbaiki fixture/lingkungan test.
- `tests/scripts/generate-sw-precache.test.ts` menulis ke `public/sw-precache-manifest.js` asli; sebagian test bisa macet di mesin lokal.
- 26 error TypeScript tersembunyi oleh `typescript.ignoreBuildErrors` (mis. impor `@base-ui/react/utils/useAnchorPositioning` di `components/ui/select.tsx`, `Metadata` dari `'react'` di `app/settings/layout.tsx`).
- Overlay gate: belum ada focus trap / Esc / `inert` pada latar.
- Membuka surat apa pun langsung menimpa posisi "Lanjutkan Hafalan" ke ayat 1; label "dihafal" menyesatkan.
- SW: cache navigasi tak terbatas (tiap `?ayah` jadi entri), RSC cache-first bisa basi setelah deploy, audio cache dilayani 200 untuk permintaan Range (risiko iOS).
- ~~Kode mati: `components/favorites.tsx`~~ (dihapus 2 Nov 2026), state `completedAyahs` di Surah Detail.

</details>

---

# 🔤 Phase 13 — Sorot Kata saat Tilawah (2 Nov 2026)

**Status:** ✅ Selesai 2 November 2026
**Spek:** [`docs/37-word-highlight-spec.md`](./37-word-highlight-spec.md)

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P13-1 | Skrip `scripts/build-word-timings.mjs`: data quran-align → `public/data/word-timings/v1/{reciterId}/NNN.json`, validasi indeks kata terhadap dataset | [NEW] | P1 | §4 |
| P13-2 | Verifikasi file audio EveryAyah identik (durasi vs segmen terakhir) — Alafasy, Minshawi, Husary 128 (pakai data 64 kbps) | [TEST] | P1 | §2 |
| P13-3 | `services/quran/word-timings.ts` + `hooks/use-active-word-range.ts` (interpolasi rAF, web & Android) | [NEW] | P1 | §6 |
| P13-4 | `QuranAyahText` / `LiveQuranAyahText` di `AyahCard` (ayat aktif saja) & Mode Fokus | [NEW] | P1 | §6 |
| P13-5 | Pengaturan **Sorot Kata** (`settings.wordHighlight`, default ON) + atribusi CC BY 4.0 di layar Tentang | [NEW] | P1 | §1 |
| P13-6 | Offline: dikecualikan dari precache install; ikut **Simpan Offline**; perbaiki `SHELL_CACHE_NAME` `-v1` → `-v2` (repair precache berjalan tiap buka app) | [FIX] | P1 | §5 |
| P13-7 | Test: tokenizer = skrip di seluruh dataset, validitas semua file waktu, pencarian rentang, loader, URL Simpan Offline | [TEST] | P2 | — |
| P13-8 | Tambah 9 qari EveryAyah yang punya data quran-align (total 14 qari, 12 bersorot kata); verifikasi durasi file | [NEW] | P1 | §2, §8 |
| P13-9 | Qari default pengguna baru → Alafasy (`DEFAULT_RECITER_ID`) | [UPDATE] | P1 | §8 |
| P13-10 | Tanda qari di Pengaturan: Untuk hafalan, Sorot kata; daftar bisa digulir (tanda ★ Populer sempat ditambahkan lalu dihapus) | [NEW] | P2 | §8 |

- [x] [NEW] P13-1 — skrip data (P1)
- [x] [TEST] P13-2 — verifikasi audio (P1)
- [x] [NEW] P13-3 — service + hook (P1)
- [x] [NEW] P13-4 — komponen teks ayat (P1)
- [x] [NEW] P13-5 — pengaturan + atribusi (P1)
- [x] [FIX] P13-6 — offline + perbaikan nama cache shell (P1)
- [x] [TEST] P13-7 — test (P2)
- [x] [NEW] P13-8 — 9 qari baru (P1)
- [x] [UPDATE] P13-9 — default Alafasy (P1)
- [x] [NEW] P13-10 — tanda qari (P2)

**Hasil verifikasi (2 Nov 2026):** Playwright dengan audio CDN diganti file uji — qari Alafasy, 1:1 menyorot `بِسْمِ` → `ٱللَّهِ` → `ٱلرَّحْمَٰنِ` → `ٱلرَّحِيمِ` sesuai waktu data; Mode Fokus Husary 2:2 menyorot kata 0→1→2 (7 kata, tanda waqaf ikut kata sebelumnya); qari default Al-Juhaynee tidak memecah teks (0 span kata). 0 error konsol. Suite test **445 lulus / 15 gagal (460)** — 15 kegagalan lama (jsdom).

**Residual:** Al-Juhaynee & Warsh belum didukung sorot kata; ketuk kata untuk memutar dari kata itu belum ada.

---

# 🧹 Phase 14 — Perbaikan Lanjutan Hasil Audit

**Status:** 🚧 Berjalan — P14-1–P14-3 selesai, P14-4 menunggu uji iPhone
**Spek:** [`docs/39-followup-fixes-plan.md`](./39-followup-fixes-plan.md) (kode A1–D3 merujuk bagian di dokumen itu)

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P14-1 | "Lanjutkan Hafalan" hanya disimpan setelah interaksi bermakna; label "Terakhir dibaca" | [FIX] | P1 | A1 |
| P14-2 | SW: kunci cache navigasi tanpa query `?ayah` | [FIX] | P1 | B1 |
| P14-3 | SW: RSC network-first berbatas waktu (atau buang RSC beda `buildId`) | [FIX] | P1 | B2 |
| P14-4 | SW: respons `206` untuk permintaan Range audio dari cache (iOS) + uji perangkat | [FIX] | P1 | B3 |
| P14-5 | Perbaiki seluruh error TypeScript, matikan `ignoreBuildErrors`, `tsc --noEmit` di CI | [FIX] | P1 | C1 |
| P14-6 | Focus trap + `inert` untuk Gerbang Threads | [A11Y] | P2 | A2 |
| P14-7 | Pasang ESLint (flat config) + jalankan di CI | [NEW] | P2 | C2 |
| P14-8 | Perbaiki 15 test gagal (jsdom `Blob`/`Response`) | [TEST] | P2 | C3 |
| P14-9 | Celah kecil: `install-prompt` try/catch, rejection `toggleFavorite`, `null` di Select qari, kunci i18n tak terpakai | [FIX] | P2 | C5 |
| P14-10 | Test precache menulis ke folder sementara; selidiki test yang menggantung | [TEST] | P3 | C4 |

- [x] [FIX] P14-1 — posisi Lanjutkan Hafalan (P1)
- [x] [FIX] P14-2 — cache navigasi tanpa query (P1)
- [x] [FIX] P14-3 — RSC tidak basi setelah deploy (P1)
- [ ] [FIX] P14-4 — Range 206 audio iOS (P1) — kode ✅, uji iPhone ⏳
- [x] [FIX] P14-5 — TypeScript bersih + CI (P1)
- [x] [A11Y] P14-6 — gerbang Threads (P2)
- [x] [NEW] P14-7 — ESLint (P2)
- [x] [TEST] P14-8 — 15 test jsdom (P2)
- [x] [FIX] P14-9 — celah kecil (P2)
- [x] [TEST] P14-10 — kebersihan test (P3)

**Audit UI/UX ulang (2 Nov 2026, build produksi + Playwright, mobile & desktop):** tidak ada error konsol/hydration, tidak ada overflow horizontal, gerbang/favorit/pencarian/sorot kata/Lanjutkan Hafalan/ganti bahasa berjalan. Diperbaiki: kartu ayat kini bisa dipilih dengan keyboard (`role="button"`, Enter/Spasi, `aria-current`); judul tab khusus untuk Mode Fokus, Pengaturan, dan Tentang; heading tersembunyi (`sr-only`) di Mode Fokus. Lanjutan (commit berikutnya): label UI id tidak lagi campur Inggris (lihat `docs/28` §1 — Pengulangan, Tanpa batas, Rentang Ayat, Pemutaran, Ikuti Ayat yang Diputar, Unduh Audio Otomatis, Offline & Penyimpanan, Hapus Audio Tersimpan; dokumen ikut diperbarui); pintasan keyboard Mode Fokus (← / → pindah ayat, Spasi putar/jeda — `useFocusKeyboardShortcuts`); penanda ayat aktif ▶ diganti titik hijau agar tidak dikira tombol putar.

**Sudah dikerjakan di luar fase ini (2 Nov 2026):** `package-lock.json` disinkronkan (`npm ci` hijau di lingkungan bersih); 5 komponen tidak terpakai dihapus; atribusi pihak ketiga di `THIRD_PARTY_NOTICES.md`.

---

# 🔁 Phase 15 — Ulang Kata (Hafalan per Kata)

**Status:** ✅ Selesai di web (2 Nov 2026) — uji perangkat iOS/Android menunggu (P15-12)
**Spek:** [`docs/38-word-loop-spec.md`](./38-word-loop-spec.md)
**Bergantung pada:** Phase 13 (data waktu per kata)

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| P15-1 | Spike: presisi berhenti di akhir potongan (web rAF vs Android `currentTime`/timer) — target meleset ≤ 80 ms | [SPIKE] | P1 | §4.3 |
| P15-2 | Putuskan pemilik state (`useWordLoopStore` baru vs slice `useRepeatStore`) & catat di `docs/15` | [DOC] | P1 | §4.5 |
| P15-3 | Logika potongan: rentang → `{startMs, endMs}` dengan perluasan segmen gabungan & bantalan | [NEW] | P1 | §4.1 |
| P15-4 | Mesin siklus: seek → play → berhenti → jeda menirukan → ulang; integrasi `AudioController` | [NEW] | P1 | §4.2 |
| P15-5 | Ketuk kata (mulai/pindah/berhenti) di ayat aktif & ayat lain; pesan untuk qari tanpa data | [NEW] | P1 | §3.1 |
| P15-6 | Tekan lama + seret rentang (sentuh & mouse), Shift+klik; tidak bentrok dengan gulir | [NEW] | P1 | §3.2 |
| P15-7 | Tangguhkan Repeat ayat & Murotal; aturan ⏮/⏭, ganti qari, pindah ayat | [NEW] | P1 | §4.4 |
| P15-8 | Tampilan: bingkai amber kata diulang, chip status + tombol Berhenti, Mode Fokus | [NEW] | P1 | §3.4 |
| P15-9 | Pengaturan "Jeda menirukan" (0/1/2/3 detik, default 1) | [NEW] | P2 | §4.2 |
| P15-10 | Keyboard & pembaca layar (role button, aria-pressed, Esc, aria-live) | [A11Y] | P1 | §3.3 |
| P15-11 | Event `word_loop_started` / `word_loop_stopped` | [NEW] | P3 | §6 |
| P15-12 | Test unit (potongan, siklus, interaksi) + uji perangkat web/iOS/Android | [TEST] | P1 | §7 |

- [x] [SPIKE] P15-1 — presisi berhenti (P1) — web ≤ 31 ms; Android: interpolasi event 100 ms (uji perangkat di P15-12), lihat `docs/38` §8.2
- [x] [DOC] P15-2 — pemilik state (P1)
- [x] [NEW] P15-3 — potongan (P1)
- [x] [NEW] P15-4 — mesin siklus (P1)
- [x] [NEW] P15-5 — ketuk kata (P1)
- [x] [NEW] P15-6 — seret rentang (P1)
- [x] [NEW] P15-7 — interaksi fitur lain (P1)
- [x] [NEW] P15-8 — tampilan (P1)
- [x] [NEW] P15-9 — jeda menirukan (P2)
- [x] [A11Y] P15-10 — aksesibilitas (P1)
- [x] [NEW] P15-11 — analytics (P3)
- [ ] [TEST] P15-12 — test & uji perangkat (P1) — unit test ✅ (`word-clip`, `word-loop-engine`), uji web Playwright ✅ (meleset ≤ 31 ms); uji iPhone & APK Android ⏳
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