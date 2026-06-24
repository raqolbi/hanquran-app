# Product Backlog

## HanQuran V1

---

# Epic 1: Quran Reader

*Membaca Al-Qur'an adalah fondasi sebelum menghafal.*

---

## PB-001: Daftar Surat

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 1

### Description

User dapat melihat daftar seluruh 114 surat dengan informasi dasar.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Menampilkan 114 surat
- [ ] Menampilkan nomor surat
- [ ] Menampilkan nama Arab
- [ ] Menampilkan nama Latin
- [ ] Menampilkan arti nama surat dalam bahasa Indonesia
- [ ] Menampilkan jumlah ayat
- [ ] Menampilkan tempat turun (Makkiyah/Madaniyah)
- [ ] Dapat scroll dengan lancar

### Subtasks

- [ ] Muat list surat dari dataset statis `public/data/*`
- [ ] Tampilkan dalam list/grid
- [ ] Loading state
- [ ] Error state

### Related FR

FR-001

---

## PB-002: Membuka Surat

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 1

### Description

User dapat membuka surat tertentu dan melihat seluruh ayat.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Menampilkan bismillah (kecuali At-Taubah)
- [ ] Menampilkan seluruh ayat surat
- [ ] Menampilkan teks Arab dengan font Uthmani
- [ ] Menampilkan nomor ayat
- [ ] Back navigation ke daftar surat
- [ ] Indikator surat aktif (nama surat di header)

### Subtasks

- [ ] Muat ayat dari dataset statis `public/data/*`
- [ ] Arabic font (Uthmani)
- [ ] Navigasi antar surat (next/previous surah)
- [ ] Header dengan nama surat

### Related FR

FR-002

---

## PB-003: Terjemahan

**Type:** Feature
**Priority:** P1 — Should Have
**Sprint:** 2

### Description

User dapat menampilkan atau menyembunyikan terjemahan per ayat.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Default: terjemahan tersembunyi
- [ ] Toggle Terjemahan di Verse Display Controls (selalu terlihat di Surah Detail)
- [ ] Terjemahan dalam bahasa Indonesia
- [ ] Toggle bersifat global (berlaku untuk semua ayat)
- [ ] Toggle state tersimpan secara lokal di perangkat

### Subtasks

- [ ] Muat translation dari dataset statis `public/data/translations/*`
- [ ] `VerseDisplayControls` — tombol Terjemahan (✓/○)
- [ ] Animate show/hide translation
- [ ] Persist `translationVisible` ke Dexie

### Related FR

FR-009

---

## PB-003b: Transliterasi

**Type:** Feature
**Priority:** P1 — Should Have
**Sprint:** 2

### Description

User dapat menampilkan atau menyembunyikan transliterasi ayat.

### Acceptance Criteria

- [ ] Default: transliterasi tersembunyi
- [ ] Toggle Transliterasi di Verse Display Controls (satu baris dengan Terjemahan dan Fokus)
- [ ] Independen dari toggle Terjemahan
- [ ] Toggle global; persisten di Dexie (`transliterationVisible`)
- [ ] Urutan render: Arab → Transliterasi → Terjemahan

### Subtasks

- [ ] Muat transliterasi dari dataset surat
- [ ] `VerseDisplayControls` — tombol Transliterasi (✓/○)
- [ ] Persist `transliterationVisible` ke Dexie

### Related FR

FR-009b

---

# Epic 2: Audio & Memorization

*Fitur inti yang membedakan HanQuran dari Quran Reader biasa.*

---

## PB-004: Audio Player

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 2

### Description

User dapat memutar audio bacaan per ayat.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Tombol Play
- [ ] Tombol Pause
- [ ] Tombol Resume
- [ ] Otomatis lanjut ke ayat berikutnya
- [ ] Navigasi next/previous ayat
- [ ] Progress bar audio
- [ ] Indikator ayat yang sedang diputar

### Subtasks

- [ ] Audio element
- [ ] Play/Pause logic
- [ ] Next/Previous dengan keyboard shortcut (optional)
- [ ] Auto-advance ke ayat berikutnya
- [ ] Progress bar

### Related FR

FR-003

---

## PB-005: Word-by-Word Highlight

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 3

### Description

Setiap kata yang sedang dibaca oleh qari akan ditandai secara real-time.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Kata aktif berubah warna (highlight)
- [ ] Highlight sinkron dengan posisi audio
- [ ] Highlight transisi mulus antar kata
- [ ] Bekerja di semua ayat

### Subtasks

- [ ] Muat word timing dari dataset statis `public/data/*`
- [ ] Word-level timestamp mapping
- [ ] Highlight component
- [ ] Sinkronisasi dengan audio currentTime

### Related FR

FR-004

---

## PB-006: Repeat System

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 3

### Description

