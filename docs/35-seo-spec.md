# 35 — Spek SEO & Discoverability (Hasil Audit + Rencana Perbaikan)

**Tanggal:** 27 Oktober 2026
**Status:** ✅ Selesai — T1–T9 (Phase 10) + H1–H9 (Phase 10b hardening), terverifikasi 29 Okt 2026 — lihat §4, §8, §9
**Mengacu:** `docs/18-development-tasks.md` (Phase 10), `docs/14-routing-spec.md`, `docs/23-static-dataset-architecture.md`, `docs/25-deployment-vercel.md`, `docs/32-capacitor-android-platform.md`

---

## 1. Ringkasan

Audit SEO (27 Oktober 2026) menemukan bahwa HanQuran web **belum siap ditemukan mesin pencari**. Fondasi PWA kuat, tetapi lapisan crawler-facing nyaris tidak ada: konten ayat tidak hadir di HTML awal, tidak ada sitemap/robots, metadata identik di semua halaman, dan tidak ada sinyal berbagi (OG/Twitter) maupun structured data.

**Skor audit: TIDAK OPTIMAL — 3 temuan kritis + 3 penting + 3 minor.**

Kategori perbaikan disusun agar:

1. Tidak mengubah perilaku PWA/offline maupun pipeline Android (`docs/32`).
2. Bisa dikerjakan bertahap — discovery (robots/sitemap/noindex) terpisah dari refactor render.

---

## 2. Temuan Audit

| # | Temuan | Bukti | Dampak | Prioritas |
|---|--------|-------|--------|-----------|
| 1 | **Konten tidak ada di HTML awal** — semua halaman `'use client'` + fetch klien | `out/surah/1.html` berisi 0× "Fatihah"; title = `HanQuran` generik | Teks ayat (nilai SEO utama) tak terbaca indexer; semua 114 surat tampil identik di SERP | 🔴 Kritis |
| 2 | **Tidak ada `sitemap.xml` & `robots.txt`** | Tidak ada `app/sitemap.ts`, `app/robots.ts`, `public/robots.txt` | Discovery & re-crawl lambat | 🔴 Kritis |
| 3 | **Metadata identik semua halaman** — satu `title` statis di `app/layout.tsx` | `app/layout.tsx` §metadata | Tidak ada title/description per surat | 🔴 Kritis |
| 4 | Tidak ada `metadataBase`, canonical, Open Graph, Twitter Card, `og:image` | grep repo: 0× `openGraph|canonical|metadataBase` | Tanpa pratinjau saat dibagikan (WhatsApp — kanal utama audiens); URL kanonikal tak valid | 🟠 Penting |
| 5 | Tidak ada structured data (JSON-LD) | grep repo: 0× `schema\.org` | Tidak ada rich result | 🟠 Penting |
| 6 | `/focus/[id]` menduplikasi konten surah; `/settings/*` tak bernilai cari | `app/focus/[id]/page.tsx` render konten penuh | Crawl budget & duplikasi konten | 🟠 Penting |
| 7 | `lang="id"` dipatok di `<html>` padahal UI bisa `en` via `next-intl` klien | `app/layout.tsx`, `i18n/config.ts` | Sinyal bahasa tidak konsisten | 🟡 Minor (P2) |
| 8 | `generator: 'v0.app'` usang; icon = `/branding/logo.png` (file besar, bukan favicon) | `app/layout.tsx` | Kualitas metadata; weight halaman | 🟡 Minor |
| 9 | `images.unoptimized: true` global | `next.config.mjs` | Tidak ada AVIF/WebP otomatis → berdampak LCP pada halaman panjang | 🟡 Minor |

**Yang sudah benar** ✅: manifest PWA lengkap (icons any+maskable, theme color), heading structure (`h1` per halaman), `viewport`/`themeColor` modern.

---

## 3. Keputusan Desain

