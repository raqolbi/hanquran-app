# 16 — Struktur Folder Final HanQuran V1

Dokumen ini mendefinisikan struktur folder yang direkomendasikan untuk HanQuran V1. Ditulis dalam Bahasa Indonesia dan disesuaikan dengan implementasi nyata (`hanquran-app`) serta prinsip Next.js App Router (Next.js 16+ / 15+ App Router). Tujuan: struktur yang bersih, scalable, mudah dipahami developer baru, tanpa over-engineering.

---

**Ringkasan singkat**
- Basis implementasi: folder `hanquran-app` berisi aplikasi Next.js.
- Rekomendasi: simpan code aplikasi di dalam `hanquran-app/` (atau `app/` pada repo monorepo), sementara `branding/` dan `docs/` tetap di root.

---

## 1. Tujuan Struktur Folder
- Mempermudah navigasi dan on‑boarding developer baru.
- Memisahkan concerns: UI, domain logic, services, storage, assets, dokumentasi.
- Memudahkan skalabilitas (fitur baru, modul, testability).
- Cocok untuk Next.js App Router (server + client components).

---

## 2. Prinsip Organisasi Kode
- App Router first: `app/` adalah entrypoint; gunakan server components untuk layout/SEO, client components untuk interaksi.
- Komponen bersifat composable: pisahkan `components/` (screen & shared) dan `components/ui/` (primitives).
- Logic domain di `lib/` atau `services/` (pure functions, data loaders, API helpers).
- State global di `stores/` (mis. `zustand`), small client-only slices di `hooks/` atau component-local state.
- Persistensi di `services/db/` (Dexie setup & migrations) dan `public/` untuk asset statis.
- Dokumentasi di `docs/` mengikuti CLAUDE.md (Bahasa Indonesia).

---

## 3. Struktur Folder Lengkap (rekomendasi)

```
/ (repo root)
├─ CLAUDE.md
├─ README.md
├─ branding/                    # sumber aset desain
├─ docs/                        # semua dokumen proyek
│  ├─ 00-vision.md
│  ├─ ...
│  └─ 16-folder-structure.md
├─ hanquran-app/          # Next.js App
│  ├─ app/                      # Next.js App Router
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ loading.tsx
│  │  ├─ /surah/[id]/page.tsx
│  │  ├─ /focus/[id]/page.tsx
│  │  └─ /settings/page.tsx
│  ├─ components/
│  │  ├─ ui/                    # primitives (Button, Dialog, Drawer, Select, Switch)
│  │  ├─ shared/                # shared components (Logo, Header, OfflineBadge)
│  │  ├─ screens/               # screen-level components (SurahDetailHeader, ActionBar)
│  │  └─ atoms/                 # sangat kecil, optional
│  ├─ lib/                      # utilities, data providers (surahs-data, routes, repeat-options)
│  ├─ hooks/                    # reusable hooks (useMediaQuery, useAudioController)
│  ├─ services/                 # SW, download manager, audio controller, api client
│  ├─ stores/                   # zustand stores (audio, user, repeat, offline)
│  ├─ types/                    # shared TS types / interfaces
│  ├─ styles/                   # tailwind config, global css
│  ├─ public/                   # static assets (branding/, favicon, fonts)
│  ├─ scripts/                  # small dev scripts (generate-data, migrate)
│  ├─ tests/                    # unit / integration tests for components & stores
│  ├─ package.json
│  └─ tsconfig.json
├─ tools/                       # optional utilities for repo maintenance
└─ .gitignore
```

> Catatan: `hanquran-app/public/branding` sudah berisi `logo.png` dan `logo-with-text.png` — tetap gunakan `components/shared/Logo.tsx` sebagai single source of truth untuk referensi brand.

---

