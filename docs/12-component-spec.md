# Component Specification

## HanQuran V1

---

# Purpose

Dokumen ini mendefinisikan seluruh komponen utama HanQuran.

Digunakan sebagai acuan:

* Design
* Frontend Development
* Component Library
* QA
* V0 Generation
* Copilot
* Claude Review

---

# Design Principles

Semua komponen harus mengikuti prinsip:

1. Memorization First
2. Mobile First
3. Offline First
4. Calm Interface
5. Quran Text Dominance

Prioritas visual:

1. Quran Text
2. Audio & Repeat
3. Progress
4. Navigation
5. Decorative Elements

---

# Shared Types

```ts
type RepeatTarget =
  | "current_ayah"
  | "ayah_range"
  | "entire_surah"

type RepeatCount =
  | 1
  | 5
  | 10
  | 25
  | 50
  | "infinite"

type RevelationType =
  | "makkiyah"
  | "madaniyah"

type ConnectionStatus =
  | "online"
  | "offline_ready"
  | "downloading"
  | "download_failed"
  | "offline"
```

---

# Module Mapping

Komponen di dokumen ini dipetakan ke modul pada `05-module-catalog.md`.

| Component             | Module           | Alias di Module Catalog                                                 |
| --------------------- | ---------------- | ----------------------------------------------------------------------- |
| ContinueReadingCard   | Reading Resume   | ContinueReadingCard                                                     |
| SearchInput           | Shared           | —                                                                       |
| FavoriteFilter        | Quran            | —                                                                       |
| SurahCard             | Quran            | SurahCard                                                               |
| FavoriteButton        | Quran            | FavoriteButton                                                          |
| SurahMetaHeader       | Quran            | SurahHeader                                                             |
| VerseDisplayControls  | Quran            | ActionBar (legacy)                                                        |
| TranslationToggle     | Quran            | TranslationToggle (child of VerseDisplayControls)                         |
| TransliterationToggle | Quran            | —                                                                         |
| FocusModeButton       | Quran            | —                                                                         |
| AyahCard              | Quran            | AyahItem                                                                |
| AyahWordHighlight     | Memorization     | HighlightEngine output                                                  |
| AudioPlayer           | Audio            | AudioBar + AudioControls + AudioProgress                                |
| RepeatSelector        | Memorization     | RepeatSelector                                                          |
| RepeatSettingsDialog  | Memorization     | RepeatOption                                                            |
| RepeatStatus          | Memorization     | —                                                                       |
| FocusModeScreen       | Memorization     | FocusPage + FocusAyah                                                   |
| FocusModePlayer       | Memorization     | FocusAudio + FocusRepeat                                                |
| SettingsCard          | Settings         | FontSizeSetting / LanguageSetting / ContrastSetting / CacheManagement |
| LanguageSetting       | Settings         | —                                                                       |
| ReciterSelector       | Settings         | —                                                                       |
| BottomNavigation      | Shared           | —                                                                       |
| BottomSheet           | Shared           | —                                                                       |
| OfflineStatusBadge    | Offline          | OfflineIndicator                                                        |
| ConnectionIndicator   | Offline          | OfflineIndicator (subset)                                               |
| OfflineBanner         | Offline          | —                                                                       |
| EmptyState            | Shared           | —                                                                       |
| Logo / LogoWithText   | Shared           | Brand mark (lihat `branding/logo-guidelines.md`)                        |

---

# 1. ContinueReadingCard

## Purpose

CTA utama Home Screen.

Memungkinkan user melanjutkan bacaan terakhir.

CTA ini harus visually lebih dominan daripada Search, Filter, dan Surah List.

---

## Props

```ts
interface ContinueReadingCardProps {
  surahNumber: number
  surahName: string

  currentAyah: number

  lastReadAt?: Date
}
```

---

## States

### Default

```text
Lanjutkan Bacaan Terakhir

Al-Ikhlas • Ayat 3

[Lanjutkan]
```

### Empty

```text
Belum ada bacaan terakhir.

Mulai dari surat favoritmu.
```

---

## Visual

```text
Background : White
Radius     : 16px
Shadow     : Medium
Padding    : 16px
CTA        : Emerald Solid Button
```

---

## Interaction

### Click Card / Button

```text
Buka Surah Detail
Scroll ke ayat terakhir
Deep link: /surah/[id]?ayah=[n]
```

