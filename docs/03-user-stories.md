# User Stories

## HanQuran V1

---

# Persona Reference

| Persona | Siapa | Tujuan Utama |
|---------|-------|--------------|
| 🧒 Anak | 3-12 tahun | Menghafal surat pendek dengan bantuan orang tua |
| 👨‍👩‍👧 Orang Tua | Pendamping | Membantu anak menghafal dengan mudah |
| 📖 Penghafal | Santri/Mahasiswa | Murojaah harian dan hafalan mandiri |
| 🏫 Komunitas | TPQ/Madrasah/Pesantren | Alat bantu mengajar hafalan |

---

# Epic 1: Quran Reader

---

## US-001: Melihat Daftar Surat

**Sebagai** semua pengguna
**Saya ingin** melihat daftar seluruh surat Al-Qur'an
**Sehingga** saya dapat memilih surat yang ingin saya baca atau hafal.

### Acceptance Criteria

1. Daftar 114 surat ditampilkan
2. Setiap surat menampilkan:
   - Nomor surat
   - Nama Arab
   - Nama Latin
   - Arti nama dalam Bahasa Indonesia
   - Jumlah ayat
   - Tempat turun (Makkiyah/Madaniyah)
3. Daftar dapat di-scroll dengan lancar
4. Loading state ditampilkan saat fetch data
5. Error state ditampilkan jika fetch gagal

### Linked PB

PB-001

### Priority

P0 — Must Have

---

## US-002: Membuka Surat dan Melihat Ayat

**Sebagai** semua pengguna
**Saya ingin** membuka surat dan melihat seluruh ayatnya
**Sehingga** saya dapat membaca dan memulai hafalan.

### Acceptance Criteria

1. Bismillah ditampilkan di awal (kecuali Surat At-Taubah)
2. Seluruh ayat ditampilkan dengan teks Arab font Uthmani
3. Nomor ayat tampil di setiap ayat
4. Header menampilkan nama surat
5. Tombol kembali ke daftar surat berfungsi
6. Navigasi ke surat sebelum dan sesudahnya tersedia

### Linked PB

PB-002

### Priority

P0 — Must Have

---

## US-003: Menampilkan Terjemahan

**Sebagai** semua pengguna
**Saya ingin** melihat terjemahan ayat dalam Bahasa Indonesia
**Sehingga** saya dapat memahami makna ayat yang sedang saya hafal.

### Acceptance Criteria

1. Terjemahan default tersembunyi
2. Toggle Terjemahan di **Verse Display Controls** (baris horizontal di bawah header surat) — selalu terlihat
3. Terjemahan dalam Bahasa Indonesia
4. Toggle bersifat global (berlaku untuk semua ayat)
5. State toggle tersimpan secara lokal di perangkat dan tetap sesuai pilihan terakhir
6. Urutan render saat aktif: Arab → Transliterasi (jika ON) → Terjemahan

### Linked PB

PB-003

### Priority

P1 — Should Have

---

## US-003b: Menampilkan Transliterasi

**Sebagai** semua pengguna
**Saya ingin** melihat transliterasi ayat
**Sehingga** saya dapat membantu pengucapan saat menghafal.

### Acceptance Criteria

1. Transliterasi default tersembunyi
2. Toggle Transliterasi di **Verse Display Controls** — selalu terlihat, satu baris dengan Terjemahan dan Fokus
3. Independen dari toggle Terjemahan
4. Toggle bersifat global
5. State tersimpan di Dexie (`settings.transliterationVisible`)
6. Urutan render: Arab → Transliterasi → Terjemahan (jika keduanya ON)

### Linked PB

PB-003b

### Priority

P1 — Should Have

---

# Epic 2: Audio & Memorization

---

## US-004: Memutar Audio Bacaan

**Sebagai** semua pengguna
**Saya ingin** mendengarkan audio bacaan ayat
**Sehingga** saya dapat meniru bacaan qari dengan benar.

### Acceptance Criteria

1. Tombol Play tersedia di setiap ayat
2. Audio dapat di-pause dan di-resume
3. Otomatis lanjut ke ayat berikutnya setelah selesai
4. Tombol next/previous untuk navigasi ayat
5. Progress bar menunjukkan posisi audio
6. Ayat yang sedang diputar ditandai secara visual

