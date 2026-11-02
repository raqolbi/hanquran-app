# 39 — Rencana Perbaikan Lanjutan (Sisa Audit & Popularitas Qari)

**Tanggal:** 2 November 2026
**Status:** 📝 Rencana — belum dikerjakan (task: `docs/18` Phase 14)
**Asal temuan:** audit kode 2 November 2026 (`docs/18` Phase 12b residual, `docs/19` Audit v4)

Dokumen ini merinci temuan audit yang **belum** diperbaiki, beserta usulan perbaikan dan kriteria selesai, serta rencana mengganti tanda "★ Populer" (kurasi) dengan data nyata dari Vercel Analytics.

Prioritas: **P1** = berdampak langsung ke pengguna/CI · **P2** = kualitas & aksesibilitas · **P3** = kerapian.

---

## A. Pengalaman Pengguna

### A1. "Lanjutkan Hafalan" tertimpa saat sekadar membuka surat — P1

**Masalah:** `usePersistLastViewed` menyimpan ayat aktif begitu Surah Detail dibuka (ayat 1). Pengguna yang sedang di Al-Baqarah 150 lalu mengintip surat lain kehilangan posisinya. Label kartu "x dari y dihafal" juga menyesatkan — yang dicatat adalah posisi baca, bukan hafalan.

**Usulan:**
- Simpan posisi hanya bila ada **interaksi bermakna**: audio diputar, ayat dipilih dengan ketukan, atau pengguna menggulir dan berhenti di ayat >1 selama ≥ N detik.
- Ganti label menjadi "Terakhir dibaca: ayat x dari y" (id/en).

**Selesai bila:** membuka lalu langsung menutup surat lain tidak mengubah kartu Lanjutkan Hafalan; test hook baru.

### A2. Aksesibilitas Gerbang Threads — P2

**Masalah:** overlay `role="dialog"` tanpa focus trap; Tab bisa keluar ke konten di belakang; tidak ada `inert` pada latar.

**Usulan:** focus trap sederhana (Tab/Shift+Tab berputar di dua tombol), `inert` pada `<main>` saat overlay tampil, kembalikan fokus setelah tutup. **Esc tidak menutup** (gerbang memang wajib — sesuai `docs/34`), tetapi diumumkan lewat deskripsi.

**Selesai bila:** Tab tidak pernah keluar overlay; pembaca layar tidak membaca konten di belakang; test komponen.

---

## B. Service Worker & Offline

### B1. Cache navigasi tidak dibatasi — P1

**Masalah:** `handleNavigation` menyimpan setiap URL lengkap, termasuk `?ayah=n`, sehingga cache `hanquran-shell-v2` terus membesar.

**Usulan:** simpan dengan kunci **tanpa query** (`url.origin + url.pathname`), karena halaman yang sama melayani semua `?ayah`. Pertahankan fallback `ignoreSearch`.

**Selesai bila:** membuka `/surah/2?ayah=1..50` menghasilkan satu entri cache; test `sw-helpers`.

### B2. Payload RSC basi setelah deploy — P1

**Masalah:** `handleAppRouter` memakai cache-first untuk RSC; setelah deploy, navigasi pertama bisa memakai payload build lama (risiko gagal memuat chunk).

**Usulan:** **network-first dengan batas waktu** (mis. 2,5 detik) untuk RSC saat online, fallback ke cache/app-shell saat offline. Atau sertakan `buildId` (sudah ada di `sw-precache-manifest.js`) dan hapus entri RSC dengan build berbeda saat aktivasi.

**Selesai bila:** setelah deploy baru, navigasi klien online selalu memakai payload baru; offline tetap jalan (`docs/30` §8).

### B3. Audio dari cache untuk permintaan Range (iOS) — P1

**Masalah:** audio tersimpan disajikan sebagai respons 200 utuh untuk permintaan `Range`. Safari/iOS sering mewajibkan `206 Partial Content` untuk media, sehingga audio offline bisa gagal diputar di iPhone.

**Usulan:** di `cacheFirst` kategori audio, bila request punya header `Range`, potong `Blob` dari cache dan kembalikan `206` dengan `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`.

**Selesai bila:** audio offline berputar & bisa di-seek di Safari iOS (uji perangkat); test helper Range.

---

## C. Kualitas Kode & CI

### C1. Error TypeScript tersembunyi — P1

**Masalah:** `next.config.mjs` memakai `typescript.ignoreBuildErrors: true`; ada ±14 error di kode aplikasi + ±12 di test (impor `@base-ui/react/utils/useAnchorPositioning` tidak ada, `Metadata` diimpor dari `'react'`, tipe payload analytics, `Dexie.Transaction`, `requestId` di `DownloadWorkerMessage`, `onValueChange` Select menerima `null`).

**Usulan:** perbaiki semua error, lalu **matikan** `ignoreBuildErrors` dan tambahkan langkah `tsc --noEmit` di CI.

**Selesai bila:** `npx tsc --noEmit` bersih; build gagal bila ada error tipe.

### C2. Lint tidak berfungsi — P2

**Masalah:** skrip `npm run lint` ada, tetapi ESLint tidak terpasang dan tidak ada konfigurasi.

**Usulan:** pasang `eslint` + `eslint-config-next` (flat config), aturan minimal (`react-hooks`, `@next/next`), jalankan di CI. Perbarui **kedua** lockfile.

### C3. 15 test gagal karena jsdom — P2

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

## D. Popularitas Qari dari Vercel Analytics — P2

### D1. Yang sudah ada

Event `audio_play` (`lib/analytics`) sudah mengirim `reciterId` setiap trek baru diputar — **tanpa** perlu perubahan kode. Dari dashboard Vercel → Analytics → Events → `audio_play` → properti `reciterId`, bisa dilihat qari mana yang paling sering diputar.

### D2. Batasan

- Data **tidak bisa dibaca langsung oleh aplikasi** saat runtime (dashboard Vercel, bukan API publik untuk klien). Jadi tanda "Populer" tetap berasal dari berkas `data/reciters.json`, tetapi isinya diperbarui **berdasarkan data**.
- Hanya pengguna **web** (PWA) — Analytics tidak aktif di APK Android (`docs/32` A1).
- Ketersediaan & retensi custom events bergantung pada paket Vercel yang dipakai — cek di dashboard.
- Bias: qari default (Alafasy) akan selalu terlihat paling populer. Usulan metrik: hitung **pemilihan qari** (event baru `reciter_selected` saat pengguna mengganti qari di Pengaturan) dan/atau `audio_play` **di luar** qari default.
- Privasi: hanya ID qari, tanpa data pribadi; konsisten dengan `docs/33`.

### D3. Usulan alur

1. Tambah event `reciter_selected { reciterId, previousReciterId }` (`docs/analytics.md`).
2. Tiap rilis (mis. bulanan), lihat 30 hari terakhir → urutkan qari menurut jumlah pemilihan + putar.
3. Perbarui `data/reciters.json`: tandai **5–6 teratas** `popular: true` dan urutkan daftar sesuai peringkat; catat periode & angka di `docs/37` §8.
4. Ubah keterangan di aplikasi dari "kurasi HanQuran" menjadi "berdasarkan pilihan pengguna (periode …)".

Opsional (P3): skrip yang membaca ekspor CSV dari dashboard lalu memperbarui `data/reciters.json` otomatis.

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 2 November 2026 | Dokumen awal — sisa audit A–C & rencana popularitas qari D |