---

## Important

```text
Tidak menampilkan progress bar.
Tidak menampilkan persentase.
Tidak menampilkan total ayat.

HanQuran bukan dashboard.
Continue Reading harus terasa
sebagai "Lanjutkan Hafalan",
bukan "Lihat Progress".
```

---

# 2. SearchInput

## Purpose

Mencari surat di Home Screen.

---

## Props

```ts
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
```

---

## Visual

```text
Height      : 48px
Radius      : 12px
Background  : White
Border      : Gray-200
Placeholder : "Cari surat..."
```

---

## Behavior

```text
Filter Surah List secara live.

Tidak membuka halaman baru.
```

---

# 3. FavoriteFilter

## Purpose

Filter daftar surat di Home.

---

## Values

```text
Semua
Favorit
```

Default:

```text
Semua aktif
```

---

## Visual

```text
Komponen : Chip
Radius   : Pill (999px)
```

### Default

```text
Background : White
Border     : Gray-200
Text       : Primary
```

### Active

```text
Background : Emerald
Text       : White
```

---

## Important

```text
Favorit adalah filter.

Bukan section.
Bukan kategori.
Bukan halaman terpisah.

Memilih "Favorit" mengganti
isi list, tidak berpindah route.
```

---

# 4. SurahCard

## Purpose

Menampilkan ringkasan surat pada Home.

---

## Props

```ts
interface SurahCardProps {
  surahNumber: number

  surahName: string
  surahNameArabic: string

  translation: string

  ayahCount: number

  revelationType: RevelationType

  isFavorite: boolean
}
```

---

## Visual

```text
Background : White
Radius     : 16px
Border     : Gray-200
Padding    : 16px
Gap        : 12px antar card
```

Konten:

```text
Nama Surat
Arti
Jumlah Ayat
Makkiyah / Madaniyah
FavoriteButton
```

---

## Interaction

### Click Card

```text
Buka Surah Detail
```

### Click Favorite

```text
Toggle Favorite
Tidak ikut membuka surat
```

Tap target favorite tidak boleh
mengganggu tap target card.

---

# 5. FavoriteButton

## Purpose

Menandai surat sebagai favorit.

---

## Props

```ts
interface FavoriteButtonProps {
  active: boolean
  onToggle: () => void
}
```

---

## States

### Inactive

```text
Icon  : ☆
Color : Gray-400
       (#9CA3AF)
```

### Active

```text
Icon  : ★
Color : Guidance Gold
       (#FBBF24)
```

---

## Animation

Duration:

```text
150ms
```

Type:

```text
Scale 0.98 → 1
Fade
```

---

## Important

```text
Jangan menggunakan ikon hati (♡ / ❤️).

Favorit di HanQuran selalu menggunakan
bintang dengan warna Guidance Gold,
selaras dengan Design System.
```

---

# 6. SurahMetaHeader

## Purpose

Menampilkan metadata surat pada Surah Detail.

---

## Props

```ts
interface SurahMetaHeaderProps {
  surahName: string

  ayahCount: number

  revelationType: RevelationType

  connectionStatus: ConnectionStatus

  isFavorite: boolean
}
```

---

## Visual

```text
Alignment : Center
```

Konten:

```text
Nama Surat
Jumlah Ayat • Makkiyah / Madaniyah
OfflineStatusBadge
FavoriteButton
```

---

## Important

```text
Header surat tidak boleh
mengalahkan teks ayat.

Tipografi metadata gunakan
Body S atau Caption.
```

---

# 7. VerseDisplayControls

> **Alias legacy di kode:** `ActionBar`. Spesifikasi UX final: `docs/22-verse-display-controls.md`.

## Purpose

Baris kontrol tampilan ayat di Surah Detail — **selalu terlihat** langsung di bawah header surat.

Tiga kontrol dalam satu baris horizontal dengan hierarki visual setara:

```text
[✓ Terjemahan] [○ Transliterasi] [🎯 Fokus]
```

Tidak disembunyikan di bottom sheet, overflow menu, dialog pengaturan, atau layar sekunder.

---

## Props

```ts
interface VerseDisplayControlsProps {
  translationOn: boolean
  transliterationOn: boolean
  onToggleTranslation: () => void
  onToggleTransliteration: () => void
  onEnterFocusMode: () => void
}
```

---

## Layout

