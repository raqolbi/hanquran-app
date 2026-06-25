# 30 — Spesifikasi Perilaku Mode Offline

**Tanggal:** 25 Juni 2026  
**Status:** ✅ Spesifikasi resmi (implementasi UI selaras — lihat §9)  
**Mengacu:** `docs/23-static-dataset-architecture.md`, `docs/15-state-management.md` §12, `docs/12-component-spec.md`

---

## 1. Prinsip Inti

HanQuran memisahkan **dua lapisan offline** yang tidak boleh dicampur:

| Lapisan | Apa yang di-cache | Kapan tersedia offline | Aksi pengguna |
|---------|-------------------|------------------------|---------------|
| **Konten baca** (teks Arab, transliterasi, terjemahan, metadata surat) | Aset statis `public/data/*` via Service Worker (`hanquran-data-v1`, cache-first) + cache in-memory sesi | Setelah pernah dimuat saat online **atau** setelah precache saat **Simpan Offline** | **Tidak** perlu unduh manual per surat hanya untuk membaca |
| **Audio tilawah** | File MP3 CDN di `hanquran-audio-v1` | Hanya setelah **Simpan Offline** surat + qari aktif (`downloadManifest.status === 'ready'`) | Wajib unduh eksplisit per surat |

**Kesimpulan bagi pengguna:**

- Offline + buka surat → **harus tetap bisa membaca** ayat (selama dataset sudah pernah di-cache SW).
- Offline + audio belum disimpan → **baca OK, putar audio tidak**.
- Yang butuh jaringan saat online: **streaming audio CDN** dan **proses unduh audio**.

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
- Beranda memuat daftar surat → memicu fetch 114 file quran (dan terjemahan sesuai locale) → SW mengisi cache data.
- Surat yang pernah dibuka saat online juga ter-cache.
- **Precache penuh:** saat pertama online, `precacheAppForOffline()` mengisi cache untuk **seluruh** dataset + shell route sehingga setiap surat dapat dibaca offline meski belum pernah dibuka (lihat §6.1).

### 2.2 Audio tilawah (CDN)

```text
everyayah.com/.../*.mp3
        ↓
Service Worker: hanquran-audio-v1 (cache-first)
        ↓
Dexie downloadManifest (metadata: surahId + reciterId, status ready)
```

- Unduhan eksplisit via **Simpan Offline** di Surah Detail.
- Saat unduh selesai, precache juga shell route `/surah/[id]` + data JSON surat tersebut (`services/offline-surah-precache.ts`).

### 2.3 Preferensi pengguna

Dexie (`settings`, `favorites`, `lastRead`, dll.) — selalu lokal, tidak bergantung jaringan.

---

## 3. Matriks Perilaku

| Koneksi | Audio surat+qari | Buka Surah Detail / Focus | Tombol Play | Tombol Simpan Offline |
|---------|------------------|---------------------------|-------------|------------------------|
| Online | Belum diunduh | ✅ Baca + stream audio | ✅ Stream CDN | ✅ Tampil |
| Online | Sudah diunduh | ✅ Baca + stream/cache | ✅ | ❌ Sembunyi (badge «Siap offline» di header) |
| Offline | Belum diunduh | ✅ Baca (dataset di-precache penuh) | ❌ Disabled | ❌ **Sembunyi** (hanya online) |
| Offline | Sudah diunduh | ✅ Baca + putar dari cache | ✅ Dari cache | ❌ Sembunyi |

### 3.1 Mode Fokus

Aturan identik Surah Detail: teks ayat selalu dapat dibaca; audio mengikuti baris matriks di atas.

### 3.2 Mode Murotal saat offline

- Hanya berlaku untuk surat yang **audio-nya sudah diunduh** untuk qari aktif.
- Lintas surat: surat tujuan harus `downloadManifest.ready` untuk qari yang sama; jika tidak → stop + feedback (bukan crash).
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

### 5.3 Mendengarkan offline (sudah disimpan)

```text
Pengguna offline → buka surat yang pernah disimpan
  → Play aktif → audio dari Cache Storage
  → Repeat & Murotal (dalam batas cache) berfungsi
  → Murotal/next/prev menuju surat yang BELUM disimpan → otomatis berhenti + toast
```

