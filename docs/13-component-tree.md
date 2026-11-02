# 13 — Struktur Komponen HanQuran

Dokumen ini memetakan pohon komponen **aktual** HanQuran untuk developer baru: siapa merender siapa, tanggung jawab, dan dependensi utama.

**Terakhir disinkronkan dengan kode:** 2 November 2026 (versi `0.6.0`). Spesifikasi visual & props tiap komponen: `docs/12-component-spec.md`. Lokasi file: `docs/16-folder-structure.md`.

---

## Ringkasan Cepat

- **Halaman:** Beranda, Surah Detail, Mode Fokus, Pengaturan, Tentang.
- **Pola server/client:** `app/page.tsx` dan `app/surah/[id]/page.tsx` adalah **server component** (SSG) yang mengirim seed data ke client component (`HomeClient`, `SurahDetailClient`). Mode Fokus & Pengaturan adalah client page.
- **Global:** `AppProviders` membungkus semua halaman (i18n, aksesibilitas, gerbang Threads, toast, splash PWA, shell native).
- **Primitives:** `components/ui/*` di atas `@base-ui/react`.

---

## Diagram Pohon

```
RootLayout (app/layout.tsx)
├─ skrip pra-paint: locale, PWA launch, gerbang Threads (docs/21 §5.6, docs/34 §14)
├─ JsonLd (WebSite)
├─ #pwa-splash
├─ AppProviders
│  └─ ErrorBoundary
│     └─ IntlProvider
│        └─ AccessibilityProvider
│           ├─ NativeShellBootstrap      (Android: status bar, back button)
│           ├─ PwaSplashDismisser
│           ├─ ThreadsGate               (overlay sekali; tidak tampil bila env URL Threads dikosongkan)
│           ├─ AppToastHost
│           └─ {halaman}
└─ <Analytics/>                          (Vercel, web production saja)

Beranda — app/page.tsx (server, SSG)
└─ HomeClient
   ├─ Header                             (logo, ConnectionIndicator, link Pengaturan)
   ├─ ContinueReadingSection → ContinueReading   (hanya setelah Dexie siap & ada lastRead)
   ├─ InstallBanner
   ├─ SearchInput
   ├─ FilterChips                        (Semua / Favorit)
   ├─ LazySurahCard × 114 → SurahCard    (content-visibility; tombol favorit saudara tautan)
   └─ HomeFooter                         (bagian disembunyikan bila env dikosongkan)

Surah Detail — app/surah/[id]/page.tsx (server, SSG)
├─ JsonLd × 2 (ContentPage, BreadcrumbList)
└─ SurahDetailClient
   └─ SurahDetailView
      ├─ Suspense → StartAyahSync        (?ayah → ayat aktif)
      ├─ SurahDetailTopChrome (sticky)
      │  ├─ SurahDetailHeader            (judul, favorit, badge Siap Offline)
      │  ├─ SurahOfflineDownload         (Simpan Offline + progres)
      │  └─ VerseDisplayControls         (Terjemahan / Transliterasi / Fokus)
      ├─ AyahCard × n                    (font Amiri Quran)
      ├─ SurahDetailScrollSpacer
      ├─ AudioPlayer (fixed bawah)
      │  └─ toolbarStart: RepeatSelector (inline) → RepeatProgressBadge
      ├─ notifikasi "Al-Qur'an selesai" (Murotal)
      └─ RepeatSettingsDialog            (Drawer di HP, Dialog di desktop) → RepeatStatus

Mode Fokus — app/focus/[id]/page.tsx (client)
└─ FocusModePage → FocusModeLoaded
   ├─ header: tombol Keluar + penghitung ayat
   ├─ ayat aktif (AnimatePresence; Arab + transliterasi/terjemahan opsional)
   ├─ AudioPlayer → RepeatSelector (inline)
   └─ RepeatSettingsDialog

Pengaturan — app/settings/page.tsx (client)
├─ SettingsHeader
├─ pemberitahuan "Data tidak dapat disimpan" (degraded mode, docs/15 §12.5)
├─ SettingsSection × n                   (Bahasa, Qari, Playback, Ukuran Teks + TextSizePreview,
│                                         Offline & Cache + OfflineStatusBadge, Aksesibilitas)
│  └─ SettingsRow + Select / Switch / SegmentedControl
├─ ClearCacheDialog
└─ tautan → Tentang

Tentang — app/settings/about/page.tsx (client)
├─ AboutHeader
└─ SettingsSection × n                   (info, misi, sumber data, repository & lisensi)
```

---

## Penjelasan Komponen

### Halaman & client root