```text
Horizontal — satu baris
Gap antar item : 12px
Equal visual hierarchy
Mobile-first; tablet/desktop susunan sama
```

Konten (urutan kiri → kanan):

```text
TranslationToggle
TransliterationToggle
FocusModeButton
```

---

## Visual

```text
Padding         : 12px horizontal, 8px vertical
Background      : Transparent
Gap antar item  : 12px
Min tap target  : 44px
```

---

## Important

```text
Toggle Terjemahan dan Transliterasi
mengubah preferensi global (Dexie settings),
bukan preferensi per-surat.

Mode Fokus tidak mengubah state
Terjemahan atau Transliterasi.
```

---

# 8. TranslationToggle

## Purpose

Menampilkan atau menyembunyikan terjemahan ayat.

Bagian dari `VerseDisplayControls` — tidak berdiri sendiri di Pengaturan.

Bersifat global mengikuti `settings.translationVisible`.

---

## Props

```ts
interface TranslationToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}
```

---

## States

### OFF

```text
Label : "○ Terjemahan"
```

### ON

```text
Label : "✓ Terjemahan"
Accent: Emerald (aktif)
```

---

## Important

```text
Toggle di Surah Detail
mengubah preferensi global,
bukan preferensi per-surat.

Urutan render saat ON:
Arab → Transliterasi (jika ON) → Terjemahan
```

---

# 8b. TransliterationToggle

## Purpose

Menampilkan atau menyembunyikan transliterasi ayat.

Bagian dari `VerseDisplayControls`.

Bersifat global mengikuti `settings.transliterationVisible`.

---

## Props

```ts
interface TransliterationToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}
```

---

## States

### OFF

```text
Label : "○ Transliterasi"
```

### ON

```text
Label : "✓ Transliterasi"
Accent: Emerald (aktif)
```

---

## Important

```text
Independen dari toggle Terjemahan.
Saat OFF, teks Arab tetap terlihat.

Urutan render saat ON (dengan terjemahan):
Arab → Transliterasi → Terjemahan
```

---

# 8c. FocusModeButton

## Purpose

Membuka Mode Fokus (`/focus/[id]?ayah=`).

Bagian dari `VerseDisplayControls`.

---

## Props

```ts
interface FocusModeButtonProps {
  onClick: () => void
}
```

---

## Visual

```text
Label : "🎯 Fokus"
```

---

## Important

```text
Hanya mengubah layout baca (navigasi route).
Tidak mengubah translationVisible
atau transliterationVisible.
```

---

# 9. AyahCard

## Purpose

Menampilkan ayat pada Surah Detail.

---

## Props

```ts
interface AyahCardProps {
  ayahNumber: number

  arabicText: string

  transliteration?: string

  translation?: string

  showTransliteration: boolean

  showTranslation: boolean

  isActive: boolean

  isCompleted: boolean
}
```

---

## Content Order

Saat beberapa layer aktif, urutan render **wajib**:

```text
1. Arabic
2. Transliteration (jika showTransliteration)
3. Translation (jika showTranslation)
```

Konsisten di Surah Detail dan Focus Mode. Lihat `docs/22-verse-display-controls.md`.

---

## Visual

```text
Radius  : 16px
Padding : 16px
Gap     : 16px antar card
```

---

## States

### Default

```text
Background : White
Border     : Gray-200
```

### Active

```text
Background : Emerald-50
Border     : Emerald-500
Prefix     : ▶ Ayat N
```

### Completed

```text
Background : Emerald-50
Border     : Transparent
Text       : Emerald
Prefix     : ✓ Ayat N
```

---

## Interaction

### Click

```text
Set Active Ayah
Play Audio dari ayat tersebut
```

---

# 10. AyahWordHighlight

## Purpose

Menampilkan highlight kata yang sedang dibaca oleh audio.

Digunakan pada:

* Surah Detail
* Focus Mode

Komponen ini menjadi inti pengalaman hafalan HanQuran.

---

## Props

```ts
interface AyahWordHighlightProps {
  word: string

  isActive: boolean
}
```

---

## States

### Default

```text
Background : Transparent
Text       : Primary (#111827)
```

### Highlighted

```text
Background : #D1FAE5
Text       : #065F46
Radius     : 8px
```

---

## Animation

Duration:

```text
200ms
```

Type:

```text
Fade Transition
```

Easing:

```text
ease-out
```

---

