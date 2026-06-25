# 13 — Struktur Komponen HanQuran

Dokumen ini mendokumentasikan struktur komponen pada proyek HanQuran. Ditujukan untuk developer baru agar cepat memahami hubungan antar-komponen, tanggung jawab, dan dependensi utama.

> Catatan: deskripsi mengikuti implementasi aktual pada folder `hanquran-app/components` dan `components/ui`.

## Ringkasan cepat
- Pages: Beranda, Halaman Surat (Surah detail), Mode Fokus, Pengaturan.
- Screen Components: header, action bar, surah list/card, ayah card, audio player, repeat inline, dll.
- Shared Components: header, bottom navigation, offline badge, audio player, repeat dialog.
- UI Components: atoms dan primitives di `components/ui` (Button, Dialog, Drawer, SegmentedControl, Select, Switch).

---

## Diagram Pohon (Tree)

```
HanQuran
├─ Pages
│  ├─ Home (app/page.tsx)
│  │  ├─ Header
│  │  ├─ ContinueReading
│  │  ├─ SearchInput
│  │  ├─ FilterChips
│  │  └─ SurahCard (list)
│  ├─ SurahDetail (app/surah/[id]/page.tsx)
│  │  ├─ SurahDetailHeader
│  │  ├─ VerseDisplayControls
│  │  ├─ AyahCard (list)
│  │  ├─ SurahDetailScrollSpacer
│  │  └─ AudioPlayer (fixed)
│  │      └─ RepeatSelector (inline, toolbarStart)
│  ├─ FocusMode (app/focus/[id]/page.tsx)
│  │  ├─ AyahWordHighlight (stub Post-MVP)
│  │  └─ AudioPlayer (fixed)
│  │      └─ RepeatSelector (inline) + RepeatSettingsDialog
│  └─ Settings (app/settings/page.tsx)
│     ├─ SettingsHeader
│     ├─ SettingsSection / SettingsRow
│     └─ Link → About (app/settings/about/page.tsx)
│        ├─ AboutHeader
│        └─ SettingsSection (info, mission, credits, repository)
│     ├─ OfflineStatusBadge
│     └─ UI primitives (Select, Switch, SegmentedControl)

├─ Screen Components
│  ├─ Header
│  ├─ VerseDisplayControls
│  ├─ SurahDetailHeader
│  ├─ SurahCard
│  ├─ AyahCard
│  ├─ ContinueReading
│  ├─ SearchInput
│  ├─ FilterChips
│  ├─ Favorites
│  ├─ BottomNavigation
│  ├─ AudioPlayer
│  ├─ RepeatSelector
│  ├─ RepeatSettingsDialog
│  ├─ SurahDetailScrollSpacer
│  ├─ FocusModePlayer (legacy, tidak dipakai)
│  └─ SettingsSection / SettingsRow

├─ Shared Components (components/shared)
│  └─ Logo / LogoWithText (brand mark)
│
└─ UI Components (components/ui)
   ├─ Button
   ├─ Dialog (DialogContent, DialogHeader, ...) 
   ├─ Drawer (DrawerContent, DrawerHeader, ...)
   ├─ SegmentedControl
   ├─ Select (SelectTrigger, SelectContent, SelectItem...)
   └─ Switch
```

---

## Kelompok dan Penjelasan Komponen

Semua penjelasan ditulis dalam Bahasa Indonesia dan mengikuti implementasi saat ini.

**Halaman (Pages)**

- Home (app/page.tsx)
  - Tujuan: Menampilkan daftar surah, pencarian, dan kartu "Lanjutkan Hafalan".
  - Tanggung jawab: Mengelola state pencarian dan filter, memuat data surah dari `lib/surahs-data` dan merender komponen list.
  - Dependensi utama: `Header`, `ContinueReading`, `SearchInput`, `FilterChips`, `SurahCard`, util `lib/surahs-data`.
  - Reusable: Tidak (halaman spesifik).

- SurahDetail (app/surah/[id]/page.tsx)
  - Tujuan: Menyajikan daftar ayat pada sebuah surat, kontrol audio, dan fitur repeat/fokus.
  - Tanggung jawab: Mengelola ayat aktif, status pemutaran, pengaturan repeat, dan membuka Mode Fokus.
  - Dependensi utama: `SurahDetailHeader`, `VerseDisplayControls`, `AyahCard`, `AudioPlayer`, `RepeatSelector` (inline), `RepeatSettingsDialog`, `SurahDetailScrollSpacer`, `useSurahDetailBottomInset`, `useSurahRepeatPlayback`.
  - Reusable: Tidak (halaman spesifik).

