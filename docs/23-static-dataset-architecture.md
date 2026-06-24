# 23 — Arsitektur Static Dataset (Keputusan MVP)

**Tanggal:** 24 Juni 2026  
**Status:** ✅ Keputusan final MVP  
**Menggantikan:** Pola Dexie-first / Repository-first untuk konten Quran (dokumen lama di `docs/07`, `docs/06`, `docs/15`)

---

## 1. Ringkasan Eksekutif

HanQuran MVP **tidak** menggunakan Dexie sebagai penyimpanan utama konten Quran.

Sumber kebenaran konten Quran adalah dataset statis yang dihasilkan:

```text
public/data/*
```

Implementasi aktual sudah mengikuti pola ini via `services/quran/`. Dokumen sebelumnya yang masih menyebut `QuranRepository` Dexie-first, seed Dexie, atau hydrate IndexedDB untuk ayat/surat **usang** dan telah diganti oleh dokumen ini.

---

## 2. Arsitektur yang Disetujui

### Konten Quran

```text
public/data/*
        ↓
services/quran/*
        ↓
Memory Cache (opsional, in-memory Map)
        ↓
React Hooks
        ↓
UI
```

### Audio

```text
CDN audio tilawah (AYAH_AUDIO_BASE_URL)
        ↓
services/quran/audio-service.ts (URL builder)
        ↓
HTMLAudioElement / AudioController (Phase 2)
```

### Qari

```text
data/reciters.json
        ↓
services/quran/audio-service.ts
```

### Preferensi & Data Pengguna

```text
Zustand Store
        ↓
Dexie (IndexedDB) — hanya data pengguna
```

**Catatan:** User meminta "Zustand Persist" — di implementasi HanQuran, persistensi dilakukan via **action store yang menulis ke Dexie** (`useUserStore`, `useRepeatStore`), bukan `zustand/middleware` persist. Pola ini tetap valid untuk MVP.

---

## 3. Yang TIDAK Digunakan (MVP)

| Pola | Status |
|------|--------|
| Dexie sebagai cache konten Quran | ❌ Dibatalkan |
| `QuranRepository` Dexie-first | ❌ Tidak diimplementasi |
| `AudioRepository` dengan IndexedDB metadata qari | ❌ Tidak diperlukan |
| Seed Dexie dari `public/data/*` | ❌ Tidak diperlukan |
| Hydrate IndexedDB untuk surat/ayat/terjemahan | ❌ Tidak diperlukan |
| Tabel Dexie `surahs`, `ayahs`, `translations`, `wordTimings`, `reciters` | ❌ Dihapus (schema v2) |

---

## 4. Laporan Review Implementasi (24 Juni 2026)

### 4.1 Layer aktif — sesuai arsitektur

| File | Peran |
|------|-------|
| `services/quran/data-loader.ts` | `fetch` ke `/data/quran/*`, `/data/translations/*` |
| `services/quran/quran-service.ts` | `getSurahList`, `getSurah`, `getSurahSummary` |
| `services/quran/mappers.ts` | Map JSON dataset → tipe aplikasi |
| `services/quran/audio-service.ts` | Qari + `buildAyahAudioUrl()` |
| `hooks/use-surah-list.ts` | Daftar surat |
| `hooks/use-surah.ts` | Detail surat |
| `hooks/use-ayah-audio.ts` | URL audio per ayat |
| `hooks/use-reciters.ts` | Daftar qari |

Cache: **in-memory** (`Map` di `data-loader.ts`, variabel modul di `quran-service.ts`). Browser HTTP cache juga berlaku untuk aset statis di `public/data/`.

### 4.2 Tidak ditemukan di kode (hanya di dokumen lama)

| Item | Temuan |
|------|--------|
| `services/api/QuranRepository.ts` | Folder `services/api/` tidak ada |
| `services/api/AudioRepository.ts` | Tidak ada |
| Seed / hydrate Quran → Dexie | Tidak ada |
| `db.surahs`, `db.ayahs`, dll. | Tidak pernah dipanggil dari kode aplikasi |
| `public/data/search/*` | Tidak ada — pencarian MVP memakai filter in-memory pada `useSurahList` |