### Linked PB

PB-004

### Priority

P0 — Must Have

---

## US-004b: Kontrol Audio dari Lock Screen

**Sebagai** 📖 Penghafal
**Saya ingin** melihat informasi surat dan ayat serta mengontrol Play/Pause dari lock screen
**Sehingga** saya dapat melanjutkan hafalan tanpa harus membuka aplikasi terus-menerus.

### Acceptance Criteria

1. Saat audio diputar, lock screen (atau kontrol media OS) menampilkan nama surat dan nomor ayat — di platform yang mendukung
2. Nama qari tampil sebagai informasi pendamping
3. Tombol Play/Pause di lock screen mengontrol pemutaran yang sama dengan aplikasi
4. Mengganti ayat memperbarui metadata
5. Jika perangkat tidak mendukung Media Session API, aplikasi tetap berfungsi normal

### Linked PB

PB-016

### Priority

P1 — Should Have (Post-MVP)

### Spesifikasi

`docs/27-media-session-api-spec.md`

---

## US-005: Highlight Kata per Kata

**Sebagai** 🧒 Anak
**Saya ingin** melihat kata yang sedang dibaca ditandai dengan warna berbeda
**Sehingga** saya bisa mengikuti bacaan kata demi kata dan lebih mudah menghafal.

**Sebagai** 📖 Penghafal
**Saya ingin** highlight mengikuti tepat di kata yang sedang dibaca qari
**Sehingga** saya tahu persis posisi bacaan dan dapat mengoreksi pelafalan saya.

### Acceptance Criteria

1. Kata aktif berubah warna (misal: hijau/highlight)
2. Highlight bergerak mengikuti audio secara real-time
3. Transisi antar kata halus, tidak melompat
4. Bekerja di semua ayat yang memiliki word timing
5. Jeda antar ayat ditangani dengan baik (highlight tidak stuck)

### Linked PB

PB-005

### Priority

P0 — Must Have

---

## US-006: Mengulang Hafalan (Repeat)

**Sebagai** 🧒 Anak (3-12 tahun)
**Saya ingin** menekan tombol bergambar hewan untuk mengulang ayat
**Sehingga** saya tidak bingung dan bisa menghafal sambil senang.

**Sebagai** 📖 Penghafal
**Saya ingin** memilih jumlah pengulangan yang fleksibel
**Sehingga** saya bisa menyesuaikan jumlah repeat dengan target hafalan harian.

### Acceptance Criteria

1. User dapat memilih target:
   - Ayat
   - Range Ayat
   - Surat
2. Pilihan repeat: 1x, 5x, 10x, 25x, 50x, Infinite (♾️)
3. UI ramah anak menggunakan ikon:
   - 🐣 1x
   - 🐥 5x
   - 🐤 10x
   - 🦜 25x
   - 🦅 50x
   - ♾️ Infinite
4. Counter menampilkan sesuai target aktif dan jumlah tersisa, contoh:
    Al-Ikhlas • 2x tersisa
    Ayat 3 • 5x tersisa
    Ayat 1-5 • 3x tersisa
5. Repeat berjalan otomatis setelah audio selesai
6. User dapat menghentikan repeat kapan saja
7. Saat infinite, audio terus berulang sampai user stop

### Linked PB

PB-006

### Priority

P0 — Must Have

---

## US-007: Mode Fokus Menghafal

**Sebagai** 📖 Penghafal
**Saya ingin** layar hanya menampilkan elemen penting untuk hafalan
**Sehingga** saya tidak terdistraksi dan bisa fokus penuh pada ayat.

### Acceptance Criteria

1. Mode fullscreen
2. Hanya menampilkan: ayat (sesuai preferensi Terjemahan/Transliterasi), audio, repeat, indikator progress hafalan minimal
3. Semua navigasi dan elemen non-esensial tersembunyi
4. Tombol Fokus di Verse Display Controls untuk masuk; tombol Keluar untuk keluar
5. Satu sentuhan untuk kembali ke tampilan normal
6. **Mode Fokus mempertahankan** state Terjemahan dan Transliterasi — tidak mengubah preferensi konten
7. Urutan konten ayat: Arab → Transliterasi (jika ON) → Terjemahan (jika ON)