User dapat memilih target dan jumlah pengulangan untuk keperluan hafalan.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Repeat Ayat
- [ ] Repeat Range Ayat
- [ ] Repeat Surat
- [ ] Repeat 1x
- [ ] Repeat 5x
- [ ] Repeat 10x
- [ ] Repeat 25x
- [ ] Repeat 50x
- [ ] Infinite repeat
- [ ] Counter tampil target aktif dan jumlah tersisa, contoh:
        Al-Ikhlas • 2x tersisa
        Ayat 3 • 5x tersisa
        Ayat 1-5 • 3x tersisa
- [ ] Repeat berjalan otomatis tanpa interaksi user
- [ ] UI friendly untuk anak (ikon hewan sesuai vision)
- [ ] User dapat menghentikan repeat kapan saja
- [ ] User dapat memilih target repeat
- [ ] Counter menampilkan target aktif

### Subtasks

- [ ] Repeat target selector
- [ ] Range picker
- [ ] Surah repeat engine
- [ ] Repeat selector UI
- [ ] Repeat counter logic
- [ ] Auto-restart audio setelah selesai
- [ ] Skin ramah anak (🐣 1x, 🐥 5x, 🐤 10x, 🦜 25x, 🦅 50x, ♾️)

### Related FR

FR-005, FR-006

---

## PB-007: Focus Mode

**Type:** Feature
**Priority:** P1 — Should Have
**Sprint:** 4

### Description

Tampilan layar bebas distraksi untuk fokus menghafal.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Hanya menampilkan ayat, audio, repeat, progress
- [ ] Sembunyikan daftar surat, navigasi, dan elemen non-esensial
- [ ] Mode fullscreen
- [ ] Mudah diaktifkan/dinonaktifkan

### Subtasks

- [ ] Focus mode toggle
- [ ] Hide/show non-essential UI
- [ ] Fullscreen API

---

# Epic 3: Persistence & Offline

*Aplikasi tetap berfungsi tanpa internet.*

---

## PB-008: Last Read

**Type:** Feature
**Priority:** P1 — Should Have
**Sprint:** 4

### Description

Sistem menyimpan posisi terakhir pengguna dan menyediakan cara cepat untuk melanjutkannya kembali.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Surat terakhir tersimpan
- [ ] Ayat terakhir tersimpan
- [ ] Disimpan otomatis saat user berpindah surat/ayat atau menutup aplikasi
- [ ] Saat aplikasi dibuka kembali, tersedia aksi "Lanjutkan bacaan terakhir" yang membuka posisi terakhir
- [ ] Tidak memerlukan akun atau login

### Subtasks

- [ ] IndexedDB/Dexie schema
- [ ] Auto-save on navigate/close
- [ ] Auto-restore on app open

### Related FR

FR-007

---

## PB-009: Favorite Surah

**Type:** Feature
**Priority:** P2 — Nice to Have
**Sprint:** 5

### Description

User dapat menandai surat favorit untuk akses cepat.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Tombol favorit di setiap surat
- [ ] Tab/filter "Favorit" tersedia di daftar surat
- [ ] Tersimpan di IndexedDB
- [ ] Persisten antar sesi

### Subtasks

- [ ] Favorite toggle di list dan di dalam surat
- [ ] Favorite surah filter/tab di home
- [ ] IndexedDB store untuk favorites

### Related FR

FR-008

---

## PB-010: Offline Cache

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 4

### Description

Data surat, ayat, dan audio yang pernah dibuka tetap tersedia tanpa internet.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Ayat yang pernah dibuka tersedia offline
- [ ] Audio yang pernah diputar tersedia offline
- [ ] Word timing yang pernah diakses tersedia offline
- [ ] Indikator status offline di UI
- [ ] Cache strategy: Cache First

### Subtasks

- [ ] Service Worker (Workbox)
- [ ] IndexedDB untuk data surat dan ayat
- [ ] Cache Storage untuk audio
- [ ] Offline indicator

### Related FR

FR-010

---

# Epic 4: PWA

*Agar aplikasi terpasang seperti native app.*

---

## PB-011: PWA Setup

**Type:** Feature
**Priority:** P0 — Must Have
**Sprint:** 1

### Description

Aplikasi dapat diinstal di perangkat dan berjalan seperti aplikasi native.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Manifest.json
- [ ] Service Worker terdaftar
- [ ] Dapat diinstal (Add to Home Screen)
- [ ] Ikon aplikasi
- [ ] Splash screen
- [ ] Tema warna

### Subtasks

- [ ] manifest.json
- [ ] Service Worker registration
- [ ] App icon (multiple sizes)
- [ ] Theme color

---

## PB-012: Lighthouse Score

**Type:** Enhancement
**Priority:** P2 — Nice to Have
**Sprint:** 5

### Description

