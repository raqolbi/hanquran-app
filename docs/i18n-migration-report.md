# Laporan Migrasi i18n — HanQuran

> 📜 **Dokumen historis.** Laporan sekali jalan migrasi teks UI ke `next-intl` (24 Juni 2026). Isinya tidak diperbarui mengikuti kode dan **bukan acuan implementasi**. Acuan terkini: `docs/21-i18n-and-locale.md`.

**Tanggal:** 2026-06-24  
**Status:** Implementasi selesai  
**Framework:** `next-intl` (App Router, tanpa prefix locale di URL)

---

## Ringkasan

Seluruh teks UI yang teridentifikasi telah dimigrasikan ke `messages/id.json` (sumber kebenaran) dan `messages/en.json`. Bahasa Indonesia tetap mempertahankan wording asli aplikasi.

---

## Inventaris String (Fase 1)

| Area | File | Status |
|------|------|--------|
| Header & status koneksi | `components/header.tsx` | ✅ |
| Pencarian & filter | `search-input.tsx`, `filter-chips.tsx` | ✅ |
| Lanjutkan hafalan | `continue-reading.tsx` | ✅ |
| Kartu & detail surat | `surah-card.tsx`, `surah-detail-header.tsx` | ✅ |
| Ayat & action bar | `ayah-card.tsx`, `action-bar.tsx` (→ VerseDisplayControls) | ✅ |
| Audio player | `audio-player.tsx` | ✅ |
| Repeat (selector, status, dialog) | `repeat-*.tsx` | ✅ |
| Mode Fokus | `focus/[id]/page.tsx`, `focus-mode-player.tsx` | ✅ |
| Pengaturan | `settings/page.tsx` | ✅ (+ Bahasa Aplikasi) |
| Offline badge | `offline-status-badge.tsx` | ✅ |
| Navigasi bawah | `bottom-navigation.tsx` | ✅ |
| Favorit | `favorites.tsx` | ✅ |
| Loading | `app/loading.tsx` | ✅ |
| Error & loading hooks | `use-surah-list.ts`, `use-surah.ts` | ✅ |
| Halaman utama & surat | `app/page.tsx`, `surah/[id]/page.tsx` | ✅ |

---

## String yang Sengaja Tidak Dilokalisasi

| Konten | Alasan |
|--------|--------|
| Nama surat (Latin/Arab) | Proper noun / konten Quran |
| Arti surat (`meaning`) | Data dataset — **mengikuti `appLocale`** (`id` → `meaning`, `en` → `name_en`) |
| Terjemahan ayat | Folder `translations/{appLocale}` — visibilitas via toggle terjemahan |
| Nama qari | Proper noun (`data/reciters.json`) |
| Brand `HanQuran` | Nama produk |
| Label numerik repeat (`1x`, `5x`, …) | Notasi universal |
| Metadata `layout.tsx` (`description`) | SEO — belum dimigrasikan |

---

## Arsitektur

```
messages/id.json, messages/en.json
        ↓
i18n/detection.ts  → first launch only
        ↓
useUserStore.init() → Dexie settings.appLocale
        ↓
IntlProvider (NextIntlClientProvider)
        ↓
useTranslations() di komponen klien
```

**Persistensi:** `settings.appLocale: 'id' | 'en'` di Dexie via `useUserStore.updateSettings()`.

**Deteksi first launch:** browser locale `id*` atau timezone `Asia/Jakarta|Makassar|Jayapura` → `id`, else `en`. Pengguna existing tanpa field `appLocale` mendapat default `id` (perilaku UI tidak berubah).

---

## Pengujian Manual yang Direkomendasikan

1. First launch (hapus IndexedDB `hanquran-db`) — verifikasi deteksi locale
2. Settings → ganti Bahasa — UI berubah tanpa reload
3. Restart app — preferensi tetap
4. Bandingkan `id` vs `en` di semua layar utama
