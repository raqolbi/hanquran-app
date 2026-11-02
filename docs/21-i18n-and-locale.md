# 21 — Internasionalisasi & Bahasa Aplikasi

**Status:** ✅ Spesifikasi produk & arsitektur — implementasi MVP selesai (24 Juni 2026); hardening paint pertama/F8 selesai (1 November 2026)  
**Berlaku untuk:** MVP V1  
**Framework:** `next-intl`

> Nomor **21** mengisi slot dokumentasi setelah penghapusan `docs/21-api-auth-and-env.md` (integrasi Quran.com — sudah tidak dipakai).

---

# 1. Ringkasan Keputusan

HanQuran mendukung **antarmuka aplikasi multibahasa**.

| Bahasa | Kode locale | Label di Pengaturan |
|--------|-------------|---------------------|
| Bahasa Indonesia | `id` | Bahasa Indonesia |
| English | `en` | English |

Framework lokalisasi UI resmi: **`next-intl`**.

Tidak menggunakan `i18next` / `react-i18next` pada MVP kecuali ada keputusan Change Control di masa depan.

---

# 2. Ruang Lingkup

## 2.1 Yang dilokalisasi (UI aplikasi)

Semua teks antarmuka yang dibaca pengguna:

- Menu & navigasi
- Halaman Pengaturan
- Dialog & bottom sheet (mis. Pengaturan Pengulangan, Hapus Audio Tersimpan)
- Label, tombol, placeholder
- Empty state & error state
- Notifikasi & pesan status
- Onboarding (bila ada di MVP)
- Overlay Gate Threads (`threadsGate.*`, `docs/34-threads-gate-spec.md`)

## 2.2 Yang TIDAK dilokalisasi

Konten Quran dan audio **tetap tidak berubah** karena pengaturan bahasa UI:

| Aspek | Sumber | Catatan |
|-------|--------|---------|
| Teks Arab Uthmani | `public/data/quran/*` | Selalu Arab |
| Transliterasi | Dataset surat | Tidak mengikuti locale UI |
| Terjemahan ayat | `public/data/translations/*` | Bahasa folder mengikuti `appLocale` (`id`/`en`); visibilitas via toggle terjemahan |
| Audio tilawah | CDN audio (`AYAH_AUDIO_BASE_URL`) | Tidak terpengaruh locale UI |
| Metadata qari | `data/reciters.json` | Nama qari proper noun |

> **Pemisahan konsep:** `settings.appLocale` = bahasa **shell aplikasi** + pemilihan folder terjemahan ayat (`id`/`en`). `settings.translationVisible` + `settings.transliterationVisible` = **tampil/sembunyi** konten ayat — dikontrol dari **Verse Display Controls** di Surah Detail (`docs/22-verse-display-controls.md`).

---

# 3. Deteksi Bahasa (First Launch)

Pada **peluncuran pertama** (belum ada `settings.appLocale` tersimpan):

```text
1. Baca navigator.language / navigator.languages (browser locale)
2. Baca Intl.DateTimeFormat().resolvedOptions().timeZone
3. Terapkan aturan di bawah
4. Simpan hasil ke Dexie settings.appLocale
```

## 3.1 Aturan

Default **Bahasa Indonesia** (`id`) jika **salah satu** kondisi terpenuhi:

- Browser locale diawali `id` (mis. `id`, `id-ID`)
- Timezone salah satu dari:
  - `Asia/Jakarta`
  - `Asia/Makassar`
  - `Asia/Jayapura`

Selain itu, default **English** (`en`).

## 3.2 Setelah first launch

```text
settings.appLocale (Dexie) = sumber kebenaran
```

Preferensi pengguna di Pengaturan **menggantikan** deteksi otomatis dan **bertahan** setelah restart aplikasi.

---

# 4. Pengaturan — Bagian Bahasa

## 4.1 Posisi di layar