| Aspek | Keputusan |
|-------|-----------|
| Strategi render | **SSR/SSG konten surat di server; client component khusus interaksi** (audio, repeat, favorit). Pola App Router saat ini: server = konten, `'use client'` = interaktivitas. |
| Sumber data server | Dataset tetap `public/data/*` (single source, `docs/23`). Server build membaca via `fs` saat `generateStaticParams` + `generateMetadata` — tanpa API eksternal, tanpa layer baru. |
| Kontrak app-shell offline | **Tidak berubah.** SW tetap melayani shell HTML untuk id surat apa pun saat offline. Konsekuensi: HTML prerender surat ter-cache akan tampil sejenak sebelum `useSurah` menyelesaikan data sesuai pathname — dimitigasi dengan pola splash/reconcile yang sudah ada. |
| Pipeline Android | `generateStaticParams` di `app/surah/[id]/layout.tsx` **tidak dihapus**, sehingga `output: 'export'` tetap valid tanpa perubahan `next.config.mjs`. |
| Routing bahasa | `/id` + `/en` + `hreflang` **tidak dibuat** (post-MVP, PB terpisah). Minimal: nilai `title/description` server memakai bahasa default `id`. |
| Focus & settings | `noindex, follow`; tidak masuk sitemap. Halaman fokus TIDAK di-refactor render (nilainya nol untuk crawler). |

---

## 4. Rencana Perbaikan (T1–T9)

### T1 — Server-render konten Surah Detail + metadata per surat [P0]

**Status: ✅ Selesai 27 Okt 2026** — `app/surah/[id]/page.tsx` server component + `generateMetadata`; konten interaktif pindah ke `components/surah-detail-client.tsx`; loader server baru `services/quran/server-surah.ts` (fs `public/data/*`); `hooks/use-surah.ts` menerima seed `initialSurah`. Unit test `tests/services/server-surah.test.ts`.

Hasil verifikasi build:

- `.next/server/app/surah/1.html` **memuat teks Arab, transliterasi, terjemahan id**, title per surat, meta description unik, dan canonical `/surah/1`.
- Export Android `out/surah/*.html` konten-nya kaya (Yasin 117 KB; Baqara 543 KB); 364 test tetap hijau.

Pelajaran implementasi:

- `useSearchParams` **men-suspend prerender** (snapshot = fallback) — `?ayah=n` kini dibaca via `window.location.search` di effect klien, tanpa suspend; sinkronisasi `activeAyah` ikut effect bila param baru muncul setelah hidrasi.
- Seed `initialSurah` dari server diverifikasi cocok dengan id pathname (`String(surah.number) === surahId`) agar aman terhadap app-shell offline.
- Branching Surah Detail berubah: konten tetap tampil saat refetch latar; spinner/error hanya bila `surah` belum ada.

Spek asli (penjelasan desain):

- `app/surah/[id]/page.tsx` → **server component**: parse `id`, baca dataset (`loadSurahFile` via `fs`, fallback kosong), export `generateMetadata()` → `title` = `Surat {nama} ({nomor}) — Audio & Hafalan | HanQuran`, `description` unik per surat, `canonical` = `/surah/[id]`. Render konten ayat (Arab + terjemahan) ke HTML awal.
- `components/surah-detail-client.tsx` → kode klien penuh sekarang (audio, repeat, hooks) diberi prop `initialSurah` agar tidak refetch saat hidrasi.

Validasi: `curl` atau `view-source` memuat nama surat + ≥1 ayat; `out/surah/1.html` hasil build memuat konten.

### T2 — `app/robots.ts` [P0]

**Status: ✅ Selesai 27 Okt 2026** — `app/robots.ts` + `lib/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost), unit test `tests/lib/site-url.test.ts`; build menghasilkan `robots.txt` berisi Allow `/`, Disallow `/focus` `/settings`, Sitemap.

```ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/focus', '/settings'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### T3 — `app/sitemap.ts` [P0]

**Status: ✅ Selesai 27 Okt 2026** — `app/sitemap.ts` (115 URL: `/` + 114× `/surah/[id]` via `generateSurahStaticParams`), unit test `tests/app/sitemap.test.ts`. Terverifikasi XML build.

Pelajaran implementasi:

