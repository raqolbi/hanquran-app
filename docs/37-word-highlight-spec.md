# 37 — Sorot Kata saat Tilawah (Word Highlight)

**Tanggal:** 2 November 2026
**Status:** ✅ Diimplementasi — rilis `0.6.0`
**Backlog:** PB-005 (sebelumnya Post-MVP, `docs/24`)
**Mengacu:** `docs/24-focus-mode-mvp-scope.md`, `docs/07-api-integration.md`, `docs/30-offline-behavior-spec.md`, `docs/26-about-screen-spec.md`

---

## 1. Ringkasan

Saat tilawah diputar, kata yang sedang dibaca qari disorot (latar hijau muda) pada ayat aktif di **Surah Detail** dan **Mode Fokus**. Fitur ini tertunda di MVP karena belum ada data waktu yang valid (`docs/24`). Sekarang datanya diambil dari **quran-align**, yang dibuat dari file audio **EveryAyah** — CDN yang sama dengan yang diputar aplikasi, sehingga waktu kata cocok dengan audio.

| Aspek | Keputusan |
|-------|-----------|
| Sumber data | [quran-align](https://github.com/cpfair/quran-align) rilis `release-2016-11-24` (Collin Fair) |
| Lisensi | **CC BY 4.0** — atribusi wajib: layar Tentang → Sumber Data, `README.md` § Credits, dan `THIRD_PARTY_NOTICES.md` (termasuk daftar perubahan yang kami lakukan pada data) |
| Qari yang didukung | **12 qari** — seluruh qari di rilis quran-align (lihat §8) |
| Qari lain | Abdullaah Al-Juhaynee & Ibrahim Al Dosary (Warsh) — **tidak ada data**; aplikasi berjalan normal tanpa sorotan |
| Qari default | **Mishary Alafasy** (`DEFAULT_RECITER_ID`) untuk pengguna baru; pengguna lama tetap memakai qari tersimpan |
| Pengaturan | **Sorot Kata** di Pengaturan → Playback (`settings.wordHighlight`, default ON) |
| Akurasi data | Rata-rata selisih <73 ms terhadap referensi independen (README quran-align); ±1% kata bisa meleset bila qari mengulang/melompati frasa |

---

## 2. Verifikasi Kecocokan Audio

Data waktu hanya benar bila file audio **identik** dengan yang dipakai saat data dibuat. Verifikasi 2 November 2026: durasi 8 file EveryAyah per qari (1:1, 2:255, 2:282, 18:10, 36:1, 55:13, 112:1, 114:6) dibandingkan dengan akhir segmen terakhir.

| Qari aplikasi | File data | Hasil |
|---------------|-----------|-------|
| `Alafasy_128kbps` | `Alafasy_128kbps.json` | ✅ Akhir segmen ≤ durasi file di semua sampel |
| `Minshawy_Mujawwad_192kbps` | `Minshawy_Mujawwad_192kbps.json` | ✅ |
| `Husary_128kbps` | `Husary_64kbps.json` | ✅ Rekaman sama; durasi file 128 kbps konsisten +34 ms dari 64 kbps (padding encoder) — di bawah galat data |
| `Abdul_Basit_Murattal_192kbps` | `Abdul_Basit_Murattal_64kbps.json` | ✅ Rekaman sama; folder 192 kbps konsisten +31 ms dari 64 kbps |
| `Abdul_Basit_Mujawwad_128kbps`, `Abdurrahmaan_As-Sudais_192kbps`, `Abu_Bakr_Ash-Shaatree_128kbps`, `Hani_Rifai_192kbps`, `Husary_Muallim_128kbps`, `Minshawy_Murattal_128kbps`, `Mohammad_al_Tablaway_128kbps`, `Saood_ash-Shuraym_128kbps` | file bernama sama | ✅ Akhir segmen ≤ durasi file di 6 sampel (1:1, 2:255, 18:10, 36:1, 112:1, 114:6) |

Catatan: file `Abdurrahmaan_As-Sudais_192kbps.json` di rilis diawali log "Crashed Command …" sebelum JSON; skrip membaca mulai `[{` dan seluruh 6.236 ayat utuh. Rekaman **Husary Muallim** berisi bagian pengulangan oleh anak-anak setelah bacaan qari — sorotan hanya mengikuti bacaan qari.

Kecocokan kata dengan teks dataset: 6.232–6.236 dari 6.236 ayat per qari (ayat yang indeks katanya melompat di data mentah, mis. 10:1 & 13:1, **tidak disorot**).

---

## 3. Definisi "Kata"

Sama di skrip pembangun data dan di klien (`lib/quran-words.ts` ↔ `countAyahWords` di `scripts/build-word-timings.mjs`, dijaga test):

1. Teks ayat dipisah spasi.
2. Token yang **hanya** berisi tanda (waqaf ۛ ۚ ۖ, tanda kecil `U+06D6–U+06ED`, tatweel) bukan kata — digabung ke kata sebelumnya untuk tampilan.
3. Muqaththa'at (الٓمٓ) dihitung satu kata.

---

## 4. Data

```
public/data/word-timings/v1/{reciterId}/{NNN}.json   ← 114 file per qari (±1,4 MB per qari; total 12 qari ±17 MB, ±5 MB terkompresi)
data/word-timing-reciters.json                       ← daftar qari yang didukung (di-bundle)
```

Format per surat:

```json
{ "surah": 1, "reciterId": "Alafasy_128kbps",
  "ayahs": { "1": [[0, 1, 60, 610], [1, 2, 620, 1310], ...] } }
```

Segmen = `[indeksKataAwal, indeksKataSesudahAkhir, mulaiMs, selesaiMs]` (satu segmen bisa mencakup >1 kata). Skrip merapikan data mentah: segmen diurutkan menurut waktu mulai dan `selesai ≥ mulai`.

Regenerasi (hanya bila sumber/qari berubah; hasil di-commit):

```bash
curl -L -o /tmp/qa.zip https://github.com/cpfair/quran-align/releases/download/release-2016-11-24/quran-align-data-2016-11-24.zip
# SHA-256: 5eeb045d8a7895208c94d2d7ec243567f8f550728835411527c4ffa1e789c9b7
unzip -o /tmp/qa.zip -d /tmp/quran-align
node scripts/build-word-timings.mjs /tmp/quran-align
```

Path berversi (`v1`) karena cache SW untuk `/data/*` bersifat cache-first: bila data diperbaiki, naikkan versi path agar salinan lama tidak dipakai.

---

## 5. Offline

- **Tidak** di-precache saat install SW (`scripts/generate-sw-precache.mjs` mengecualikan `/data/word-timings/`) agar unduhan awal PWA tidak bertambah ±4 MB.
- Dimuat per surat saat dibutuhkan → disimpan SW di `hanquran-data-v3` (cache-first) + cache memori.
- **Simpan Offline** ikut menyimpan file waktu surat itu untuk qari yang dipilih (`buildSurahOfflineDataUrls(surahId, reciterId)`).
- Offline tanpa file waktu → sorotan tidak tampil; audio & teks tetap normal.
- Android (static export): file ikut di-bundle di APK.

---

## 6. Implementasi

| Lapisan | File | Peran |
|---------|------|-------|
| Data | `services/quran/word-timings.ts` | `hasWordTimings`, `loadSurahWordTimings` (dedupe + cache memori), `findActiveWordRange` (pencarian biner) |
| Hook | `hooks/use-active-word-range.ts` | Posisi audio dari `useAudioStore.currentTime`, diinterpolasi per frame (`requestAnimationFrame` × `playbackRate`, maks 600 ms) — berjalan di web & Android |
| UI | `components/quran-ayah-text.tsx` | `QuranAyahText` (teks utuh / per kata) & `LiveQuranAyahText` (mengikuti audio) |
| Pemakaian | `AyahCard` (hanya ayat aktif), Mode Fokus | Ayat non-aktif tetap satu string → render daftar 286 ayat tidak terbebani |
| Pengaturan | `settings.wordHighlight` | Default `true`; field lama dilengkapi `normalizeStoredSettings()` |

Aturan perilaku:

- Sorotan hanya pada ayat yang **sedang diputar** dengan qari yang sama (`currentTrack` cocok surat + ayat + qari).
- Sebelum kata pertama mulai → tidak ada sorotan; di celah antar-kata → kata terakhir tetap tersorot (tidak berkedip).
- Saat dijeda → sorotan tetap di kata posisi jeda; setelah ayat selesai → hilang.
- Gaya (`app/globals.css`, `.quran-word[data-state]`, spek visual `docs/09` Word Highlight):
  - **Sedang dibaca** (`active`): "pil" hijau lembut — gradasi `#ECFDF5 → #A7F3D0`, teks `#065F46`, cincin `box-shadow` 0,12em + glow halus. Ruang di sekitar kata dari bayangan, **bukan** padding → tidak ada pergeseran layout.
  - **Sudah dibaca** (`read`): teks `#047857` sebagai jejak bacaan di ayat itu.
  - Transisi 220–260 ms ease-out; dimatikan otomatis saat Animasi Halus OFF.
  - Kontras tinggi: kata aktif latar `#064E3B` teks putih; kata sudah dibaca `#064E3B` (tanpa garis bawah agar tidak menabrak harakat bawah).

---

## 7. Batasan & Pekerjaan Lanjutan

- Al-Juhaynee & Ibrahim Al Dosary (Warsh) belum didukung — perlu data waktu sendiri (forced alignment).
- Data menambah ±5 MB (terkompresi) ke APK Android; PWA tidak terpengaruh karena dimuat per surat.
- Ketuk kata untuk mengulang satu kata / rentang kata → direncanakan di `docs/38-word-loop-spec.md`.
- Data 2016; bila penulis quran-align merilis revisi, jalankan ulang skrip dengan versi path baru.

---

## 8. Daftar Qari & Tanda

Sumber: `data/reciters.json` (urutan = urutan tampil di Pengaturan). Di Pengaturan → Qari setiap qari diberi tanda:

| Tanda | Arti | Sumber |
|-------|------|--------|
| Untuk hafalan | Rekaman metode belajar (Muallim) | Field `memorization` |
| Sorot kata | Mendukung sorot kata | Otomatis dari `data/word-timing-reciters.json` |

| Qari | Folder EveryAyah | Sorot kata |
|------|------------------|:----------:|
| Mishary Rashid Alafasy (default) | `Alafasy_128kbps` | ✅ |
| Abdul Basit Abdus Samad (Murattal) | `Abdul_Basit_Murattal_192kbps` | ✅ |
| Abdurrahman As-Sudais | `Abdurrahmaan_As-Sudais_192kbps` | ✅ |
| Saud Ash-Shuraim | `Saood_ash-Shuraym_128kbps` | ✅ |
| Mahmoud Khalil Al-Husary (Murattal) | `Husary_128kbps` | ✅ |
| Muhammad Siddiq Al-Minshawi (Murattal) | `Minshawy_Murattal_128kbps` | ✅ |
| Mahmoud Khalil Al-Husary (Muallim) — untuk hafalan | `Husary_Muallim_128kbps` | ✅ |
| Abdul Basit Abdus Samad (Mujawwad) | `Abdul_Basit_Mujawwad_128kbps` | ✅ |
| Muhammad Siddiq Al-Minshawi (Mujawwad) | `Minshawy_Mujawwad_192kbps` | ✅ |
| Abu Bakr Ash-Shatri | `Abu_Bakr_Ash-Shaatree_128kbps` | ✅ |
| Hani Ar-Rifai | `Hani_Rifai_192kbps` | ✅ |
| Mohamed Al-Tablawi | `Mohammad_al_Tablaway_128kbps` | ✅ |
| Abdullaah Awaad Al-Juhaynee | `Abdullaah_3awwaad_Al-Juhaynee_128kbps` | — |
| Ibrahim Al Dosary (Warsh) | `warsh/warsh_ibrahim_aldosary_128kbps` | — |

Menambah qari: pastikan folder ada di EveryAyah (`https://everyayah.com/data/{folder}/001001.mp3`), tambahkan ke `data/reciters.json`; untuk sorot kata perlu data waktu yang dibuat dari file audio yang sama.

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 2 November 2026 | Dokumen awal — implementasi dengan data quran-align untuk 3 qari |
| 2 November 2026 | Tampilan sorotan dipercantik: pil bergradasi + cincin/glow, jejak kata yang sudah dibaca, varian kontras tinggi |
| 2 November 2026 | Diperluas ke 12 qari (9 qari baru di aplikasi); qari default → Alafasy; tanda Untuk hafalan / Sorot kata (§8) |
| 2 November 2026 | Tanda "Populer" dihapus (tanpa data popularitas yang bisa dipertanggungjawabkan, dan pemeliharaannya merepotkan) |
