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

## Riwayat

### [0.5.0] — 2026-06-26

#### Ringkasan

Pengaturan **Auto Download Audio** (opt-in, default OFF) — menyimpan otomatis file MP3 ayat yang diputar agar dapat didengar offline nanti, tanpa menggantikan unduhan penuh per surat via **Simpan Offline**.

#### Fitur baru

- Toggle **Auto Download Audio** di Pengaturan → Offline & Cache (`settings.autoDownloadOnPlay`, default `false`)
- Cache background per ayat saat play (online) ke `hanquran-audio-v1` — tidak memblokir streaming
- Pemutaran offline per ayat: ayat yang pernah diputar (saat fitur ON) dapat diputar tanpa jaringan
- Spesifikasi: `docs/31-auto-download-audio-spec.md`

#### Perbaikan

- Gate pemutaran offline & Murotal memeriksa cache per ayat, bukan hanya manifest surat penuh

#### Catatan penting

- Badge «Siap offline» surat tetap hanya untuk **Simpan Offline** penuh — bukan auto download sebagian
- Versi `package.json` **0.5.0** — tampil otomatis di layar Tentang HanQuran

#### Uji sebelum rilis

- [x] Unit test `audio-play-cache`, `can-play-ayah-offline`, gate pemutaran — 292 test hijau
- [ ] Verifikasi manual: ON → play beberapa ayat online → offline → hanya ayat tersebut dapat diputar
- [ ] Preview / staging diuji
- [ ] Production deploy
- [ ] Checklist `docs/25-deployment-vercel.md` §5

---

### [0.4.0] — 2026-06-26

#### Ringkasan

Milestone **Offline First** — seluruh Al-Qur'an (teks, terjemahan, metadata) dan shell aplikasi tersimpan sebagai aset offline sejak Service Worker terpasang. PWA berfungsi penuh tanpa jaringan (termasuk cold start setelah dipasang); internet hanya untuk streaming atau menyimpan audio.

#### Fitur baru

- **Precache saat install** — Service Worker mem-precache app shell, seluruh `/_next/static/*`, dan dataset Qur'an penuh saat `install` (lihat `docs/30` §6.1)
- **Baca seluruh surat offline tanpa unduh** — buka surat mana pun saat offline meski belum pernah dibuka
- **App-shell route dinamis** — `/surah/[id]` & `/focus/[id]` membaca id dari URL; satu shell melayani semua id, Mode Fokus & surat baru tetap terbuka offline
- **Manifest precache hasil build** — `scripts/generate-sw-precache.mjs` (dijalankan via `postbuild`) men-generate daftar aset ber-hash

#### Perbaikan

- Cold start PWA offline & Mode Fokus offline tidak lagi memunculkan «Anda sedang offline» / halaman error
- Navigasi App Router (RSC) offline dicocokkan dengan `ignoreSearch`
- Batas Murotal offline — pemutaran berhenti saat surat berikut/sebelumnya belum tersedia offline

#### PWA & offline

- **Service Worker cache dinaikkan ke `*-v2`** (`hanquran-shell/static/data-v2`); cache audio tetap `hanquran-audio-v1`
- Hapus precache berbasis online lama (`offline-app-precache.ts`) — digantikan precache `install`

#### Catatan penting

- **Wajib buka aplikasi online sekali** agar Service Worker baru (v2) terpasang & precache berjalan, sebelum mode offline penuh aktif
- Versi `package.json` **0.4.0** — tampil otomatis di layar Tentang HanQuran
- Konten Tentang HanQuran diperbarui: prinsip "Offline First" kini mencerminkan baca offline sejak terpasang

#### Masalah yang diketahui

- Cache Storage memerlukan secure context (HTTPS / `localhost`) — uji LAN via tunnel HTTPS
- Word-by-word highlight & persist posisi audio terakhir — Post-MVP

#### Uji sebelum rilis

- [x] Unit test SW helpers (`isDynamicAppRoute`), `parseSurahIdFromPathname`, generator manifest
- [x] `npm run build` + 278 unit test hijau
- [ ] Verifikasi manual perangkat: install online sekali → offline → cold start, Beranda/Tentang/Mode Fokus/surat-belum-unduh, batas Murotal (`docs/30` §8)
- [ ] Preview / staging diuji
- [ ] Production deploy
- [ ] Checklist `docs/25-deployment-vercel.md` §5

---

### [0.3.0] — 2026-06-25

#### Ringkasan

