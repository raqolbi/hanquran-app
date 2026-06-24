# 20 — MVP Freeze & Scope Lock

## HanQuran V1

**Tanggal ditetapkan:** 15 Juni 2026
**Status:** 🔒 FROZEN — Berlaku sebelum Sprint 1 dimulai
**Otoritas:** Dokumen ini adalah referensi akhir untuk scope MVP. Tidak dapat dimodifikasi tanpa proses Change Control (Bagian 10).

---

# 1. Tujuan

Dokumen ini adalah **otoritas final** untuk menetapkan:

- Apa yang termasuk dalam MVP HanQuran V1
- Apa yang tidak termasuk dalam MVP
- Keputusan arsitektur yang dibekukan
- Struktur navigasi yang dibekukan
- Kondisi yang harus terpenuhi sebelum MVP dinyatakan selesai

Tujuan utama dokumen ini adalah **mencegah scope creep** dan **menghilangkan ambiguitas** sebelum Sprint 1 dimulai.

Dokumen ini tidak menggantikan dokumen sebelumnya. Perannya hanya membekukan scope dan mengkonsolidasikan keputusan final.

---

# 2. Tujuan MVP

MVP HanQuran V1 adalah:

> Aplikasi hafalan Al-Qur'an yang dapat berjalan offline, memungkinkan pengguna memilih surat, memutar audio per ayat, menggunakan sistem repeat untuk hafalan, membaca dalam Mode Fokus bebas distraksi, dan menyimpan preferensi secara lokal — tanpa memerlukan akun atau koneksi internet setelah data diunduh.

> **Pembaruan 24 Juni 2026:** Word-by-word highlight **tidak** termasuk MVP V1 — lihat `docs/24-focus-mode-mvp-scope.md`.

MVP berhasil jika pengguna dapat:

```
Buka aplikasi
↓
Pilih surat
↓
Putar audio
↓
Aktifkan Repeat
↓
Masuk Focus Mode
↓
Hafal tanpa gangguan
↓
Tutup → buka lagi → Lanjutkan dari posisi terakhir
```

---

# 3. Identitas Produk

## HanQuran adalah

- Platform hafalan Al-Qur'an berbasis audio dan pengulangan
- Dirancang untuk anak-anak, orang tua, dan penghafal Al-Qur'an
- Aplikasi offline-first yang berfungsi tanpa akun
- Open source — dapat digunakan oleh TPQ, madrasah, pesantren, dan komunitas

## HanQuran bukan

- Platform sosial atau komunitas
- Platform gamifikasi atau leaderboard
- Dashboard statistik atau analitik
- Platform eksplorasi tafsir atau kajian mendalam
- Layanan cloud atau sinkronisasi multi-perangkat (pada V1)

## Prinsip utama yang tidak dapat dikompromikan

| Prinsip | Makna |
|---------|-------|
| **Memorization First** | Semua keputusan produk dievaluasi berdasarkan: "Apakah ini membantu pengguna menghafal?" |
| **Mobile First** | Dirancang untuk layar kecil dan sentuhan, bukan desktop |
| **Offline First** | Setelah data diunduh, aplikasi tidak boleh bergantung pada koneksi internet |
| **Simplicity First** | Tidak ada registrasi. Tidak ada konfigurasi rumit. Buka → Pilih → Hafal |

---

# 4. Fitur MVP (Dalam Scope)

Berikut adalah seluruh fitur yang termasuk dalam MVP V1. Semua berasal dari Product Backlog yang sudah disetujui.

## 4.1 Daftar Surat (PB-001) — P0

- Menampilkan 114 surat dengan nomor, nama Arab, nama Latin, arti, jumlah ayat, dan tempat turun
- Dapat di-scroll dengan lancar
- Data diambil dari `public/data/*` via `services/quran/` (Static Dataset Architecture)

## 4.2 Membuka Surat / Surah Detail (PB-002) — P0

- Menampilkan bismillah (kecuali At-Taubah)
- Menampilkan seluruh ayat dengan font Uthmani
- Navigasi next/previous surat
- Header dengan nama surat aktif
- **Verse Display Controls:** `[Terjemahan] [Transliterasi] [Fokus]` — satu baris di bawah header
- Kontrol audio, repeat, dan navigasi Focus Mode

## 4.3 Terjemahan (PB-003) — P1

