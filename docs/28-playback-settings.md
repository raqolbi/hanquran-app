# 28 — Playback Settings

**Tanggal:** 25 Juni 2026  
**Status:** ✅ Diimplementasi (MVP V1)  
**Lokasi UI:** `/settings` — bagian **Playback**

---

## 1. Ringkasan

Bagian **Playback** pada halaman Pengaturan mengatur perilaku layar saat audio tilawah berjalan di **Surah Detail** (`/surah/[id]`).

Pada MVP V1, bagian ini berisi pengaturan playback. **Mode Murotal** tersedia sejak v0.3.0 — lihat `docs/29-murotal-mode-spec.md`.

| Pengaturan | Default | Persistensi | Status |
|------------|---------|-------------|--------|
| Auto Follow Playback | ON (`true`) | `settings.autoFollowPlayback` | ✅ Diimplementasi |
| Mode Murotal | OFF (`false`) | `settings.murotalEnabled` | ✅ Diimplementasi |

> **Bukan bagian Playback Settings:** pengaturan repeat (`RepeatSettingsDialog`), play/pause, navigasi ayat — tetap di kontrol audio pada Surah Detail. Lihat `docs/22-verse-display-controls.md` (Bagian 6).

> **Bukan bagian Playback Settings:** **Auto Download Audio** — toggle di section **Offline & Cache**. Lihat `docs/31-auto-download-audio-spec.md`.

---

## 2. Posisi di Halaman Pengaturan

Urutan section di `/settings` (setelah Qari, sebelum Ukuran Teks Arab):

```text
1. Bahasa Aplikasi
2. Reciter (Qari)
3. Playback                    ← baru
4. Ukuran Teks Arab
5. Offline & Cache
6. Aksesibilitas
7. Tentang HanQuran  →  `/settings/about`
```

Wireframe & visual: `docs/08-ui-ux-wireframe.md` (Bagian 9), `docs/12-component-spec.md` (Bagian 17).

---

## 3. Section Playback

### 3.1 Judul Section

```text
Playback
```

Label section dilokalisasi via `next-intl` (namespace `settings.playback`).

### 3.2 Kontrol

Satu baris toggle dalam card, pola sama dengan baris di section Aksesibilitas (`SettingsRow` + `Switch`):

```text
Auto Follow Playback          [ON / OFF]
Otomatis menggulir layar agar ayat yang sedang diputar tetap terlihat.
```

| Field UI | Nilai |
|----------|-------|
| Nama | Auto Follow Playback |
| Deskripsi | Otomatis menggulir layar agar ayat yang sedang diputar tampil penuh dan di tengah area baca. |
| Default | ON |
| Kontrol | `Switch` |

### 3.3 Mode Murotal

> Spesifikasi lengkap: `docs/29-murotal-mode-spec.md`

```text
Mode Murotal                    [ON / OFF]
Putar tilawah secara berkelanjutan: lanjut ke ayat
berikutnya atau surat berikutnya hingga Anda berhenti.
```

| Field UI | Nilai |
|----------|-------|
| Nama | Mode Murotal |
| Deskripsi | Putar tilawah berkelanjutan hingga dihentikan pengguna |
| Default | **OFF** |
| Kontrol | `Switch` |

---

## 4. Auto Follow Playback — Perilaku

Berlaku saat audio tilawah aktif di Surah Detail dan `settings.autoFollowPlayback === true`.

### 4.1 Saat ayat aktif berpindah

1. Sistem menghitung **zona baca** — area antara chrome atas (header + kontrol baca) dan chrome bawah (`AudioPlayer`), dengan padding kecil.
2. **Jika kartu ayat aktif sudah tampil penuh di zona baca dan mendekati tengah** — tidak ada scroll.
3. **Jika kartu terpotong** (mis. tertutup audio bar) **atau belum di tengah** — sistem melakukan auto scroll agar ayat aktif **sebisa mungkin berada di tengah** zona baca.
4. Scroll memakai sistem animasi yang sudah ada (`settings.smoothAnimation` via `AccessibilityProvider`):
   - `smoothAnimation: true` → scroll animasi halus.
   - `smoothAnimation: false` → scroll instan (tanpa animasi).

### 4.2 Scroll manual pengguna

- Saat pengguna sedang melakukan scroll manual (sentuh, roda mouse, atau keyboard), auto follow **ditangguhkan** sementara.
- Setelah pengguna berhenti scroll selama jeda singkat (~2 detik, dapat disesuaikan saat implementasi), auto follow **dapat aktif kembali**.
- Auto follow tidak boleh menarik layar saat pengguna sedang membaca ayat lain secara sengaja.