- FocusMode (app/focus/[id]/page.tsx)
  - Tujuan: Layar baca fokus bebas distraksi — satu ayat nyata, tanpa word highlight MVP.
  - Tanggung jawab: Menampilkan ayat aktif, audio play/pause, navigasi prev/next, preferensi baca, keluar ke Surah Detail.
  - Dependensi utama: `AudioPlayer`, `RepeatSelector` (inline), `RepeatSettingsDialog`, `useSurah`, `useReadingDisplay`, `useSurahRepeatPlayback`, `useSurahDetailBottomInset`.
  - Reusable: Tidak (mode khusus).

- Settings (app/settings/page.tsx)
  - Tujuan: Menyediakan konfigurasi aplikasi (bahasa UI, qari, ukuran teks, playback, offline, dsb.).
  - Tanggung jawab: Menyusun sections pengaturan termasuk **Bahasa Aplikasi**, **Playback**, menampilkan status offline dan kontrol UI untuk memilih opsi.
  - Dependensi utama: `SettingsSection`, `SettingsRow`, `LanguageSetting`, `OfflineStatusBadge`, `next-intl`, `components/ui/*` primitives. Spesifikasi: `docs/21-i18n-and-locale.md`, `docs/28-playback-settings.md`, `docs/29-murotal-mode-spec.md`.
  - Reusable: Tidak (halaman konfigurasi), beberapa sub-komponen bersifat reusable.

**Komponen Layar (Screen Components)**

Untuk setiap entri: Tujuan / Tanggung jawab / Dependensi / Reusable

- `Header`
  - Tujuan: Bar atas pada banyak halaman, menampilkan judul dan akses ke halaman Pengaturan.
  - Tanggung jawab: Menampilkan status koneksi (menggunakan window.online/offline), link ke pengaturan.
  - Dependensi utama: `routes` util.
  - Reusable: Ya (dipakai di beberapa halaman).

- `VerseDisplayControls` (alias `ActionBar`)
  - Tujuan: Kontrol tampilan ayat di halaman surat — Terjemahan, Transliterasi, Fokus — selalu terlihat dalam satu baris horizontal di bawah header.
  - Spesifikasi: `docs/22-verse-display-controls.md`
  - Tanggung jawab: Menyediakan tombol aksi yang relevan untuk konteks SurahDetail.
  - Dependensi utama: props callback dari SurahDetail.
  - Reusable: Ya (dipakai pada SurahDetail dan konteks lain jika perlu).

- `SurahDetailHeader`
  - Tujuan: Header khusus pada halaman Surat menampilkan metadata surat dan tombol favorit.
  - Tanggung jawab: Render judul surat, statistik, dan state offline-ready.
  - Dependensi utama: `routes` util.
  - Reusable: Ya (khusus halaman surah tetapi dapat dipakai lagi dengan props yang sesuai).

- `SurahCard`
  - Tujuan: Representasi singkat sebuah surat di daftar utama.
  - Tanggung jawab: Render nama surat, jumlah ayat, tipe, dan tombol favorit; link ke halaman surat.
  - Dependensi utama: `routes` util, ikon `Heart`.
  - Reusable: Ya.

- `AyahCard`
  - Tujuan: Menampilkan satu ayat (Arab + transliterasi opsional + terjemahan opsional) di halaman SurahDetail.
  - Tanggung jawab: Menangani state isActive/isCompleted UI dan klik untuk memilih ayat.
  - Dependensi utama: props dari SurahDetail.
  - Reusable: Ya (lihat daftar ayat).

- `ContinueReading`
  - Tujuan: Kartu promosi untuk melanjutkan hafalan yang merujuk ke ayat tertentu.
  - Tanggung jawab: Menampilkan progress singkat dan link ke ayat.
  - Dependensi utama: `routes` util.
  - Reusable: Ya.

- `SearchInput`
  - Tujuan: Input pencarian di halaman utama.
  - Tanggung jawab: Menyediakan callback `onSearch` saat query berubah.
  - Dependensi utama: none (murni UI + event).
  - Reusable: Ya.

- `FilterChips`
  - Tujuan: Filter singkat (Semua / Favorit) di halaman utama.
  - Tanggung jawab: Menyediakan callback `onFilterChange`.
  - Dependensi utama: none.
  - Reusable: Ya.