- Nama field Next 16 adalah `lastModified` (bukan `lastmod`) — resolver XML di `next/dist/.../resolve-route-data.js` membaca field itu.
- Route metadata (`robots.ts`/`sitemap.ts`) membutuhkan label `export const dynamic = 'force-static'`; jika tidak, mode export Android gagal ("Failed to collect page data for /sitemap.xml").

- URL: `/` + 114× `/surah/[id]` (cocok dengan `generateSurahStaticParams`).
- `lastmod` = tanggal build / versi `dataHash` dari `public/data/manifest.json`; entri lain tanpa `changefreq/priority` (praktik kini: Google mengabaikannya).
- `/focus` dan `/settings` tidak dicantumkan.

### T4 — Metadata root + social preview [P1]

**Status: ✅ Selesai 29 Okt 2026** — `app/layout.tsx`: `metadataBase` dari `SITE_URL`, template title `%s | HanQuran`, `openGraph` (type/siteName/locale/id + image) dan `twitter: summary_large_image`; `generator: 'v0.app'` dihapus. Override OG/Twitter per surat ditambahkan di `generateMetadata` (`openGraph.type='article'`, `og:url` + `og:title` unik). Terverifikasi di HTML build: home & `/surah/1` memuat `og:title` yang benar, canonical absolut (`http://localhost:3000/surah/1` dengan fallback dev).

Di `app/layout.tsx`:

- `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')` (di Vercel pakai `VERCEL_URL`/production URL).
- `openGraph` + `twitter: summary_large_image` + `og:image` 1200×630 → T5.
- Hapus `generator: 'v0.app'`.
- Template title: `title: { default: 'HanQuran', template: '%s | HanQuran' }` agar T1 hanya menyebut bagian spesifik.

### T5 — OG image [P2]

**Status: ✅ Selesai 29 Okt 2026** — `public/og/og-default.png` (1200×630 PNG, background teal gradient + logo, alt-free dekoratif). Digenerate dari `scripts/generate-og-image.mjs` (puppeteer; fallback Chromium sistem `/snap/bin/chromium`) via `npm run gen:og`. Referensi `og:image` + `twitter:image` sudah aktif (T4); varian per surat tetap tidak dibuat.

Satu gambar statik 1200×630 (logo + tagline) di `public/og/og-default.png`, direferensikan `og:image`, `og:image:width/height`, `twitter:image`. Variasi per surat tidak wajib.

### T6 — JSON-LD structured data [P1]

**Status: ✅ Selesai 29 Okt 2026** — `lib/schema-org.ts` (`buildWebSiteSchema`, `buildSurahBreadcrumbSchema`, `buildSurahPageSchema`) + `components/json-ld.tsx`; unit test `tests/lib/schema-org.test.ts`. `WebSite` disuntik dari root layout (berlaku semua halaman, duplikasi antar-halaman aman & didedup Google — keputusan pragmatis vs route-group home); `ContentPage` + `BreadcrumbList` per surat dari server page. Terverifikasi: `/surah/1` memuat 3 JSON-LD valid (WebSite, ContentPage, BreadcrumbList).

- Halaman depan: `WebSite`.
- Halaman surat: `ContentPage`/`Article` + `BreadcrumbList` (`Beranda → Surat ke-N`), disuntik via `<script type="application/ld+json">` dari server component (mengikuti hasil T1).

### T7 — noindex `/focus` & `/settings` [P0]

**Status: ✅ Selesai 27 Okt 2026** — `app/focus/[id]/layout.tsx` & `app/settings/layout.tsx` baru: `robots: { index: false, follow: true }`; terverifikasi tag `noindex` hadir di HTML build untuk kedua route.

`generateMetadata` → `robots: { index: false, follow: true }` pada kedua route. Halaman fokus tak perlu refactor render (T1 tidak melingkupinya).

### T8 — Minor hygiene [P2]

**Status: ✅ Selesai 29 Okt 2026**