Memastikan kualitas aplikasi sesuai target.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Performance >= 90
- [ ] Accessibility >= 90
- [ ] PWA >= 90
- [ ] Mobile responsive
- [ ] First load < 3 detik
- [ ] Visual terasa polished dengan motion ringan tanpa mengganggu fokus hafalan

### Subtasks

- [ ] Lighthouse audit
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] PWA checklist
- [ ] Polish visual foundation V1

---

# Epic 5: Mobile & Accessibility

---

## PB-013: Mobile Responsive

**Type:** Enhancement
**Priority:** P0 — Must Have
**Sprint:** 2

### Description

Aplikasi harus nyaman digunakan di semua ukuran layar.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Android phone
- [ ] iPhone
- [ ] Tablet
- [ ] Touch-friendly controls (besar, mudah ditekan)
- [ ] Orientasi portrait dan landscape

### Subtasks

- [ ] Responsive layout (TailwindCSS)
- [ ] Touch target minimum 44x44px
- [ ] Viewport meta
- [ ] Portrait/landscape testing

---

## PB-014: Font & Accessibility

**Type:** Enhancement
**Priority:** P1 — Should Have
**Sprint:** 5

### Description

Mendukung pengguna dengan kebutuhan aksesibilitas berbeda.

### Acceptance Criteria

- [x] Belum dikerjakan
- [ ] Ukuran font dapat disesuaikan
- [ ] Kontras tinggi
- [ ] Screen reader support dasar
- [ ] Arabic font terbaca jelas di semua ukuran

### Subtasks

- [ ] Font size setting
- [ ] High contrast mode
- [ ] ARIA labels
- [ ] Arabic font size independent

---

## PB-015: Bahasa Aplikasi (Application Language)

**Type:** Feature
**Priority:** P1 — Should Have
**Sprint:** 1

### Description

Pengguna dapat memilih bahasa antarmuka aplikasi: Bahasa Indonesia atau English.

### Acceptance Criteria

- [ ] Bahasa didukung: `id` (Bahasa Indonesia) dan `en` (English)
- [ ] Deteksi otomatis pada first launch (browser locale + timezone Indonesia)
- [ ] Bagian **Bahasa Aplikasi** di halaman Pengaturan
- [ ] Preferensi persisten di Dexie (`settings.appLocale`)
- [ ] Seluruh label UI (menu, dialog, tombol, empty state) mengikuti locale aktif
- [ ] Teks Arab ayat, transliterasi, audio, dan qari **tidak** berubah
- [ ] Implementasi memakai **`next-intl`**

### Subtasks

- [ ] Setup `next-intl` + `messages/id.json` & `messages/en.json`
- [ ] `i18n/detection.ts` — alur first launch
- [ ] Field `appLocale` di `settings` (Dexie)
- [ ] Komponen `LanguageSetting` di `/settings`
- [ ] Migrasi string UI hardcoded ke katalog terjemahan

### Related FR

FR-011

### Spesifikasi

`docs/21-i18n-and-locale.md`

---

# Sprint Plan

## Sprint 1: Foundation

```
PB-001  Daftar Surat
PB-002  Membuka Surat
PB-011  PWA Setup
PB-015  Bahasa Aplikasi
```

Goal: User dapat melihat daftar surat dan membuka surat.

---

## Sprint 2: Audio & Mobile

```
PB-003  Terjemahan
PB-004  Audio Player
PB-013  Mobile Responsive
```

Goal: User dapat mendengar audio bacaan.

---

## Sprint 3: Memorization Core

```
PB-005  Word-by-Word Highlight
PB-006  Repeat System
```

Goal: User dapat menghafal dengan repeat dan highlight.

---

## Sprint 4: Offline & Focus

```
PB-007  Focus Mode
PB-008  Last Read
PB-010  Offline Cache
```

Goal: Aplikasi berfungsi offline.

---

## Sprint 5: Polish

```
PB-009  Favorite Surah
PB-012  Lighthouse Score
PB-014  Font & Accessibility
```

Goal: Fitur pelengkap dan optimasi.

---

# Priority Summary

| Priority | Count | Items |
|----------|-------|-------|
| P0 — Must Have | 7 | PB-001, PB-002, PB-004, PB-005, PB-006, PB-010, PB-011, PB-013 |
| P1 — Should Have | 4 | PB-003, PB-007, PB-008, PB-014 |
| P2 — Nice to Have | 3 | PB-009, PB-012 |

---

# Metrics (dari BRD)

Setiap backlog item dianggap selesai jika:

1. Acceptance criteria terpenuhi
2. Mobile responsive
3. Lighthouse check tidak turun di bawah 90

---

## Next Steps

- [x] 03-user-stories.md
- [x] 04-system-architecture.md
- [x] 05-module-catalog.md
- [x] 06-database-schema.md
- [x] 07-api-integration.md
- [x] 08-ui-ux-wireframe.md
