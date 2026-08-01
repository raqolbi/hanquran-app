# 33 — Privacy Policy & Data Safety (Google Play)

**Bahasa:** Indonesia (teks kebijakan); ringkasan Data Safety untuk Play Console.  
**Status:** Dokumen rilis store — Phase A5 (`docs/32`)  
**Application ID:** `app.hanquran.android`  
**Versi acuan:** selaras `package.json`

---

## 1. URL kebijakan privasi

Host teks §2 di situs PWA produksi, misalnya:

- `https://<domain-produksi>/privacy` *(tambahkan rute publik saat domain final)*  
- Atau publikasikan gist/halaman statis yang sama isinya, lalu tempel URL di Play Console → **App content → Privacy policy**.

Selama URL produksi belum final, gunakan dokumen ini sebagai sumber kebenaran salinan.

---

## 2. Kebijakan Privasi (ringkas untuk pengguna)

**HanQuran** adalah aplikasi hafalan Al-Qur'an (PWA & Android) tanpa akun pengguna.

### Data yang kami proses

| Jenis | Keterangan |
|-------|------------|
| Preferensi lokal | Bahasa UI, qari, pengaturan repeat/murotal, favorit, posisi terakhir baca — disimpan **di perangkat** (IndexedDB / penyimpanan app) |
| Cache audio | File tilawah yang Anda unduh atau putar (jika unduh otomatis aktif) — disimpan **di perangkat** |
| Analytics (hanya PWA web) | Di build web production, page view / event anonim via Vercel Analytics. **Tidak** diaktifkan di APK Capacitor |

### Yang tidak kami lakukan

- Tidak ada registrasi / login  
- Tidak mengumpulkan nama, email, atau nomor telepon  
- Tidak menjual data pengguna  
- Tidak meminta izin mikrofon, kamera, atau lokasi untuk MVP  

### Jaringan

Saat online, aplikasi dapat mengunduh teks/aset yang sudah dibundle atau streaming/mengunduh audio dari CDN pihak ketiga (**everyayah.com**). Lihat layar **Tentang** untuk kredit qari & sumber.

### Anak-anak

Aplikasi cocok untuk pembelajaran; kami tidak menargetkan pengumpulan data anak secara khusus karena tidak ada akun.

### Kontak

Untuk pertanyaan privasi terkait distribusi open-source: lihat repository GitHub proyek HanQuran.

---

## 3. Play Console — Data safety (isian disarankan)

| Pertanyaan | Jawaban disarankan |
|------------|-------------------|
| Apakah app mengumpulkan data pengguna? | **Tidak** mengumpulkan data ke server pengembang untuk akun/profil. Preferensi & cache **hanya on-device**. |
| Data dibagikan ke pihak ketiga? | Audio di-stream/unduh dari CDN tilawah (everyayah.com) saat pengguna memutar/mengunduh — bukan “data pribadi” teridentifikasi. Analytics web (Vercel) hanya di PWA, bukan APK. |
| Keamanan | Data lokal; HTTPS untuk jaringan |
| Penghapusan | Uninstall aplikasi / clear storage OS menghapus preferensi & cache lokal |

**Deklarasikan di form:** tidak ada pengumpulan lokasi, kontak, foto, mikrofon, financial, dll.

---

## 4. Izin Android (MVP)

Hindari izin sensitif. Playback background memakai foreground service media sesuai plugin NativeAudio — deklarasi FGS di manifest plugin, tanpa izin mikrofon/kamera/lokasi.

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 1 Agustus 2026 | Dokumen awal Phase A5 |