Bagian baru di halaman `/settings`, **di urutan paling atas** (sebelum Qari dan pengaturan lain), agar pengguna dapat mengganti bahasa shell sebelum membaca label berikutnya.

## 4.2 Wireframe (mobile)

```text
┌──────────────────────────────────────┐
│ ← Kembali            Pengaturan      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Bahasa Aplikasi                  │ │
│ │ Pilih bahasa tampilan aplikasi.  │ │
│ │ [Bahasa Indonesia] [English]     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ … bagian Qari, Terjemahan, dll. …   │
└──────────────────────────────────────┘
```

## 4.3 Opsi

| Nilai disimpan | Label tampilan (di locale aktif) |
|----------------|----------------------------------|
| `id` | Bahasa Indonesia |
| `en` | English |

## 4.4 Perilaku

- Pengguna dapat mengganti bahasa kapan saja.
- Perubahan langsung memperbarui seluruh label UI (tanpa reload penuh jika memungkinkan).
- Nilai disimpan ke `settings.appLocale` di Dexie.
- Tidak menghapus cache Quran atau audio.
- Tidak mengubah route MVP yang dibekukan (`/`, `/surah/[id]`, `/focus/[id]`, `/settings`).

---

# 5. Arsitektur Teknis (`next-intl`)

## 5.1 Prinsip integrasi

- **Route MVP tetap tanpa prefix locale** (sesuai `docs/20-mvp-freeze.md`).
- Locale aktif disuplai dari `settings.appLocale` ke provider `next-intl`.
- Pesan UI disimpan sebagai file terjemahan terpisah, bukan string hardcoded di komponen.

## 5.2 Struktur folder (rencana implementasi)

```text
hanquran-app/
├─ messages/
│  ├─ id.json          # String UI Bahasa Indonesia
│  └─ en.json          # String UI English
├─ i18n/
│  ├─ config.ts        # locales yang didukung: id, en
│  ├─ request.ts       # Resolusi locale per request (baca Dexie / default)
│  └─ detection.ts     # Algoritma first-launch (Bagian 3)
├─ lib/
│  ├─ app-locale.ts    # Cache localStorage + skrip init pra-paint
│  └─ locale-text.ts   # Pasangan teks id/en untuk paint pertama
├─ components/shared/
│  └─ locale-text.tsx  # Render bilingual yang dipilih CSS
└─ app/
   └─ layout.tsx       # NextIntlClientProvider + skrip locale
```

## 5.3 Alur runtime

```text
App start
  │
  ├─ Skrip inline pra-paint: cache `hanquran:app-locale`
  │     └─ set <html data-app-locale> + lang (cache → deteksi → id)
  │
  ├─ settings.appLocale ada di Dexie?
  │     ├─ Ya  → gunakan nilai tersimpan
  │     └─ Tidak → detectLocale() → simpan ke Dexie
  │
  ▼
NextIntlClientProvider(locale, messages)
  │
  ▼
Komponen memakai useTranslations('…') / t('key')
```

## 5.4 Persistensi

Tambahan pada `SettingsRecord` (`docs/06-database-schema.md`):

```ts
appLocale: 'id' | 'en';
```

Field ini:

- Diisi saat first launch (deteksi) atau saat user mengubah di Pengaturan.
- **Tidak** dihapus saat aksi **Hapus Audio Tersimpan** (sama seperti preferensi lain di `settings`).

## 5.5 State management

- **Persisten:** `useUserStore.updateSettings({ appLocale })` → Dexie `settings`.
- **Runtime:** `next-intl` context menyediakan string terjemahan ke komponen.
- Komponen **tidak** memuat file `messages/*.json` secara langsung.

**Pengecualian (F8):** label kecil yang tampil di atas lipatan dan harus benar
sebelum Dexie selesai dibaca memakai `lib/locale-text.ts`, yang membaca
`messages/id.json` + `messages/en.json` untuk merender **kedua** bahasa
sekaligus. Kedua berkas itu sudah ada di bundle klien lewat `IntlProvider`,
jadi tidak menambah unduhan baru. CSS memilih bahasa yang tampil berdasarkan
`<html data-app-locale>`.