## Important

```text
Jangan menggunakan:

- Blink
- Pulse
- Flash
- Bounce

Highlight harus terasa halus
dan tidak mengganggu hafalan.
```

---

## Usage Example

```text
قُلْ هُوَ ٱللَّهُ أَحَدٌ

[قُلْ] ← aktif
هُوَ
ٱللَّهُ
أَحَدٌ
```

---

# 11. AudioPlayer

## Purpose

Player utama HanQuran.

Komponen inti aplikasi.

Sticky di bagian bawah pada mobile.

---

## Props

```ts
interface AudioPlayerProps {
  currentAyah: number
  currentTime: number
  duration: number

  isPlaying: boolean

  repeatTarget: RepeatTarget
  repeatCount: RepeatCount

  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void

  onSeek: (time: number) => void

  onOpenRepeatSettings: () => void
}
```

---

## Container

```text
Background : White
Border Top : Gray-200
Shadow     : Medium
Height     : 96px (mobile sticky)
Position   : sticky bottom (mobile)
```

---

## Controls

Urutan:

```text
Previous
Play / Pause
Next
```

Play / Pause:

```text
Lebih besar dibanding kontrol lain.
```

---

## Progress

```text
Track    : Gray-200
Progress : Emerald
Thumb    : Emerald
Height   : 6px
Radius   : 999px
Seekable : true
```

---

## Repeat Region

Posisi:

```text
Bawah progress
```

Konten:

```text
RepeatSelector
Settings Button (⚙)
RepeatStatus (jika repeat aktif)
```

---

## States

### Playing

```text
Pause Button visible
```

### Paused

```text
Play Button visible
```

---

# 12. RepeatSelector

## Purpose

Menampilkan dan memilih jumlah repeat aktif.

Membuka RepeatSettingsDialog untuk konfigurasi lanjutan.

---

## Props

```ts
interface RepeatSelectorProps {
  repeatCount: RepeatCount
  isActive: boolean
  onClick: () => void
}
```

---

## Values

Setiap nilai memiliki ikon child-friendly:

```text
🐣 1x
🐥 5x
🐤 10x
🦜 25x
🦅 50x
♾️ Infinite
```

Label utama selalu memakai
ikon + angka.

---

## Visual

```text
Height : 40px
Radius : 999px (pill)
```

### Default

```text
Background : White
Border     : Gray-200
Text       : Primary

Format:
[ 🐥 5x ▼ ]
```

### Active

```text
Background : Emerald
Text       : White

Format:
[ 🐥 5x ▼ ]
```

---

## Interaction

### Click

```text
Open RepeatSettingsDialog
```

---

## Important

```text
Ikon harus tetap terasa hangat
untuk anak, tanpa membuat UI
terkesan seperti game.

Repeat selector tidak boleh
disembunyikan di menu dalam.
```

---

# 13. RepeatSettingsDialog

## Purpose

Konfigurasi repeat.

Desktop:

```text
Dialog
```

Mobile:

```text
Bottom Sheet
```

---

## Props

```ts
interface RepeatSettingsDialogProps {
  repeatCount: RepeatCount

  targetType: RepeatTarget

  fromAyah?: number
  toAyah?: number

  onApply: (config: {
    repeatCount: RepeatCount
    targetType: RepeatTarget
    fromAyah?: number
    toAyah?: number
  }) => void
}
```

---

## Layout Order

Urutan field mengikuti wireframe:

```text
1. Repeat Count
2. Target
3. (Conditional) Range Inputs
4. Tombol Terapkan
```

---

## Repeat Count

```text
○ 🐣 1x
● 🐥 5x
○ 🐤 10x
○ 🦜 25x
○ 🦅 50x
○ ♾️ Infinite
```

---

## Target

### Current Ayah

```text
● Ayat Aktif
```

### Ayah Range

```text
○ Range Ayat
```

Field tambahan (muncul saat Range dipilih):

```text
Dari Ayat   [ 1 ]
Sampai Ayat [ 5 ]
```

### Entire Surah

```text
○ Surat Ini
```

---

## Preview

### Current Ayah

```text
Ayat 2 • 5x
```

### Range

```text
Ayat 1-5 • 10x
```

### Surah

```text
Al-Fatihah • 5x
```

---

## Action

```text
[ Terapkan ]
```

---

## Important

