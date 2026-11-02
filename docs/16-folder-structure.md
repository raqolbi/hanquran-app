# 16 — Struktur Folder HanQuran

Dokumen ini memetakan struktur folder **aktual** repository `hanquran-app` (Next.js App Router + Capacitor Android). Gunakan sebagai peta untuk developer baru.

**Terakhir disinkronkan dengan kode:** 2 November 2026 (versi `0.6.0`).

> Versi sebelumnya dokumen ini berisi struktur **rekomendasi** (folder `components/screens/`, `components/atoms/`, `services/api/`, `services/sw/`, `styles/`, `types/*.ts` terpisah) yang **tidak pernah** dibuat. Seluruh isi di bawah mengikuti kode nyata. Jika menambah folder baru, perbarui dokumen ini.

---

## 1. Prinsip Organisasi Kode

- **App Router first:** `app/` adalah entrypoint. Halaman surat (`/surah/[id]`) adalah server component yang di-SSG; interaksi ada di client component (`components/*-client.tsx`).
- **Komponen datar:** komponen layar ada langsung di `components/`; primitives di `components/ui/`; komponen lintas layar (brand, gate, error) di `components/shared/`; provider global di `components/providers/`.
- **Logika murni** di `lib/` (tanpa React), **integrasi platform** di `services/` (audio, SW, Dexie, dataset).
- **State global** di `stores/` (Zustand, persist langsung ke Dexie). State lokal tetap di komponen.
- **Konten Qur'an** dari `public/data/*` lewat `services/quran/` — **bukan** Dexie (`docs/23`).
- Dokumentasi di `docs/` dalam Bahasa Indonesia (`CLAUDE.md`).

---

## 2. Struktur Root

```
hanquran-app/
├─ app/                 # Next.js App Router (halaman, layout, sitemap, robots, font)
├─ components/          # komponen React
├─ hooks/               # custom hooks (client-side)
├─ lib/                 # helper murni & util
├─ services/            # integrasi platform: audio, SW, Dexie, dataset Qur'an
├─ stores/              # Zustand stores
├─ types/               # tipe bersama (satu file: types/index.ts)
├─ i18n/                # konfigurasi & deteksi locale next-intl
├─ messages/            # teks UI: id.json, en.json
├─ data/                # data kecil yang di-bundle: reciters.json, about-credits.ts
├─ public/              # aset statis, dataset Qur'an, Service Worker
├─ scripts/             # build, Android, precache SW, audit performa
├─ tests/               # unit & integration test (Vitest; node default, jsdom per file)
├─ android/             # proyek Capacitor Android (docs/32)
├─ branding/, assets/   # sumber aset desain & ikon/splash Capacitor
├─ docs/                # dokumentasi proyek
├─ reports/             # hasil audit (Lighthouse)
├─ capacitor.config.ts, next.config.mjs, vercel.json, vitest.config.ts
├─ CLAUDE.md, README.md, RELEASE.md, LICENSE, COMMERCIAL-LICENSE.md
└─ package.json, pnpm-lock.yaml
```

Tidak ada folder `styles/` (CSS global di `app/globals.css`, Tailwind v4 via `@tailwindcss/postcss`) maupun `src/`.

---

## 3. `app/`

```
app/
├─ layout.tsx            # root layout: skrip pra-paint (locale, PWA, gate), JSON-LD, AppProviders
├─ page.tsx              # Beranda (SSG) → HomeClient
├─ loading.tsx
├─ globals.css           # Tailwind v4 + token desain
├─ robots.ts, sitemap.ts # SEO (docs/35)
├─ icon.png, apple-icon.png
├─ fonts/                # Amiri Quran (woff2 + lisensi OFL) — docs/09 §4
├─ surah/[id]/           # layout.tsx (generateStaticParams) + page.tsx (server, SSG)
├─ focus/[id]/           # layout.tsx (noindex, static params) + page.tsx (client)
└─ settings/             # layout.tsx (noindex) + page.tsx + about/page.tsx
```

---

## 4. `components/`

