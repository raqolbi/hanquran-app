# Catatan Rilis — HanQuran

Template dan riwayat rilis untuk pengguna. Tulis dalam **Bahasa Indonesia** (istilah teknis seperti PWA, Service Worker boleh tetap bahasa asli).

**Deploy:** lihat `docs/25-deployment-vercel.md`  
**Skema versi:** [Semantic Versioning](https://semver.org/lang/id/) — selaras `package.json`

| Segmen | Arti (pre-1.0 MVP) |
|--------|---------------------|
| **0.MINOR.PATCH** | `MINOR` = fitur / milestone; `PATCH` = perbaikan bug |
| **1.0.0** | Rilis publik stabil pertama (MVP “selesai”) |

---

## Cara memakai template

1. Salin blok **Template versi baru** di bawah ke bagian **Riwayat**.
2. Isi tanggal, ringkasan, dan bullet per kategori.
3. Perbarui `version` di `package.json` sebelum tag Git (opsional: `git tag v0.2.0`).
4. Setelah deploy production di Vercel, centang item QA di `docs/25-deployment-vercel.md` §5.

---

## Template versi baru

```markdown
## [0.x.x] — YYYY-MM-DD

### Ringkasan

Satu atau dua kalimat: apa yang berubah bagi pengguna.

### Fitur baru

- …

### Perbaikan

- …

### PWA & offline

- …

### Catatan penting

- Perubahan data pengguna / migrasi Dexie (jika ada)
- Perlu muat ulang atau hapus cache (jika ada)

### Masalah yang diketahui

- …

### Uji sebelum rilis

- [ ] Preview / staging diuji
- [ ] Production deploy
- [ ] Checklist `docs/25-deployment-vercel.md` §5
```

---

## Rencana (belum dirilis)

### [0.2.0] — (implementasi selesai, belum dirilis)

#### Ringkasan

Pengalaman pemutaran audio di mobile: metadata surat/ayat di lock screen dan kontrol Play/Pause via Media Session API.

#### Fitur baru (rencana)

- Media Session API — metadata surat, ayat, dan qari di kontrol media OS
- Kontrol Play/Pause dari lock screen (jika platform mendukung)
- Progress bar & seek via `setPositionState` / `seekto` (Chrome Android)
- Navigasi ayat dari lock screen (`previoustrack` / `nexttrack`) — mengikuti aturan transport `docs/29` §7.2
- Audio background lebih baik saat layar terkunci — selama browser mengizinkan

#### PWA & offline

- Tidak ada perubahan Service Worker; audio tetap via `HTMLAudioElement`
- Disarankan uji dengan PWA terpasang di Android & iOS

#### Dokumentasi

- Spesifikasi lengkap: `docs/27-media-session-api-spec.md`
- Task implementasi: `docs/18-development-tasks.md` Phase 2b

#### Masalah yang diketahui (antisipasi)

- Perilaku background audio **platform-dependent** — iOS Safari lebih ketat daripada Android Chrome
- Firefox Android: progress bar lock screen tidak tersedia (known limitation, §6.3 `docs/27`)

#### Uji sebelum rilis

- [x] Unit test `media-session` + integrasi `audio-controller`
- [ ] Checklist manual lock screen (`docs/27` §8)
- [ ] Tidak ada regresi `AudioTabSync` dan RepeatEngine (uji manual)

---

### [0.3.0] — (rencana — implementasi selesai, belum dirilis)

#### Ringkasan

Tilawah berkelanjutan (**Mode Murotal**), progress repeat **x/y** di audio bar, dan perbaikan auto follow di landscape HP.

#### Fitur baru (rencana)

- Toggle **Mode Murotal** di Pengaturan → Playback (default OFF)
- Pemutaran otomatis lanjut ke ayat berikutnya atau surat berikutnya
- Integrasi dengan RepeatEngine — repeat didahulukan; setelah siklus selesai, murotal advance
- Berlaku di Surah Detail dan Focus Mode
- Badge **`x/y`** (`RepeatProgressBadge`) saat sesi repeat aktif — Surah Detail & Focus Mode
- Aturan tombol **⏮/⏭** transport — dalam surat (default) atau lintas surat saat Murotal ON

#### Perbaikan (rencana)

- Auto Follow Playback — pengukuran zona baca di landscape HP (`short-landscape`)
- **Lazy load kartu surat Beranda** — `LazySurahCard` (LCP/TBT membaik pada run Lighthouse terbaik)
- Tooling audit performa — `npm run perf:*` (bundle, Lighthouse, PWA smoke)

#### PWA & offline

- Tidak ada perubahan Service Worker
- Navigasi lintas surat memakai route yang sama (`/surah/[id]`, `/focus/[id]`)

#### Dokumentasi

- Spesifikasi lengkap: `docs/29-murotal-mode-spec.md`, `docs/12-component-spec.md` (§14–15)
- Task implementasi: `docs/18-development-tasks.md` Phase 2c

#### Catatan penting

- Migrasi Dexie: field baru `settings.murotalEnabled` (default `false`)
- Akhir Al-Qur'an (An-Nas): pemutaran berhenti + feedback pengguna
- `package.json` belum di-bump — naik ke `0.3.0` saat rilis formal

#### Uji sebelum rilis

- [x] Unit test `murotal-resolver` + orkestrasi repeat+murotal
- [x] Unit test auto follow landscape + `formatRepeatProgressLabel`
- [x] Unit test `lazy-surah-card` + baseline performa (`docs/18` Phase 7)
- [ ] Checklist manual Phase 2c (`docs/18`) — lintas surat, kombinasi repeat+murotal
- [ ] Uji auto follow landscape HP (perangkat fisik)
- [ ] Tidak ada regresi RepeatEngine dan Media Session

---

## Riwayat

### [0.1.0] — (belum dirilis)

#### Ringkasan

Rilis MVP pertama HanQuran — aplikasi hafalan Al-Qur'an dengan audio per ayat, repeat, mode fokus, dan dukungan offline.

#### Fitur baru

- Beranda — daftar surat, pencarian, filter favorit
- Detail surat — audio tilawah, pengulangan ayat (RepeatEngine)
- Mode Fokus — baca satu ayat bebas distraksi
- Lanjutkan Hafalan — lanjut dari posisi terakhir
- Pengaturan — bahasa UI (ID/EN), qari, ukuran teks Arab, aksesibilitas
- Unduh offline per surat — audio + metadata cache
- PWA — instal ke layar utama, splash screen, shell offline

#### Perbaikan

- _(Isi saat rilis dari delta sejak tag sebelumnya)_

#### PWA & offline

- Service Worker — caching dataset, aset, dan audio CDN
- Halaman fallback `offline.html` saat tidak ada jaringan

#### Catatan penting

- Data hafalan (favorit, pengaturan, progres) disimpan **lokal di perangkat** (IndexedDB); tidak ada akun cloud pada MVP.
- Setelah instal PWA, update aplikasi mengikuti deploy baru di Vercel (refresh / update SW).

#### Masalah yang diketahui

- Word-by-word highlight — Post-MVP
- Persist posisi audio terakhir — belum
- Verifikasi E2E pemutaran offline — manual
- Media Session API — diimplementasi; menunggu tag rilis `v0.2.0` & uji manual lock screen (`docs/27`)

#### Uji sebelum rilis

- [ ] Preview / staging diuji
- [ ] Production deploy
- [ ] Checklist `docs/25-deployment-vercel.md` §5

---

<!-- Versi berikutnya: salin Template di atas ke sini, di atas entri 0.1.0 -->