- `app/icon.png` (512×512, transparan) + `app/apple-icon.png` (180×180, latar `#FAFAF8`) via file convention App Router — blok `icons` manual di `app/layout.tsx` dihapus. Generator: `scripts/generate-favicons.mjs` + `npm run gen:favicon`.
- `images.unoptimized` **tetap global** dengan alasan didokumentasikan di `next.config.mjs`: SW precache + Capacitor mengandalkan URL aset apa adanya (`/branding/*.png`), dan satu-satunya `next/image` adalah logo kecil (`components/shared/Logo.tsx`). Evaluasi aktivasi optimizer ditunda sampai ada gambar konten; saat itu, gate per-target (`isAndroidTarget`) wajib dipakai agar export Android tak terpengaruh.
- Terverifikasi: `<link rel="icon">` 512 + `<link rel="apple-touch-icon">` 180 muncul di HTML web **dan** `out/` export Android.

- Favicon khusus (32/180px) di `app/icon.png`/`apple-icon.png` — memanfaatkan konvensi App Router menggantikan `icons.icon`.
- Catat `images.unoptimized` sebagai risiko performa; evaluasi aktivasi optimizer untuk build web non-Android (ikuti gate `docs/32` agar export Android tidak terpengaruh).

### T9 — Verifikasi & regressi [P0]

**Status: ✅ Selesai 29 Okt 2026** — verifikasi penuh terhadap `npm run build && npm start`.

Hasil (semua lulus):

| Cek | Hasil |
|-----|-------|
| `robots.txt` | 200 `text/plain` — Allow `/`, Disallow `/focus` `/settings`, `Sitemap:` menunjuk SITE_URL |
| `sitemap.xml` | 200 `application/xml` — 115 `<loc>` + 115 `<lastmod>`, semua URL 200 |
| 114 halaman `/surah/*` | 100% punya title unik (`Surat …`), meta description, canonical absolut, `og:title`, dan 3 JSON-LD valid (WebSite + ContentPage + BreadcrumbList) |
| `/surah/115`, `/surah/abc` | **404** (setelah `export const dynamicParams = false` di layout surat — sebelumnya soft-404 200) |
| `/surah/0` | ⚠️ 200 berisi halaman not-found — artefak fallback internal Next (`0.html` prerender); tidak ditautkan & tidak ada di sitemap, dampak minimal, dicatat sebagai known-issue |
| `/focus/*`, `/settings*` | `noindex, follow`; home tanpa meta robots (index default) |
| Aset ikon/OG | `/icon.png`, `/apple-icon.png`, `/og/og-default.png` → 200, content-type benar |
| Lighthouse SEO | home **100**, surah-1 **100**, settings **66** (hanya audit "Page is blocked from indexing" — sesuai desain noindex) |
| Lighthouse perf | home 53, surah-1 73, settings 83 — **di luar scope SEO**, dicatat sebagai follow-up (T10, lihat bawah) |
| `npm run build:android` | hijau; `out/` memuat surat, robots, sitemap, ikon, OG |
| `npx vitest run` | 77 file / 370 test lulus |

Validasi eksternal (Rich Results Test & WhatsApp/Sharing Debugger) tetap dilakukan **setelah deploy production** dengan `NEXT_PUBLIC_SITE_URL` terpasang — di lokal tag & JSON-LD sudah memenuhi struktur.

Catatan follow-up (bukan bagian Phase 10):

- Performance home 53 — halaman daftar surat masih CSR (`app/page.tsx`). Kandidat task baru: server-render daftar surat + optimasi LCP.
- `/surah/0` soft-404 artefak Next — dapat ditutup lewat middleware/redirect bila diperlukan.

---

## 5. Definisi Selesai (DoD)