```
components/
├─ ui/                   # primitives: button, dialog, drawer, select, switch, segmented-control
├─ shared/               # Logo, ThreadsGate, InstallBanner, ErrorBoundary, ErrorFallback,
│                        # LocaleText, AppToastHost, PwaSplashDismisser
├─ providers/            # AppProviders, IntlProvider, AccessibilityProvider, NativeShellBootstrap
│
├─ home-client.tsx       # Beranda interaktif (pencarian, filter, favorit)
├─ header.tsx, search-input.tsx, filter-chips.tsx, continue-reading.tsx, home-footer.tsx
├─ surah-card.tsx, lazy-surah-card.tsx
│
├─ surah-detail-client.tsx            # Surah Detail interaktif
├─ surah-detail-header.tsx, surah-detail-top-chrome.tsx, surah-detail-scroll-spacer.tsx
├─ start-ayah-sync.tsx                # sinkron ?ayah (di dalam Suspense)
├─ verse-display-controls.tsx, ayah-card.tsx, quran-ayah-text.tsx, surah-offline-download.tsx
├─ audio-player.tsx, repeat-selector.tsx, repeat-settings-dialog.tsx,
├─ repeat-status.tsx, repeat-progress-badge.tsx, offline-status-badge.tsx
│
└─ settings-section.tsx, native-aware-link.tsx, json-ld.tsx
```


Catatan:

- Lima komponen lama yang tidak dipakai dihapus 2 Nov 2026 (lihat `docs/13` § Komponen yang Dihapus).
- `components/ui/` tidak boleh mengimpor `stores/` atau `services/`.

---

## 5. `hooks/`

Semua hook client-side, nama file `use-*.ts`. Kelompok utama:

| Kelompok | Hook |
|----------|------|
| Konten | `use-surah`, `use-surah-list`, `use-reciters`, `use-preferred-reciter` |
| Audio & repeat | `use-audio`, `use-ayah-audio`, `use-surah-repeat-playback`, `use-audio-playback-gate`, `use-auto-follow-playback` |
| Offline | `use-surah-offline-download`, `use-surah-offline-ready` |
| Tampilan | `use-reading-display`, `use-arabic-text-size`, `use-surah-detail-bottom-inset`, `use-media-query`, `use-is-client` |
| Sorot kata | `use-active-word-range` (`docs/37`) |
| Lain-lain | `use-persist-last-viewed`, `use-track-surah-opened`, `use-install-prompt`, `use-threads-gate` |

---

## 6. `lib/`

Helper murni (dapat diuji tanpa React). Contoh: `routes.ts` (builder URL + static export Android), `navigate.ts`, `ayah-param.ts`, `surah-search.ts`, `surah-seed.ts`, `repeat-*.ts`, `auto-follow-playback.ts`, `murotal-pending-play.ts`, `app-locale.ts`, `locale-text.ts`, `threads-gate.ts`, `install-prompt.ts`, `app-about.ts` (konstanta & env tautan pembuat), `site-url.ts`, `schema-org.ts`, `platform.ts`, `native-*.ts`, `quran-font.ts`, `analytics/`.

---

## 7. `services/`

```
services/
├─ quran/                       # satu-satunya jalur konten Qur'an (public/data/*)
│  ├─ quran-service.ts, data-loader.ts, mappers.ts, paths.ts
│  ├─ server-surah.ts           # baca dataset saat build/SSG
│  ├─ word-timings.ts           # data waktu per kata (quran-align, docs/37)
│  ├─ audio-service.ts, audio-config.ts   # URL MP3 CDN everyayah.com
│  └─ app-types.ts, dataset-types.ts, index.ts
├─ db/
│  ├─ db.ts                     # instance Dexie + defaultSettings
│  └─ migrations.ts             # schema v1…v5
├─ audio-controller.ts          # HTMLAudioElement ↔ useAudioStore
├─ native-audio-player.ts, native-media-session.ts, resolve-native-audio-path.ts  # Android
├─ media-session.ts, audio-tab-sync.ts, repeat-tab-sync.ts
├─ repeat-engine.ts, murotal-resolver.ts, playback-track-navigation.ts
├─ download-manager.ts (+ -types), download-manifest-key.ts
├─ audio-play-cache.ts, audio-prefetch.ts, audio-cache-stats.ts, audio-cache-constants.ts
├─ surah-audio-cache.ts, resolve-playable-audio-url.ts
├─ offline-surah-precache.ts, cache-manager.ts
```

Service Worker **bukan** di `services/`, melainkan file statis `public/sw.js` + `public/sw-helpers.js` + `public/sw-precache-manifest.js` (di-generate `scripts/generate-sw-precache.mjs`).