### Linked PB

PB-007

### Priority

P1 — Should Have

---

# Epic 3: Persistence & Offline

---

## US-008: Melanjutkan Bacaan Terakhir

**Sebagai** 📖 Penghafal
**Saya ingin** membuka aplikasi dan mudah melanjutkan ke surat dan ayat terakhir yang saya baca
**Sehingga** saya tidak perlu mencari-cari lagi posisi hafalan saya kemarin.

**Sebagai** 🧒 Anak
**Saya ingin** aplikasi menampilkan jalan cepat ke surat yang kemarin saya hafal
**Sehingga** saya bisa melanjutkan hafalan tanpa bantuan orang tua.

### Acceptance Criteria

1. Surat terakhir otomatis tersimpan
2. Ayat terakhir otomatis tersimpan
3. Saat aplikasi dibuka kembali, tersedia entry point "Lanjutkan bacaan terakhir" yang membuka posisi terakhir
4. Tidak memerlukan login/registrasi
5. Data bertahan meskipun browser ditutup

### Linked PB

PB-008

### Priority

P1 — Should Have

---

## US-009: Menandai Surat Favorit

**Sebagai** 👨‍👩‍👧 Orang Tua
**Saya ingin** menandai surat-surat pendek yang sedang dihafal anak saya
**Sehingga** saya bisa membukanya dengan cepat tanpa scroll panjang.

### Acceptance Criteria

1. Tombol favorit (bintang/heart) di setiap surat
2. Tab atau filter untuk "Favorit" di daftar surat utama
3. Favorit tersimpan di lokal (tanpa akun)
4. Data favorit tidak hilang saat browser ditutup

### Linked PB

PB-009

### Priority

P2 — Nice to Have

---

## US-010: Belajar Tanpa Internet

**Sebagai** 📖 Penghafal
**Saya ingin** tetap bisa menghafal meskipun tidak ada sinyal
**Sehingga** perjalanan atau tempat tanpa internet tidak menghentikan rutinitas hafalan saya.

**Sebagai** 🏫 Komunitas (Pesantren/TPQ)
**Saya ingin** data Al-Qur'an dan audio tetap bisa digunakan tanpa internet
**Sehingga** santri bisa menghafal kapan saja meskipun pesantren tidak memiliki WiFi stabil.

### Acceptance Criteria

1. Surat dan ayat yang pernah dibuka tetap tampil saat offline
2. Audio yang pernah diputar tetap bisa diputar saat offline
3. Word timing tetap berfungsi saat offline
4. Indikator status offline terlihat di UI
5. Tidak ada error atau blank screen saat offline

### Linked PB

PB-010

### Priority

P0 — Must Have

---

# Epic 4: PWA

---

## US-011: Aplikasi Terpasang di HP

**Sebagai** semua pengguna
**Saya ingin** memasang HanQuran di layar utama HP saya
**Sehingga** saya bisa membukanya seperti aplikasi biasa tanpa buka browser dulu.

### Acceptance Criteria

1. Muncul prompt "Add to Home Screen" saat pertama kali
2. Ikon aplikasi tampil di home screen
3. Splash screen saat membuka aplikasi
4. Tidak ada address bar browser
5. Bekerja di Android dan iPhone

### Linked PB

PB-011

### Priority

P0 — Must Have

---

## US-012: Performa Cepat dan Lancar

**Sebagai** semua pengguna
**Saya ingin** aplikasi terbuka dengan cepat
**Sehingga** saya tidak menunggu lama dan langsung bisa menghafal.

### Acceptance Criteria

1. First load kurang dari 3 detik
2. Lighthouse Performance >= 90
3. Lighthouse Accessibility >= 90
4. Lighthouse PWA >= 90
5. Visual terasa rapi dan hidup dengan motion ringan tanpa mengganggu fokus hafalan

### Linked PB

PB-012

### Priority

P2 — Nice to Have

---

# Epic 5: Mobile & Accessibility

---

## US-013: Nyaman di Semua Ukuran Layar

**Sebagai** 🧒 Anak
**Saya ingin** tombol-tombolnya besar dan mudah ditekan
**Sehingga** jari saya yang masih kecil tidak kesulitan.

