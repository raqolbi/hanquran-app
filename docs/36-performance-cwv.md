# 36 — Performa Beranda & Core Web Vitals (Phase 11)

**Tanggal:** 29 Oktober 2026 — diperbarui 31 Oktober 2026 (Phase 11b: LCP Threads Gate)
**Status:** ✅ Selesai — beranda di-SSG, daftar 114 surat ada di HTML awal; overlay gate ikut HTML awal
**Mengacu:** `docs/18-development-tasks.md` (Phase 11), `docs/35-seo-spec.md` §8 F11, `docs/23-static-dataset-architecture.md`, `docs/30-offline-behavior-spec.md`

---

## 1. Latar Belakang

Audit SEO Phase 10 mencatat **F11**: beranda masih 100% CSR — `app/page.tsx` berstatus `'use client'` dan daftar surat baru muncul setelah `useSurahList()` selesai fetch 114 file JSON di klien. Dampaknya:

- HTML awal hanya berisi shell + teks "Memuat daftar surat" → crawler tidak melihat tautan/judul surat.
- Lighthouse mobile: **performance 59**, TBT 680 ms, CLS 0.239 (placeholder `LazySurahCard` berganti kartu), FCP 0.8 s tetapi LCP 3.9 s.

Halaman surat sudah di-SSG pada Phase 10 (T1); beranda adalah halaman terakhir yang masih bergantung penuh pada JS.

---

## 2. Perubahan

| # | Perubahan | File |
|---|-----------|------|
| P11-1 | Loader server ringkasan 114 surat (metadata saja, tanpa ayat) | `services/quran/server-surah.ts` → `readSurahListForServer()` |
| P11-2 | Beranda menjadi server component (SSG) + canonical `/`; UI interaktif dipindah ke `HomeClient` | `app/page.tsx`, `components/home-client.tsx` |
| P11-3 | `useSurahList(initialSurahs)` memakai seed server: tidak fetch 114 JSON bila locale `id`; fetch hanya untuk locale lain, retry, atau tanpa seed (app-shell) | `hooks/use-surah-list.ts` |
| P11-4 | `LazySurahCard` tidak lagi menunda render — kartu selalu ada di HTML; browser melewatkan render kartu di luar viewport lewat `content-visibility: auto` + `contain-intrinsic-size` | `components/lazy-surah-card.tsx` |
| P11-5 | Chrome beranda default-visible (`initial={false}`): header (LCP), search, filter | `components/header.tsx`, `search-input.tsx`, `filter-chips.tsx` |
| P11-6 | `ContinueReadingSection` menerima daftar surat dari induk (menghapus fetch daftar kedua di klien) | `components/continue-reading.tsx` |

Catatan: `generateStaticParams` halaman surat, pipeline `output: 'export'` Android, dan app-shell offline tidak berubah. Seed server hanya berisi locale `id`; pengguna locale `en` tetap fetch seperti sebelumnya.

---

## 3. Hasil

### 3.1 HTML awal

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Tautan `/surah/*` di HTML beranda | 0 | **114** |
| Nama surat di HTML (Al-Faatiha … An-Naas) | tidak ada | ada |
| Ukuran HTML (raw / gzip) | ± shell kecil | 264 KB / **17,3 KB gzip** |
| Canonical | tidak ada | `/` |

> 264 KB raw terdengar besar, tetapi gzip hanya 17 KB dan menggantikan 114 request JSON (~1,3 MB total) yang sebelumnya harus diunduh klien.

### 3.2 Lighthouse (mobile, produksi lokal)

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Performance | 59 | **85** |
| FCP | 0,8 s | 0,9 s |
| LCP | 3,9 s | 3,9 s (lihat §3.3) |
| TBT | 680 ms | **200 ms** |
| CLS | 0,239 | **0** |
| Speed Index | 1,9 s | 1,4 s |
| SEO | 100 | 100 |

Regresi halaman lain: `/surah/1` performance 87 → 88, SEO 100; `/settings` SEO 66 (noindex by design, tidak berubah).

### 3.3 Temuan LCP: Threads Gate

Dengan PerformanceObserver, elemen LCP pengunjung **baru** adalah paragraf di overlay **Threads Gate** yang baru muncul setelah hidrasi (±3,9 s pada throttle Lighthouse). Jika gate sudah pernah diselesaikan (localStorage), LCP turun menjadi **logo header ±0,1 s** (unthrottled) karena header kini server-rendered dan default-visible.

Jadi LCP 3,9 s bukan berasal dari konten beranda, melainkan dari overlay produk (`docs/34`) yang sengaja dirender setelah mount. Kandidat follow-up: render overlay di HTML awal dengan visibility diatur skrip inline pra-paint (pola yang sama dengan `pwa-launching`), tanpa mengubah perilaku gate.

**Status: ✅ ditindaklanjuti 31 Okt 2026 (Phase 11b).** Overlay kini dirender di HTML awal; skrip inline pra-paint menandai `<html>` bila flag `completed` valid dan CSS menyembunyikan overlay untuk pengguna lama. `<noscript>` menyembunyikan gate saat JS mati agar konten tidak terkunci. Hasil:

| Metrik | Sebelum 11b | Sesudah 11b |
|--------|-------------|-------------|
| Observed LCP first-visit (PerformanceObserver) | ±3,9 s | **0,10–0,15 s** |
| Overlay saat `domcontentloaded` (fresh / returning) | belum ada / belum ada | **`display:flex` / `display:none`** |
| Skor performance Lighthouse (3 run) | 85 | 82–92 (variasi TBT mesin) |
| SEO / CLS | 100 / 0 | 100 / 0 |

Catatan: LCP **simulasi** Lantern masih ±3,0–3,3 s karena model main-thread-nya tidak mengikuti paint SSR; angka observed di atas yang mencerminkan pengalaman nyata. Implementasi & invariant di [`docs/34` §14](./34-threads-gate-spec.md).

---

## 4. Verifikasi & Non-Regresi

| Cek | Hasil |
|-----|-------|
| `npm run build` (web) | ✅ hijau |
| `HANQURAN_TARGET=android npx next build` | ✅ hijau; `out/index.html` berisi 114 tautan `.html`, surat/robots/sitemap utuh |
| Test suite | ✅ **85 file / 409 test** (3 test skrip init gate dari Phase 11b) |
| Smoke browser | ✅ 114 kartu terlihat; pencarian `yasin` → 1 kartu; filter favorit kosong → pesan; navigasi home → surat; 0 request dataset saat locale `id`; tanpa JS daftar tetap tampil |
| Smoke Threads Gate | ✅ fresh: gate di HTML awal & alur 5 detik → Lanjut; returning: `display:none` sebelum hidrasi; tanpa JS: gate tersembunyi |
| Lighthouse SEO | ✅ 100 (home), tidak turun |
| Offline shell / SW | ✅ tidak diubah |

---

## 5. Di Luar Scope / Backlog

- ~~**LCP first-visit** — Threads Gate (lihat §3.3)~~ ✅ diselesaikan Phase 11b (`docs/34` §14).
- **F8** — flash terjemahan untuk locale `en` (seed server selalu `id`); butuh routing i18n/cookie locale.
- **F13** — validasi eksternal (Rich Results, Sharing Debugger, Search Console) setelah deploy production + `NEXT_PUBLIC_SITE_URL`.
- Tautan kartu surat tetap `prefetch={false}` (Phase 10b H3); RSC payload surat diunduh saat diklik, bukan saat kartu terlihat.
