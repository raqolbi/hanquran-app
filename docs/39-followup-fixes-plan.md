# 39 — Rencana Perbaikan Lanjutan (Sisa Audit)

**Tanggal:** 2 November 2026
**Status:** 📝 Rencana — belum dikerjakan (task: `docs/18` Phase 14)
**Asal temuan:** audit kode 2 November 2026 (`docs/18` Phase 12b residual, `docs/19` Audit v4)

Dokumen ini merinci temuan audit yang **belum** diperbaiki, beserta usulan perbaikan dan kriteria selesai.

Prioritas: **P1** = berdampak langsung ke pengguna/CI · **P2** = kualitas & aksesibilitas · **P3** = kerapian.

---

## A. Pengalaman Pengguna

### A1. "Lanjutkan Hafalan" tertimpa saat sekadar membuka surat — P1

✅ **Selesai 2 Nov 2026** — `usePersistLastViewed(surahId, ayah, engaged)`; label "Terakhir dibaca".

**Masalah:** `usePersistLastViewed` menyimpan ayat aktif begitu Surah Detail dibuka (ayat 1). Pengguna yang sedang di Al-Baqarah 150 lalu mengintip surat lain kehilangan posisinya. Label kartu "x dari y dihafal" juga menyesatkan — yang dicatat adalah posisi baca, bukan hafalan.

**Usulan:**
- Simpan posisi hanya bila ada **interaksi bermakna**: audio diputar, ayat dipilih dengan ketukan, atau pengguna menggulir dan berhenti di ayat >1 selama ≥ N detik.
- Ganti label menjadi "Terakhir dibaca: ayat x dari y" (id/en).

**Selesai bila:** membuka lalu langsung menutup surat lain tidak mengubah kartu Lanjutkan Hafalan; test hook baru.

### A2. Aksesibilitas Gerbang Threads — P2

✅ **Selesai 2 Nov 2026** — focus trap Tab/Shift+Tab, `inert` pada semua saudara overlay hingga `<body>`, fokus dikembalikan saat ditutup.

**Masalah:** overlay `role="dialog"` tanpa focus trap; Tab bisa keluar ke konten di belakang; tidak ada `inert` pada latar.

**Usulan:** focus trap sederhana (Tab/Shift+Tab berputar di dua tombol), `inert` pada `<main>` saat overlay tampil, kembalikan fokus setelah tutup. **Esc tidak menutup** (gerbang memang wajib — sesuai `docs/34`), tetapi diumumkan lewat deskripsi.

**Selesai bila:** Tab tidak pernah keluar overlay; pembaca layar tidak membaca konten di belakang; test komponen.

---

## B. Service Worker & Offline

### B1. Cache navigasi tidak dibatasi — P1

✅ **Selesai 2 Nov 2026** — `navigationCacheKey`; entri ber-query lama dibersihkan saat aktivasi SW v5.

**Masalah:** `handleNavigation` menyimpan setiap URL lengkap, termasuk `?ayah=n`, sehingga cache `hanquran-shell-v2` terus membesar.

**Usulan:** simpan dengan kunci **tanpa query** (`url.origin + url.pathname`), karena halaman yang sama melayani semua `?ayah`. Pertahankan fallback `ignoreSearch`.

**Selesai bila:** membuka `/surah/2?ayah=1..50` menghasilkan satu entri cache; test `sw-helpers`.

### B2. Payload RSC basi setelah deploy — P1

✅ **Selesai 2 Nov 2026** — network-first 2,5 dtk + cache RSC terpisah `hanquran-rsc-v1`. Sekaligus memperbaiki bug: RSC menimpa dokumen app-shell di cache yang sama sehingga surat yang belum pernah dibuka gagal dibuka offline.

**Masalah:** `handleAppRouter` memakai cache-first untuk RSC; setelah deploy, navigasi pertama bisa memakai payload build lama (risiko gagal memuat chunk).

**Usulan:** **network-first dengan batas waktu** (mis. 2,5 detik) untuk RSC saat online, fallback ke cache/app-shell saat offline. Atau sertakan `buildId` (sudah ada di `sw-precache-manifest.js`) dan hapus entri RSC dengan build berbeda saat aktivasi.

**Selesai bila:** setelah deploy baru, navigasi klien online selalu memakai payload baru; offline tetap jalan (`docs/30` §8).

### B3. Audio dari cache untuk permintaan Range (iOS) — P1

✅ **Kode selesai 2 Nov 2026** (`rangeResponseFromCache`, 206/416; respons 206 dari jaringan tidak lagi dicoba disimpan). ⏳ Uji Safari iOS di perangkat masih perlu.