## 4. Penjelasan Setiap Folder
- `app/` — Next.js App Router: tempat halaman (server+client components), layouts, dan routing. Gunakan struktur file/route sesuai Next.js (folder per route).
- `components/` — Semua komponen UI. Subfolder disusun untuk kemudahan: `ui/` (primitives), `shared/` (brand + utilities), `screens/` (komponen yang mewakili bagian layar), `atoms/` (komponen sangat kecil).
- `lib/` — Pure helpers, data fixtures (`surahs-data.ts`), route builders (`routes.ts`), repeat logic helpers.
- `hooks/` — Custom React hooks yang reusable (harus client-side). Contoh: `useMediaQuery`, `useAudioController`.
- `services/` — Layanan aplikasi yang berinteraksi dengan platform: `service-worker/`, `download-manager.ts`, `audio-controller.ts`, `api/` (jika ada sinkronisasi server).
- `stores/` — Client state stores (Zustand): `audioStore.ts`, `userStore.ts`, `repeatStore.ts`, `offlineStore.ts`. Simpan di sini agar mudah dicari.
- `types/` — Shared TypeScript types/interfaces (SurahData, RepeatConfig, ConnectionStatus).
- `public/` — Static assets served langsung: icons, branding images, audio placeholders. Audio binaries stored later in Cache Storage via SW, bukan di `public/`.
- `styles/` — Tailwind config, global CSS, design tokens jika perlu.
- `tests/` — Unit & integration tests. Keep test file colocated with components if preferred (e.g., `component.test.tsx`) or centralized.
- `docs/` — Dokumen proyek (wireframes, spec, routing, component-tree, state management).

---

## 5. Struktur `components/` (detail)
Rekomendasi struktur komponen yang mencerminkan implementasi saat ini.

```
components/
├─ ui/                 # primitives; tidak bergantung pada projek domain
│  ├─ button.tsx
│  ├─ dialog.tsx
│  ├─ drawer.tsx
│  ├─ select.tsx
│  └─ switch.tsx
├─ shared/             # brand + small shared building blocks
│  ├─ logo.tsx
│  ├─ header.tsx
│  └─ offline-status-badge.tsx
├─ screens/            # screen specific components (composed from ui + shared)
│  ├─ surah-detail-header.tsx
│  ├─ action-bar.tsx
│  └─ audio-player.tsx
├─ atoms/              # very small components (AyahWordHighlight, Chip)
└─ index.ts            # optional barrel export
```

Prinsip:
- `ui/` tidak boleh mengimpor `lib/` atau `stores/`.
- `screens/` boleh mengimpor `ui/`, `shared/`, `lib/`, `stores/`.
- Komponen besar (halaman) tetap di `app/` sebagai glue layer.

---

## 6. Struktur `services/`

```
services/
├─ audio-controller.ts      # jembatan HTMLAudioElement ↔ useAudioStore
├─ download-manager.ts      # orchestration unduh audio ke Cache Storage
├─ db/                      # Dexie setup dan migrasi
│  ├─ db.ts                 # Dexie instance + schema v1 (13 tabel)
│  └─ migrations.ts         # migrasi antar versi Dexie
├─ api/                     # Repository Layer (public/data/*, EveryAyah)
│  ├─ QuranRepository.ts    # Local-First: Dexie first, API fallback
│  └─ AudioRepository.ts    # Cache Storage first, download fallback
└─ sw/                      # service worker source (workbox / manual sw)
   └─ service-worker.js
```

Catatan:
- `services/db/db.ts` berisi instance Dexie tunggal yang digunakan oleh seluruh Repository.
- Service Worker adalah sumber kebenaran untuk file di Cache Storage. Client memverifikasi via `caches.match`.
- Komponen tidak boleh mengakses `services/db/` atau `services/api/` secara langsung — semua melalui Store actions.

---

## 7. Struktur `stores/` (state)
Gunakan `zustand` dengan akses langsung ke Dexie dari action store (tanpa persist middleware).