- `Favorites`
  - Tujuan: Menampilkan daftar surat favorit pengguna dalam bentuk compact.
  - Tanggung jawab: Toggle tampilan, menerima daftar favorit dari parent.
  - Dependensi utama: props `favorites`.
  - Reusable: Ya.

- `BottomNavigation`
  - Tujuan: Navigasi bawah (Beranda / Pengaturan).
  - Tanggung jawab: Menangani highlight item aktif dan callback navigasi.
  - Dependensi utama: ikon lucide.
  - Reusable: Ya.

- `AudioPlayer`
  - Tujuan: Pemain audio fixed di bagian bawah (Surah Detail & Focus Mode).
  - Tanggung jawab: Progress, play/pause, prev/next, slot `toolbarStart` untuk repeat inline; ukur tinggi chrome via ref untuk scroll spacer.
  - Dependensi utama: `useAudio`, `lib/surah-detail-chrome`.
  - Reusable: Ya.

- `FocusModePlayer` *(legacy)*
  - Tujuan: Digantikan `AudioPlayer` di Focus Mode. File masih ada, tidak dirender.
  - Reusable: Tidak (deprecated).

- `RepeatSelector`
  - Tujuan: Kontrol ringkas jumlah repeat (`variant="inline"` di audio bar) atau panel vertikal legacy.
  - Tanggung jawab: Select jumlah + `RepeatProgressBadge` (x/y saat aktif) + tombol ⚙ ke `RepeatSettingsDialog`.
  - Dependensi utama: `lib/repeat-options`, `lib/repeat-progress`, `components/repeat-progress-badge`, `components/ui/select`.
  - Reusable: Ya.

- `RepeatProgressBadge`
  - Tujuan: Label fraksi progress repeat (mis. `2/5`, `3/∞`).
  - Tanggung jawab: Render badge emerald di audio bar & di dalam `RepeatStatus`.
  - Dependensi utama: `lib/repeat-progress`, `lib/repeat-options`.
  - Reusable: Ya.

- `SurahDetailScrollSpacer`
  - Tujuan: Ruang scroll di akhir daftar ayat agar ayat terakhir tidak tertutup chrome audio.
  - Tanggung jawab: Menerima `height` dari `useSurahDetailBottomInset` (≈ tinggi audio + 16px comfort).
  - Reusable: Ya (Surah Detail).

- `RepeatStatus`
  - Tujuan: Menampilkan status repeat (target, konteks ayat) + badge x/y.
  - Tanggung jawab: Kartu panel/dialog; di inline hanya badge lewat `RepeatSelector`.
  - Dependensi utama: `RepeatProgressBadge`, `lib/repeat-options`.
  - Reusable: Ya.

- `RepeatSettingsDialog`
  - Tujuan: Dialog / drawer pengaturan repeat (count, target, range).
  - Tanggung jawab: Drawer di mobile & landscape HP (`DESKTOP_DIALOG_MEDIA` dari `lib/viewport.ts`); Dialog di desktop/tablet tinggi.
  - Dependensi utama: `components/ui/dialog`, `components/ui/drawer`, `hooks/use-media-query`, `lib/viewport`, `lib/repeat-options`.
  - Reusable: Ya.

- `OfflineStatusBadge`
  - Tujuan: Menampilkan status koneksi dan cache (online / offline_ready / downloading / download_failed / offline).
  - Tanggung jawab: Render variant label+ikon sesuai state.
  - Dependensi utama: none.
  - Reusable: Ya.

- `SettingsSection` / `SettingsRow`
  - Tujuan: Wrapper UI untuk layout bagian pengaturan.
  - Tanggung jawab: Menyajikan header, deskripsi, dan konten; menyediakan row label+control.
  - Dependensi utama: `components/ui/*` primitives.
  - Reusable: Ya.

**Komponen Bersama (Shared Components)**

Ini adalah komponen yang digunakan lintas halaman sebagai building block:
- `Header`, `BottomNavigation`, `OfflineStatusBadge`, `AudioPlayer`, `RepeatSettingsDialog`, `RepeatStatus`, `VerseDisplayControls`, `SearchInput`, `FilterChips`, `ContinueReading`, `Favorites`.

Untuk setiap shared component, tanggung jawab dan dependensi sudah dicantumkan di atas pada bagian Screen Components.

Folder khusus brand: `components/shared`

- `Logo` / `LogoWithText` (components/shared/Logo.tsx)
  - Tujuan: Menampilkan brand mark HanQuran secara konsisten.
  - Tanggung jawab: Membungkus `next/image` dengan aturan ukuran minimum dan aspect ratio asli aset.
  - Dependensi utama: `next/image`, aset `public/branding/logo.png` dan `public/branding/logo-with-text.png`, `branding/logo-guidelines.md`.
  - Reusable: Ya (Home Header, Settings Header, `app/loading.tsx`, dan lokasi brand lainnya).

