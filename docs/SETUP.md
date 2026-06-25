# Panduan Setup Developer — HanQuran

Dokumen ini menjelaskan cara menyiapkan lingkungan pengembangan HanQuran untuk developer baru. Mengacu pada arsitektur yang dibekukan di `docs/20-mvp-freeze.md`.

---

## 1. Prasyarat


| Tool    | Versi minimum             |
| ------- | ------------------------- |
| Node.js | 20 LTS                    |
| npm     | 10 (terpaket dengan Node) |


Codebase aplikasi berada di folder `hanquran-app/`. Seluruh perintah di bawah dijalankan dari dalam folder tersebut.

---

## 2. Instalasi

```bash
cd hanquran-app
npm install
```

> MVP tidak memerlukan kredensial API eksternal. Konten Quran disajikan dari dataset statis `public/data/*`, audio tilawah dari CDN eksternal (`AYAH_AUDIO_BASE_URL`), dan daftar qari dari `data/reciters.json`. Detail arsitektur data: `[docs/07-api-integration.md](./07-api-integration.md)`.

---

## 3. Perintah yang Tersedia


| Perintah             | Fungsi                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run dev`        | Menjalankan dev server di [http://localhost:3000](http://localhost:3000) |
| `npm run build`      | Build produksi (Next.js + Turbopack)                                     |
| `npm run start`      | Menjalankan hasil build produksi                                         |
| `npm run lint`       | Linting dengan ESLint                                                    |
| `npm run typecheck`  | Pemeriksaan tipe TypeScript (`tsc --noEmit`)                             |
| `npm run test`       | Menjalankan unit & integration test (Vitest)                             |
| `npm run test:watch` | Menjalankan test dalam mode watch                                        |
| `npm run perf`       | Build produksi + ukur bundle (`.next/static`)                            |
| `npm run perf:bundle`| Ukur ukuran chunk JS/CSS hasil build                                       |
| `npm run perf:lighthouse` | Audit Lighthouse mobile (butuh `npm run start` di port 3000)        |
| `npm run perf:pwa`   | Smoke audit PWA (manifest + service worker)                              |


---

## 4. Stack Teknologi (Dibekukan)

Lihat `docs/20-mvp-freeze.md` Bagian 7. Ringkasan:


| Lapisan          | Teknologi                                                   |
| ---------------- | ----------------------------------------------------------- |
| Framework        | Next.js App Router                                          |
| Bahasa           | TypeScript                                                  |
| Styling          | Tailwind CSS + shadcn/ui (`@base-ui/react`)                 |
| Runtime State    | Zustand                                                     |
| Persistent State | Dexie (IndexedDB)                                           |
| Audio Cache      | Cache Storage API (via Service Worker)                      |
| Data Source      | Dataset statis `public/data/*` + CDN audio tilawah          |
| Testing          | Vitest + jsdom + fake-indexeddb                             |
| UI i18n          | next-intl (`id`, `en`) — lihat `docs/21-i18n-and-locale.md` |


---

## 5. Struktur Folder

Mengikuti `docs/16-folder-structure.md`:

```
hanquran-app/
├─ app/            — Next.js App Router (halaman: /, /surah/[id], /focus/[id], /settings)
├─ components/
│  ├─ ui/          — primitives (Button, Dialog, dll.)
│  ├─ shared/      — komponen bersama (Logo, ErrorBoundary, AppBootstrap)
│  └─ ...          — komponen layar
├─ stores/         — Zustand stores (audio, user, repeat, offline)
├─ services/
│  ├─ db/          — Dexie setup & migrations
│  ├─ api/         — Repository Layer (Phase 1)
│  ├─ audio-controller.ts  — jembatan HTMLAudioElement ↔ store (Phase 2)
│  ├─ media-session.ts     — Media Session API, lock screen (Phase 2b, `docs/27`)
│  └─ download-manager/  — (Phase 5)
├─ data/           — reciters.json dan metadata domain
├─ types/          — TypeScript types/interfaces domain
├─ hooks/          — custom React hooks
├─ lib/            — utilitas, route helper, seed data
├─ tests/          — unit & integration tests
└─ public/
   ├─ data/        — dataset statis Quran & terjemahan
   └─ sw.js        — Service Worker
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

- Nama database: `hanquran-db`, versi schema: **2** (v1 menyertakan tabel konten Quran — dihapus).
- Tabel MVP: `settings`, `favorites`, `lastRead`, `downloadManifest` + Growth tables.
- Definisi schema: `services/db/migrations.ts` (`SCHEMA_V2`).
- Sumber kebenaran struktur: `docs/06-database-schema.md`.
- **Konten Quran tidak disimpan di Dexie.**

---

## 7. Service Worker

- File: `public/sw.js` + `public/sw-helpers.js` (Phase 5 — runtime caching + DownloadManager messaging).
- Registrasi: `components/providers/app-providers.tsx` → `lib/register-service-worker.ts` (production only).
- Strategi caching runtime & DownloadManager diimplementasikan di **Phase 5**.

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

HanQuran direncanakan di-host di **Vercel**. Panduan lengkap — branch strategy, preview vs production, checklist QA, rollback:

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