- [x] `view-source` dari setiap halaman surat memuat nama surat, teks ayat, title, description, canonical, OG tag unik. — terverifikasi 29 Okt 2026 (114/114 halaman).
- [x] `/robots.txt` dan `/sitemap.xml` dilayani dengan benar di deploy Vercel. — terverifikasi lokal (`npm start`); ulangi cek setelah deploy production.
- [x] `/focus` & `/settings` mengirim `noindex`. — terverifikasi di HTML build.
- [ ] OG image tampil di WhatsApp & Sharing Debugger. — struktur & file siap; validasi eksternal setelah deploy.
- [x] JSON-LD valid tanpa error pada Rich Results Test. — JSON-LD valid secara struktur (parse + tipe per halaman); uji Rich Results setelah deploy.
- [x] Build web & build Android keduanya hijau; seluruh test unit tetap hijau. — 370 test lulus.
- [x] Tidak ada perubahan perilaku PWA offline shell (`docs/30`). — app-shell & SW tidak diubah.

---

## 6. Di Luar Scope (Niat Eksplisit)

- Routing locale `/id` + `/en` + `hreflang` — post-MVP.
- Sitemap per-bahasa dan sitemap gambar.
- Prerender broadcast/OG dinamis per ayat — tetap hanya metadata level surat.
- Integrasi Search Console & otomatisasi indexing — dilakukan setelah domain production final dan `NEXT_PUBLIC_SITE_URL` dipasang di Vercel env.

---

## 7. Urutan Pengerjaan Disarankan

1. **T2 + T3 + T7** — cepat, risiko rendah, dampak discovery langsung (setengah hari).
2. **T1** — nilai terbesar: konten menembus HTML (2–3 hari dengan pengujian).
3. **T4 + T6** — metadata root, template title, dan JSON-LD mengikuti hasil T1.
4. **T9** — verifikasi menyeluruh, lalu perbarui status Phase 10 di `docs/18`.
5. **T5 + T8** — nice to have, boleh setelah perbaikan SEO inti live.

---

## 8. Audit Lanjutan Pasca-Implementasi (29 Okt 2026)

Audit kritis terhadap hasil T1–T9 (bukan audit SEO awal). Semua temuan **tidak menggagalkan** implementasi — build web/Android hijau, 370 test lulus, Lighthouse SEO home & surah 100 — tetapi 4 temuan berprioritas tinggi layak diperbaiki sebelum rilis produksi.

### 8.1 Ringkasan temuan

| ID | Kategori | Temuan | Bukti | Dampak | Prioritas |
|----|----------|--------|-------|--------|-----------|
| **F1** | Bug (regresi T1) | `?ayah=` tidak reaktif pada navigasi query-only (back/forward, push URL sama dengan query beda) | `components/surah-detail-client.tsx` membaca `window.location.search` sekali di `useEffect([])`; sebelumnya `useSearchParams` reaktif | Ayat aktif/highlight/audio tidak berpindah | **P0** |
| **F2** | Performa | Payload berlipat + double download | HTML Surah 2 = 536 KB, RSC prefetch = 267 KB, klien **masih** fetch JSON 272 KB; kartu home memakai `<Link>` default `prefetch=true` | ±1 MB per buka Baqara; data seluler & main thread | **P0** |
| **F3** | Performa/UX | Konten SSR tak terlihat sampai hidrasi | 10 node `style="opacity:0"` (motion `initial={{ opacity: 0 }}`) di HTML build | Tanpa JS/lambat = area bacaan kosong; LCP tertunda | **P1** |
| **F4** | Deployment | Canonical/sitemap bisa menunjuk host salah | `lib/site-url.ts` fallback `VERCEL_URL` (host deployment ber-hash, bukan domain produksi) | Sinyal indexing terpecah | **P0** |
| F5 | Kecil | `/surah/0` & `/focus/<id invalid>` masih 200 | Artefak fallback Next | Soft-404 (noindex/robots memitigasi) | P2 |
| F6 | Keamanan | JSON-LD tanpa escape `<` | `components/json-ld.tsx` → `JSON.stringify` di `dangerouslySetInnerHTML` | Dataset lokal (trusted); hardening | P2 |
| F7 | Logika | `?ayah=999` tidak diklem | `startAyah` dipakai apa adanya | Ayat aktif di luar rentang | P1 |
| F8 | UX | Flash terjemahan & locale | Seed server selalu terjemahan `id` | Pengguna `en` melihat flash Indonesia sebelum refetch | ✅ Selesai — Phase 12 (`docs/21` §5.6) |
| F9 | UX | Deep link `?ayah=n` tidak scroll | Tidak ada `scrollIntoView` (perilaku lama) | Pengguna mendarat di atas halaman | P1 |
| F10 | Higiene | Import `React` tak terpakai | `components/surah-detail-client.tsx:3` | Lint noise | P3 |
| F11 | SEO | Home masih CSR | `app/page.tsx` `'use client'`; Lighthouse perf 53 | Konten home tipis untuk crawler; CWV | ✅ Selesai — Phase 11 (`docs/36`) |
| F12 | Test | Coverage seed/XML/query belum ada | — | Regresi tidak terdeteksi otomatis | P1 |
| F13 | Operasional | Validasi eksternal & Search Console belum | Butuh deploy production | — | P1 (setelah deploy) |