Aturan: komponen tidak mengakses `services/db/` langsung (lewat store) dan tidak mengakses `services/quran/` langsung (lewat hook).

---

## 8. `stores/`

```
stores/
├─ audioStore.ts     # runtime pemutaran (tidak dipersist)
├─ userStore.ts      # favorit, settings, lastViewed (Dexie) + persistenceAvailable
├─ repeatStore.ts    # config (Dexie settings.repeatConfig) + runtime
├─ offlineStore.ts   # koneksi, status unduhan per surat+qari, ringkasan manifest
└─ index.ts          # barrel + initStores()
```

Rincian: `docs/15-state-management.md`.

---

## 9. `types/`, `i18n/`, `messages/`, `data/`

- `types/index.ts` — satu file untuk tipe bersama (`SettingsRecord`, `DownloadManifestRecord`, `RepeatConfig`, `ConnectionStatus`, …). Tipe dataset/konten ada di `services/quran/*-types.ts`.
- `i18n/config.ts`, `i18n/detection.ts` — locale `id`/`en` client-side (tanpa prefix URL). `docs/21`.
- `messages/id.json`, `messages/en.json` — seluruh teks UI.
- `data/reciters.json` — daftar qari; `data/word-timing-reciters.json` — qari yang punya data sorot kata; `data/about-credits.ts` — sumber data di layar Tentang.

---

## 10. `public/`

```
public/
├─ data/                 # dataset Qur'an: manifest.json, quran/NNN.json, translations/{id,en}/NNN.json,
│                        # word-timings/v1/{reciterId}/NNN.json (docs/37)
├─ branding/, icons/, og/
├─ manifest.json         # PWA manifest
├─ offline.html
├─ sw.js, sw-helpers.js, sw-precache-manifest.js
```

---

## 11. `scripts/`

| Script | Fungsi |
|--------|--------|
| `generate-sw-precache.mjs` (+ `lib/dataset-fingerprint.mjs`) | Daftar precache SW & fingerprint dataset (sebelum & sesudah `next build`) |
| `build-android.mjs`, `build-android-bundle.mjs`, `prepare-capacitor-assets.mjs`, `apply-native-audio-complete-patch.mjs`, `patches/` | Pipeline Android (`docs/32`) |
| `measure-bundle.mjs`, `run-lighthouse.mjs`, `validate-pwa.mjs` | Audit performa/PWA (`npm run perf*`) |
| `generate-og-image.mjs`, `generate-favicons.mjs` | Aset SEO/ikon |
| `build-word-timings.mjs` | Bangun data sorot kata dari rilis quran-align (dijalankan manual, `docs/37` §4) |

---

## 12. `tests/`

Dipisah per lapisan, mengikuti struktur sumber: `tests/app`, `components`, `hooks`, `lib`, `services`, `stores`, `i18n`, `public`, `scripts`, `service-worker`, plus `fixtures/`, `helpers/`, `setup.ts`. Tidak ada test e2e/a11y otomatis (backlog `docs/18` Phase 7).

---

## 13. Aturan Penamaan

- File/folder: `kebab-case` (`surah-detail-header.tsx`). Pengecualian lama: `components/shared/Logo.tsx`, `ErrorBoundary.tsx`, `ErrorFallback.tsx`, dan file store `camelCase` (`audioStore.ts`).
- Komponen React: `PascalCase`. Hook: `useCamelCase` di file `use-kebab-case.ts`.
- Store: file `xxxStore.ts` mengekspor `useXxxStore`.

---

## 14. Anti-Pattern

- Business logic di komponen presentasional — pindahkan ke `lib/` atau `services/`.
- Menyimpan biner audio di `public/` — audio dari CDN + Cache Storage.
- React Context untuk data yang sering berubah — gunakan Zustand.
- Membaca nilai khusus browser (`window`, `caches`, state live store via `get()`) saat render komponen yang di-SSR — penyebab hydration mismatch (`docs/15` §13).

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| Juni 2026 | Dokumen awal — struktur rekomendasi |
| 2 November 2026 | Ditulis ulang mengikuti struktur aktual repo; folder rekomendasi yang tidak pernah dibuat dihapus; komponen tidak terpakai ditandai |
| 2 November 2026 | Tambah file sorot kata (`docs/37`) |