## 5.6 Paint pertama & cache locale (F8)

Dexie hanya bisa dibaca setelah hidrasi; sebelum itu `next-intl` memakai `id`
agar render klien = HTML server (tanpa hydration mismatch). Supaya pengguna
`en` tidak melihat kedipan Indonesia, locale dipindahkan ke jalur **pra-paint**:

| Lapisan | File | Peran |
|---------|------|-------|
| Cache | `lib/app-locale.ts` (`hanquran:app-locale`) | Salinan sinkron `settings.appLocale` di `localStorage` |
| Skrip init | `buildAppLocaleInitScript()` di `app/layout.tsx` | Baca cache → deteksi → set `<html data-app-locale>` + `lang` sebelum paint; hanya membaca |
| Sinkronisasi | `stores/userStore.ts`, `components/providers/intl-provider.tsx` | Tulis cache saat `init()`/ganti bahasa; terapkan atribut (`applyAppLocaleToDocument()`) **sebelum** `set()` agar atribut dan teks `next-intl` berganti dalam frame yang sama |
| Teks bilingual | `components/shared/locale-text.tsx` | Render `<span data-locale="id|en">`; CSS menyembunyikan yang tidak aktif |
| Konten ayat | `hooks/use-surah.ts` → `data-content-locale` | Terjemahan seed `id` disembunyikan (`visibility:hidden`) sampai terjemahan locale aktif siap; dipakai juga oleh [`app/focus/[id]/page.tsx`](../app/focus/%5Bid%5D/page.tsx) |
| Prefetch terjemahan | `prefetchSurahTranslation()` (`services/quran/quran-service.ts`) + `warmTranslationFile()` (`data-loader.ts`) | Setelah surat tampil, terjemahan bahasa lain diisi ke cache memori saat idle agar ganti bahasa tidak menunggu jaringan |
| Resync | `IntlProvider` (`pageshow` persisted + event `storage`) | Halaman dari bfcache / tab lain memuat ulang locale dari Dexie |

Aturan CSS (`app/globals.css`):

```css
html:not([data-app-locale='en']) [data-locale='en'] { display: none; }
html[data-app-locale='en'] [data-locale='id'] { display: none; }
html[data-app-locale='en'] [data-content-locale='id'],
html[data-app-locale='id'] [data-content-locale='en'] { visibility: hidden; }
```

Tanpa atribut (SSR tanpa JS) teks `id` tetap tampil. Seed beranda membawa
`meaningTranslations { id, en }`, sehingga locale `en` tidak perlu refetch
daftar surat. Pencarian mencocokkan kedua bahasa.

**Urutan sinkronisasi.** Atribut `<html>` tidak diperbarui di `useEffect`
setelah paint, melainkan lewat `applyAppLocaleToDocument()` yang dipanggil
sinkron dari `userStore.init()` dan `updateSettings({ appLocale })` sebelum
`set()`. Dengan begitu, saat cache basi (nilai `localStorage` ≠ Dexie) atau
saat pengguna mengganti bahasa, teks bilingual dan teks `next-intl` tidak
sempat tampil dengan bahasa berbeda dalam satu frame. `IntlProvider` tetap
memanggil helper yang sama sebagai jaring pengaman untuk perubahan locale di
luar alur store.

**Prefetch & ganti bahasa.** Saat locale berganti (mis. setelah kembali dari
`/settings` lewat tombol back), terjemahan lama disembunyikan sampai data
locale baru siap. Supaya jeda itu tidak terasa, `useSurah` memanggil
`prefetchSurahTranslation()` setelah konten tampil; berkas terjemahan bahasa
lain biasanya sudah ada di cache SW sehingga permintaan berikutnya selesai
dalam satu microtask. Prefetch dijadwalkan idle (`requestIdleCallback`, fallback
`setTimeout` 1,2 s) dan tidak memblokir render.