**Komponen UI (UI Components)**

Folder: `components/ui`

- `Button`
  - Tujuan: Primitive tombol dengan variant/style system.
  - Tanggung jawab: Menyediakan API varian (default, outline, secondary, ghost, destructive, link) dan ukuran.
  - Dependensi utama: `@base-ui/react/button` primitive, `class-variance-authority`.
  - Reusable: Ya (atom).

- `Dialog` dan sub-komponen (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, dll.)
  - Tujuan: Primitive dialog modal.
  - Tanggung jawab: Abstraksi wrapper di atas primitive library, menambah styling khas proyek.
  - Dependensi utama: `@base-ui/react/dialog`.
  - Reusable: Ya.

- `Drawer` dan sub-komponen
  - Tujuan: Primitive bottom drawer untuk mobile.
  - Tanggung jawab: Abstraksi styling + struktur.
  - Dependensi utama: `@base-ui/react/drawer`.
  - Reusable: Ya.

- `SegmentedControl`
  - Tujuan: Kontrol segmented untuk pilihan singkat (pilihan tunggal).
  - Tanggung jawab: Render opsi sebagai radio-like segmented buttons.
  - Dependensi utama: none (primitive React).
  - Reusable: Ya.

- `Select` (Trigger, Content, Item, Value)
  - Tujuan: Dropdown select yang dibangun di atas `@base-ui/react/select`.
  - Tanggung jawab: Menyediakan trigger, popup dan item yang konsisten dengan style proyek.
  - Dependensi utama: `@base-ui/react/select`.
  - Reusable: Ya.

- `Switch`
  - Tujuan: Toggle on/off berbentuk switch.
  - Tanggung jawab: Abstraksi di atas primitive switch.
  - Dependensi utama: `@base-ui/react/switch`.
  - Reusable: Ya.

---

## Bagian Khusus

### Komponen inti hafalan (Memorization core)
- `ContinueReading` — kartu entry untuk melanjutkan hafalan.
- `FocusMode` page (`app/focus/[id]/page.tsx`) — layar baca fokus MVP (ayat utuh; word highlight Post-MVP).
- `AyahWordHighlight` — komponen highlight kata; **belum dipakai** di MVP V1 (`docs/24-focus-mode-mvp-scope.md`).
- `RepeatSettingsDialog`, `RepeatSelector`, `lib/repeat-options`, `lib/viewport` — mengatur logika dan UI pengulangan hafalan.

Catatan: state repeat di `useRepeatStore`; UI repeat inline di `AudioPlayer.toolbarStart` pada Surah Detail dan Focus Mode.

### Komponen audio
- `AudioPlayer` — chrome bawah fixed (progress + repeat inline + transport) di Surah Detail dan Focus Mode.
- `FocusModePlayer` — **legacy**, digantikan `AudioPlayer`.
- `useSurahDetailBottomInset` — mengukur tinggi chrome untuk `SurahDetailScrollSpacer` dan padding Focus Mode.

### Komponen repeat
- `RepeatSelector` — `variant="inline"` di audio bar; `variant="panel"` legacy.
- `RepeatSettingsDialog` — drawer (mobile & landscape HP) atau dialog (desktop lebar+tinggi).
- `RepeatStatus` — dipakai di dalam dialog / panel legacy; tidak di chrome bawah.
- `lib/repeat-options.ts` — definisi opsi repeat, helper `getRepeatOption`, `formatRepeatCount`.

### Komponen offline
- `OfflineStatusBadge` — menampilkan lima status koneksi/cache.
- Halaman Pengaturan memanggil badge ini untuk menampilkan status cache audio dan data Al-Qur'an.
- `Header` juga membaca event online/offline untuk menampilkan status ringkas.

---

## Catatan Implementasi & Saran untuk Kontributor Baru
- Komponen UI di `components/ui` adalah primitives: gunakan mereka saat membuat komponen baru agar konsistensi tampilan terjaga.
- Logika domain (surah data, opsi repeat) ditempatkan di `lib/` — pertahankan pemisahan UI vs domain logic.
- Hindari membuat komponen baru jika fungsi sudah tercakup oleh komponen yang ada; prefer props dan composition.

---

Dokumen ini disimpan sebagai `13-component-tree.md` dan mencerminkan struktur kode saat ini.