```text
Repeat Count diletakkan di atas
Target agar user pertama-tama
memilih "berapa kali", baru
"apa yang diulang".

Urutan ini mengikuti
08-ui-ux-wireframe.md.
```

---

# 14. RepeatStatus

## Purpose

Menampilkan status repeat yang sedang aktif.

Hanya muncul saat repeat aktif.

---

## Props

```ts
interface RepeatStatusProps {
  targetType: RepeatTarget

  currentCycle: number
  totalCycles: number

  currentAyah?: number

  fromAyah?: number
  toAyah?: number

  totalAyahsInSurah?: number
}
```

---

## Visual

```text
Prefix : 🟢
```

---

## Examples

### Current Ayah

```text
🟢 Ayat Aktif
Ayat 2 • 4x tersisa
```

---

### Range

```text
🟢 Range Ayat 1-5
Siklus 2 / 5
Sedang di Ayat 3
```

---

### Entire Surah

```text
🟢 Surat Al-Fatihah
Siklus 2 / 5
Sedang di Ayat 3 dari 7
```

---

## Important

```text
Saat target adalah Ayat Aktif:
playback berhenti setelah jumlah
repeat selesai.

Saat target adalah Range / Surat:
satu siklus harus selesai sebelum
counter dikurangi.
```

---

# 15. FocusModeScreen

## Purpose

Mode hafalan tanpa distraksi.

Quran text mengisi sebagian besar layar.

---

## Props

```ts
interface FocusModeScreenProps {
  surahName: string
  currentAyah: number
  totalAyahs: number

  arabicText: string
  transliteration?: string
  translation?: string
  showTransliteration: boolean
  showTranslation: boolean

  repeatTarget: RepeatTarget
  repeatCount: RepeatCount

  onExit: () => void
}
```

---

## Content Order

Mengikuti preferensi dari `VerseDisplayControls` / Dexie settings:

```text
Arabic
↓ Transliteration (jika showTransliteration)
↓ Translation (jika showTranslation)
```

> Mode Fokus mengubah **cara** ayat disajikan, bukan konten yang ditampilkan. Lihat `docs/22-verse-display-controls.md`.

---

## Visible Elements

```text
Top Bar (Keluar + Ayat N / Total)

Quran Text (48px / 56px)

Progress

FocusModePlayer
  ├── Previous Ayah (ikon ⏮, sama AudioPlayer)
  ├── Play / Pause
  └── Next Ayah (ikon ⏭, sama AudioPlayer)

RepeatSelector

RepeatStatus
```

> Navigasi ayat **tidak** memakai tombol teks penuh terpisah di bawah footer — ikon prev/next digabung dalam `FocusModePlayer`.

---

## Hidden Elements

```text
Search
Surah List
Settings Groups
VerseDisplayControls
BottomNavigation
Sidebar / Widget
Dekorasi besar
```

---

## Visual

```text
Background : Warm White / Subtle Emerald Tint
Alignment  : Center
```

---

## Important

```text
Tombol Keluar harus selalu
mudah ditemukan.

State Terjemahan dan Transliterasi
dipertahankan dari Surah Detail —
tidak di-reset saat masuk/keluar Fokus.

Tidak ada animasi besar
saat teks Arab terlihat.
```

---

# 16. FocusModePlayer

## Purpose

Player khusus Focus Mode — **baris kontrol audio selaras `AudioPlayer`** (progress + ⏮ play/pause ⏭), tanpa chrome sticky bawah.

---

## Props

```ts
interface FocusModePlayerProps {
  isPlaying: boolean
  progress: number

  onPlayPause: () => void
  onPrevious?: () => void
  onNext?: () => void
}
```

---

## Controls

```text
Baris tunggal (gap 24px, sama AudioPlayer §9):
  SkipBack (⏮) — aria-label dari namespace `surah.previousAyah`
  Play / Pause — tombol bulat primary
  SkipForward (⏭) — aria-label dari namespace `surah.nextAyah`
```

Ikon: `lucide-react` `SkipBack` / `SkipForward`, ukuran 20px. Tombol samping: `rounded-lg p-2 hover:bg-secondary`.

---

## Progress

```text
Track    : Gray-200
Progress : Emerald
Thumb    : Emerald
```

---

## Important

```text
Player Focus Mode tidak menampilkan
metadata surat besar.

Fokus tetap pada teks ayat.
```

---

# 17. SettingsCard

