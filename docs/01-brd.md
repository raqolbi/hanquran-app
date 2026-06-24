# Business Requirements Document (BRD)

## HanQuran

### Version 1.0

---

# 1. Project Overview

## Project Name

HanQuran

## Project Type

Open Source Progressive Web Application (PWA)

## Purpose

Menyediakan aplikasi Al-Qur'an yang berfokus pada hafalan dan murojaah dengan pengalaman yang sederhana, cepat, dan ramah untuk semua usia.

---

# 2. Business Problem

Sebagian besar aplikasi Al-Qur'an saat ini berfokus pada:

- Membaca
- Tafsir
- Terjemahan
- Kajian

Namun belum banyak yang secara khusus mengoptimalkan proses:

- Menghafal ayat
- Pengulangan audio
- Murojaah

Akibatnya pengguna harus:

- Mengatur repeat secara manual
- Memutar ulang berkali-kali
- Kehilangan fokus karena banyak fitur

---

# 3. Business Goals

## Goal 1

Mempermudah proses hafalan Al-Qur'an.

---

## Goal 2

Mengurangi jumlah interaksi yang diperlukan untuk memulai hafalan.

Target:

```text
Maksimal 3 langkah
```

```text
Pilih Surat
↓
Pilih Ayat
↓
Play Repeat
```

---

## Goal 3

Memungkinkan penggunaan tanpa akun.

---

## Goal 4

Memungkinkan penggunaan offline setelah data diunduh.

---

# 4. Scope

## In Scope (V1)

### Quran Reader

- Daftar surat
- Daftar ayat
- Audio ayat

---

### Audio Control

- Play
- Pause
- Resume
- Next ayat
- Previous ayat

---

### Repeat System

Repeat Target:

- Repeat Ayat
- Repeat Range Ayat
- Repeat Surat

Repeat Count:

- Repeat 1x
- Repeat 5x
- Repeat 10x
- Repeat 25x
- Repeat 50x
- Infinite Repeat

---

### Word Highlight

Highlight kata sesuai posisi audio.

---

### Last Read

Menyimpan posisi terakhir pengguna.

---

### Favorite Surah

Menyimpan surat favorit.

---

### Offline Cache

Menyimpan:

- Ayat
- Audio
- Word timing

---

### Translation

Menampilkan terjemahan.

Status:

Default hidden.

---

## Out of Scope (V1)

- Login
- Registrasi
- Cloud Sync
- AI
- Voice Recognition
- Kelas Tahfidz
- Family Account
- Social Feature

---

# 5. User Personas

## Persona 1

### Anak

Usia:

3-12 tahun

Tujuan:

Menghafal surat pendek.

---

## Persona 2

### Orang Tua

Tujuan:

Mendampingi hafalan anak.

---

## Persona 3

### Penghafal Al-Qur'an

Tujuan:

Murojaah harian.

---

# 6. Functional Requirements

## FR-001

### Menampilkan Daftar Surat

User dapat melihat seluruh surat.

Acceptance:

- Nomor surat tampil
- Nama Arab tampil
- Nama Latin tampil

---

## FR-002

### Membuka Surat

User dapat membuka surat tertentu.

Acceptance:

- Ayat tampil
- Audio tersedia

---

## FR-003

### Memutar Audio

User dapat memutar audio surat.

Acceptance:

- Audio berjalan normal
- Dapat pause
- Dapat resume

---

## FR-004

### Highlight Kata Aktif

Saat audio diputar.

Acceptance:

- Kata aktif berubah visual
- Highlight mengikuti audio

---

## FR-005

### Repeat Hafalan

User dapat memilih target dan jumlah repeat.

Acceptance:

- Repeat berjalan otomatis
- Counter tampil
- User dapat memilih target repeat:
  - Ayat
  - Range Ayat
  - Surat
- Repeat berjalan otomatis sesuai target
- Counter tampil

---

## FR-006

### Infinite Repeat

User dapat mengulang tanpa batas.

Acceptance:

- Audio terus berulang
- Dapat dihentikan kapan saja

---

## FR-007

### Last Read

Sistem menyimpan posisi terakhir.

Acceptance:

- Surat terakhir tersimpan
- Ayat terakhir tersimpan

