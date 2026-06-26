# 31 — Auto Download Audio Saat Putar

**Tanggal:** 26 Juni 2026  
**Status:** ✅ Diimplementasi — dirilis `0.5.0`  
**Lokasi UI:** `/settings` — bagian **Offline & Cache**

---

## 1. Ringkasan

Fitur **Auto Download Audio** mengunduh file MP3 ayat ke Cache Storage (`hanquran-audio-v1`) secara otomatis **saat pengguna memutar audio tilawah**, hanya jika pengaturan diaktifkan dan perangkat **online**.

| Pengaturan | Default | Persistensi | Status |
|------------|---------|-------------|--------|
| Auto Download Audio | **OFF** (`false`) | `settings.autoDownloadOnPlay` | 📋 Belum diimplementasi |

> **Bukan fitur ini:** unduh seluruh surat via tombol **Simpan Offline** di Surah Detail — tetap unduhan eksplisit per surat+qari. Lihat `docs/30-offline-behavior-spec.md` §5.1.

> **Bukan fitur ini:** auto-download surat favorit saat online (P2 terpisah) — lihat `docs/18-development-tasks.md` Phase 5.

---

## 2. Latar & Gap Dokumen

| Sumber | Status sebelum spesifikasi ini |
|--------|--------------------------------|
| `docs/03-user-stories.md` US-010 | Menyebut «audio yang pernah diputar tersedia offline» — tanpa mekanisme |
| `docs/02-product-backlog.md` PB-010 | Acceptance criteria serupa — belum terhubung ke pengaturan |
| `docs/15-state-management.md` §12.1 | Menyatakan runtime cache saat play **tidak** diimplementasi |
| `docs/07-api-integration.md` §11 | «Jangan download audio massal secara default di V1» |
| `docs/30-offline-behavior-spec.md` | Hanya unduh eksplisit **Simpan Offline** |

Spesifikasi ini **menyelesaikan gap** di atas dengan prinsip **opt-in** (default OFF) sehingga tidak melanggar kebijakan «tidak unduh massal secara default».

---

## 3. Posisi di Halaman Pengaturan

Toggle berada di section **Offline & Cache** (bukan Playback):

```text
1. Bahasa Aplikasi
2. Reciter (Qari)
3. Playback
4. Ukuran Teks Arab
5. Offline & Cache              ← toggle di sini
6. Aksesibilitas
7. Tentang HanQuran  →  `/settings/about`
```

Wireframe & visual: `docs/08-ui-ux-wireframe.md` (Bagian 9), `docs/12-component-spec.md` (Bagian 17).

---

## 4. Kontrol UI

Satu baris toggle dalam card Offline & Cache, pola `SettingsRow` + `Switch`:

```text
Auto Download Audio           [ON / OFF]
Simpan otomatis audio ayat yang Anda putar
agar bisa didengar offline nanti.
```

| Field UI | Nilai |
|----------|-------|
| Nama (ID) | Auto Download Audio |
| Nama (EN) | Auto Download Audio |
| Deskripsi (ID) | Simpan otomatis audio ayat yang Anda putar agar bisa didengar offline nanti. |
| Deskripsi (EN) | Automatically save audio for verses you play so you can listen offline later. |
| Default | **OFF** |
| Kontrol | `Switch` |
| Namespace i18n | `settings.offline.autoDownloadOnPlay` |

---

## 5. Perilaku Saat ON

Berlaku di **Surah Detail** (`/surah/[id]`) dan **Focus Mode** (`/focus/[id]`) saat:

```text
settings.autoDownloadOnPlay === true
AND connectionStatus === 'online'
AND file MP3 ayat belum ada di hanquran-audio-v1
```

### 5.1 Trigger

- Saat pemutaran audio ayat **dimulai** (play / auto-advance Murotal / repeat).
- Satu file per ayat + qari aktif (`settings.reciterId`).

### 5.2 Unduhan

- Unduh **background** — tidak memblokir streaming CDN; audio tetap diputar dari jaringan.
- Hanya file ayat yang **sedang atau baru diputar** — **bukan** seluruh surat sekaligus.
- Menulis ke `hanquran-audio-v1` via Service Worker (strategi sama dengan cache audio lain).
- Kegagalan unduh background **tidak** menghentikan playback; tidak perlu toast error (best-effort).

### 5.3 Qari

- Cache terpisah per `reciterId` — sama seperti manifest unduhan eksplisit.
- Jika pengguna mengganti qari, ayat yang diputar dengan qari baru di-cache terpisah.

### 5.4 Manifest Dexie

- **Tidak** mengubah `downloadManifest.status` menjadi `ready` — status `ready` tetap eksklusif untuk unduhan penuh via **Simpan Offline**.
- Auto download hanya menambah entri di Cache Storage; metadata manifest surat penuh tidak diperbarui.

### 5.5 Badge «Siap offline» & tombol Simpan Offline

- **Tombol Simpan Offline** disembunyikan bila seluruh ayat surat+qari sudah ada di Cache Storage — baik via manifest `ready` (Simpan Offline) maupun auto download per ayat (`isSurahAudioFullyCached`).
- **Badge** header surat (`Siap offline`) mengikuti aturan yang sama: tampil bila seluruh audio surat tersedia offline.
- Surat yang **sebagian** ayatnya tercache (auto download) tetap menampilkan tombol Simpan Offline untuk mengunduh sisa ayat sekaligus.

