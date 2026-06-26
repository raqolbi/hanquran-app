# 30 — Spesifikasi Perilaku Mode Offline

**Tanggal:** 26 Juni 2026  
**Status:** ✅ Spesifikasi resmi — **offline-first sejati** (lihat §9 untuk status implementasi)  
**Mengacu:** `docs/23-static-dataset-architecture.md`, `docs/15-state-management.md` §12, `docs/12-component-spec.md`

---

## 1. Prinsip Inti — Offline First

> **Aturan utama:** Seluruh aplikasi (shell + dataset Qur'an) tersimpan sebagai
> **aset offline sejak install Service Worker**. Setelah SW terpasang **satu kali
> saat online**, aplikasi **harus berfungsi penuh tanpa jaringan** — termasuk
> *cold start* PWA terinstal dalam keadaan offline. **Jaringan hanya dibutuhkan
> untuk: (a) streaming audio yang belum diunduh, (b) proses Simpan Offline audio.**

HanQuran memisahkan **dua lapisan offline** yang tidak boleh dicampur:

| Lapisan | Apa yang di-cache | Kapan tersedia offline | Aksi pengguna |
|---------|-------------------|------------------------|---------------|
| **Aplikasi + Konten baca** (shell HTML/JS/CSS, route, teks Arab, transliterasi, terjemahan, metadata surat) | App shell + seluruh `public/data/*`, **di-precache saat SW `install`** | **Sejak SW terpasang** — tidak perlu pernah membuka surat saat online | **Tidak ada** — otomatis tersedia |
| **Audio tilawah** | File MP3 CDN di `hanquran-audio-v1` | (a) **Simpan Offline** penuh surat+qari (`downloadManifest.status === 'ready'`), atau (b) ayat per ayat yang pernah diputar saat **Auto Download Audio** ON (`docs/31`) | (a) Unduh eksplisit per surat, atau (b) opt-in per ayat saat play |

**Kesimpulan bagi pengguna:**

- PWA terinstal dibuka offline (cold start) → **Beranda, daftar surat, dan setiap halaman tampil** (bukan «Anda sedang offline»).
- Offline + buka surat **mana pun** (belum pernah dibuka) → **tetap bisa membaca** ayat penuh.
- Offline + buka **Tentang HanQuran / Mode Fokus** → tampil normal.
- Offline + audio belum disimpan → **baca OK, putar audio tidak** (Play disabled + toast).
- Yang butuh jaringan: **streaming audio CDN** dan **proses unduh audio** — **tidak ada lagi**.

### 1.1 Halaman «Anda sedang offline» (`offline.html`)

`offline.html` adalah **jaring pengaman terakhir**, hanya muncul untuk navigasi ke
URL **di luar** route aplikasi yang dikenal (mis. salah ketik path) **dan** tidak
ada di cache. Dalam pemakaian normal offline-first, pengguna **tidak boleh** pernah
melihat halaman ini saat membuka Beranda/surat/about/focus.

---

## 2. Sumber Data & Cache

### 2.1 Dataset Quran (`/data/*`)

```text
public/data/manifest.json
public/data/quran/{id}.json
public/data/translations/{lang}/{id}.json
        ↓ fetch (services/quran/data-loader.ts)
Service Worker: hanquran-data-v1 (cache-first)
        ↓
In-memory Map (per sesi tab)
```

- **Bukan** disimpan di Dexie.
- **Di-precache saat SW `install`** (lihat §6.1): seluruh dataset (`manifest.json`, 114 file quran, terjemahan `id` + `en`) langsung tersimpan di `hanquran-data-v1` sebagai aset offline — **tanpa** menunggu pengguna membuka surat.
- Runtime (cache-first) tetap mengisi entri apa pun yang belum sempat ter-precache.

### 2.2 Audio tilawah (CDN)

```text
everyayah.com/.../*.mp3
        ↓
Service Worker: hanquran-audio-v1 (cache-first)
        ↓
Dexie downloadManifest (metadata: surahId + reciterId, status ready)
```

- Unduhan eksplisit via **Simpan Offline** di Surah Detail (seluruh ayat surat + qari).
- **Auto Download Audio** (opt-in, default OFF): saat play ayat online, cache file MP3 ayat tersebut ke `hanquran-audio-v1` — lihat `docs/31-auto-download-audio-spec.md`.
- Saat Simpan Offline selesai, precache juga shell route `/surah/[id]` + data JSON surat tersebut (`services/offline-surah-precache.ts`).

### 2.3 Preferensi pengguna

Dexie (`settings`, `favorites`, `lastRead`, dll.) — selalu lokal, tidak bergantung jaringan.

---

## 3. Matriks Perilaku

| Koneksi | Audio surat+qari | Buka Surah Detail / Focus | Tombol Play | Tombol Simpan Offline |
|---------|------------------|---------------------------|-------------|------------------------|
| Online | Belum diunduh | ✅ Baca + stream audio | ✅ Stream CDN | ✅ Tampil |
| Online | Sudah diunduh | ✅ Baca + stream/cache | ✅ | ❌ Sembunyi (badge «Siap offline» di header) |
| Offline | Belum diunduh (manifest & cache ayat miss) | ✅ Baca (dataset di-precache penuh) | ❌ Disabled | ❌ **Sembunyi** (hanya online) |
| Offline | Sebagian (auto download ON, ayat pernah diputar) | ✅ Baca; putar **hanya ayat yang ada di cache** | ✅ Per ayat tercache | ❌ Sembunyi |
| Offline | Sudah diunduh penuh (Simpan Offline) | ✅ Baca + putar seluruh surat dari cache | ✅ Dari cache | ❌ Sembunyi |

### 3.1 Mode Fokus

Aturan identik Surah Detail: teks ayat selalu dapat dibaca; audio mengikuti baris matriks di atas.

### 3.2 Mode Murotal saat offline

- Hanya berlaku untuk ayat/surat yang **file audionya ada di cache** (Simpan Offline penuh **atau** auto download per ayat).
- Lintas surat: surat/ayat tujuan harus tercache untuk qari yang sama; jika tidak → stop + feedback (bukan crash).
- Ref: `docs/29-murotal-mode-spec.md` § integrasi offline.

### 3.3 Repeat saat offline

- Konfigurasi repeat tetap dapat diubah.
- Siklus repeat **hanya berjalan** jika audio ayat tersedia (cache atau online).

---

## 4. Aturan UI

### 4.1 `SurahOfflineDownload` (Surah Detail)

| Kondisi | Tampilan |
|---------|----------|
| `connectionStatus === 'online'` dan belum `ready` | Tombol **Simpan Offline** + progres unduhan |
| `connectionStatus === 'online'` dan `ready` | Komponen **tidak** dirender (badge di header surat) |
| `connectionStatus === 'offline'` | Komponen **tidak** dirender — unduh tidak dapat dimulai tanpa jaringan |
| Unduh gagal (online) | Pesan error + tombol coba lagi (jika online) |

**Catatan:** Jangan menampilkan tombol disabled dengan teks «tidak tersedia» saat offline — **sembunyikan** seluruh blok unduhan.

### 4.2 `AudioPlayer` (Surah Detail & Focus Mode)

Definisikan `audioPlaybackBlocked` ketika:

```text
connectionStatus === 'offline'
AND downloadManifest[surahId + reciterId] !== 'ready'
AND caches.match(audioUrl) === miss   // belt-and-suspenders
```

| Kondisi | Play / Pause | Seek | Prev / Next |
|---------|--------------|------|-------------|
| `audioPlaybackBlocked` | ❌ Disabled | ❌ Disabled | ✅ Navigasi ayat tetap (baca) |
| Audio tersedia (online atau cache) | ✅ Normal | ✅ Normal | ✅ Sesuai `docs/29` §7.2 |

**Feedback saat pengguna menekan Play padahal diblokir:**

- Tampilkan **toast** (bukan `alert`):
  - ID: `Audio tidak tersedia offline. Simpan surat ini saat online untuk mendengarkan tanpa internet.`
  - EN: `Audio isn't available offline. Save this surah while online to listen without internet.`
- Kunci i18n disarankan: `audio.offlineUnavailableToast`
- Toast singkat (~4 detik), dapat ditutup, `role="status"` / live region.

**Visual:** tombol Play ber-opacity reduksi + `aria-disabled` + tooltip opsional selaras disabled.

### 4.3 Indikator status

| Lokasi | Komponen | Cakupan |
|--------|----------|---------|
| Header Beranda | `ConnectionIndicator` | `online` / `offline_ready` / `offline` |
| Pengaturan | `OfflineStatusBadge` | Lima state penuh |
| Surah Detail header | Badge «Siap offline» | Hanya surat+qari yang `ready` |

`offline_ready` di header = perangkat offline **dan** minimal satu surat audio tercache (`manifestSummary.surahsCached > 0`).

### 4.4 Pesan error muat data (bukan audio)

Jika `/data/*` tidak ada di cache SW (mis. first-open offline tanpa pernah online):

- Surah Detail menampilkan `DataLoadErrorFallback` — **bukan** redirect ke Beranda.
- Pesan: `Tidak dapat memuat ayat surat ini.` + tombol coba lagi.

Ini berbeda dari blokir audio — pengguna perlu pernah online sekali agar dataset ter-cache.

---

## 5. Alur Pengguna (Wireframe Logis)

### 5.1 Menyimpan audio untuk offline (harus online)

```text
Pengguna online → buka Surah Detail → Simpan Offline
  → progres ayat x/y
  → selesai: badge header «Siap offline» + precache data & shell route
```

### 5.2 Membaca offline tanpa audio

```text
Pengguna offline → buka app (Beranda dari cache)
  → tap surat
  → Surah Detail: teks ayat tampil
  → Play disabled
  → tap Play → toast «Audio tidak tersedia offline…»
  → (tidak ada tombol Simpan Offline)
```

### 5.3 Mendengarkan offline (surat disimpan penuh)

```text
Pengguna offline → buka surat yang pernah Simpan Offline penuh
  → Play aktif → audio seluruh ayat dari Cache Storage
  → Repeat & Murotal (dalam batas cache) berfungsi
  → Murotal/next/prev menuju surat yang BELUM disimpan → otomatis berhenti + toast
```

### 5.4 Mendengarkan offline (auto download per ayat)

```text
Pengaturan Auto Download Audio ON (pernah online)
  → pengguna play ayat 1, 3, 5 → file tersimpan di cache
Pengguna offline → buka surat yang sama
  → Play ayat 1/3/5 → aktif dari cache
  → Play ayat 2/4 → disabled + toast
  → Murotal berhenti saat ayat tujuan belum di-cache
```

Ref: `docs/31-auto-download-audio-spec.md`.

**Aturan batas Murotal offline:** ketika tilawah berlanjut (atau pengguna menekan
next/prev) menuju **surat lain** yang audionya belum tersedia offline, pemutaran
**berhenti otomatis** (`pause`) dan menampilkan toast. Berpindah surat untuk
**dibaca** tetap diizinkan (teks tersedia offline). Lihat
`hooks/use-surah-repeat-playback.ts` (`ensureTargetSurahPlayable`).

---

## 6. Service Worker — Offline First

| Cache | Isi | Strategi |
|-------|-----|----------|
| `hanquran-shell-v1` | App shell: `offline.html`, **app-shell HTML** + RSC route | network-first nav / SWR (`ignoreSearch`), **fallback app-shell** |
| `hanquran-static-v1` | `/_next/static/*` (JS/CSS hashed), font, ikon, `manifest.json` | **precache install** + SWR |
| `hanquran-data-v1` | seluruh `/data/*` | **precache install** + cache-first |
| `hanquran-audio-v1` | MP3 CDN | cache-first (Simpan Offline / auto download saat play jika ON) |

**Jangan** fallback navigasi `/surah/*` ke HTML Beranda — menyebabkan splash + kembali ke home (bug 25 Juni 2026).

### 6.1 Precache saat `install` (wajib untuk cold-start offline)

Saat event `install`, Service Worker **wajib** mem-precache seluruh aset yang
dibutuhkan agar aplikasi boot tanpa jaringan:

1. **App shell & boot assets** — `offline.html`, app-shell HTML, dan **seluruh
   `/_next/static/*`** (JS/CSS). Karena nama file di-*hash* per build, daftar ini
   **di-generate saat build** (lihat §6.3) lalu di-`importScripts` oleh `sw.js`.
2. **Dataset penuh** — `manifest.json`, 114 `/data/quran/*.json`, semua
   `/data/translations/{id,en}/*.json` (~5,7 MB).
3. **Ikon, font, `manifest.json`**.

Precache ini **tidak** bergantung pada `localStorage` atau kunjungan online;
ia berjalan sekali saat SW dipasang/diperbarui. Selama proses install, perangkat
**harus online** (instalasi PWA memang memerlukan koneksi awal).

### 6.2 Route dinamis via App Shell

`/surah/[id]` dan `/focus/[id]` adalah route **dinamis** (server-rendered
on-demand) — tidak ada HTML statis per-id untuk di-precache. Strategi:

- Precache **satu app-shell** (mis. dokumen `/surah/1` atau shell khusus) di
  `hanquran-shell-v1`.
- Untuk navigasi offline ke `/surah/<id>` / `/focus/<id>` yang **tidak** ada di
  cache, SW mengembalikan **app-shell** tersebut (bukan `offline.html`).
- Halaman membaca `id` dari **URL sisi-klien** (`parseSurahIdFromPathname(usePathname())`),
  lalu memuat data dari `hanquran-data-v1`. Dengan demikian satu shell melayani semua id.
- Mode Fokus tidak boleh menampilkan error boundary saat offline; data ayat
  diambil dari cache data yang sudah di-precache.

### 6.3 Manifest precache hasil build

Karena `/_next/static/*` memakai nama ber-hash, daftar precache **di-generate**
oleh skrip `postbuild` (mis. `scripts/generate-sw-precache.mjs`) yang memindai
output `.next` + `public/data`, lalu menulis berkas yang di-`importScripts`
`sw.js`. Tanpa ini, cold-start offline gagal karena chunk JS belum ter-cache.

### 6.4 Pencocokan RSC App Router (`_rsc`)

Navigasi SPA Next.js mengambil payload RSC dengan query `?_rsc=<hash>` yang
berubah per build. SW mencocokkan dengan `ignoreSearch: true` dan mengandalkan
header `Vary: RSC` untuk membedakan entri dokumen vs RSC pada URL yang sama.

---

## 7. Hubungan dengan Dokumen Lain

| Dokumen | Pembaruan |
|---------|-----------|
| `docs/23-static-dataset-architecture.md` | §7 Offline — merujuk dokumen ini |
| `docs/15-state-management.md` | §10.3, §12 — selaras lapisan cache |
| `docs/12-component-spec.md` | §11 AudioPlayer offline, § baru SurahOfflineDownload |
| `docs/07-api-integration.md` | §Offline Friendly, pesan UI |
| `docs/18-development-tasks.md` | Task implementasi UI offline |
| `docs/20-mvp-freeze.md` | Kriteria offline §9.3 |
| `docs/29-murotal-mode-spec.md` | Lintas surat offline |

---

## 8. Kriteria Penerimaan (QA)

- [ ] Online: Simpan Offline tampil dan berhasil mengunduh 1 surat.
- [ ] Online → offline: buka surat **tanpa** unduh audio → teks tampil, Play disabled, toast saat tap Play.
- [ ] Offline: tombol Simpan Offline **tidak** tampil.
- [ ] Online → unduh (Simpan Offline) → offline: audio diputar tanpa jaringan.
- [ ] Auto Download ON → play beberapa ayat online → offline: hanya ayat yang pernah diputar dapat diputar.
- [ ] Auto Download default OFF → play online → offline: ayat tidak tersedia kecuali Simpan Offline penuh.
- [ ] Cold start offline: Beranda tampil; **surat apa pun** (termasuk yang belum pernah dibuka) dapat dibuka & dibaca — bukan splash → home / «Anda sedang offline».
- [ ] Offline: buka **Tentang HanQuran** & **Mode Fokus** → halaman tampil normal (bukan «Anda sedang offline»).
- [ ] Focus Mode: aturan Play sama dengan Surah Detail.
- [ ] Murotal offline: tilawah berhenti otomatis + toast saat menuju surat yang audionya belum diunduh; next/prev lintas surat berperilaku sama.

---

## 9. Gap Implementasi (26 Juni 2026)

| Item | Dokumen | Status |
|------|---------|--------|
| Tombol Simpan Offline saat offline | §4.1 | ✅ Disembunyikan (`showDownloadUi`) |
| Play disabled + toast offline | §4.2 | ✅ `useAudioPlaybackGate` + `AppToastHost` |
| Murotal stop di batas offline | §3.2, §5.3 | ✅ `ensureTargetSurahPlayable` |
| SW `ignoreSearch` untuk RSC | §6.4 | ✅ |
| Precache app shell + `/_next/static/*` saat install | §6.1, §6.3 | ✅ `precacheOnInstall()` + manifest build |
| Manifest precache hasil build (`postbuild`) | §6.3 | ✅ `scripts/generate-sw-precache.mjs` |
| App-shell untuk route dinamis (baca id dari URL) | §6.2 | ✅ `parseSurahIdFromPathname` + fallback SW |
| Precache dataset penuh saat install | §6.1 | ✅ `__SW_PRECACHE__.data` |
| Auto download audio saat play (opt-in) | `docs/31-auto-download-audio-spec.md` | 📋 Belum diimplementasi — default OFF |
| Runtime cache audio saat play tanpa pengaturan ON | `docs/31` §6 | **Tidak** — hanya saat `autoDownloadOnPlay === true` atau Simpan Offline |

**Catatan verifikasi:** semua jalur di atas perlu diuji ulang di perangkat
(install SW saat online sekali → matikan jaringan → cold start). Service Worker
cache dinaikkan ke `*-v2` agar precache install berjalan ulang.

Task implementasi: `docs/18-development-tasks.md` Phase 5.

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 25 Juni 2026 | Dokumen awal — pemisahan konten baca vs audio, matriks UI, gap implementasi |
| 25 Juni 2026 | Precache penuh dataset + shell semua route, SW `ignoreSearch` RSC, batas Murotal offline |
| 26 Juni 2026 | **Revisi offline-first sejati**: precache app shell + `/_next/static/*` + dataset saat SW `install` (§6.1), manifest precache hasil build (§6.3), app-shell route dinamis via `useParams` (§6.2); §9 mencatat gap cold-start offline yang masih terbuka |

---

Dokumen ini disimpan sebagai `docs/30-offline-behavior-spec.md`.