---

## FR-008

### Favorite Surah

User dapat menandai surat favorit.

Acceptance:

- Favorit tersimpan lokal

---

## FR-009

### Translation Toggle

User dapat menampilkan atau menyembunyikan terjemahan **ayat** (konten Quran dari dataset).

Acceptance:

- Default hidden
- Toggle di **Verse Display Controls** pada Surah Detail — selalu terlihat
- Dapat diaktifkan kapan saja
- Terpisah dari bahasa UI aplikasi (lihat FR-011)
- Tidak ada di halaman Pengaturan

---

## FR-009b

### Transliteration Toggle

User dapat menampilkan atau menyembunyikan transliterasi ayat.

Acceptance:

- Default hidden
- Toggle di Verse Display Controls — satu baris dengan Terjemahan dan Fokus
- Independen dari Translation Toggle
- Persisten di Dexie (`settings.transliterationVisible`)

---

## FR-011

### Application Language

User dapat memilih bahasa antarmuka aplikasi.

Acceptance:

- Bahasa didukung: Bahasa Indonesia (`id`) dan English (`en`)
- Deteksi otomatis pada first launch (browser locale + timezone) — lihat `docs/21-i18n-and-locale.md`
- Preferensi persisten di Dexie (`settings.appLocale`)
- Pengguna dapat mengganti bahasa di Pengaturan kapan saja
- Perubahan bahasa memperbarui menu, navigasi, dialog, label, tombol, empty state, dan notifikasi
- Teks Arab ayat, transliterasi, audio, dan recitation **tidak** berubah

Framework implementasi: **`next-intl`**

---

## FR-010

### Offline Mode

Data yang pernah dibuka tetap tersedia.

Acceptance:

- Ayat tampil tanpa internet
- Audio tetap dapat diputar

---

# 7. Non Functional Requirements

## Performance

First Load:

```text
< 3 detik
```

---

## Lighthouse

Target:

```text
Performance ≥ 90
Accessibility ≥ 90
PWA ≥ 90
```

---

## Mobile First

Responsif untuk:

- Android
- iPhone
- Tablet

---

## Offline First

Aplikasi tetap berfungsi setelah data tersimpan.

---

## Accessibility

Mendukung:

- Ukuran font besar
- Kontras tinggi
- Screen reader dasar

---

# 8. Data Requirements

## Source

Data Al-Qur'an:

- Ayat
- Surat
- Audio
- Word Timing
- Translation

Sumber:

- Dataset statis `public/data/*` (konten Quran & terjemahan)
- CDN audio tilawah (eksternal)
- `data/reciters.json` (metadata qari)

Lihat `docs/07-api-integration.md`.

---

# 9. Local Storage Requirements

Menggunakan IndexedDB dan Cache Storage.

Data yang disimpan:

```text
Settings
Last Read
Favorites
Surah Cache
Ayah Cache
Translation Cache
Word Timing Cache
UI Preferences
Audio Cache
```

---

# 10. Success Metrics

## MVP Success

Minimal:

- User dapat membuka surat
- User dapat memutar audio
- User dapat melakukan repeat
- Highlight kata berjalan
- Offline mode berjalan

---

## Product Success

Target awal:

- Digunakan untuk hafalan surat pendek
- Dapat digunakan anak-anak tanpa bantuan teknis
- Dapat digunakan sepenuhnya tanpa login

---

# 11. Future Enhancements (V2)

- Murojaah Playlist
- Pohon Hafalan
- Sleep Mode
- Word-by-Word Meaning
- Multiple Reciter
- Progress Statistics
- Export & Import Data

---

## Catatan Arsitektur

Karena Anda berencana menjadikannya proyek open source, saya sarankan setelah BRD ini langsung membuat:

1. Product Backlog
2. User Stories
3. System Architecture Document
4. Module Catalog
5. Database Schema (IndexedDB)
6. Data Integration Specification (`docs/07-api-integration.md`)
7. Internationalization Specification (`docs/21-i18n-and-locale.md`)
7. UI/UX Wireframe

Urutan tersebut akan membuat implementasi Next.js jauh lebih terstruktur dibanding langsung mulai coding.