- Toggle terjemahan di Verse Display Controls ✅
- Default: tersembunyi ✅
- Bahasa terjemahan mengikuti `appLocale` (`id` / `en`) ✅
- Toggle state tersimpan di Dexie (`settings.translationVisible`) ✅

## 4.3b Transliterasi (PB-003b) — P1

- Toggle transliterasi di Verse Display Controls
- Default: tersembunyi
- Independen dari terjemahan; persisten di Dexie (`settings.transliterationVisible`)
- Urutan render: Arab → Transliterasi → Terjemahan

## 4.4 Audio Player (PB-004) — P0

- Putar, jeda, lanjutkan audio per ayat
- Progress bar audio
- Navigasi next/previous ayat
- Auto-advance ke ayat berikutnya
- Indikator ayat yang sedang diputar

## 4.5 Word-by-Word Highlight (PB-005) — ~~P0~~ Post-MVP

> **Dicabut dari MVP V1** (24 Juni 2026). Dataset `word_by_word` kosong; lihat `docs/24-focus-mode-mvp-scope.md`.

- ~~Setiap kata yang sedang dibaca ditandai secara real-time~~
- ~~Highlight sinkron dengan posisi audio~~
- Ditunda hingga sumber data word timing tersedia

## 4.6 Sistem Repeat (PB-006) — P0

Pengguna dapat mengatur:

**Target repeat:**
- Ayat aktif
- Range ayat (misal: Ayat 1–5)
- Seluruh surat

**Jumlah pengulangan:**

| Ikon | Jumlah |
|------|--------|
| 🐣 | 1× |
| 🐥 | 5× |
| 🐤 | 10× |
| 🦜 | 25× |
| 🦅 | 50× |
| ♾️ | Infinite |

Counter menampilkan target aktif dan jumlah tersisa. Repeat berjalan otomatis tanpa interaksi tambahan.

## 4.7 Focus Mode (PB-007) — P1

- Layar bebas distraksi: menampilkan satu ayat (Arab, transliterasi/terjemahan sesuai preferensi) ✅
- Sembunyikan daftar surat, navigasi utama, dan elemen non-esensial ✅
- Navigasi ayat sebelumnya/berikutnya dalam mode ✅
- **Audio per ayat** (play/pause, progress) via `FocusModePlayer` ✅
- **Repeat** — konfigurasi & otomasi sinkron dengan Surah Detail (`useSurahRepeatPlayback`) ✅
- **Ukuran teks Arab** mengikuti `settings.fontSize` ✅
- **Tanpa** word-by-word highlight pada MVP V1
- Route: `/focus/[id]?ayah=[n]` ✅

## 4.8 Last Read / Lanjutkan Hafalan (PB-008) — P1

- Posisi terakhir (surat + ayat) disimpan otomatis di Dexie `lastRead` — `usePersistLastViewed` di Surah Detail & Focus ✅
- Kartu "Lanjutkan Hafalan" di Home — `ContinueReadingSection`; hanya tampil jika `lastViewed` ada ✅
- Tidak memerlukan akun atau login

## 4.9 Favorit Surat (PB-009) — P2

- Tombol favorit di setiap surat — Beranda (`SurahCard`) & Surah Detail (`SurahDetailHeader`) ✅
- Filter "Favorit" tersedia di Home ✅
- Disimpan di Dexie `favorites` via `useUserStore.toggleFavorite` ✅
- Persisten antar sesi — end-to-end ✅

## 4.10 Offline Cache (PB-010) — P0

- Unduh audio per surat via **Simpan Offline** di Surah Detail ✅
- Cache Storage untuk file audio ✅
- Service Worker untuk caching aset statis & runtime ✅
- Indikator status offline di UI ✅
- Download manifest di Dexie `downloadManifest` (reciter-aware) ✅
- Hapus cache — UI ada; logika belum
- Verifikasi pemutaran offline end-to-end — belum

## 4.11 PWA Setup (PB-011) — P0

- `manifest.json` tersedia
- Service Worker terdaftar
- Dapat diinstal di perangkat (Add to Home Screen)
- Ikon aplikasi, splash screen, dan tema warna

## 4.12 Mobile Responsive (PB-013) — P0

- Berfungsi di Android phone, iPhone, dan tablet
- Touch target minimum 44×44 px
- Portrait dan landscape

## 4.13 Pengaturan (Settings)