**Aturan batas Murotal offline:** ketika tilawah berlanjut (atau pengguna menekan
next/prev) menuju **surat lain** yang audionya belum tersedia offline, pemutaran
**berhenti otomatis** (`pause`) dan menampilkan toast. Berpindah surat untuk
**dibaca** tetap diizinkan (teks tersedia offline). Lihat
`hooks/use-surah-repeat-playback.ts` (`ensureTargetSurahPlayable`).

---

## 6. Service Worker (ringkasan)

| Cache | Isi | Strategi |
|-------|-----|----------|
| `hanquran-data-v1` | `/data/*` (seluruh dataset di-precache) | cache-first |
| `hanquran-audio-v1` | MP3 CDN | cache-first |
| `hanquran-shell-v1` | HTML navigasi + RSC App Router | network-first / stale-while-revalidate (`ignoreSearch`) |
| `hanquran-static-v1` | `/_next/static/*`, font, ikon | stale-while-revalidate |

**Jangan** fallback navigasi `/surah/*` ke HTML Beranda — menyebabkan splash + kembali ke home (bug yang diperbaiki 25 Juni 2026).

### 6.1 Precache penuh konten baca (Offline First)

Dataset teks **kecil (~5,7 MB)**, sehingga seluruhnya di-precache saat pertama
online agar **setiap surat dapat dibaca offline** tanpa perlu diunduh:

- `services/offline-app-precache.ts` → `precacheAppForOffline()` dipanggil dari
  `initStores()` (hanya saat online, sekali per versi dataset via flag
  `localStorage`).
- Yang di-precache: `manifest.json`, semua `/data/quran/*.json`, semua
  `/data/translations/{id,en}/*.json`, serta **shell semua route** (home,
  settings, about, `/surah/[id]`, `/focus/[id]`) — dokumen + payload RSC.
- Service Worker memproses batch (`cache-offline-batch`) dengan konkurensi
  terbatas.

### 6.2 Pencocokan RSC App Router (`_rsc`)

Navigasi SPA Next.js mengambil payload RSC dengan query `?_rsc=<hash>` yang
berubah per build. SW mencocokkan dengan `ignoreSearch: true` dan mengandalkan
header `Vary: RSC` untuk membedakan entri dokumen vs RSC pada URL yang sama.
Tanpa ini, navigasi ke route yang sudah di-precache tetap jatuh ke
`offline.html`.

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
- [ ] Online → unduh → offline: audio diputar tanpa jaringan.
- [ ] Cold start offline: Beranda tampil; **surat apa pun** (termasuk yang belum pernah dibuka) dapat dibuka & dibaca — bukan splash → home / «Anda sedang offline».
- [ ] Offline: buka **Tentang HanQuran** & **Mode Fokus** → halaman tampil normal (bukan «Anda sedang offline»).
- [ ] Focus Mode: aturan Play sama dengan Surah Detail.
- [ ] Murotal offline: tilawah berhenti otomatis + toast saat menuju surat yang audionya belum diunduh; next/prev lintas surat berperilaku sama.

---

## 9. Gap Implementasi (25 Juni 2026)

| Item | Dokumen | Status |
|------|---------|--------|
| Tombol Simpan Offline saat offline | §4.1 | ✅ Disembunyikan (`showDownloadUi`) |
| Play disabled + toast offline | §4.2 | ✅ `useAudioPlaybackGate` + `AppToastHost` |
| Navigasi surat/route apa pun offline | §6 | ✅ Precache penuh + SW `ignoreSearch` |
| Baca seluruh surat offline tanpa unduh | §3, §6.1 | ✅ `precacheAppForOffline()` |
| Murotal stop di batas offline | §3.2, §5.3 | ✅ `ensureTargetSurahPlayable` |
| `docs/15` §12.1 menyebut Dexie untuk konten Quran | — | ✅ Dikoreksi di `docs/15` |
| Runtime cache audio saat pertama play (online) | `docs/15` §12.1 | **Tidak** diimplementasi — hanya unduh eksplisit |

Task implementasi: `docs/18-development-tasks.md` Phase 5 (pembaruan 25 Juni 2026).

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 25 Juni 2026 | Dokumen awal — pemisahan konten baca vs audio, matriks UI, gap implementasi |
| 25 Juni 2026 | Precache penuh dataset + shell semua route (§6.1), SW `ignoreSearch` RSC (§6.2), batas Murotal offline (§5.3) |

---

Dokumen ini disimpan sebagai `docs/30-offline-behavior-spec.md`.
