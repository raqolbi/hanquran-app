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

#### Uji sebelum rilis

- [ ] Preview / staging diuji
- [ ] Production deploy
- [ ] Checklist `docs/25-deployment-vercel.md` §5

---

<!-- Versi berikutnya: salin Template di atas ke sini, di atas entri 0.1.0 -->