- **Bahasa aplikasi** (Bahasa Indonesia / English) — `next-intl`, persisten di `settings.appLocale` ✅
- Pilih qari ✅
- Ukuran teks Arab ✅ (persisten `settings.fontSize`, diterapkan di Surah Detail & Focus)
- Toggle terjemahan global (konten ayat — di Verse Display Controls, bukan Pengaturan) ✅
- Toggle transliterasi global (Verse Display Controls) ✅
- Hapus cache ✅ — `services/cache-manager.ts`, konfirmasi di Settings
- Status offline ✅
- Aksesibilitas dasar — kontras tinggi & animasi halus persisten (`contrastMode`, `smoothAnimation`); diterapkan global via `AccessibilityProvider` ✅

## 4.14 Lighthouse & Aksesibilitas (PB-012, PB-014) — P2

- Performance ≥ 80
- Accessibility ≥ 80
- PWA ≥ 80
- First load < 3 detik di jaringan 3G

---

# 5. Fitur di Luar MVP (Out Of Scope)

Fitur-fitur berikut **tidak boleh dikerjakan** dalam MVP. Seluruh request terkait fitur ini harus dikategorikan sebagai Post-MVP, Growth Phase, atau Future Vision.

## 5.1 Akun & Otentikasi

- Registrasi pengguna
- Login / Logout
- OAuth (Google, Apple, Facebook)
- Profile pengguna

## 5.2 Sinkronisasi Cloud

- Penyimpanan data di server
- Sinkronisasi progress antar perangkat
- Backup & restore via cloud
- Multi-device sync

## 5.3 Fitur Sosial & Komunitas

- Berbagi hafalan
- Komentar atau diskusi
- Forum atau chat
- Leaderboard publik

## 5.4 Gamifikasi

- Poin atau XP
- Badge atau trofi
- Streak tracking yang kompleks
- Reward system

## 5.5 Analitik & Statistik Lanjutan

- Dashboard statistik hafalan
- Laporan perkembangan
- Export data CSV/PDF
- Heatmap aktivitas

## 5.6 Fitur Hafalan Lanjutan (Growth Phase)

- Murajaah otomatis berbasis algoritma
- Target hafalan harian/mingguan
- Progress tracker per juz atau per halaman mushaf
- Catatan hafalan (Notes)
- Bookmark per ayat (bukan favorit surat)

## 5.7 Konten Tambahan

- Tafsir
- Asbabun Nuzul
- Kajian tematik
- Multiple bahasa terjemahan
- Audio lebih dari satu qari per surat secara simultan

## 5.8 Fitur Platform Masa Depan

- API publik untuk developer
- Plugin atau ekstensi
- White-label untuk pesantren
- Modul guru-murid

---

# 6. Pembekuan Navigasi

Navigasi MVP terdiri dari **empat halaman** berikut. Tidak ada route tambahan yang termasuk MVP.

| Route | Nama Halaman | Tujuan |
|-------|--------------|--------|
| `/` | Beranda (Home) | Daftar surat, pencarian, filter favorit, kartu "Lanjutkan Hafalan" |
| `/surah/[id]` | Detail Surat | Tampilan ayat, audio player, repeat system, tombol Focus Mode |
| `/focus/[id]` | Mode Fokus | Layar baca bebas distraksi (satu ayat; tanpa word highlight MVP) |
| `/settings` | Pengaturan | Bahasa UI, qari, ukuran teks, cache, aksesibilitas |

Query parameter yang diizinkan:
- `/surah/[id]?ayah=[n]` — membuka halaman pada ayat tertentu
- `/focus/[id]?ayah=[n]` — memulai Focus Mode dari ayat tertentu

## Route yang direkomendasikan tetapi bukan MVP

Route berikut muncul sebagai rekomendasi di `docs/14` tetapi **tidak termasuk** MVP:

- `/favorites` — manajemen halaman favorit terpisah
- `/search` — halaman pencarian penuh
- `/offline` — halaman manajemen cache
- `/profile` — profil pengguna

Route ini tidak boleh dibuat dalam Sprint 1–5.

## Diagram navigasi yang dibekukan

```
Home (/)
  ├── Surah Detail (/surah/[id])
  │     └── Focus Mode (/focus/[id])
  └── Pengaturan (/settings)
```

Alur navigasi canonical:

