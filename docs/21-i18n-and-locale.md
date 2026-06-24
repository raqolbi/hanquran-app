# 21 — Internasionalisasi & Bahasa Aplikasi

**Status:** 🆕 Spesifikasi produk & arsitektur (dokumentasi saja — belum diimplementasikan)  
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
- Dialog & bottom sheet (mis. Pengaturan Repeat, Hapus Cache)
- Label, tombol, placeholder
- Empty state & error state
- Notifikasi & pesan status
- Onboarding (bila ada di MVP)

## 2.2 Yang TIDAK dilokalisasi

Konten Quran dan audio **tetap tidak berubah** karena pengaturan bahasa UI:

| Aspek | Sumber | Catatan |
|-------|--------|---------|
| Teks Arab Uthmani | `public/data/quran/*` | Selalu Arab |
| Transliterasi | Dataset surat | Tidak mengikuti locale UI |
| Terjemahan ayat | `public/data/translations/*` | Dikendalikan oleh **toggle terjemahan** & resource terjemahan, bukan locale UI |
| Audio tilawah | CDN audio (`AYAH_AUDIO_BASE_URL`) | Tidak terpengaruh locale UI |
| Metadata qari | `data/reciters.json` | Nama qari proper noun |

> **Pemisahan konsep:** `settings.appLocale` = bahasa **shell aplikasi**. `settings.translationVisible` + `settings.transliterationVisible` + `translationResourceId` = tampilan **konten ayat** — dikontrol dari **Verse Display Controls** di Surah Detail (`docs/22-verse-display-controls.md`), bukan dari locale UI.

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
└─ app/
   └─ layout.tsx       # NextIntlClientProvider
```

## 5.3 Alur runtime

```text
App start
  │
  ├─ settings.appLocale ada?
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
- **Tidak** dihapus saat aksi **Hapus Cache** (sama seperti preferensi lain di `settings`).

## 5.5 State management

- **Persisten:** `useUserStore.updateSettings({ appLocale })` → Dexie `settings`.
- **Runtime:** `next-intl` context menyediakan string terjemahan ke komponen.
- Komponen **tidak** memuat file `messages/*.json` secara langsung.

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

# 8. Acceptance Criteria (dokumentasi selesai → siap implementasi)

- [ ] `next-intl` terpasang dan dikonfigurasi untuk App Router
- [ ] `messages/id.json` dan `messages/en.json` mencakup string MVP
- [ ] Deteksi first launch sesuai Bagian 3
- [ ] Bagian **Bahasa Aplikasi** di `/settings` berfungsi
- [ ] `appLocale` persisten di Dexie
- [ ] Teks Arab ayat & audio tidak berubah saat ganti bahasa UI
- [ ] Tidak ada referensi ke `i18next` / `react-i18next` di implementasi MVP

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

---

Dokumen ini disimpan sebagai `docs/21-i18n-and-locale.md`.
