# Pemberitahuan Pihak Ketiga — HanQuran

Daftar data, aset, dan layanan pihak ketiga yang **disertakan** atau **dipakai langsung** oleh HanQuran beserta lisensi dan atribusinya. Library npm mengikuti lisensinya masing-masing (lihat `package.json` / `node_modules/*/LICENSE`).

Atribusi juga ditampilkan di aplikasi: **Pengaturan → Tentang HanQuran → Sumber Data** (`data/about-credits.ts`).

---

## 1. Data waktu per kata — quran-align

| | |
|---|---|
| Sumber | https://github.com/cpfair/quran-align — rilis `release-2016-11-24`, berkas `quran-align-data-2016-11-24.zip` (SHA-256 `5eeb045d8a7895208c94d2d7ec243567f8f550728835411527c4ffa1e789c9b7`) |
| Pembuat | Collin Fair |
| Lisensi data | [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) |
| Lokasi di repo | `public/data/word-timings/v1/**`, `data/word-timing-reciters.json` |
| Dipakai untuk | Sorot kata saat tilawah (`docs/37-word-highlight-spec.md`) |

**Perubahan yang kami lakukan** (diwajibkan CC BY 4.0 untuk disebutkan), oleh `scripts/build-word-timings.mjs`:

- Dipecah per qari & per surat, diubah ke format JSON ringkas `{ surah, reciterId, ayahs }`; field `stats` dibuang.
- Segmen diurutkan menurut waktu mulai dan waktu selesai dijamin ≥ waktu mulai (<0,1% segmen).
- Ayat yang indeks katanya melebihi jumlah kata pada teks dataset kami dibuang.
- Data `Husary_64kbps` dipakai untuk folder audio `Husary_128kbps`, dan `Abdul_Basit_Murattal_64kbps` untuk `Abdul_Basit_Murattal_192kbps` (rekaman sama).
- Log galat di awal berkas `Abdurrahmaan_As-Sudais_192kbps.json` diabaikan saat membaca.

Data asli tidak diubah isinya selain hal di atas. Kode alat quran-align sendiri berlisensi MIT, tetapi **tidak** disertakan di repo ini.

## 2. Font Amiri Quran

| | |
|---|---|
| Sumber | Amiri Project — https://github.com/aliftype/amiri (didistribusikan ulang lewat paket npm `@fontsource/amiri-quran` 5.3.0, subset Arab) |
| Hak cipta | Copyright 2010–2022 The Amiri Project Authors |
| Lisensi | SIL Open Font License 1.1 — teks lengkap: `app/fonts/OFL-amiri-quran.txt` |
| Lokasi di repo | `app/fonts/amiri-quran-arabic-400-normal.woff2` |
| Perubahan | Tidak ada (berkas woff2 subset Arab dari Fontsource apa adanya) |

## 3. Teks Al-Qur'an — Tanzil

| | |
|---|---|
| Sumber | Tanzil Project — https://tanzil.net/ (teks Utsmani) |
| Ketentuan | Sesuai ketentuan Tanzil: teks tidak diubah, sumber disebutkan dan ditautkan |
| Lokasi | Diolah ke `public/data/quran/*.json` lewat [HanQuran Data Generator](https://github.com/raqolbi/hanquran-data-generator) |

## 4. Transliterasi — eQuran.id

| | |
|---|---|
| Sumber | https://equran.id/ |
| Lokasi | Field `transliteration` di `public/data/quran/*.json` |

## 5. Audio tilawah — EveryAyah

| | |
|---|---|
| Sumber | https://everyayah.com/ — audio per ayat dari para qari |
| Penggunaan | **Tidak disertakan** di repo; di-stream langsung dari CDN EveryAyah (`services/quran/audio-config.ts`) dan bisa disimpan di perangkat pengguna (Simpan Offline) |
| Daftar qari | `data/reciters.json` |

---

Jika Anda pemilik salah satu sumber di atas dan ingin atribusi diperbaiki, silakan buka issue di repository.