```
/ → /surah/2 → /focus/2?ayah=5 → /surah/2?ayah=5
           ↓
       /settings
```

---

# 7. Pembekuan Teknis

Seluruh keputusan teknis berikut adalah **final untuk MVP**. Tidak dapat diganti tanpa Change Control.

## 7.1 Frontend

| Teknologi | Versi / Catatan |
|-----------|-----------------|
| **Next.js App Router** | Framework utama, folder `app/` |
| **TypeScript** | Wajib di seluruh codebase |
| **Tailwind CSS** | Sistem styling |
| **shadcn/ui** | Komponen UI primitif |

## 7.2 State Management

| Layer | Teknologi |
|-------|-----------|
| **Runtime State** | **Zustand** — Active Surah, Active Ayah, Audio State, Repeat State, UI State, Session State |
| **URL State** | Next.js App Router — Route param & query string |
| **Local UI State** | `useState` / `useReducer` — State sementara di dalam komponen |

React Context tidak digunakan sebagai state management utama.

## 7.3 Persistensi

| Teknologi | Digunakan untuk |
|-----------|-----------------|
| **Dexie (IndexedDB)** | Settings, Favorites, Last Read, Download Manifest — **bukan** konten Quran |
| **Cache Storage API** | Audio MP3, Static Assets, Offline Assets |

`localForage` dan `localStorage` **tidak digunakan** sebagai primary persistence.

Dexie schema **v2** — hanya data pengguna (+ Growth tables):

```
settings, favorites, lastRead, downloadManifest,
bookmarks*, memorization_progress*, murajaah_sessions*,
statistics*, notes*
```

> Tabel konten Quran (`surahs`, `ayahs`, dll.) **dihapus** di v2. Lihat `docs/23-static-dataset-architecture.md`.

## 7.4 Data Source

| Sumber | Peran |
|--------|-------|
| **Dataset statis (`public/data/*`)** | **Satu-satunya** source of truth konten Quran |
| **CDN audio tilawah** | Sumber audio per ayat (`AYAH_AUDIO_BASE_URL`) |
| **`data/reciters.json`** | Metadata qari yang didukung |

## 7.5 Arsitektur

**Static Dataset Architecture** — konten Quran:

```
UI → hooks → services/quran/ → public/data/*
```

**Data pengguna:**

```
UI → Store (Zustand) → Dexie
```

Dilarang mengakses Dexie atau `public/data/` langsung dari komponen UI.

## 7.6 PWA

| Teknologi | Tujuan |
|-----------|--------|
| **Service Worker** | Caching runtime, offline support |
| **Workbox** | Strategi caching |
| **Web App Manifest** | Installable PWA |

## 7.7 Struktur Folder

Mengikuti `docs/16-folder-structure.md`:

```
app/           — Next.js App Router pages
components/    — Komponen UI
stores/        — Zustand stores
services/
  db/          — Dexie setup & migrations
  api/         — Repository Layer
  audio-controller/
  download-manager/
hooks/         — Custom React hooks
lib/           — Utilitas, types, routes helper
```

Struktur feature-first tidak digunakan.

---

# 8. Pembekuan Desain

Seluruh keputusan visual dan UX berikut dibekukan berdasarkan `docs/08`, `docs/09`, dan `docs/10`.

## 8.1 Prinsip Desain yang Dibekukan

| Prinsip | Penerapan |
|---------|-----------|
| **Memorization First** | Teks Arab selalu jadi elemen paling dominan. Dekorasi tidak boleh mengganggu keterbacaan ayat |
| **Arabic Text Dominance** | Font Uthmani, ukuran besar, kontras tinggi, latar bersih |
| **Repeat Controls Visibility** | Kontrol repeat harus selalu terlihat dan mudah dijangkau dengan satu tangan |
| **Calm Interface** | Tidak ada warna jenuh, animasi agresif, atau shadow berlebihan |
| **Mobile First** | Layout dirancang untuk layar 375px lebih dulu, kemudian diperluas ke tablet |

## 8.2 Hierarki Visual yang Dibekukan

```
1. Teks Al-Qur'an
2. Audio & Repeat controls
3. Navigasi
4. Dekorasi
```

Jika terjadi konflik antara elemen visual, selalu prioritaskan keterbacaan ayat.

## 8.3 Komponen yang Dibekukan

