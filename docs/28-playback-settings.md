# 28 — Playback Settings

**Tanggal:** 25 Juni 2026  
**Status:** ✅ Diimplementasi (MVP V1)  
**Lokasi UI:** `/settings` — bagian **Playback**

---

## 1. Ringkasan

Bagian **Playback** pada halaman Pengaturan mengatur perilaku layar saat audio tilawah berjalan di **Surah Detail** (`/surah/[id]`).

Pada MVP V1, bagian ini berisi satu pengaturan:

| Pengaturan | Default | Persistensi |
|------------|---------|-------------|
| Auto Follow Playback | ON (`true`) | `settings.autoFollowPlayback` |

> **Bukan bagian Playback Settings:** pengaturan repeat (`RepeatSettingsDialog`), play/pause, navigasi ayat — tetap di kontrol audio pada Surah Detail. Lihat `docs/22-verse-display-controls.md` (Bagian 6).

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
| Deskripsi | Otomatis menggulir layar agar ayat yang sedang diputar tetap terlihat. |
| Default | ON |
| Kontrol | `Switch` |

---

## 4. Auto Follow Playback — Perilaku

Berlaku saat audio tilawah aktif di Surah Detail dan `settings.autoFollowPlayback === true`.

### 4.1 Saat ayat aktif berpindah

1. Sistem memeriksa apakah elemen ayat aktif masih terlihat di viewport.
2. **Jika masih terlihat** — tidak ada scroll; highlight ayat tetap berpindah seperti biasa.
3. **Jika keluar viewport** — sistem melakukan auto scroll halus agar ayat aktif kembali terlihat.
4. Scroll memakai sistem animasi yang sudah ada (`settings.smoothAnimation` via `AccessibilityProvider`):
   - `smoothAnimation: true` → scroll animasi halus.
   - `smoothAnimation: false` → scroll instan (tanpa animasi).

### 4.2 Scroll manual pengguna

- Saat pengguna sedang melakukan scroll manual (sentuh, roda mouse, atau keyboard), auto follow **ditangguhkan** sementara.
- Setelah pengguna berhenti scroll selama jeda singkat (~2 detik, dapat disesuaikan saat implementasi), auto follow **dapat aktif kembali**.
- Auto follow tidak boleh menarik layar saat pengguna sedang membaca ayat lain secara sengaja.

### 4.3 Prinsip anti-flicker

- Scroll hanya dilakukan jika diperlukan — hindari pergerakan layar berlebihan.
- Tidak scroll ulang jika ayat aktif sudah memenuhi kriteria visibilitas (mis. seluruh kartu atau bagian inti ayat terlihat).
- Perubahan pengaturan (ON/OFF) berlaku segera tanpa reload halaman.

### 4.4 Cakupan layar

| Layar | Auto Follow Playback |
|-------|----------------------|
| Surah Detail (`/surah/[id]`) | ✅ Berlaku |
| Focus Mode (`/focus/[id]`) | ❌ Tidak berlaku — satu ayat per layar, tidak ada daftar scroll |
| Beranda / Pengaturan | ❌ Tidak berlaku |

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