## Purpose

Kelompok pengaturan.

Setiap pengaturan menjadi card sendiri.

---

## Visual

```text
Background : White
Radius     : 16px
Padding    : 16px
```

---

## Section Order

Mengikuti urutan wireframe:

```text
1. Bahasa Aplikasi
2. Ukuran Teks Arab
3. Reciter
4. Kontras Tinggi
5. Offline & Cache
```

> **Catatan:** Toggle Terjemahan dan Transliterasi **tidak** ada di Pengaturan — hanya di `VerseDisplayControls` pada Surah Detail (`docs/22-verse-display-controls.md`).

---

## Sections

### Bahasa Aplikasi

```text
SegmentedControl atau Select:
  Bahasa Indonesia (id)
  English (en)
```

- Label section & deskripsi dilokalisasi via `next-intl`
- Nilai disimpan: `settings.appLocale`
- Spesifikasi: `docs/21-i18n-and-locale.md`

### Ukuran Teks Arab

```text
[Kecil] [Sedang] [Besar]
```

### Reciter

```text
ReciterSelector
```

### Kontras Tinggi

```text
[ON / OFF]
```

### Offline & Cache

```text
Audio tersimpan : 24 MB
Data Quran      : Cached

[Bersihkan Cache]
```

---

## Important

```text
Bahasa setting harus ramah
non-teknis.

Tombol "Bersihkan Cache" harus
meminta konfirmasi sebelum
menghapus.
```

---

# 18. ReciterSelector

## Purpose

Memilih qari.

---

## Props

```ts
interface ReciterSelectorProps {
  selectedReciter: string
  onChange: (reciter: string) => void
}
```

---

## Examples

```text
Misyari Rasyid Alafasy
Abdul Basit Abdus Samad
Saad Al-Ghamdi
```

---

## Visual

```text
Komponen : Dropdown
Format   : [ Misyari Alafasy ▼ ]
Height   : 44px
Radius   : 12px
```

---

# 19. BottomNavigation

## Purpose

Navigasi utama mobile.

V1 hanya berisi Home dan Settings.

---

## Props

```ts
interface BottomNavigationProps {
  activeRoute: "home" | "settings"
}
```

---

## Items

```text
Home
Settings
```

---

## Visual

```text
Background  : White
Border Top  : Gray-200
Height      : 64px
Active text : Emerald
Inactive    : Gray-400
```

---

## Important

```text
Tidak ada Profile.
Tidak ada Library.
Tidak ada Explore.
Tidak ada Achievements.

V1 hanya:
Home
Settings
```

---

# 20. BottomSheet

## Purpose

Container konfigurasi mobile.

---

## Visual

```text
Radius     : 24px 24px 0 0
Max Width  : 640px
Background : White
Shadow     : Large
```

---

## Usage

```text
RepeatSettingsDialog (mobile)
ReciterSelector (mobile)
Future Settings
```

---

## Behavior

```text
Slide up dari bawah.
Backdrop overlay.
Dapat ditutup dengan
swipe down atau tap backdrop.
```

---

# 21. OfflineStatusBadge

## Purpose

Menampilkan status koneksi dan cache pada area konten.

---

## Props

```ts
interface OfflineStatusBadgeProps {
  status: ConnectionStatus
}
```

---

## States

### Online

```text
● Online
Color : Emerald
```

### Offline Ready

```text
● Offline Ready
Color : Emerald
```

### Downloading

```text
⬇ Mengunduh Audio...
Color : Amber
```

### Download Failed

```text
⚠ Audio Belum Tersedia Offline
Color : Red (muted)
```

### Offline

```text
● Offline
Color : Gray
```

---

# 22. ConnectionIndicator

## Purpose

Status koneksi singkat di Home Header.

Subset dari OfflineStatusBadge.

---

## Props

```ts
interface ConnectionIndicatorProps {
  status: Extract<
    ConnectionStatus,
    "online" | "offline_ready" | "offline"
  >
}
```

---

## States

```text
● Online
● Offline Ready
● Offline
```

---

## Important

```text
ConnectionIndicator hanya menampilkan
3 state ringkas pada header.

State "downloading" dan
"download_failed" ditampilkan oleh
OfflineStatusBadge di konten surat,
bukan di header.
```

---

# 23. OfflineBanner

## Purpose

Memberi tahu user saat aplikasi
sedang berjalan dari cache penuh.