36 komponen existing di `hanquran-v1-design/` adalah fondasi implementasi. Modifikasi struktural terhadap komponen existing harus mengacu pada `docs/12-component-spec.md`.

## 8.4 Figma / High-Fidelity yang Dibekukan

Desain layar yang sudah final di `docs/10-high-fidelity-ui.md` adalah referensi visual MVP. Tidak ada redesain navigasi atau perubahan layout utama yang diperbolehkan dalam MVP.

---

# 9. Definisi Selesai MVP

MVP HanQuran V1 dinyatakan **selesai** hanya jika seluruh kondisi berikut terpenuhi.

## 9.1 Core Flows

- [x] Pengguna dapat membuka daftar 114 surat dan menavigasi ke surat manapun
- [x] Pengguna dapat memutar audio per ayat dengan play/pause/seek yang reliabel di mobile
- [x] Pengguna dapat mengaktifkan repeat (1×/5×/10×/25×/50×/∞) untuk ayat aktif, range ayat, atau seluruh surat
- [x] Repeat berjalan otomatis sesuai konfigurasi tanpa interaksi tambahan
- [x] Focus Mode menampilkan satu ayat dalam layout bebas distraksi dengan data nyata
- [x] Navigasi ayat di Focus Mode (`/focus/[id]`) berfungsi tanpa keluar dari mode
- [x] "Lanjutkan Hafalan" tersedia di Home dan membuka posisi terakhir yang tersimpan

## 9.2 Data & State

- [x] Data surat dimuat dari `public/data/*` via `services/quran/`
- [x] Cache in-memory per sesi — tidak perlu Dexie untuk konten Quran
- [x] Preferensi pengguna (bahasa UI, qari, ukuran teks, terjemahan ayat, konfigurasi repeat) tersimpan di Dexie dan persisten antar sesi
- [x] Bahasa UI (`settings.appLocale`: `id` | `en`) dapat diubah di Pengaturan dan memperbarui seluruh label aplikasi via `next-intl`
- [x] Arti surat & terjemahan ayat mengikuti `appLocale` (`getSurahMeaning`, `lib/translation-language.ts`)
- [x] Posisi terakhir (surat + ayat) tersimpan otomatis di Dexie `lastRead`
- [x] Favorit surat persisten di Dexie — `toggleFavorite` di Beranda & Surah Detail

## 9.3 Offline & PWA

- [ ] Minimal 1 surat dapat diunduh dan diputar saat perangkat offline — infrastruktur unduh ✅; verifikasi playback belum
- [ ] Aplikasi dapat diinstal sebagai PWA di perangkat Android dan iOS
- [ ] Offline shell dapat dimuat tanpa koneksi internet
- [x] Indikator status offline tersedia di UI

## 9.4 Kualitas

- [ ] Semua P0 tasks di Phase 0–6 (`docs/18`) sudah selesai
- [x] Unit tests untuk audio controller dan repeat engine passing
- [ ] Integration & E2E tests untuk core flows passing
- [ ] Tidak ada P0 blocker yang tersisa
- [ ] Skor Lighthouse ≥ 80 untuk Performance, Accessibility, Best Practices, PWA
- [ ] Tidak ada critical regression di audio playback, repeat, atau offline mode

## 9.5 Release

- [ ] Staging environment siap dan telah diuji
- [ ] Error tracking terpasang
- [ ] Release notes ditulis
- [ ] Rollout plan tersedia

---

# 10. Kebijakan Change Control

## Setelah dokumen ini disetujui, berlaku aturan berikut:

### Penambahan fitur baru

Setiap permintaan fitur baru setelah dokumen ini disetujui **harus diklasifikasikan** sebagai salah satu dari:

| Klasifikasi | Kondisi |
|-------------|---------|
| **Post-MVP** | Diperlukan segera setelah MVP release, namun tidak memblokir MVP |
| **Growth Phase** | Fitur yang mendukung platform hafalan lanjutan (Progress, Murajaah, Statistik, Catatan) |
| **Future Vision** | Fitur jangka panjang (Akun, Sinkronisasi, Multi-device, Komunitas) |

Tidak ada fitur yang boleh masuk scope MVP tanpa:

1. Review formal oleh product owner
2. Justifikasi bahwa fitur tersebut **memblokir** salah satu kondisi di Bagian 9
3. Persetujuan tertulis yang terdokumentasi

### Perubahan arsitektur teknis