**Sebagai** 👨‍👩‍👧 Orang Tua
**Saya ingin** aplikasi tetap rapi di tablet maupun HP
**Sehingga** saya bisa mendampingi anak menggunakan perangkat apa pun yang tersedia.

### Acceptance Criteria

1. Layout responsif di Android phone, iPhone, dan tablet
2. Touch target minimal 44x44px
3. Mendukung orientasi portrait dan landscape
4. Tidak ada elemen yang terpotong atau overflow
5. Nyaman digunakan dengan satu tangan

### Linked PB

PB-013

### Priority

P0 — Must Have

---

## US-014: Teks dan Kontras Dapat Disesuaikan

**Sebagai** 👨‍👩‍👧 Orang Tua (usia lanjut)
**Saya ingin** ukuran teks Arab bisa diperbesar
**Sehingga** saya bisa ikut membaca dan menyimak hafalan anak meskipun penglihatan saya tidak setajam dulu.

### Acceptance Criteria

1. Ukuran font dapat disesuaikan (opsi: kecil, sedang, besar)
2. Mode kontras tinggi tersedia
3. Arabic font tetap terbaca jelas di ukuran besar
4. Tombol dan teks memiliki kontras yang cukup (WCAG AA)
5. ARIA label untuk screen reader dasar

### Linked PB

PB-014

### Priority

P1 — Should Have

---

## US-015: Memilih Bahasa Aplikasi

**Sebagai** semua pengguna
**Saya ingin** memilih bahasa tampilan aplikasi (Bahasa Indonesia atau English)
**Sehingga** saya dapat menggunakan HanQuran dalam bahasa yang paling nyaman bagi saya.

### Acceptance Criteria

1. Bahasa didukung: Bahasa Indonesia (`id`) dan English (`en`)
2. Pada first launch, bahasa default ditentukan dari browser locale dan timezone (lihat `docs/21-i18n-and-locale.md`)
3. Bagian **Bahasa Aplikasi** tersedia di Pengaturan dengan opsi **Bahasa Indonesia** dan **English**
4. Preferensi disimpan lokal dan bertahan setelah restart
5. Mengganti bahasa memperbarui menu, navigasi, dialog, label, tombol, empty state, dan notifikasi
6. Teks Arab ayat, transliterasi, audio tilawah, dan nama qari tidak berubah
7. Framework: **`next-intl`**

### Linked PB

PB-015

### Priority

P1 — Should Have

---

# Story Map

```
Epic 1: Quran Reader
  Sprint 1  │ US-001 ──► US-002
            │              │
  Sprint 2  │              └──► US-003

Epic 2: Audio & Memorization
  Sprint 2  │ US-004
            │   │
  Sprint 3  │   ├──► US-005
            │   └──► US-006
  Sprint 4  │         └──► US-007

Epic 3: Persistence & Offline
  Sprint 4  │ US-008 ──► US-010
  Sprint 5  │ US-009

Epic 4: PWA
  Sprint 1  │ US-011
  Sprint 5  │ US-012

Epic 5: Mobile & A11y
  Sprint 2  │ US-013
  Sprint 5  │ US-014
```

---

# Persona Coverage

| Persona | User Stories |
|---------|--------------|
| 🧒 Anak | US-005, US-006, US-008, US-013 |
| 👨‍👩‍👧 Orang Tua | US-009, US-013, US-014 |
| 📖 Penghafal | US-005, US-006, US-007, US-008, US-010 |
| 🏫 Komunitas | US-010 |
| Semua | US-001, US-002, US-003, US-004, US-011, US-012 |

---

# Definition of Done

Sebuah user story dianggap selesai jika:

1. Semua acceptance criteria terpenuhi
2. Mobile responsive (test di 3 ukuran layar)
3. Lighthouse score tidak turun
4. Tidak ada error di console
5. Berfungsi di Chrome dan Safari terbaru
6. Visual tetap rapi dan tidak mengganggu fokus hafalan

---

## Next Steps

- [x] 04-system-architecture.md
- [x] 05-module-catalog.md
- [x] 06-database-schema.md
- [x] 07-api-integration.md
- [x] 08-ui-ux-wireframe.md