---

## 6. Perilaku Saat OFF (Default)

Identik perilaku MVP saat ini:

- Play online → stream CDN saja; file **tidak** disimpan ke cache (kecuali sudah pernah diunduh via Simpan Offline).
- Offline → hanya ayat/surat yang pernah **Simpan Offline** penuh dapat diputar.

---

## 7. Dampak Offline

### 7.1 Pemutaran ayat per ayat

Gate pemutaran (`audioPlaybackBlocked`) sudah memeriksa `caches.match(audioUrl)` selain manifest — lihat `docs/30-offline-behavior-spec.md` §4.2.

| Kondisi offline | Auto download pernah ON + ayat pernah diputar | Hanya Simpan Offline penuh |
|-----------------|--------------------------------------------------|------------------------------|
| Ayat pernah di-cache | ✅ Putar dari cache | ✅ Putar dari cache |
| Ayat belum pernah di-cache | ❌ Play disabled + toast | ❌ Play disabled + toast |

### 7.2 Mode Murotal & repeat offline

- Ayat berikutnya hanya diputar jika file-nya ada di cache (manifest `ready` **atau** entri auto download).
- Jika ayat tujuan belum di-cache → pemutaran berhenti + toast (aturan existing `ensureTargetSurahPlayable`).
- **Tidak** ada prefetch ayat berikutnya otomatis — hanya ayat yang benar-benar diputar.

### 7.3 Ukuran cache & pembersihan

- File auto download ikut dihitung dalam statistik «Audio tersimpan» di Pengaturan.
- **Bersihkan Cache** menghapus seluruh `hanquran-audio-v1` termasuk file auto download + manifest — perilaku existing.

---

## 8. Batasan & Non-Goals

| Batasan | Alasan |
|---------|--------|
| Default OFF | Hemat bandwidth & storage; selaras `docs/07` §11 |
| Hanya saat online | Unduh memerlukan jaringan |
| Tidak unduh massal | Tidak prefetch surat/ayat yang belum diputar |
| Tidak menggantikan Simpan Offline | Pengguna yang ingin seluruh surat offline tetap pakai tombol eksplisit |
| Tidak aktif saat offline | Tidak ada aksi unduh tanpa jaringan |

---

## 9. State Management

| Field | Tipe | Default | Tabel Dexie | Kontrol UI |
|-------|------|---------|-------------|------------|
| `autoDownloadOnPlay` | `boolean` | `false` | `settings` | `/settings` → Offline & Cache |

Pola persistensi: `useUserStore.updateSettings()` — lihat `docs/15-state-management.md` (Bagian 6).

Implementasi unduh background disarankan di layer service (mis. hook pemutaran atau `download-manager` method baru `cacheAyahOnPlay`) — detail implementasi saat coding.

---

## 10. Wireframe (Mobile)

```text
┌──────────────────────────────────┐
│ Offline & Cache                  │
│                                  │
│ Status: Online                   │
│ Audio tersimpan: 24 MB           │
│ Data Quran     : Cached          │
│                                  │
│ Auto Download Audio    [OFF]     │
│ Simpan otomatis audio ayat yang  │
│ Anda putar agar bisa didengar    │
│ offline nanti.                   │
│                                  │
│ [ Bersihkan Cache ]              │
└──────────────────────────────────┘
```

---

## 11. Kriteria Penerimaan (QA)

- [ ] Default pengaturan OFF untuk instalasi baru.
- [ ] OFF + online + play ayat → tidak menambah entri cache audio (selain yang sudah ada dari Simpan Offline).
- [ ] ON + online + play ayat → file MP3 ayat muncul di `hanquran-audio-v1` tanpa mengganggu streaming.
- [ ] ON + offline + ayat pernah diputar saat ON → Play aktif dari cache.
- [ ] ON + offline + ayat belum pernah diputar → Play disabled + toast.
- [ ] Badge «Siap offline» surat hanya untuk Simpan Offline penuh, bukan auto download sebagian.
- [ ] Badge «Siap offline» & tombol Simpan Offline hilang bila seluruh ayat surat tercache (manifest atau auto download).
- [ ] Ganti qari → cache auto download terpisah per qari.
- [ ] Bersihkan Cache → file auto download ikut terhapus.

---

## 12. Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| `docs/30-offline-behavior-spec.md` | Matriks offline, gate Play, Simpan Offline |
| `docs/15-state-management.md` | Strategi offline-first & unduhan |
| `docs/06-database-schema.md` | `SettingsRecord.autoDownloadOnPlay` |
| `docs/07-api-integration.md` | Performance — opt-in unduh |
| `docs/08-ui-ux-wireframe.md` | Wireframe Pengaturan |
| `docs/12-component-spec.md` | Section Offline & Cache |
| `docs/02-product-backlog.md` | PB-010 acceptance criteria |
| `docs/03-user-stories.md` | US-010 |
| `docs/18-development-tasks.md` | Task implementasi |
