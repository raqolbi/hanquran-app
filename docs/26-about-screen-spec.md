# 26 — Spesifikasi Layar Tentang HanQuran

**Tanggal:** 24 Juni 2026  
**Status:** ✅ Spesifikasi resmi MVP (P1)  
**Route:** `/settings/about`

---

## 1. Ringkasan Audit

| Pertanyaan | Hasil |
|------------|--------|
| Apakah fitur sudah ada di codebase? | ❌ Belum — tidak ada route atau komponen About |
| Apakah sudah terdokumentasi sebelumnya? | ❌ Tidak ada entri «Tentang HanQuran» di docs |
| Dampak pada Settings | Tambah **satu baris navigasi** di bagian bawah halaman Pengaturan |
| Klasifikasi MVP | **P1** — informasi resmi aplikasi; mendukung transparansi lisensi & credits |

Dokumen yang diperbarui: `08`, `10`, `12`, `14`, `05`, `20`, `18`, dan dokumen ini.

---

## 2. Tujuan Layar

Layar **Tentang HanQuran** menampilkan informasi resmi mengenai aplikasi kepada pengguna akhir — tanpa membuka dokumentasi developer atau README di GitHub.

Bukan layar pengaturan teknis; isinya informatif dan dapat diperbarui terpusat tanpa hardcode di komponen UI.

---

## 3. Navigasi

### Dari Pengaturan

Tambahkan item di **bagian bawah** halaman `/settings` (setelah Aksesibilitas):

```text
Tentang HanQuran  →
```

- Pola: baris navigasi (link) dalam card, konsisten dengan mobile-first Settings.
- Target: `/settings/about`
- Kembali dari About: `router.back()` — tidak `push` ke `/settings` agar riwayat browser tidak duplikat
- Kembali dari Pengaturan: selalu ke Beranda (`routes.home()`)

### Routing

| URL | Halaman | File |
|-----|---------|------|
| `/settings` | Pengaturan | `app/settings/page.tsx` |
| `/settings/about` | Tentang HanQuran | `app/settings/about/page.tsx` |

Builder route: `routes.settingsAbout()` di `lib/routes.ts`.

---

## 4. Konten (Scope)

Konten **tidak** di-hardcode penuh di komponen React. Struktur data di `lib/app-about.ts` + `data/about-credits.ts`; teks UI di `messages/{id,en}.json` namespace `about`.

### 4.1 Informasi Aplikasi

| Field | Sumber |
|-------|--------|
| Nama aplikasi | `lib/app-about.ts` (`APP_NAME`) |
| Deskripsi singkat | `messages` → `about.app.description` |
| Versi | `package.json` → `version` (impor tunggal di `lib/app-about.ts`) |

### 4.2 Tentang HanQuran

Menjelaskan (via i18n):

- Tujuan HanQuran
- Filosofi produk (empat prinsip: Memorization / Mobile / Offline / Simplicity First)
- Fokus aplikasi (bullet: repeat, audio per ayat, mode fokus, Mode Murotal, Media Session, lanjutkan hafalan, offline, preferensi lokal)

Konsep selaras `docs/00-vision.md` dan `docs/20-mvp-freeze.md` §3 — wording UI boleh disederhanakan untuk pengguna.

### 4.3 Credits

Kelompok **Sumber Data** (struktur di `data/about-credits.ts`, label via i18n):

| Sub-bagian | Sumber |
|------------|--------|
| Teks Al-Qur'an | [Tanzil Project](https://tanzil.net/) |
| Dataset JSON Al-Qur'an | [HanQuran Data Generator](https://github.com/raqolbi/hanquran-data-generator) |
| Transliterasi | [eQuran.id](https://equran.id/) |
| Audio Murottal | Para qari dan penyedia audio yang digunakan HanQuran |

Tambahan kategori teknologi **tidak** ditampilkan — hanya sumber data konten.

### 4.4 Repository & Lisensi

| Item | Sumber |
|------|--------|
| Tautan repository GitHub | `lib/app-about.ts` (`APP_REPOSITORY_URL`) |
| HanQuran Community License | tautan ke file `LICENSE` di repository |
| Lisensi komersial | tautan ke `COMMERCIAL-LICENSE.md` (opsional di UI) |

---

## 5. UI & Design System

Mengikuti pola Settings yang ada:

- Header sticky: tombol kembali + Logo 24px + judul «Tentang HanQuran»
- `SettingsSection` untuk setiap kelompok konten
- Card: radius 16px (`rounded-2xl`), border, padding 16px
- Typography: judul section `text-sm font-semibold`; body `text-sm text-muted-foreground`
- Link eksternal: `rel="noopener noreferrer"`, indikator aksesibilitas
- Layout: `max-w-2xl`, padding selaras `/settings`

---

## 6. Aksesibilitas

- Struktur heading: satu `h1` di header; `h2` per `SettingsSection`
- Semua tautan dapat difokus keyboard (`focus-visible:ring`)
- Tautan eksternal: `aria-label` atau teks yang jelas
- Versi aplikasi: dibaca screen reader (bukan hanya visual)

---

## 7. Implementasi (Referensi Kode)

| Area | File |
|------|------|
| Metadata & versi | `lib/app-about.ts` |
| Struktur credits | `data/about-credits.ts` |
| Layar | `app/settings/about/page.tsx` |
| Link dari Settings | `app/settings/page.tsx` |
| Route helper | `lib/routes.ts` |
| i18n | `messages/id.json`, `messages/en.json` → `about.*` |
| Tes | `tests/lib/app-about.test.ts`, `tests/app/settings-about.test.tsx` |

---

## 8. Klasifikasi MVP

| Prioritas | Alasan |
|-----------|--------|
| **P1** | Melengkapi Pengaturan; transparansi credits & lisensi; risiko teknis rendah |

Bukan P0 blocker rilis, tetapi **termasuk MVP lengkap** bersama fitur Settings lainnya.

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 24 Juni 2026 | Dokumen awal — audit, scope, routing, konten, P1 |

---

Dokumen ini disimpan sebagai `docs/26-about-screen-spec.md`.