```
stores/
├─ audioStore.ts        # play/pause/seek/currentTrack (runtime, tidak dipersist)
├─ userStore.ts         # favorites, settings (baca/tulis Dexie langsung)
├─ repeatStore.ts       # repeatConfig (persisten di Dexie), repeatState (runtime)
├─ offlineStore.ts      # connection, downloadStatuses, manifest (baca Dexie + SW)
└─ index.ts             # helper untuk combine stores (optional)
```

Prinsip:
- Store memegang UI state yang perlu diakses lintas komponen.
- Persistensi dilakukan via **Dexie langsung** dari action store (`init()` untuk baca, action untuk tulis).
- `useAudioStore` tidak dipersist — seluruh state bersifat runtime.
- Jangan taruh ephemeral UI states di store (modal open/close kecuali diperlukan lintas komponen).

---

## 8. Struktur `hooks/`

```
hooks/
├─ use-media-query.ts
├─ use-audio.ts          # hook yang mengikat audio element dan audioStore
├─ use-service-worker.ts # wrapper postMessage / events
└─ index.ts
```

Prinsip: hooks hanya client-side; tulis dengan `use client` bila perlu.

---

## 9. Struktur `types/`

```
types/
├─ index.d.ts
├─ domain.ts            # SurahData, SurahAyah
├─ repeat.ts            # RepeatTarget, RepeatCount
└─ offline.ts           # ConnectionStatus, DownloadManifest
```

Gunakan tipe ini di seluruh aplikasi untuk konsistensi.

---

## 10. Struktur Assets & Branding

```
public/
├─ branding/
│  ├─ logo.png
│  └─ logo-with-text.png
├─ icons/
└─ fonts/
```

- Simpan source artwork (Figma exports, guidelines) di `branding/` pada root repo (non-public). Gunakan `public/branding` untuk asset runtime.
- Semua referensi logo gunakan `components/shared/Logo.tsx`.

---

## 11. Struktur Dokumentasi
- `docs/` berisi semua dokumen (00-.. 16-..).
- Dokumentasi technical yang berubah sering (routing, components, state) letakkan di `docs/` versied.
- Ikuti CLAUDE.md: semua dokumen dalam Bahasa Indonesia.

---

## 12. Aturan Penamaan
- File/Folder: `kebab-case` (mis. `surah-detail-header.tsx`, `repeat-settings-dialog.tsx`).
- Komponen React: `PascalCase` (mis. `SurahCard`, `AudioPlayer`).
- Hooks: `useCamelCase` (mis. `useMediaQuery`, `useAudioController`).
- Stores: `camelCase` file for store export (mis. `audioStore.ts` exports `useAudioStore`).
- Types: `PascalCase` exports from `types/*.ts`.

---

## 13. Anti-Pattern yang Harus Dihindari
- Menaruh business logic di komponen presentasional.
- Menyimpan heavy binary assets di `public/` (gunakan Cache Storage dan SW untuk audio besar).
- Menggunakan React Context untuk frequently-changing data (gunakan `zustand`).
- Prop drilling berskala besar — gunakan stores atau colocate component.
- Menyamakan UI primitives dengan screen components (pisahkan `components/ui` vs `components/screens`).

---

## 14. Struktur Final yang Direkomendasikan (ringkas)
- Keep app inside `hanquran-app/` with clear subfolders: `app/`, `components/`, `lib/`, `hooks/`, `services/`, `stores/`, `types/`, `public/`, `styles/`, `tests/`, `docs/`.
- Single source of truth untuk branding: `components/shared/Logo.tsx` + `public/branding/*`.
- State: `stores/` (zustand) + persist langsung ke **Dexie** (`services/db/`); audio files in Cache Storage + service worker.
- Seluruh akses data: `stores/` → `services/api/` (Repository) → `services/db/` (Dexie) → `public/data/*` (fallback).

---

Jika Anda mau, saya bisa:
- Terapkan skeleton folders & contoh file (`audioStore`, `download-manager`, SW skeleton).
- Atau commit dokumen ini dan/atau menjalankan langkah scaffolding minimal.

Dokumen ini disimpan sebagai `docs/16-folder-structure.md`.
