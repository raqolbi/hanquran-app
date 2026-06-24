# 22 — Verse Display Controls

**Status:** ✅ Keputusan UX final  
**Berlaku untuk:** MVP V1  
**Layar:** Surah Detail (`/surah/[id]`)

> Kontrol tampilan ayat **selalu terlihat** di baris horizontal tunggal langsung di bawah header surat. Tidak disembunyikan di bottom sheet, overflow menu, dialog pengaturan, atau layar konfigurasi sekunder.

---

# 1. Ringkasan Keputusan

Tiga kontrol membaca ditampilkan bersamaan dalam satu baris horizontal:

```text
[✓ Terjemahan] [○ Transliterasi] [🎯 Fokus]
```

| Kontrol | Fungsi | Persistensi |
|---------|--------|-------------|
| Terjemahan | Menampilkan / menyembunyikan terjemahan ayat | `settings.translationVisible` |
| Transliterasi | Menampilkan / menyembunyikan transliterasi ayat | `settings.transliterationVisible` |
| Fokus | Masuk / keluar Mode Fokus (ubah layout baca) | Runtime (navigasi route) |

**Komponen UI:** `VerseDisplayControls` (alias legacy di kode: `ActionBar`).

Spesifikasi komponen: `docs/12-component-spec.md` (Bagian 7–9).  
Wireframe: `docs/08-ui-ux-wireframe.md` (Bagian 7).

---

# 2. Posisi Layout

```text
Surah Header
     ↓
Verse Display Controls   ← baris tunggal, hierarki visual setara
     ↓
Verse Content (daftar ayat)
```

Contoh:

```text
Al-Faatiha
الفاتحة

7 ayat • Makkiyah • Siap Offline

[✓ Terjemahan] [○ Transliterasi] [🎯 Fokus]

Ayat Content...
```

## 2.1 Persyaratan layout

- Ketiga kontrol ditampilkan **serentak** — tidak ada yang disembunyikan di menu lain.
- Satu baris horizontal; hierarki visual **setara** antar tombol.
- Perilaku **satu ketuk** (one-tap toggle) untuk Terjemahan dan Transliterasi; Fokus memicu navigasi ke `/focus/[id]`.
- Mobile-first; tablet dan desktop mempertahankan susunan yang sama.
- Tidak wrap ke baris kedua kecuali lebar layar benar-benar tidak mencukupi.

---

# 3. Perilaku Kontrol

## 3.1 Terjemahan

Mengontrol visibilitas **terjemahan ayat** (konten dari `public/data/translations/*`).

| State | Tampilan |
|-------|----------|
| ON | `✓ Terjemahan` — teks terjemahan ditampilkan di bawah Arab |
| OFF | `○ Terjemahan` — teks terjemahan disembunyikan |

Saat OFF:

- Teks Arab tetap terlihat.
- Perilaku Transliterasi **tidak** terpengaruh.

Toggle mengubah preferensi global (`settings.translationVisible`), bukan per-surat.

## 3.2 Transliterasi

Mengontrol visibilitas **transliterasi ayat** (konten dari dataset surat).

| State | Tampilan |
|-------|----------|
| ON | `✓ Transliterasi` — transliterasi ditampilkan |
| OFF | `○ Transliterasi` — transliterasi disembunyikan |

Saat OFF:

- Teks Arab tetap terlihat.
- Perilaku Terjemahan **tidak** terpengaruh.

Toggle mengubah preferensi global (`settings.transliterationVisible`).

## 3.3 Fokus

Mengontrol **Mode Fokus** — mengubah layout membaca, bukan preferensi konten.

| State | Perilaku |
|-------|----------|
| OFF (Surah Detail) | Tombol `🎯 Fokus` — ketuk untuk membuka `/focus/[id]?ayah=` |
| ON (Focus Mode) | Layar fokus aktif; tombol Keluar kembali ke Surah Detail |

Mode Fokus **tidak** mengubah:

- preferensi Terjemahan
- preferensi Transliterasi

---

# 4. Mode Fokus & Preferensi Tampilan

> **Prinsip:** Mode Fokus mengubah **cara** ayat disajikan, bukan **konten** apa yang ditampilkan.

Terjemahan dan transliterasi tetap dikendalikan **hanya** oleh toggle masing-masing. Saat masuk Mode Fokus, state Terjemahan dan Transliterasi dari sesi terakhir dipertahankan.

### Focus + Terjemahan ON + Transliterasi ON

```text
Arabic
↓
Transliteration
↓
Translation
```

### Focus + Terjemahan ON + Transliterasi OFF

```text
Arabic
↓
Translation
```

### Focus + Terjemahan OFF + Transliterasi ON

```text
Arabic
↓
Transliteration
```

### Focus + Terjemahan OFF + Transliterasi OFF

```text
Arabic only
```

---

# 5. Urutan Render Ayat

Ketika semua opsi konten aktif, urutan **wajib konsisten** di:

- Surah Detail (`AyahCard`)
- Mode Fokus (`FocusModeScreen`)
- Seluruh dokumentasi Reading Experience

```text
Arabic
↓
Transliteration
↓
Translation
```

---

# 6. Yang Bukan Bagian Verse Display Controls

Kontrol berikut **tetap** di lokasi masing-masing dan **tidak** dipindah ke baris ini:

| Fitur | Lokasi |
|-------|--------|
| Pengaturan Repeat | Bottom sheet / dialog (`RepeatSettingsDialog`) — via `RepeatSelector` |
| Audio play/pause, next/prev | `AudioPlayer` sticky bawah |
| Ukuran teks Arab | Pengaturan (`/settings`) |
| Bahasa aplikasi (UI shell) | Pengaturan (`/settings`) |
| Qari / reciter | Pengaturan (`/settings`) |

**Dihapus dari Pengaturan:** bagian "Terjemahan Default" — toggle terjemahan dan transliterasi hanya di Verse Display Controls pada Surah Detail.

---

# 7. State Management

| Field | Tipe | Default MVP | Persistensi |
|-------|------|-------------|-------------|
| `translationVisible` | `boolean` | `false` | Dexie `settings` |
| `transliterationVisible` | `boolean` | `false` | Dexie `settings` |

Lihat `docs/15-state-management.md` dan `docs/06-database-schema.md`.

---

# 8. Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| `docs/08-ui-ux-wireframe.md` | Wireframe Surah Detail & Focus Mode |
| `docs/12-component-spec.md` | Props & visual `VerseDisplayControls` |
| `docs/21-i18n-and-locale.md` | Label kontrol dilokalisasi; konten ayat tidak |
| `docs/03-user-stories.md` | US-003 (Terjemahan), US-003b (Transliterasi), US-007 (Fokus) |
