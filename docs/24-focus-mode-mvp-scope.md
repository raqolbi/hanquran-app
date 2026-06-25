# 24 — Scope Mode Fokus MVP (Keputusan Word-by-Word)

**Tanggal:** 24 Juni 2026  
**Status:** ✅ Keputusan final MVP  
**Mengacu:** `docs/20-mvp-freeze.md`, `docs/23-static-dataset-architecture.md`, `docs/18-development-tasks.md`

---

## 1. Ringkasan Keputusan

**Word-by-word highlight tidak termasuk MVP V1.**

Mode Fokus (`/focus/[id]`) pada MVP adalah **layar baca bebas distraksi** dengan konten ayat nyata dari `public/data/*` — **tanpa** penyorotan kata per kata dan **tanpa** simulasi timer.

Fitur word-by-word highlight + sinkron audio ditunda ke **Post-MVP** hingga tersedia sumber data timing yang valid.

---

## 2. Latar Belakang

| Temuan | Detail |
|--------|--------|
| Dataset | Field `word_by_word` di `public/data/quran/{id}.json` **kosong** (`{}`) untuk seluruh surat |
| Mapper | `services/quran/mappers.ts` tidak memetakan `word_by_word` |
| Dexie | Tabel `wordTimings` dihapus pada schema v2 |
| Implementasi lama | Focus Mode memakai `arabic.split(/\s+/)` + `setInterval(700ms)` — **bukan data nyata**, menyesatkan pengguna |

Simulasi interval tetap **dihapus** dari kode. Komponen `AyahWordHighlight` tetap ada sebagai stub visual untuk fase berikutnya.

---

## 3. Scope MVP — Mode Fokus (PB-007)

### Termasuk ✅

- Route `/focus/[id]?ayah=[n]`
- Konten ayat nyata: Arab, transliterasi & terjemahan (sesuai preferensi `useReadingDisplay`)
- Navigasi ayat sebelumnya / berikutnya tanpa keluar dari mode
- **Audio per ayat** — play/pause + progress + navigasi ⏮/⏭ via `AudioPlayer` + `RepeatSelector` inline (layout identik Surah Detail)
- Tombol keluar kembali ke Surah Detail pada ayat aktif
- UI repeat — select cepat + ⚙ → `RepeatSettingsDialog`; state via `useRepeatStore` + `RepeatEngine` (sama seperti Surah Detail); **tanpa** teks hint di layar
- **Mode Murotal** — tilawah berkelanjutan via `settings.murotalEnabled`; perilaku sama Surah Detail — `docs/29-murotal-mode-spec.md` ✅
- **Progress repeat** — badge `x/y` di `RepeatSelector` inline (identik Surah Detail) ✅
- **Transport ⏮/⏭** — aturan `docs/29-murotal-mode-spec.md` §7.2 (lintas surat jika Murotal ON) ✅

### Tidak termasuk ❌ (Post-MVP)

- Word-by-word highlight (PB-005)
- Sinkron highlight dengan `currentTime` audio
- Word timing dari dataset atau API eksternal
- Simulasi progress kata-per-kata

---

## 4. Dampak pada Product Backlog

| ID | Perubahan |
|----|-----------|
| **PB-005** Word-by-Word Highlight | **P0 → Post-MVP (P3)** — blocked oleh ketersediaan data timing |
| **PB-007** Focus Mode | Tetap **P1** — didefinisikan ulang sebagai layar baca fokus tanpa word highlight |
| **Phase 4** (`docs/18`) | Seluruh task word highlight → **Post-MVP**, bukan blocker rilis |

---

## 5. Dampak pada Definisi Selesai MVP

Kriteria berikut di `docs/20-mvp-freeze.md` **dicabut** dari MVP V1:

- ~~Focus Mode menampilkan highlight kata-per-kata sinkron dengan audio~~

Kriteria pengganti:

- Focus Mode menampilkan satu ayat dalam layout bebas distraksi dengan data nyata
- Navigasi antar ayat di `/focus/[id]` berfungsi tanpa keluar dari mode

---

## 6. Jalur Post-MVP (Referensi)

Saat data timing tersedia:

1. Isi atau ganti field `word_by_word` / sumber timing eksternal
2. Perluas mapper `mapSurahToDetail` atau service terpisah
3. Integrasikan `AyahWordHighlight` dengan `AudioController.currentTime`
4. Aktifkan kembali Phase 4 di `docs/18-development-tasks.md`

---

## 7. Dokumen Terkait yang Diperbarui

- `docs/20-mvp-freeze.md` — PB-005 & kriteria Focus Mode
- `docs/18-development-tasks.md` — Phase 4 ditandai Post-MVP
- `docs/02-product-backlog.md` — PB-005 prioritas
- `docs/13-component-tree.md` — pohon komponen & chrome audio
- `docs/12-component-spec.md` — spesifikasi `AudioPlayer`, `RepeatSelector` inline