**Resync bfcache & multi-tab.** Halaman yang dipulihkan dari bfcache membawa
state React lama, dan perubahan bahasa di tab lain tidak terlihat di tab ini.
`IntlProvider` mendengarkan `pageshow` (`persisted === true`) dan event
`storage` untuk kunci locale, lalu memanggil `init()` agar Dexie kembali
menjadi sumber kebenaran.

**Batasan yang diketahui:** konten yang tampil pada paint pertama sudah
dual-render (kartu surat, kontrol baca surat, header surat, tombol unduh
offline, banner install, gate, pencarian, filter). Sisa yang belum dual-render
adalah teks di bawah lipatan (footer) dan komponen yang baru dirender setelah
Dexie siap (kartu Lanjutkan Hafalan, pesan kosong favorit), sehingga tidak
terlihat berkedip. Nama aksesibel (`aria-label`) masih mengikuti `next-intl`
dan bisa berbahasa `id` sebelum inisialisasi selesai — dampaknya hanya pada
screen reader, bukan tampilan. Ini residual, bukan blocker.

---

# 6. Dampak Navigasi & URL

| Aspek | Keputusan MVP |
|-------|----------------|
| Path URL | Tetap `/`, `/surah/[id]`, `/focus/[id]`, `/settings` |
| Locale di URL | Tidak wajib pada MVP |
| Deep link | Tidak memuat locale; memakai preferensi tersimpan |

Jika di masa depan diperlukan URL ber-prefix locale (`/id/surah/2`), itu masuk Change Control — bukan bagian MVP saat ini.

---

# 7. Design System & Konten

- Tipografi Arab untuk ayat **tidak** berubah saat ganti bahasa UI.
- Font Latin UI mengikuti `docs/09-design-system.md`.
- Semua string UI baru **wajib** ditambahkan ke `messages/id.json` dan `messages/en.json` bersamaan.
- Nama proper (mis. nama qari, nama surat Latin) tidak perlu diterjemahkan ulang kecuali ada kebutuhan produk eksplisit.

---

# 8. Acceptance Criteria

- [x] `next-intl` terpasang dan dikonfigurasi untuk App Router
- [x] `messages/id.json` dan `messages/en.json` mencakup string MVP
- [x] Deteksi first launch sesuai Bagian 3
- [x] Bagian **Bahasa Aplikasi** di `/settings` berfungsi
- [x] `appLocale` persisten di Dexie
- [x] Teks Arab ayat & audio tidak berubah saat ganti bahasa UI
- [x] Arti surat (`meaning` / `name_en`) & terjemahan ayat mengikuti `appLocale`
- [x] Tidak ada flash `id` pada paint pertama untuk pengguna `en` (arti kartu, placeholder, filter, gate)
- [x] Terjemahan ayat `id` tidak terlihat selama locale `en` menunggu data `en`
- [x] Tidak ada referensi ke `i18next` / `react-i18next` di implementasi MVP
- [ ] Verifikasi aksesibilitas label per locale (P2)

---

# 9. Dokumen Terkait

| Dokumen | Peran |
|---------|-------|
| `docs/20-mvp-freeze.md` | Scope MVP & pembekuan teknis |
| `docs/08-ui-ux-wireframe.md` | Wireframe Pengaturan + Bahasa |
| `docs/12-component-spec.md` | `LanguageSetting` / urutan section |
| `docs/06-database-schema.md` | Field `appLocale` |
| `docs/15-state-management.md` | Persistensi preferensi bahasa |
| `docs/04-system-architecture.md` | Lapisan i18n & tech stack |
| `docs/34-threads-gate-spec.md` | Namespace `threadsGate` (overlay sekali) |

---

Dokumen ini disimpan sebagai `docs/21-i18n-and-locale.md`.