**Masalah:** audio tersimpan disajikan sebagai respons 200 utuh untuk permintaan `Range`. Safari/iOS sering mewajibkan `206 Partial Content` untuk media, sehingga audio offline bisa gagal diputar di iPhone.

**Usulan:** di `cacheFirst` kategori audio, bila request punya header `Range`, potong `Blob` dari cache dan kembalikan `206` dengan `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`.

**Selesai bila:** audio offline berputar & bisa di-seek di Safari iOS (uji perangkat); test helper Range.

---

## C. Kualitas Kode & CI

### C1. Error TypeScript tersembunyi — P1

✅ **Selesai 2 Nov 2026** — 0 error `tsc --noEmit`; `ignoreBuildErrors` dihapus; skrip `npm run typecheck` + langkah CI di `android-export.yml`.

**Masalah:** `next.config.mjs` memakai `typescript.ignoreBuildErrors: true`; ada ±14 error di kode aplikasi + ±12 di test (impor `@base-ui/react/utils/useAnchorPositioning` tidak ada, `Metadata` diimpor dari `'react'`, tipe payload analytics, `Dexie.Transaction`, `requestId` di `DownloadWorkerMessage`, `onValueChange` Select menerima `null`).

**Usulan:** perbaiki semua error, lalu **matikan** `ignoreBuildErrors` dan tambahkan langkah `tsc --noEmit` di CI.

**Selesai bila:** `npx tsc --noEmit` bersih; build gagal bila ada error tipe.

### C2. Lint tidak berfungsi — P2

✅ **Selesai 2 Nov 2026** — ESLint 9 + `eslint-config-next` 16.2.6 (flat config `eslint.config.mjs`), langkah CI "Lint". 0 error; 13 peringatan `react-hooks/set-state-in-effect` (pola sinkronisasi state di effect) dibiarkan sebagai peringatan untuk refactor bertahap. Tetap ESLint 9 karena plugin react/import/jsx-a11y belum mendukung ESLint 10. Kedua lockfile diperbarui dan diverifikasi (`npm ci`, `pnpm install --frozen-lockfile`).

**Masalah:** skrip `npm run lint` ada, tetapi ESLint tidak terpasang dan tidak ada konfigurasi.

**Usulan:** pasang `eslint` + `eslint-config-next` (flat config), aturan minimal (`react-hooks`, `@next/next`), jalankan di CI. Perbarui **kedua** lockfile.

### C3. 15 test gagal karena jsdom — P2

✅ **Selesai 2 Nov 2026** — `Blob` Node dipasang di `tests/setup.ts`; 2 test SW salah ekspektasi diperbaiki (P14-3). Seluruh suite **476/476** lulus di lingkungan bersih.

**Masalah:** `new Response(new Blob())` di jsdom melempar `object.stream is not a function`, menggagalkan 15 test Cache Storage.

**Usulan:** di test, buat respons dengan `new Response('isi')` / `ArrayBuffer`, atau polyfill `Blob` dari `node:buffer` di `tests/setup.ts`.

**Selesai bila:** seluruh suite hijau.

### C4. Test menulis berkas sumber — P3

**Masalah:** `tests/scripts/generate-sw-precache.test.ts` menimpa `public/sw-precache-manifest.js` asli; sebagian test bisa menggantung di mesin lokal.

**Usulan:** skrip menerima path keluaran (env/argumen) → test menulis ke folder sementara. Selidiki test yang menggantung (`--reporter=hanging-process`).

### C5. Celah kecil — P2

| Lokasi | Masalah | Usulan |
|--------|---------|--------|
| `lib/install-prompt.ts` | `localStorage.setItem` tanpa `try/catch` (sama seperti bug gerbang yang sudah diperbaiki) | Bungkus `try/catch` |
| `components/home-client.tsx`, `surah-detail-client.tsx` | `void toggleFavorite()` → rejection tidak tertangani bila Dexie gagal | `.catch()` + toast "Gagal menyimpan favorit" |
| `app/settings/page.tsx` | `onValueChange` Select qari bisa menerima `null` | Abaikan `null` sebelum `updateSettings` |
| `messages/*.json` | Kunci milik komponen yang sudah dihapus (mis. `home.myFavorites`) | Hapus kunci tak terpakai |

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 2 November 2026 | Dokumen awal — sisa audit A–C & rencana popularitas qari D |
| 2 November 2026 | Bagian D (popularitas qari) dihapus — tanda Populer tidak dipakai |