### 4.3 Prinsip anti-flicker

- Scroll hanya dilakukan jika kartu ayat belum **penuh terlihat** atau belum **cukup dekat ke tengah** zona baca (toleransi ~32px).
- Overlap sebagian saja **tidak** dianggap cukup — mencegah kartu tertutup audio bar tanpa scroll.
- Perubahan pengaturan (ON/OFF) berlaku segera tanpa reload halaman.

### 4.4 Landscape HP (`short-landscape`)

- Chrome atas **tidak sticky** — dapat ter-scroll keluar layar.
- Pengukuran zona baca **mengabaikan** chrome yang sudah di atas viewport (offset negatif), agar pusat zona baca tidak bergeser terlalu ke atas dan auto scroll tidak melewati ayat aktif.
- Tinggi viewport memakai `visualViewport` bila tersedia (lebih akurat di mobile).

### 4.5 Cakupan layar

| Layar | Auto Follow Playback |
|-------|----------------------|
| Surah Detail (`/surah/[id]`) | ✅ Berlaku |
| Focus Mode (`/focus/[id]`) | ❌ Tidak berlaku — satu ayat per layar, tidak ada daftar scroll |
| Beranda / Pengaturan | ❌ Tidak berlaku |

### 4.6 Tombol Previous / Next (transport audio)

Aturan lengkap — termasuk lintas surat saat **Mode Murotal** ON: `docs/29-murotal-mode-spec.md` §7.2.

Ringkasan:

- **Murotal OFF:** ⏮/⏭ hanya antar ayat dalam surat; nonaktif di ayat pertama (prev) atau terakhir (next).
- **Murotal ON:** ⏮ dari ayat 1 (bukan surat 1) → surat sebelumnya ayat terakhir; ⏭ dari ayat terakhir (bukan surat 114) → surat berikutnya ayat 1.

Berlaku di Surah Detail dan Focus Mode.

---

## 5. Saat Dimatikan (OFF)

Jika pengguna mematikan Auto Follow Playback:

- Audio tilawah tetap berjalan normal.
- Highlight ayat aktif tetap berpindah mengikuti playback.
- Posisi scroll layar **sepenuhnya** dikendalikan pengguna.
- Tidak ada auto scroll saat ayat aktif berubah.

---

## 6. State Management

| Field | Tipe | Default | Tabel Dexie | Kontrol UI |
|-------|------|---------|-------------|------------|
| `autoFollowPlayback` | `boolean` | `true` | `settings` | `/settings` → Playback |
| `murotalEnabled` | `boolean` | `false` | `settings` | `/settings` → Playback |

Pola persistensi sama dengan preferensi lain di `useUserStore.updateSettings()` — lihat `docs/15-state-management.md` (Bagian 6).

Runtime sementara (tidak dipersist):

| State | Pemilik | Keterangan |
|-------|---------|------------|
| `isUserScrolling` | Hook / komponen Surah Detail | Menandai scroll manual aktif |
| `autoFollowSuspendedUntil` | Hook / komponen Surah Detail | Timestamp jeda sebelum auto follow aktif kembali |

---

## 7. Wireframe (Mobile)

```text
┌──────────────────────────────────┐
│ Playback                         │
│                                  │
│ Auto Follow Playback    [ON/OFF] │
│ Otomatis menggulir layar agar    │
│ ayat yang sedang diputar tetap   │
│ terlihat.                        │
│                                  │
│ Mode Murotal             [ON/OFF]│
│ Putar tilawah berkelanjutan.     │
└──────────────────────────────────┘
```

---

## 8. Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| `docs/08-ui-ux-wireframe.md` | Wireframe Pengaturan |
| `docs/10-high-fidelity-ui.md` | Urutan group Settings |
| `docs/12-component-spec.md` | `SettingsCard` / `SettingsRow` |
| `docs/06-database-schema.md` | `SettingsRecord.autoFollowPlayback` |
| `docs/15-state-management.md` | Persistensi preferensi |
| `docs/22-verse-display-controls.md` | Kontrol baca vs kontrol playback |
| `docs/14-routing-spec.md` | Route Surah Detail & Pengaturan |
| `docs/29-murotal-mode-spec.md` | Mode Murotal — pemutaran berkelanjutan |
| `docs/31-auto-download-audio-spec.md` | Auto Download Audio — cache saat play (Offline & Cache) |