Rilis growth HanQuran — Media Session di lock screen, **Mode Murotal** tilawah berkelanjutan, progress repeat **x/y**, lazy load Beranda, dan tooling audit performa.

#### Fitur baru

- **Media Session API** — metadata surat/ayat/qari di kontrol media OS; Play/Pause dari lock screen
- Progress bar & seek via `setPositionState` / `seekto` (Chrome Android)
- Navigasi ayat dari lock screen (`previoustrack` / `nexttrack`) — mengikuti aturan transport `docs/29` §7.2
- Toggle **Mode Murotal** di Pengaturan → Playback (default OFF)
- Pemutaran otomatis lanjut ke ayat berikutnya atau surat berikutnya setelah repeat selesai
- Badge **`x/y`** (`RepeatProgressBadge`) saat sesi repeat aktif — Surah Detail & Focus Mode
- Aturan tombol **⏮/⏭** transport — dalam surat (default) atau lintas surat saat Murotal ON
- **Lazy load kartu surat Beranda** — `LazySurahCard` (LCP/TBT membaik pada run Lighthouse terbaik)

#### Perbaikan

- Auto Follow Playback — pengukuran zona baca di landscape HP (`short-landscape`)
- Tooling audit performa — `npm run perf:*` (bundle, Lighthouse, PWA smoke)

#### PWA & offline

- Tidak ada perubahan Service Worker; audio tetap via `HTMLAudioElement`
- Navigasi lintas surat memakai route yang sama (`/surah/[id]`, `/focus/[id]`)
- Disarankan uji dengan PWA terpasang di Android & iOS

#### Catatan penting

- Migrasi Dexie: field baru `settings.murotalEnabled` (default `false`)
- Akhir Al-Qur'an (An-Nas): pemutaran berhenti + feedback pengguna
- Versi `package.json` **0.3.0** — tampil otomatis di layar Tentang HanQuran

#### Masalah yang diketahui

- Perilaku background audio **platform-dependent** — iOS Safari lebih ketat daripada Android Chrome
- Firefox Android: progress bar lock screen tidak tersedia (known limitation, §6.3 `docs/27`)
- Lighthouse Performance Beranda — run terbaik ~47; target ≥ 80 belum tercapai
- Word-by-word highlight — Post-MVP
- Persist posisi audio terakhir — belum

#### Uji sebelum rilis

- [x] Unit test `media-session` + integrasi `audio-controller`
- [x] Unit test `murotal-resolver` + orkestrasi repeat+murotal
- [x] Unit test auto follow landscape + `formatRepeatProgressLabel`
- [x] Unit test `lazy-surah-card` + baseline performa (`docs/18` Phase 7)
- [x] Checklist manual lock screen (`docs/27` §8)
- [x] Checklist manual Phase 2c (`docs/18`) — lintas surat, kombinasi repeat+murotal
- [x] Uji auto follow landscape HP (perangkat fisik)
- [x] Preview / staging diuji
- [x] Production deploy
- [x] Checklist `docs/25-deployment-vercel.md` §5 (uji manual)

---

### [0.1.0] — baseline MVP (pengembangan)

#### Ringkasan

Baseline MVP HanQuran — aplikasi hafalan Al-Qur'an dengan audio per ayat, repeat, mode fokus, dan dukungan offline. Fitur growth `0.2.0`/`0.3.0` digabung dalam rilis **0.3.0** di atas.

#### Fitur baru

- Beranda — daftar surat, pencarian, filter favorit
- Detail surat — audio tilawah, pengulangan ayat (RepeatEngine)
- Mode Fokus — baca satu ayat bebas distraksi
- Lanjutkan Hafalan — lanjut dari posisi terakhir
- Pengaturan — bahasa UI (ID/EN), qari, ukuran teks Arab, aksesibilitas
- Unduh offline per surat — audio + metadata cache
- PWA — instal ke layar utama, splash screen, shell offline

#### PWA & offline

- Service Worker — caching dataset, aset, dan audio CDN
- Halaman fallback `offline.html` saat tidak ada jaringan

#### Catatan penting

- Data hafalan (favorit, pengaturan, progres) disimpan **lokal di perangkat** (IndexedDB); tidak ada akun cloud pada MVP.
- Setelah instal PWA, update aplikasi mengikuti deploy baru di Vercel (refresh / update SW).

---

<!-- Versi berikutnya: salin Template di atas ke sini, di atas entri 0.5.0 -->