### 8.2 Catatan penting

- F2 dan F3 adalah **konsekuensi langsung strategi SSR penuh** di T1: konten terkirim dua kali (markup terlihat + flight payload) dan klien tetap refetch dataset.
- F4 hanya muncul bila `NEXT_PUBLIC_SITE_URL` tidak diisi di environment produksi Vercel.
- Ukuran `out/surah` naik dari ±3 MB → **29 MB** karena 114 HTML berisi konten penuh (implikasi ukuran APK Android — perlu keputusan terpisah).

---

## 9. Rencana Hardening (H1–H9)

| ID | Task | Tipe | Prioritas | Ref |
|----|------|------|-----------|-----|
| **H1** | Reaktivitas `?ayah`: leaf `<StartAyahSync />` memakai `useSearchParams` dibungkus `<Suspense fallback={null}>` — konten di luar boundary tetap prerendered | [FIX] | P0 | F1 |
| **H2** | `useSurah`: jangan refetch bila seed cocok & bahasa terjemahan `id`; fetch hanya bila locale ≠ `id`, retry, atau seed tidak ada | [PERF] | P0 | F2 |
| **H3** | `SurahCard`/`NativeAwareLink`: `prefetch={false}` (atau prefetch saat hover) untuk 114 halaman surat | [PERF] | P0 | F2 |
| **H4** | `SurahDetailView`: wrapper daftar ayat `initial={false}` / fade CSS default-visible | [FIX] | P1 | F3 |
| **H5** | `lib/site-url.ts`: fallback `VERCEL_PROJECT_PRODUCTION_URL`; dokumentasikan kewajiban `NEXT_PUBLIC_SITE_URL`; pasang di Vercel Production | [FIX] | P0 | F4 |
| **H6** | `components/json-ld.tsx`: escape `<` → `\u003c` sebelum inject | [HARDEN] | P2 | F6 |
| **H7** | Clamp `?ayah` ke `1..ayahCount` + scroll ke ayat aktif setelah sync | [FIX] | P1 | F7, F9 |
| **H8** | Status rapi: `dynamicParams=false` untuk `/focus/[id]`; mitigasi `/surah/0` (redirect/404) | [FIX] | P2 | F5 |
| **H9** | Test baru: seed `useSurah`, reaktivitas query (H1), sitemap/robots XML build, `dynamicParams` 404 | [TEST] | P1 | F12 |

Urutan disarankan: **H1 → H2 → H3 → H5 → H4 → H7 → H9 → H6 → H8**.

Kontrak non-regresi: app-shell offline & SW tidak berubah; `generateStaticParams` tetap; export Android tetap hijau; Lighthouse SEO tidak turun.

F8, F10, F13 dicatat sebagai backlog terpisah; F10 sudah ikut beres saat H1. **F11** dikerjakan sebagai **Phase 11 — Performa Beranda & CWV** (`docs/36-performance-cwv.md`), lihat §9.2.

### 9.1 Status implementasi (29 Okt 2026) — ✅ Selesai