Perubahan terhadap keputusan arsitektur yang dibekukan di Bagian 7 memerlukan:

1. Analisis dampak terhadap seluruh komponen terdampak
2. Update pada dokumen yang relevan (`docs/15`, `docs/16`, `docs/18`, dll.)
3. Persetujuan sebelum implementasi dimulai

### Perubahan desain

Perubahan terhadap keputusan desain yang dibekukan di Bagian 8 memerlukan:

1. Update `docs/08`, `docs/09`, atau `docs/10` terlebih dahulu
2. Update `docs/12-component-spec.md` jika komponen terdampak
3. Tidak ada perubahan navigasi utama yang diperbolehkan dalam MVP

## Ringkasan klasifikasi fitur yang sudah diputuskan

| Fitur | Klasifikasi |
|-------|-------------|
| Login / Akun | Future Vision |
| Cloud Sync | Future Vision |
| Murajaah otomatis | Growth Phase |
| Progress hafalan lanjutan | Growth Phase |
| Catatan hafalan | Growth Phase |
| Bookmark per ayat | Growth Phase |
| Statistik & dashboard | Growth Phase |
| Komunitas / sosial | Future Vision |
| Multi-device sync | Future Vision |
| Tafsir / kajian | Post-MVP |
| `/favorites` route | Post-MVP |
| `/search` route | Post-MVP |
| `/offline` route | Post-MVP |

---

# 11. Deklarasi Freeze

Dokumen ini menyatakan bahwa seluruh keputusan berikut adalah **final dan dibekukan** per 15 Juni 2026:

---

## ✅ Scope Freeze

MVP HanQuran V1 terdiri dari 14 product backlog item (PB-001 s.d. PB-014) sebagaimana didefinisikan di `docs/02-product-backlog.md` dan dijabarkan di Bagian 4 dokumen ini.

Tidak ada fitur tambahan yang boleh masuk MVP tanpa Change Control (Bagian 10).

---

## ✅ Navigation Freeze

Empat route berikut adalah satu-satunya halaman MVP:

```
/             — Home
/surah/[id]   — Detail Surat
/focus/[id]   — Mode Fokus
/settings     — Pengaturan
```

Tidak ada route lain yang termasuk MVP.

---

## ✅ Technical Freeze

| Keputusan | Teknologi yang Dibekukan |
|-----------|--------------------------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Runtime State | Zustand |
| Persistent DB | Dexie (IndexedDB) |
| Audio Cache | Cache Storage API |
| Data Source | Dataset statis `public/data/*` + CDN audio tilawah |
| UI Locale | Bahasa Indonesia (`id`) & English (`en`) via **next-intl** |
| Architecture | Local First + Repository Pattern |

---

## ✅ Design Freeze

Desain visual dan UX dibekukan sesuai:
- `docs/08-ui-ux-wireframe.md`
- `docs/09-design-system.md`
- `docs/10-high-fidelity-ui.md`

Prinsip yang tidak dapat dikompromikan: **Memorization First, Mobile First, Offline First, Arabic Text Dominance, Repeat Controls Visibility**.

---

## ✅ Architecture Freeze

Dokumentasi arsitektur yang menjadi acuan tunggal:

| Dokumen | Peran |
|---------|-------|
| `docs/04-system-architecture.md` | System architecture & component tree |
| `docs/06-database-schema.md` | Dexie schema, 13 tabel, indexing, migration |
| `docs/07-api-integration.md` | Service layer, Static Dataset flow |
| `docs/23-static-dataset-architecture.md` | Keputusan arsitektur konten Quran MVP |
| `docs/21-i18n-and-locale.md` | Lokalisasi UI (`next-intl`, id/en) |
| `docs/14-routing-spec.md` | Route spec & navigasi |
| `docs/15-state-management.md` | 5-layer state architecture |
| `docs/16-folder-structure.md` | Struktur folder proyek |
| `docs/17-implementation-roadmap.md` | Fase & urutan implementasi |
| `docs/18-development-tasks.md` | 81 tasks, MVP checklist, Definition of Done |

---

**Seluruh Sprint 1 s.d. Sprint 5 harus mengacu pada dokumen ini.**

Dokumen ini disimpan di `docs/20-mvp-freeze.md` dan tidak boleh diperbarui kecuali melalui proses Change Control yang terdokumentasi.