| Komponen | Tanggung jawab | Dependensi utama |
|----------|----------------|------------------|
| `Home` (`app/page.tsx`) | Baca ringkasan 114 surat saat build (`readSurahListForServer`) → seed `HomeClient` | `services/quran/server-surah.ts` |
| `HomeClient` | Pencarian, filter, favorit; daftar surat dari seed (tanpa fetch untuk locale `id`) | `useSurahList`, `useUserStore` (slice `favorites`), `matchesSurahSearch` |
| `SurahDetailPage` | Validasi id, metadata SEO, JSON-LD, seed konten | `readSurahForServer`, `lib/schema-org.ts` |
| `SurahDetailClient` / `SurahDetailView` | Ayat aktif, playback & repeat, favorit, auto follow, simpan posisi baca | `useSurah`, `useSurahRepeatPlayback`, `useAutoFollowPlayback`, `usePersistLastViewed`, `useSurahDetailBottomInset` |
| `FocusModePage` | Satu ayat besar tanpa distraksi; `?ayah` divalidasi `parseAyahParam` | `useSurah`, `useSurahRepeatPlayback`, `useArabicTextSize` |
| `SettingsPage` | Seluruh preferensi; hapus cache audio | `useUserStore.updateSettings`, `useOfflineStore`, `services/cache-manager.ts` |

### Komponen layar

| Komponen | Tanggung jawab |
|----------|----------------|
| `Header` | Bar atas Beranda: logo, indikator koneksi (`ConnectionIndicator`), tautan Pengaturan |
| `ContinueReading` | Kartu Lanjutkan Hafalan → `/surah/[id]?ayah=n` |
| `SearchInput`, `FilterChips` | Callback `onSearch` / `onFilterChange`; state tetap di `HomeClient` |
| `SurahCard` / `LazySurahCard` | Ringkasan surat + favorit; lihat `docs/12` §4 untuk struktur DOM |
| `SurahDetailHeader` | Nama surat, jumlah ayat, Makkiyah/Madaniyah, favorit, badge Siap Offline |
| `SurahOfflineDownload` | Tombol Simpan Offline; aktif hanya setelah hidrasi bila Cache Storage tersedia |
| `VerseDisplayControls` | Toggle terjemahan/transliterasi + masuk Mode Fokus (`docs/22`) |
| `AyahCard` | Satu ayat; status aktif; klik memilih ayat |
| `AudioPlayer` | Chrome audio bawah: progres, play/pause, prev/next, slot `toolbarStart` |
| `RepeatSelector`, `RepeatProgressBadge`, `RepeatStatus`, `RepeatSettingsDialog` | UI repeat (`docs/12`, `lib/repeat-*.ts`) |
| `OfflineStatusBadge` (+ `ConnectionIndicator`) | Varian status koneksi/cache |
| `SettingsSection` / `SettingsRow` | Layout bagian & baris pengaturan |
| `NativeAwareLink` | `next/link` di web; `<a>` ke file `.html` di Android |
| `JsonLd` | Structured data dengan escape `<` |

### Komponen bersama (`components/shared`)

| Komponen | Tanggung jawab |
|----------|----------------|
| `Logo` | Brand mark via `next/image` (`public/branding/*`) |
| `ThreadsGate` | Overlay kustom (bukan `Dialog`) sekali pakai; `docs/34` |
| `InstallBanner` | Ajakan instal PWA (disembunyikan di native) |
| `LocaleText` | Render teks `id` + `en` sekaligus, dipilih CSS sebelum paint (`docs/21` §5.6) |
| `ErrorBoundary`, `ErrorFallback` (`DataLoadErrorFallback`) | Penanganan error render & gagal muat data |
| `AppToastHost`, `PwaSplashDismisser` | Toast global; menutup splash PWA |

### Primitives (`components/ui`)

`Button`, `Dialog`, `Drawer`, `Select`, `Switch` (di atas `@base-ui/react`), `SegmentedControl` (React murni). Tidak boleh mengimpor `stores/` atau `services/`.

---

## Komponen Tidak Dipakai

File berikut masih ada tetapi **tidak di-import** di mana pun (dicek 2 Nov 2026). Jangan dijadikan acuan; kandidat dihapus.

| File | Keterangan |
|------|------------|
| `components/action-bar.tsx` | Digantikan `VerseDisplayControls` (`docs/22`) |
| `components/favorites.tsx` | Daftar favorit lama; diganti filter chip "Favorit" |
| `components/bottom-navigation.tsx` | Navigasi bawah tidak dipakai di MVP |
| `components/focus-mode-player.tsx` | Digantikan `AudioPlayer` di Mode Fokus |
| `components/ayah-word-highlight.tsx` | Word highlight Post-MVP (`docs/24`) |

---

## Catatan untuk Kontributor

- Gunakan primitives `components/ui` untuk komponen baru.
- Logika domain di `lib/` / `services/`, bukan di komponen.
- Komponen yang di-SSR tidak boleh memakai nilai khusus browser pada render pertama (`docs/15` §13).

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| Juni 2026 | Dokumen awal |
| 2 November 2026 | Ditulis ulang: pola server/client (SSG + seed), `HomeClient`, `SurahDetailClient`, top chrome, Simpan Offline, `StartAyahSync`, degraded mode; komponen tidak dipakai dipisah ke tabel tersendiri; referensi `lib/surahs-data` (sudah dihapus) dibuang |