| ID | Perubahan kode | Bukti verifikasi |
|----|----------------|------------------|
| **H1** | Leaf `components/start-ayah-sync.tsx` (`useSearchParams`) dirender di dalam `<Suspense fallback={null}>` dari `SurahDetailView`; pembacaan `window.location.search` dihapus | Smoke Puppeteer: `history.pushState` + `popstate` ke `?ayah=3` & `?ayah=7` → kartu aktif berpindah; `#ayah-1` tetap ada di HTML prerender |
| **H2** | `lib/surah-seed.ts` (`isMatchingSurahSeed`, `shouldFetchSurah`) + `hooks/use-surah.ts` memakai seed tanpa fetch dan mengadopsi seed baru saat navigasi klien | Browser: buka `/surah/2` & klik kartu dari home → **0 request** `/data/quran|translations/*` (sebelumnya 272 KB) |
| **H3** | `SurahCard` → `prefetch={false}` | Browser home + scroll: **0 prefetch** `/surah/*` (sebelumnya tiap kartu terlihat memicu RSC ±267 KB untuk Baqara) |
| **H4** | `initial={false}` pada wrapper daftar ayat, `AyahCard`, dan header surat | HTML build: node `opacity:0` tersisa hanya audio player (chrome interaktif); dengan JS dimatikan teks ayat tetap tampil (opacity 1) |
| **H5** | `lib/site-url.ts`: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → localhost | Test `tests/lib/site-url.test.ts` (5 kasus, termasuk prioritas domain produksi) |
| **H6** | `serializeJsonLd()` di `lib/schema-org.ts` (escape `<` → `\u003c`), dipakai `components/json-ld.tsx` | Test escape + JSON-LD 114 halaman tetap valid (`JSON.parse` di audit build) |
| **H7** | `lib/ayah-param.ts` (parse + clamp) & `lib/ayah-scroll.ts` (scroll ke `#ayah-n` dengan inset chrome) | Browser: `/surah/1?ayah=5` → aktif + scroll; `?ayah=999` → **ayah 7** (terakhir) |
| **H8** | `dynamicParams=false` di `app/focus/[id]/layout.tsx`; redirect `/surah/0` & `/focus/0` → `/` di `vercel.json` | `npm start`: `/surah/115`, `/focus/115`, `/surah/0`, `/focus/0` → **404** (artefak `0.html` hilang pada build baru) |
| **H9** | 8 file test baru/diperluas: `ayah-param`, `ayah-scroll`, `surah-seed`, `start-ayah-sync`, `use-surah`, `robots`, `static-params`, `site-url`, `schema-org` | **84 file / 399 test lulus** |

Regresi: build web hijau; export Android (`HANQURAN_TARGET=android`) hijau dengan `out/surah/*.html` tetap berisi konten; Lighthouse SEO **100** (home & surah-1), settings 66 (noindex by design); performa surah-1 **73 → 87**.

Catatan: `?ayah` invalid diklem di state, URL tidak ditulis ulang (share link tetap apa adanya). `/surah/0` di lokal `next start` tetap 404 berkat hilangnya artefak `0.html`; redirect `vercel.json` menjadi pengaman tambahan di production. F10 (import `React` tak terpakai) ikut beres.

### 9.2 Tindak lanjut F11 — Phase 11 (✅ 29 Okt 2026)

F11 dikerjakan sebagai phase terpisah (**Phase 11 — Performa Beranda & CWV**) agar hardening SEO tetap fokus pada H1–H9. Spek hasil lengkap: [`docs/36-performance-cwv.md`](./36-performance-cwv.md).

| Perubahan | File | Bukti |
|-----------|------|-------|
| Loader server ringkasan 114 surat | `services/quran/server-surah.ts` → `readSurahListForServer()` | Test `tests/services/server-surah.test.ts` |
| Beranda server component (SSG) + canonical `/`; UI pindah ke `HomeClient` | `app/page.tsx`, `components/home-client.tsx` | HTML build: 114 tautan `/surah/*`, nama surat ada, canonical `/` |
| Seed daftar surat di klien; skip fetch dataset locale `id` | `hooks/use-surah-list.ts`, `lib/surah-seed.ts` | Test `tests/hooks/use-surah-list.test.tsx`; browser: **0 request** `/data/*` saat buka beranda |
| Kartu surat selalu di HTML + `content-visibility` | `components/lazy-surah-card.tsx` | Test `tests/components/lazy-surah-card.test.tsx`; CLS **0** |
| Animasi masuk tidak menyembunyikan konten | `components/header.tsx`, `search-input.tsx`, `filter-chips.tsx` | HTML build: node `opacity:0` hanya tersisa di footer (below fold) |
| Satu sumber daftar surat | `components/continue-reading.tsx` | Tidak ada fetch daftar kedua di klien |

