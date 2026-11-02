# Panduan Setup Developer — HanQuran

Dokumen ini menjelaskan cara menyiapkan lingkungan pengembangan HanQuran untuk developer baru. Mengacu pada arsitektur yang dibekukan di `docs/20-mvp-freeze.md`.

**Terakhir disinkronkan dengan kode:** 2 November 2026 (versi `0.6.0`).

---

## 1. Prasyarat


| Tool    | Versi minimum             |
| ------- | ------------------------- |
| Node.js | 22 LTS (dipakai CI; minimal 20.9 untuk Next.js 16) |
| npm     | 10 (terpaket dengan Node) |
| JDK + Android SDK | Hanya untuk build Android (`docs/32`) |

Repo menyimpan dua lockfile: `package-lock.json` (dipakai CI GitHub Actions: `npm ci`) dan `pnpm-lock.yaml` (dipakai Vercel). Bila menambah dependency, perbarui **keduanya**.


Codebase aplikasi berada di folder `hanquran-app/`. Seluruh perintah di bawah dijalankan dari dalam folder tersebut.

---

## 2. Instalasi

```bash
cd hanquran-app
npm install
cp .env.example .env.local   # opsional — semua env bersifat opsional
```

> MVP tidak memerlukan kredensial API eksternal. Konten Quran disajikan dari dataset statis `public/data/*`, audio tilawah dari CDN eksternal (`AYAH_AUDIO_BASE_URL`), dan daftar qari dari `data/reciters.json`. Detail arsitektur data: `[docs/07-api-integration.md](./07-api-integration.md)`.

---

## 3. Perintah yang Tersedia


