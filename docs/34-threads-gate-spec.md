# 34 — Overlay Gate Threads (sekali, client-side)

**Tanggal:** 17 Agustus 2026  
**Status:** ✅ Diimplementasi — overlay sekali, Lanjut aktif 5 detik setelah Threads  
**Cakupan:** PWA + APK Capacitor  
**Tujuan:** trik pemasaran sekali pakai, bukan verifikasi follow

---

## 1. Ringkasan keputusan

Saat pengguna **pertama kali** membuka HanQuran, overlay tenang menutup aplikasi. Ada dua tombol: **Threads** dan **Lanjut**.

| Keputusan | Isi |
|-----------|-----|
| Sifat | Gimmick pemasaran sekali. Bukan paywall, bukan akun, bukan bukti follow |
| URL | Satu sumber: `APP_AUTHOR_THREADS_URL` di `lib/app-about.ts` — sama dengan footer Beranda & layar Tentang |
| Lanjut menyala | **5 detik** setelah tombol Threads diketuk (`THREADS_GATE_CONTINUE_DELAY_MS = 5000`). Tidak menunggu pengguna kembali; delay supaya tidak kelihatan langsung nyala |
| Persistensi | `localStorage` — sesi berikutnya overlay tidak muncul |
| Backend | Tidak ada |
| Plugin Capacitor baru | Tidak wajib |

Alur:

```text
Buka HanQuran
  → overlay muncul (jika belum completed)
  → ketuk Threads  → halaman Threads terbuka
  → tunggu 5 detik (Lanjut masih mati; tanpa hitung mundur)
  → Lanjut aktif
  → ketuk Lanjut   → overlay ditutup, flag disimpan
  → buka app lagi  → overlay tidak muncul
```

Delay 5 detik adalah ilusi gimmick: pengguna yang sempat ke Threads biasanya baru melihat Lanjut sudah menyala saat kembali. Jangan menunggu event “kembali ke app”.

---

## 2. Bukan fitur ini

| Bukan | Alasan |
|-------|--------|
| Verifikasi follow Threads | Tidak ada API publik; app tanpa akun |
| Menunggu pengguna kembali ke HanQuran | Gimmick: delay 5 detik sejak ketuk Threads, bukan deteksi kembali |
| Soft banner seperti InstallBanner | Overlay sekali, blocking sampai Lanjut |
| Preferensi Dexie / Pengaturan | Flag boolean sekali tulis — bukan settings pengguna |
| `@capacitor/browser` | Default Capacitor sudah mengeluarkan origin `threads.com` dari WebView; uji APK dulu |

---

## 3. Play Store — apakah aman?

**Tidak ada larangan eksplisit** di Google Play Developer Program Policy untuk CTA “buka profil media sosial” sekali di dalam app.