Hasil: Lighthouse mobile beranda **performance 59 → 85**, TBT **680 → 200 ms**, CLS **0,239 → 0**, Speed Index 1,9 → 1,4 s, SEO tetap **100**; seluruh suite **85 file / 406 test**; build web & export Android hijau. LCP first-visit saat itu masih 3,9 s karena paragraf **Threads Gate** yang sengaja dirender setelah hidrasi (`docs/34`) — lalu **ditindaklanjuti Phase 11b (31 Okt 2026)**: overlay di-SSR + skrip pra-paint, observed LCP **±3,9 s → 0,10–0,15 s** (`docs/34` §14, `docs/36` §3.3). F8 ditindaklanjuti **Phase 12 (1 Nov 2026)** — lihat §9.3. F13 (validasi eksternal) tetap terbuka.

### 9.3 Tindak lanjut F8 — Phase 12: Locale Paint Pertama (✅ 1 Nov 2026)

F8 (flash Indonesia untuk pengguna `en`) dikerjakan sebagai phase terpisah **Phase 12** tanpa mengubah routing URL atau SSG. Spek mekanisme lengkap: [`docs/21` §5.6](./21-i18n-and-locale.md).

| Perubahan | File | Bukti |
|-----------|------|-------|
| Cache locale sinkron + skrip inline pra-paint (`<html data-app-locale>` + `lang`) | `lib/app-locale.ts`, `app/layout.tsx` | Test `tests/lib/app-locale.test.ts` (cache, deteksi, read-only) |
| Cache disegarkan saat `init()`/ganti bahasa; atribut disinkronkan setelah Dexie siap | `stores/userStore.ts`, `components/providers/intl-provider.tsx` | Test `tests/stores/userStore.test.ts`; browser: `data-app-locale="en"` di `domcontentloaded` |
| Teks bilingual pra-paint (arti kartu, label ayat/tipe, placeholder, filter, gate) | `components/shared/locale-text.tsx`, `lib/locale-text.ts`, `components/surah-card.tsx`, `search-input.tsx`, `filter-chips.tsx`, `threads-gate.tsx` | Test `tests/lib/locale-text.test.ts`, `tests/components/threads-gate.test.tsx`; browser: kartu 1 = `The Opening` / `verses` / `Meccan` |
| Seed beranda membawa arti `id` + `en`; locale `en` tanpa refetch; pencarian dua bahasa | `services/quran/mappers.ts`, `services/quran/app-types.ts`, `hooks/use-surah-list.ts`, `lib/surah-search.ts` | Test mapper, hook, `surah-search`; browser: 0 request daftar saat `en` |
| Terjemahan ayat yang tidak cocok disembunyikan sampai data locale aktif siap | `hooks/use-surah.ts`, `components/ayah-card.tsx`, `app/globals.css` | Browser: fetch `en` ditahan → `data-content-locale="id"` `visibility:hidden`; setelah data tiba `en` terlihat |

Hasil: pada `domcontentloaded` pengguna `en` sudah melihat teks Inggris (sebelumnya flash ±100–386 ms); pengguna `id` tidak berubah; tanpa JS teks `id` tetap tampil. 87 file / **424 test** lulus; build web & export Android hijau; Lighthouse home performance **91**, SEO **100**, CLS **0**. HTML beranda 267 → 298 KB raw (+1,9 KB gzip). Residual: label shell yang belum dual-render (kartu Lanjutkan Hafalan, footer, banner install, header surat) masih dapat berkedip pada kunjungan pertama pengguna lama tanpa cache.
