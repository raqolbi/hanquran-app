# High Fidelity UI

## HanQuran V1

---

# 1. Purpose

Dokumen ini mendefinisikan tampilan visual final HanQuran V1 berdasarkan:

* Wireframe
* Design System
* UX Principles

Dokumen ini menjadi referensi utama untuk:

* Figma
* Frontend Next.js
* QA visual review

---

# 2. Visual Identity

## Personality

HanQuran harus terasa:

* Tenang
* Bersih
* Hangat
* Fokus
* Modern
* Tidak berlebihan

---

## Emotional Goal

Saat user membuka aplikasi:

```text
Saya ingin menghafal Al-Quran.
Bukan belajar memakai aplikasi.
```

UI harus menghilang di belakang aktivitas hafalan.

---

# 3. Home Screen

## Mobile

### Layout

```text
Header
↓
Continue Reading
↓
Search
↓
Filter
↓
Surah List
↓
Bottom Navigation
```

---

### Header

Tinggi:

```text
~72px (mobile)
```

Isi:

```text
HanQuran
Status koneksi
```

Visual:

* Background gradient lembut
* Tidak menggunakan card
* Judul lebih dominan
* **Tanpa** tagline/subjudul di bawah judul

---

### Continue Reading

Lebar:

```text
100%
```

Padding:

```text
16px
```

Visual:

* Card putih
* Shadow medium
* Radius 16px

Konten:

```text
Nama Surat
Ayat terakhir
Button Lanjutkan
```

CTA:

```text
Emerald Solid Button
```

---

### Search

Tinggi:

```text
48px
```

Radius:

```text
12px
```

Placeholder:

```text
Cari surat...
```

---

### Filter

Komponen:

```text
Chip
```

State:

```text
Semua
Favorit
```

Default:

```text
Semua aktif
```

---

### Surah List

Card:

```text
White
16px radius
```

Isi:

```text
Nama Surat
Arti
Jumlah Ayat
Kategori
Favorite Button
```

Spacing:

```text
12px antar card
```

---

# 4. Surah Detail

## Mobile

### Layout

```text
Header
↓
Meta Surah
↓
Verse Display Controls
↓
Ayat List
↓
Sticky Player
```

---

### Header

Back button kiri.

Tidak perlu title besar.

Fokus tetap ke isi surat.

---

### Meta Surah

Isi:

```text
Nama Surat
Jumlah Ayat
Makkiyah/Madaniyah
Offline Ready
```

Visual:

```text
Center aligned
```

---

### Action Bar → Verse Display Controls

Komponen:

```text
Terjemahan Toggle
Transliterasi Toggle
Fokus Button
```

Layout:

```text
Horizontal — satu baris di bawah header surat
Equal visual hierarchy
```

Spesifikasi: `docs/22-verse-display-controls.md`.

---

### Ayat List

Lebar:

```text
100%
```

Gap:

```text
16px
```

---

### Ayat Card

Default:

```text
White
Border Gray
```

Active:

```text
Emerald Border
Emerald Background Tint
```

Completed:

```text
Light Emerald
```

---

### Arabic Text

Ukuran default:

```text
40px
```

Alignment:

```text
Center
```

Line Height:

```text
1.9
```

---

### Translation

Ukuran:

```text
16px
```

Warna:

```text
Secondary Text
```

---

# 5. Sticky Audio Player

## Mobile

Tinggi minimum:

```text
~112px (progress + baris repeat inline + transport)
```

Posisi:

```text
fixed bottom: 0
```

Selalu terlihat.

---

### Layout

```text
Baris 1 : ━━━━━●━━━━━  (progress)
Baris 2 : [🐥 5x ▼][2/5][⚙]     ⏮  ▶/⏸  ⏭
```

Play button lebih besar dibanding kontrol lain.

Repeat **inline** di kiri — bukan kartu mengambang.

---

### Progress

Tinggi:

```text
6px
```

Radius:

```text
999px
```

---

### Repeat

Posisi:

```text
Baris transport (kiri), bersama tombol ⚙
```

Komponen:

```text
RepeatSelector (inline)
Settings Button (⚙)
```

---

# 6. Focus Mode

## Mobile

### Background

Gunakan:

```text
Warm White
```

atau

```text
Subtle Emerald Tint
```

---

### Layout

```text
Top Bar
↓
Arabic Text (+ transliterasi / terjemahan opsional)
↓
AudioPlayer (fixed, identik Surah Detail)
```

Tidak ada blok repeat terpisah atau teks hint sinkronisasi.

---

### Arabic Text

Ukuran:

```text
48px
```

atau

```text
56px
```

pada layar besar.

---

### Highlight Word

Background:

```text
#D1FAE5
```

Text:

```text
#065F46
```

Radius:

```text
8px
```

Animasi:

```text
200ms fade
```

---

### Repeat Status

Visual:

```text
Badge + Status
```

Contoh:

```text
🟢 Ayat Aktif

Ayat 1 • 4x tersisa
```

atau:

```text
🟢 Range Ayat 1-5

Siklus 2 / 5
Sedang di Ayat 3
```

---

# 7. Settings

## Mobile

Gunakan:

```text
Single Column
```

---

### Setting Card

Radius:

```text
16px
```

Padding:

```text
16px
```

Background:

```text
White
```

---

### Group Order

```text
Bahasa Aplikasi
↓
Reciter
↓
Playback
↓
Kontras
↓
Offline & Cache
↓
Aksesibilitas
↓
Tentang HanQuran  →  `/settings/about`
```

> Terjemahan dan Transliterasi dikontrol di Verse Display Controls (Surah Detail), bukan di Pengaturan.

> **Playback:** Auto Follow Playback & Mode Murotal — `docs/28-playback-settings.md`, `docs/29-murotal-mode-spec.md`.

Layar **Tentang HanQuran**: informasi aplikasi, filosofi, credits, repository & lisensi — `docs/26-about-screen-spec.md`.

---

# 8. Desktop Layout

## Max Content Width

```text
960px
```

---

## Reading Width

```text
900px
```

maksimum.

---

## Home

Gunakan:

```text
2 column layout
```

Bagian atas:

```text
Continue Reading
Search
Filter
```

Bagian bawah:

```text
Surah List
```

---

## Surah Detail

Ayat tetap:

```text
Single Reading Column
```

Jangan membuat dua kolom ayat.

---

## Focus Mode

Konten harus tetap berada di tengah layar.

Target:

```text
Membaca nyaman selama 30+ menit.
```

---

# 9. Empty States

## Favorites Empty

Visual:

* Ikon bintang outline
* Teks pendek
* CTA ringan

---

## Last Read Empty

Visual:

* Ikon buku
* Teks sederhana

---

# 10. Offline States

## Offline Ready

Badge:

```text
Emerald
```

---

## Downloading

Badge:

```text
Amber
```

Progress:

```text
Linear Progress
```

---

## Failed

Badge:

```text
Muted Red
```

---

# 11. Visual QA Checklist

Sebelum dianggap selesai:

* Arabic text selalu paling dominan
* Tidak ada card terlalu padat
* Repeat mudah ditemukan
* Player selalu jelas
* Kontras memenuhi WCAG AA
* Fokus hafalan tetap menjadi aktivitas utama
* Tidak ada elemen dekoratif mengganggu ayat
* Mobile tetap nyaman digunakan satu tangan

---

# 12. Ready for Implementation

Setelah dokumen ini selesai:

1. Buat Figma
2. Review visual
3. Buat component library
4. Implementasi Next.js
5. QA visual dan UX

```
```