| Perintah             | Fungsi                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run dev`        | Menjalankan dev server di [http://localhost:3000](http://localhost:3000) |
| `npm run build`      | Build produksi (Next.js + Turbopack)                                     |
| `npm run start`      | Menjalankan hasil build produksi                                         |
| `npm run lint`       | ESLint (`eslint.config.mjs`, aturan Next.js + TypeScript) — juga di CI |
| `npm run typecheck`  | Cek tipe TypeScript (`tsc --noEmit`) — juga dijalankan `next build` & CI |
| `npm run test`       | Menjalankan unit & integration test (Vitest)                             |
| `npm run test:watch` | Menjalankan test dalam mode watch                                        |
| `npm run perf`       | Build produksi + ukur bundle (`.next/static`)                            |
| `npm run perf:bundle`| Ukur ukuran chunk JS/CSS hasil build                                       |
| `npm run perf:lighthouse` | Audit Lighthouse mobile (butuh `npm run start` di port 3000)        |
| `npm run perf:pwa`   | Smoke audit PWA (manifest + service worker)                              |
| `npm run build:android` | Static export + profil Android (`HANQURAN_TARGET=android`) → `out/`   |
| `npm run android:sync` | `build:android` + patch audio native + `cap sync android`             |
| `npm run android:bundle` | Build AAB rilis (butuh keystore, lihat `docs/32`)                  |
| `npm run cap:open`   | Buka proyek Android di Android Studio                                     |
| `node scripts/build-word-timings.mjs <dir>` | Regenerasi data sorot kata dari rilis quran-align (jarang; `docs/37` §4) |

Catatan: `npm run build` menjalankan `scripts/generate-sw-precache.mjs` sebelum & sesudah `next build` untuk mengisi `public/sw-precache-manifest.js`. Jangan commit hasil placeholder `"buildId": "dev"` dari dev/test.


---

## 4. Stack Teknologi (Dibekukan)

Lihat `docs/20-mvp-freeze.md` Bagian 7. Ringkasan:


| Lapisan          | Teknologi                                                   |
| ---------------- | ----------------------------------------------------------- |
| Framework        | Next.js App Router                                          |
| Bahasa           | TypeScript                                                  |
| Framework versi  | Next.js 16, React 19                                        |
| Styling          | Tailwind CSS v4 + shadcn/ui (`@base-ui/react`)              |
| Runtime State    | Zustand                                                     |
| Persistent State | Dexie (IndexedDB)                                           |
| Audio Cache      | Cache Storage API (Service Worker + Auto Download main thread) |
| Android          | Capacitor 8 (static export)                                 |
| Data Source      | Dataset statis `public/data/*` + CDN audio tilawah          |
| Testing          | Vitest + jsdom + fake-indexeddb                             |
| UI i18n          | next-intl (`id`, `en`) — lihat `docs/21-i18n-and-locale.md` |


---

## 5. Struktur Folder

Peta lengkap & terbaru: **`docs/16-folder-structure.md`**. Ringkasan:

```
hanquran-app/
├─ app/         — App Router: /, /surah/[id], /focus/[id], /settings, /settings/about, sitemap, robots, fonts/
├─ components/  — komponen layar; ui/ (primitives), shared/, providers/
├─ hooks/       — custom hooks (use-*.ts)
├─ lib/         — helper murni (routes, ayah-param, locale, gate, analytics, …)
├─ services/    — quran/ (dataset), db/ (Dexie), audio, download manager, cache
├─ stores/      — Zustand: audio, user, repeat, offline
├─ types/       — types/index.ts
├─ i18n/, messages/ — next-intl
├─ data/        — reciters.json, about-credits.ts
├─ public/      — data/ (dataset Qur'an), sw.js, sw-helpers.js, manifest.json, branding/
├─ scripts/     — precache SW, Android, audit performa
├─ tests/       — Vitest
└─ android/     — proyek Capacitor
```

---

## 6. Arsitektur Akses Data (Wajib)

**Konten Quran:** Static Dataset — `public/data/`* → `services/quran/` → hooks → UI. Lihat `docs/23-static-dataset-architecture.md`.

**Data pengguna:** UI → Store (Zustand) → Dexie. Komponen tidak mengakses Dexie secara langsung.

```
Konten Quran:
  UI → hooks → services/quran/ → public/data/*

Data pengguna:
  UI → Store (Zustand) → Dexie (services/db/)
```

Audio tilawah di-stream dari **CDN audio** (`services/quran/audio-config.ts` → `AYAH_AUDIO_BASE_URL`); metadata qari dari `**data/reciters.json`**.

### Store & Persistensi

- 4 store: `useAudioStore`, `useUserStore`, `useRepeatStore`, `useOfflineStore`.
- Persistensi memakai Dexie **langsung dari action store** (bukan persist middleware).
- Saat app start, `AppProviders` memanggil `initStores()` yang membaca data persisten dari Dexie.

### Database Dexie

- Nama database: `hanquran-db`, versi schema: **5** (v1 menyertakan tabel konten Quran — dihapus di v2; v3–v5 mengganti PK `downloadManifest` menjadi `[surahId+reciterId]`).
- Tabel MVP: `settings`, `favorites`, `lastRead`, `downloadManifest` + Growth tables.
- Definisi schema: `services/db/migrations.ts` (`SCHEMA_V3` dipakai di versi 5).
- Sumber kebenaran struktur: `docs/06-database-schema.md`.
- **Konten Quran tidak disimpan di Dexie.**

---

## 7. Service Worker

- File: `public/sw.js` (`SW_VERSION = 'v5'`) + `public/sw-helpers.js` + `public/sw-precache-manifest.js` (di-generate saat build). Ditulis manual, bukan Workbox.
- Registrasi: `components/providers/app-providers.tsx` → `lib/register-service-worker.ts` (production web saja; tidak di Android native).
- Nama cache & strategi: `docs/06` §6, perilaku offline: `docs/30`.

---

## 8. Testing

- Framework: **Vitest** dengan environment `jsdom`.
- `fake-indexeddb` menyediakan IndexedDB in-memory agar Dexie dapat diuji.
- Setup global: `tests/setup.ts`. Konfigurasi: `vitest.config.ts`.
- Lokasi test: `tests/**/*.test.ts`.

Jalankan:

```bash
npm run test
```

Per 2 Nov 2026: **476 test / 95 file**, semua lulus. `tests/setup.ts` memasang `Blob` Node karena `Blob` jsdom tidak punya `.stream()`.

Catatan: `tests/scripts/generate-sw-precache.test.ts` menulis ke `public/sw-precache-manifest.js`. Setelah menjalankan test, kembalikan file itu dengan `git checkout -- public/sw-precache-manifest.js` sebelum commit.

### Performance & Lighthouse

Prasyarat audit Lighthouse: build + server produksi berjalan.

```bash
npm run build
npm run start          # terminal 1
npm run perf:bundle    # terminal 2
npm run perf:pwa
npm run perf:lighthouse -- --soft   # --soft: tidak gagal meski skor < 80
```

Output disimpan di `reports/` (diabaikan Git). Ambang: skor kategori ≥ 80 (`docs/18` Phase 7).

---

## 9. Konvensi

Ikuti `CLAUDE.md`:

- Seluruh dokumentasi & label UI dalam Bahasa Indonesia.
- Nama file/folder/route/komponen/interface/library tetap bahasa asli.
- File/folder: `kebab-case`. Komponen React: `PascalCase`. Hooks: `useCamelCase`.

---

## 10. Deploy ke Vercel (staging & production)

HanQuran di-host di **Vercel** (PWA, saluran utama); aplikasi Android dibangun dari repo yang sama via Capacitor (`docs/32`). Panduan lengkap — branch strategy, preview vs production, checklist QA, rollback:

**[`docs/25-deployment-vercel.md`](./25-deployment-vercel.md)**

Ringkasan cepat:


| Lingkungan               | Cara                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| Preview                  | Otomatis per PR / push branch — uji build production di URL `*.vercel.app` |
| Production               | Branch `main` — deploy otomatis setelah merge                              |
| Staging tetap (opsional) | Branch `staging` + subdomain custom                                        |


**PWA & offline hanya dapat diuji di deployment production build** (Vercel atau `npm run build && npm start`), bukan `npm run dev`.

Catatan rilis per versi: [`RELEASE.md`](../RELEASE.md) di root proyek.

Analytics custom events: [`docs/analytics.md`](./analytics.md).

---

Dokumen ini disimpan sebagai `docs/SETUP.md`.