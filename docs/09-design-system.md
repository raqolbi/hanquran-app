# Design System

## HanQuran V1

---

# 1. Purpose

Dokumen ini mendefinisikan design system HanQuran V1.

Tujuan:

* Menjaga konsistensi visual
* Mempercepat implementasi frontend
* Menjadi acuan Figma dan Next.js
* Memastikan seluruh layar terasa satu produk

---

# 2. Design Principles

## Memorization First

Visual harus membantu pengguna fokus menghafal.

Prioritas:

1. Teks Al-Quran
2. Audio & Repeat
3. Navigasi
4. Dekorasi

Jika terjadi konflik, selalu prioritaskan keterbacaan ayat.

---

## Multilingual UI

Antarmuka aplikasi (bukan teks Arab ayat) mendukung **Bahasa Indonesia** dan **English** melalui **`next-intl`**.

- String UI didefinisikan di `messages/id.json` dan `messages/en.json`
- Tipografi Arab untuk ayat tidak berubah saat ganti bahasa UI
- Spesifikasi lengkap: `docs/21-i18n-and-locale.md`

---

## Calm Interface

UI harus terasa:

* Tenang
* Bersih
* Ringan
* Tidak melelahkan mata

Hindari:

* Warna terlalu jenuh
* Animasi agresif
* Shadow berlebihan

---

## Respectful Quran Experience

Konten Al-Quran selalu menjadi elemen paling dominan.

Jangan:

* Menempatkan iklan di layar baca
* Mengganggu teks dengan ilustrasi
* Menggunakan efek visual berlebihan

---

# 3. Color System

## Primary

### HanQuran Emerald

```text
#0F766E
```

Penggunaan:

* Primary button
* Active state
* Progress
* Audio player
* Repeat aktif

---

## Secondary

### Emerald Bright

```text
#10B981
```

Penggunaan:

* Hover
* Selected state
* Highlight ringan
* Success state

---

## Accent

### Guidance Gold

```text
#FBBF24
```

Penggunaan:

* Favorite
* Bookmark
* Badge penting

---

## Surface

### Background

```text
#FAFAF8
```

### Card

```text
#FFFFFF
```

### Border

```text
#E5E7EB
```

---

## Text

### Primary

```text
#111827
```

### Secondary

```text
#6B7280
```

### Disabled

```text
#9CA3AF
```

---

## Semantic Colors

### Success

```text
#16A34A
```

### Warning

```text
#D97706
```

### Error

```text
#DC2626
```

### Info

```text
#0284C7
```

---

# 4. Typography

## Arabic

### Font

```text
Uthmani Hafs
```

Fallback:

```text
Amiri
Noto Naskh Arabic
serif
```

---

### Sizes

```text
Small  : 32px
Medium : 40px
Large  : 48px
```

Line Height:

```text
1.9
```

Alignment:

```text
center
```

---

## UI Font

### Font Family

```text
Plus Jakarta Sans
```

Fallback:

```text
Inter
system-ui
sans-serif
```

---

### Type Scale

```text
Display : 36
H1      : 30
H2      : 24
H3      : 20

Body L  : 18
Body M  : 16
Body S  : 14

Caption : 12
```

---

### Font Weights

```text
Regular  : 400
Medium   : 500
Semibold : 600
Bold     : 700
```

---

# 5. Spacing System

Gunakan skala berikut:

```text
4
8
12
16
24
32
48
64
```

Contoh:

```text
Card Padding      : 16px
Section Gap       : 24px
Page Padding      : 16px
Desktop Padding   : 32px
```

---

# 6. Radius System

```text
Small  : 8px
Medium : 12px
Large  : 16px
XL     : 20px
Pill   : 999px
```

Penggunaan:

```text
Button       : 12px
Card         : 16px
BottomSheet  : 24px
Chip         : Pill
```

---

# 7. Elevation

## Shadow Small

```css
0 2px 8px rgba(0,0,0,0.04)
```

---

## Shadow Medium

```css
0 4px 12px rgba(0,0,0,0.05)
```

---

## Shadow Large

```css
0 12px 24px rgba(0,0,0,0.08)
```

---

# 8. Icon System

Library:

```text
Lucide
```

Ukuran:

```text
Small  : 16
Medium : 20
Large  : 24
```

---

# 9. Motion System

## Duration

```text
Fast   : 150ms
Normal : 200ms
Slow   : 250ms
```

---

## Easing

```css
ease-out
```

---

Gunakan untuk:

* Toggle
* Repeat selector
* Bottom sheet
* Navigation

---

Jangan gunakan:

* Bounce
* Spring ekstrem
* Parallax

---

# 10. Layout System

## Mobile

Max Width:

```text
100%
```

Page Padding:

```text
16px
```

---

## Tablet

Content Width:

```text
720px
```

---

## Desktop

Content Width:

```text
960px
```

Untuk layar baca:

```text
max-width: 900px
```

agar ayat tidak terlalu melebar.

---

# 11. Components

## Button

### Primary

```text
Background : Emerald
Text       : White
```

Height:

```text
44px
```

---

### Secondary

```text
Background : White
Border     : Gray-200
Text       : Primary
```

---

## Chip

### Default

```text
Background : White
Border     : Gray-200
```

### Active

```text
Background : Emerald
Text       : White
```

---

## Favorite Button

### Default

```text
☆
Gray-400
```

### Active

```text
★
Gold
```

---

## Search Input

Height:

```text
48px
```

Radius:

```text
12px
```

---

## Bottom Sheet

Radius:

```text
24px 24px 0 0
```

Max Width:

```text
640px
```

---

# 12. Ayat Components

## Ayat Card

### Default

```text
Background : White
Border     : Gray-200
Radius     : 16px
```

---

### Active Playing

```text
Background : Emerald-50
Border     : Emerald-500
```

---

### Completed

```text
Background : Emerald-50
Text       : Emerald
```

---

## Word Highlight

```text
Background : #D1FAE5
Text       : #065F46
Radius     : 8px
```

---

# 13. Audio Player

## Sticky Player

Height (min):

```text
~112px
```

Background:

```text
White
```

Border:

```text
Gray-200
```

Shadow:

```text
Medium
```

Layout: progress + baris `[repeat inline][⚙] ··· ⏮ ▶ ⏭`.

---

## Progress

Track:

```text
Gray-200
```

Progress:

```text
Emerald
```

Thumb:

```text
Emerald
```

---

# 14. Accessibility

Minimum tap area:

```text
44x44
```

---

Target contrast:

```text
WCAG AA
```

---

Keyboard focus:

```text
2px solid Emerald
```

---

# 15. Responsive Rules

## Mobile

* Single column
* Sticky player bottom

---

## Tablet

* Wider cards
* Same content hierarchy

---

## Desktop

* Centered reading layout
* Limited content width
* Comfortable reading distance

---

# 16. Figma Structure

```text
Foundations
├─ Colors
├─ Typography
├─ Spacing
├─ Radius
├─ Shadows

Components
├─ Button
├─ Chip
├─ Input
├─ Ayat Card
├─ Audio Player
├─ Bottom Sheet

Screens
├─ Home
├─ Surah Detail
├─ Focus Mode
├─ Settings
```

---