Muncul satu kali per sesi.

---

## Props

```ts
interface OfflineBannerProps {
  visible: boolean
  onDismiss: () => void
}
```

---

## Visual

```text
Background : Gray-50
Border     : Gray-200
Padding    : 12px 16px
Text       : Secondary
Radius     : 12px
```

---

## Content

```text
Offline • Menampilkan data tersimpan
```

---

## Important

```text
Banner harus ringkas.

Tidak boleh terlihat panik
atau menyalahkan user.
```

---

# 24. EmptyState

## Purpose

Tampilan saat belum ada data.

---

## Props

```ts
interface EmptyStateProps {
  variant: "favorites_empty" | "last_read_empty"
  onAction?: () => void
}
```

---

## Variants

### Favorites Empty

```text
Icon : ☆ outline
Title: Belum ada surat favorit.
Body : Tandai surat yang sering
       dihafal agar lebih cepat
       dibuka.
```

### Last Read Empty

```text
Icon : Buku
Title: Belum ada bacaan terakhir.
Body : Mulai dari surat favoritmu.
```

---

## Visual

```text
Alignment : Center
Padding   : 32px
Icon size : 48px
Text      : Secondary
```

---

## Important

```text
Empty state tidak boleh
menggunakan ilustrasi besar
yang mengalihkan fokus.
```

---

# 25. Logo / LogoWithText

## Purpose

Brand mark resmi HanQuran. Memastikan identitas visual konsisten pada
header, splash, favicon, dan area lain yang menampilkan brand.

Sumber aset & aturan visual mengikuti `branding/logo-guidelines.md`.

---

## Props

```ts
interface LogoProps {
  // Tinggi logo dalam piksel. Default Logo = 40, LogoWithText = 56.
  // Minimum 24px (sesuai logo-guidelines.md).
  size?: number

  className?: string

  // Preload aset, dipakai pada header utama atau splash.
  priority?: boolean

  // Override alt text. Set "" untuk pemakaian dekoratif.
  alt?: string
}
```

---

## Variants

### Logo (icon-only)

```text
Aset      : /branding/logo.png
Konten    : Letter H + Open Mushaf + Light Star
Pemakaian : Favicon, header kompak, ruang sempit
```

### LogoWithText (icon + wordmark)

```text
Aset      : /branding/logo-with-text.png
Konten    : Icon + wordmark "HanQuran"
Pemakaian : Splash / loading, landing, dokumentasi
```

---

## Visual

```text
Aspect ratio  : Mengikuti aset asli (1536:1024)
Safe area     : 1× tinggi bintang (jangan tempatkan
                elemen lain di dalam area ini)
Minimum size  : 24px (digital), 32px (recommended)
Warna         : Gunakan aset asli; jangan ubah warna
Modifikasi    : Tidak boleh diputar, di-shadow, di-outline,
                atau diberi efek 3D
```

---

## Integration Points

```text
Home Header        → Logo size 40
Settings Header    → Logo size 24
app/loading.tsx    → LogoWithText size 72
Favicon (layout)   → /branding/logo.png
```

---

# Component Priority

## Core Components

Komponen yang menentukan pengalaman hafalan inti.

```text
AyahCard
AyahWordHighlight
AudioPlayer
RepeatSelector
RepeatSettingsDialog
RepeatStatus
FocusModeScreen
FocusModePlayer
```

---

## Secondary Components

Komponen pendukung pengalaman utama.

```text
ContinueReadingCard
SearchInput
SurahCard
SurahMetaHeader
VerseDisplayControls
TranslationToggle
TransliterationToggle
FocusModeButton
FavoriteButton
FavoriteFilter
SettingsCard
ReciterSelector
```

---

## Utility Components

Komponen sistemik dan layout dasar.

```text
BottomNavigation
BottomSheet
OfflineStatusBadge
ConnectionIndicator
OfflineBanner
EmptyState
```

---

# Design Authority

Saat terjadi konflik antar dokumen,
gunakan urutan berikut:

```text
1. 08-ui-ux-wireframe.md
2. 09-design-system.md
3. 10-high-fidelity-ui.md
4. 11-v0-master-prompt.md
5. 12-component-spec.md (dokumen ini)
```

Component Spec tidak boleh
menambah fitur yang tidak
terdefinisi di wireframe atau
high-fidelity UI.

---