Risiko yang relevan adalah **Deceptive Behavior** dan **Misleading Claims** ([kebijakan](https://support.google.com/googleplay/android-developer/answer/9888077)): aplikasi tidak boleh menyesatkan pengguna tentang fungsinya.

| Praktik | Status |
|---------|--------|
| Copy mengundang buka Threads, tanpa klaim “sudah follow” / “wajib follow agar fitur jalan” | Aman secara desain |
| Lanjut aktif setelah delay tetap 5 detik — tidak berpura-pura mengecek follow | Mengurangi penipuan fungsi |
| Flag hanya di perangkat (`localStorage`) | Tidak mengubah Data Safety (`docs/33`) |
| Perilaku sama untuk reviewer Play dan pengguna | Wajib — jangan deteksi lingkungan review |
| Menyembunyikan overlay dari reviewer / beda fitur per geo | Dilarang (Behavior Transparency) |
| Copy “Ikuti akun ini dulu baru bisa memakai HanQuran” padahal tidak dicek | **Jangan** — klaim menyesatkan |

Store listing tetap mendeskripsikan HanQuran sebagai aplikasi hafalan (baca, audio, repeat, offline). Overlay ini **bukan** fitur inti; tidak perlu dijual sebagai “follow to unlock”.

Ini **bukan jaminan hukum**. Reviewer Play tetap bisa menolak atas diskresi. Jika ditolak, turunkan overlay menjadi banner non-blocking — jangan menambah verifikasi palsu.

Kebijakan yang **tidak** dilanggar oleh desain ini: pengumpulan data pribadi, iklan menyesatkan, ubah pengaturan perangkat, atau unduhan aset tersembunyi.

---

## 4. Prinsip produk

Overlay ini adalah **pengecualian sekali** terhadap Memorization First (`docs/08` §2): funnel hafalan dimulai **setelah** overlay ditutup.

Aturan:

- Hanya sekali per instalasi / penyimpanan origin
- Visual tenang (emerald, Dialog yang sudah ada) — bukan iklan ramai
- Setelah completed, nol gesekan
- Jangan kunci pengguna jika Threads gagal dibuka (lihat §7.3)
- Deep link (`/surah/[id]`, `/focus/[id]`) tetap ter-gate sampai completed — lalu rute tetap terbuka

---

## 5. Tautan resmi

Satu-satunya URL yang boleh dibuka dari overlay:

| Konstanta | Nilai saat spek ini ditulis |
|-----------|-----------------------------|
| `APP_AUTHOR_THREADS_URL` | `https://www.threads.com/@cenybug` |

Sumber: `lib/app-about.ts`. Dipakai juga oleh `HomeFooter` dan layar Tentang (`docs/26`).

Dilarang hardcode URL kedua di komponen overlay. Jika akun berubah, ubah konstanta itu saja.

---

## 6. Wireframe (mobile)

Setelah splash (PWA `z-index` 10000 / splash native Capacitor), overlay Dialog di atas semua rute.

```text
┌──────────────────────────────────────┐
│            (backdrop)                │
│   ┌──────────────────────────────┐   │
│   │                              │   │
│   │         [Logo 40]            │   │
│   │         HanQuran             │   │
│   │                              │   │
│   │  Ikuti @cenybug di Threads   │   │
│   │  untuk melanjutkan ke        │   │
│   │  HanQuran.                   │   │
│   │                              │   │
│   │  [ Buka Threads ]   primary  │   │
│   │  [ Lanjut ]         disabled │   │
│   │                     → aktif  │   │
│   │                     5 detik  │   │
│   │                     setelah  │   │
│   │                     Threads  │   │
│   │                              │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

Tidak ada tombol X / tutup. Tidak dismiss lewat tap backdrop.

Tombol:

| Tombol | Gaya (`docs/09`) | Awal | Setelah ketuk Threads |
|--------|------------------|------|------------------------|
| Buka Threads | Primary, tinggi 44px | Aktif | Tetap bisa diketuk (buka lagi); **jangan reset** timer |
| Lanjut | Secondary | Disabled | Tetap disabled **5 detik**, lalu aktif. Tanpa angka hitung mundur |

Label UI Bahasa Indonesia. Proper noun **Threads** dan **HanQuran** tidak diterjemahkan.

---

## 7. Perilaku

### 7.1 State mesin

```text
pending      overlay tampil, Lanjut disabled
waiting      Threads diketuk, tautan dibuka, timer 5 detik berjalan, Lanjut masih disabled
ready        5 detik wall-clock terlewati, Lanjut enabled
completed    Lanjut diketuk (atau sudah ada flag) → overlay hilang selamanya
```

Konstanta implementasi: `THREADS_GATE_CONTINUE_DELAY_MS = 5000` di `lib/threads-gate.ts`.

### 7.2 Ketuk Threads

1. Buka `APP_AUTHOR_THREADS_URL` di konteks baru (`target="_blank"`, `rel="noopener noreferrer"`).
2. Di native: biarkan WebView Capacitor mengeluarkan origin eksternal (perilaku default).
3. Jika masih `pending`: catat `clickedAt = Date.now()`, pindah ke `waiting`. Ketuk ulang tidak me-reset `clickedAt`.
4. Jangan tunggu `visibilitychange` / “kembali ke app” untuk menyalakan Lanjut.
5. Lanjut tetap disabled sampai `Date.now() >= clickedAt + 5000`.

Tidak perlu membuktikan halaman Threads selesai dimuat. Jangan tampilkan hitung mundur di tombol atau overlay.

### 7.2.1 Timer vs aplikasi di belakang

`setTimeout` sering di-throttle saat tab/WebView hidden. Wajib memakai **deadline wall-clock**:

```text
continueAt = clickedAt + THREADS_GATE_CONTINUE_DELAY_MS
```

Saat overlay terlihat lagi (`visibilitychange` / `focus` / interval pendek), jika `Date.now() >= continueAt` → `ready`. Jika pengguna kembali setelah lebih dari 5 detik, Lanjut sudah menyala tanpa jeda tambahan.

### 7.3 Threads gagal dibuka

Jangan jebak pengguna (Offline First + Play).

Jika inisiasi buka gagal (popup diblokir, `window.open` null, `navigator.onLine === false` dan navigasi tidak jalan):

- Tetap masuk `waiting` dan jalankan delay 5 detik yang sama
- Opsional: satu baris teks bantuan “Jika Threads tidak terbuka, ketuk Lanjut.” (baru relevan setelah `ready`)

Jangan membuat overlay tanpa jalan keluar.

### 7.4 Ketuk Lanjut

- Hanya jika state `ready` (Lanjut enabled)
- Tulis flag completed ke `localStorage`
- Tutup overlay
- Fokus ke konten di belakang (rute yang sudah terbuka)
- Bersihkan timer jika masih ada

### 7.5 Peluncuran berikutnya

Jika flag completed ada → overlay tidak di-mount (setelah hidrasi klien).

### 7.6 Splash vs overlay

Urutan: splash native/PWA → baca `localStorage` di klien → overlay jika pending.

- Overlay kustom (`role="dialog"`), **bukan** Dialog Base UI — Base UI menandai sibling `inert` / `aria-hidden` dan memicu hydration mismatch
- Overlay baru setelah hidrasi klien dan `localStorage` terbaca (`useEffect` mount)
- Overlay memakai Dialog (`z-50`); splash PWA `z-index: 10000` harus sudah dismissed

### 7.7 Back Android

Saat overlay terbuka di Beranda, Back **tetap** `exit_app` seperti sekarang (`lib/android-back.ts`). Overlay tidak menelan Back untuk memaksa pengguna tetap di app.

Cold start berikutnya: overlay muncul lagi sampai completed.

### 7.8 Aksesibilitas

- `role="dialog"`, judul terhubung (`DialogTitle`)
- Fokus awal di tombol Threads
- Lanjut `disabled` sampai `ready` (`aria-disabled`)
- Backdrop tidak menutup dialog
- Kontras WCAG AA (`docs/09`)

---

## 8. Persistensi

Pola sama dengan banner install (`lib/install-prompt.ts`), **bukan** Dexie.

`docs/20` menyatakan localStorage bukan primary persistence untuk preferensi. Pengecualian ini setara banner install: flag UI sekali/TTL, bukan settings hafalan.

| Item | Nilai |
|------|--------|
| Kunci | `hanquran:threads-gate-completed` |
| Nilai | JSON `{ "completedAt": number }` (`Date.now()`) |
| TTL | Tidak ada — sekali selamanya sampai storage dihapus |
| SSR | `typeof window === 'undefined'` → belum completed |
| Storage rusak | `catch` → anggap belum completed |
| Reset | Clear data origin / uninstall. Tidak ada toggle di Pengaturan |

Menulis flag saat **Lanjut** diketuk. Jika app ditutup setelah Threads tetapi sebelum Lanjut (termasuk saat masih `waiting`), overlay muncul lagi dari `pending` — Lanjut disabled sampai Threads diketuk lagi, lalu delay 5 detik diulang. Timer tidak perlu di-persist.

---

## 9. Arsitektur implementasi

| Lapisan | File rencana | Peran |
|---------|--------------|--------|
| Helper | `lib/threads-gate.ts` | get/set flag, `THREADS_GATE_CONTINUE_DELAY_MS`, guard `window` |
| Hook | `hooks/use-threads-gate.ts` | state `pending` / `waiting` / `ready` / `completed`, deadline wall-clock, mount via `useEffect` |
| UI | `components/shared/threads-gate.tsx` | Overlay kustom, dua tombol, i18n |
| Mount | `components/providers/app-providers.tsx` | Global, semua rute |
| URL | `lib/app-about.ts` | `APP_AUTHOR_THREADS_URL` saja |
| i18n | `messages/id.json`, `messages/en.json` | namespace `threadsGate` |
| Tes | `tests/lib/threads-gate.test.ts`, `tests/hooks/use-threads-gate.test.ts` | pola `install-prompt` |

Komponen UI tidak mengakses `localStorage` langsung — hanya lewat helper/hook (`docs/07`, `docs/15`).

Tidak mengubah: Dexie schema, `userStore`, `MainActivity`, `capacitor.config.ts`.

---

## 10. Copy i18n

Namespace: `threadsGate`. Semua label Indonesia kecuali proper noun.

| Kunci | id | en |
|-------|----|----|
| `title` | Dukung HanQuran | Support HanQuran |
| `body` | Ikuti @cenybug di Threads untuk melanjutkan ke HanQuran. | Follow @cenybug on Threads to continue to HanQuran. |
| `openThreads` | Buka Threads | Open Threads |
| `continue` | Lanjut | Continue |
| `opensInNewTab` | (sudah ada di `about.credits.opensInNewTab`) | sama |
| `openFailedHint` | Jika Threads tidak terbuka, ketuk Lanjut. | If Threads doesn’t open, tap Continue. |

**Dilarang** di copy:

- “Wajib follow”
- “Kami memeriksa apakah Anda sudah follow”
- “Fitur terkunci sampai follow”

---

## 11. Visual (selaras 09 / 10)

- Overlay kustom `role="dialog"` `aria-modal="true"` — bukan Dialog Base UI
- Radius 16–20px, padding 24px (`docs/08` token Dialog 20px)
- Logo `Logo` 40px (sama header Beranda)
- Backdrop `bg-black/40` (div terpisah, tidak menandai sibling `inert`)
- Tanpa animasi bounce/spring ekstrem (`docs/09` §9)
- Tanpa iklan, tanpa hitung mundur di UI, tanpa konfeti
- Delay 5 detik Lanjut **tidak** ditampilkan sebagai angka atau progress

---

## 12. Tes (saat implementasi)

- Flag kosong → overlay tampil setelah klien siap
- Flag ada → overlay tidak tampil
- Ketuk Threads → `waiting`, Lanjut masih disabled, URL = `APP_AUTHOR_THREADS_URL`
- 4,9 detik setelah ketuk → Lanjut masih disabled
- 5,0 detik (wall-clock) setelah ketuk → `ready`, Lanjut enabled
- Ketuk Threads kedua tidak me-reset deadline
- App hidden lalu visible setelah ≥ 5 detik → Lanjut enabled tanpa menunggu sisa `setTimeout`
- Ketuk Lanjut sebelum `ready` → tidak menutup (disabled)
- Ketuk Lanjut setelah `ready` → `localStorage` terisi, overlay hilang
- JSON rusak di storage → overlay tampil (fail-open ke pending)
- SSR / `useIsClient` false → tidak akses `localStorage`, tidak hydration mismatch

---

## 13. Dokumen terkait

| Dokumen | Peran |
|---------|-------|
| `docs/08-ui-ux-wireframe.md` | Overlay + inventory layar |
| `docs/09-design-system.md` | Tombol 44px, Dialog, calm interface |
| `docs/10-high-fidelity-ui.md` | Visual overlay |
| `docs/12-component-spec.md` | `ThreadsGate` |
| `docs/21-i18n-and-locale.md` | Namespace `threadsGate` |
| `docs/26-about-screen-spec.md` | URL Threads yang sama |
| `docs/32-capacitor-android-platform.md` | Tautan eksternal WebView; `@capacitor/browser` tetap P2 |
| `docs/33-play-store-privacy-and-data-safety.md` | Flag on-device, bukan data yang dikumpulkan |

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 17 Agustus 2026 | Spek awal — gimmick sekali, Lanjut aktif 5 detik setelah Threads diketuk |
| 17 Agustus 2026 | Implementasi client-side (`lib/threads-gate.ts`, overlay di `AppProviders`) |