### 4.3 Dexie — penggunaan yang benar (tetap)

| Tabel | Dipakai oleh |
|-------|--------------|
| `settings` | `useUserStore`, `useRepeatStore` |
| `favorites` | `useUserStore` |
| `lastRead` | `useUserStore` |
| `downloadManifest` | `useOfflineStore` (Phase 5) |
| Growth: `bookmarks`, `notes`, dll. | Schema siap, belum diisi MVP |

### 4.4 Gap yang diperbaiki dalam sprint ini

1. Schema Dexie v2 — hapus tabel konten Quran yang tidak pernah dipakai
2. Dokumentasi — selaraskan `docs/07`, `docs/06`, `docs/15`, `docs/04`, `docs/18`, dll.
3. `AppProviders` — panggil `initStores()` untuk store pengguna (`repeatStore`, `offlineStore`)

---

## 5. Service Layer — Kontrak MVP

### `services/quran/quran-service.ts`

| Fungsi | Sumber |
|--------|--------|
| `getManifest()` | `public/data/manifest.json` |
| `getSurahList()` | `public/data/quran/{n}.json` (114 file) |
| `getSurah(id, language?)` | Quran + `public/data/translations/{lang}/{n}.json` |
| `getSurahSummary(id)` | `public/data/quran/{n}.json` |

### `services/quran/audio-service.ts`

| Fungsi | Sumber |
|--------|--------|
| `getReciters()` | `data/reciters.json` |
| `buildAyahAudioUrl(...)` | CDN audio tilawah |

### Fungsi opsional (post-MVP / saat index tersedia)

| Fungsi | Catatan |
|--------|---------|
| `loadJuz()` | Belum ada di dataset — tunggu generator |
| `searchQuran()` | Gunakan `public/data/search/*` jika generator menyediakan; jangan pakai Dexie |

---

## 6. Pencarian (Search)

**Saat ini:** filter client-side pada daftar surat yang sudah dimuat (`app/page.tsx` + `useSurahList`).

**Ke depan:** jika generator menambahkan `public/data/search/*`, muat index JSON statis tersebut langsung — **tanpa** IndexedDB.

---

## 7. Offline & Cache

| Jenis data | Strategi MVP |
|------------|--------------|
| Konten Quran | Aset statis `public/data/*` — di-cache browser + in-memory sesi |
| Audio | CDN tilawah + Cache Storage (Phase 5, Service Worker) |
| Preferensi pengguna | Dexie |

Konten Quran **tidak** perlu di-seed ke IndexedDB agar offline berfungsi — Service Worker (Phase 5) dapat cache-aset `public/data/*` secara langsung.

---

## 8. Diagram Perbandingan

### Dokumen lama (usang)

```text
UI → Store → QuranRepository → Dexie → public/data/* (fallback)
```

### MVP final (disetujui)

```text
UI → Hooks → services/quran/ → public/data/*
UI → Store → Dexie (settings, favorites, lastRead, …)
```

---

## 9. Konfirmasi

- ✅ `public/data/*` adalah **satu-satunya** sumber konten Quran untuk MVP HanQuran
- ✅ **Tidak** diperlukan seeding atau hydration Dexie untuk konten Quran
- ✅ Dexie tetap dipakai untuk data pengguna dan metadata offline audio (manifest)

---

## 10. Dokumen Terkait

| Dokumen | Peran |
|---------|-------|
| `docs/07-api-integration.md` | Kontrak service layer & alur fetch |
| `docs/06-database-schema.md` | Schema Dexie (hanya data pengguna) |
| `docs/15-state-management.md` | Store vs service layer |
| `docs/18-development-tasks.md` | Backlog — Phase 1 data integration selesai |
