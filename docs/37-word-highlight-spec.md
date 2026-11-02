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
| Lisensi | **CC BY 4.0** — atribusi wajib (sudah di layar Tentang → Sumber Data) |
| Qari yang didukung | Mishary Alafasy (`Alafasy_128kbps`), Mahmoud Khalil Al-Husary (`Husary_128kbps`), Muhammad Siddiq Al-Minshawi (`Minshawy_Mujawwad_192kbps`) |
| Qari lain | Abdullaah Al-Juhaynee (default) & Ibrahim Al Dosary (Warsh) — **tidak ada data**; aplikasi berjalan normal tanpa sorotan |
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

Kecocokan kata dengan teks dataset: 6.234 dari 6.236 ayat (2 ayat — 10:1 & 13:1 — punya indeks kata melompat di data mentah dan **tidak disorot**).

---

## 3. Definisi "Kata"

Sama di skrip pembangun data dan di klien (`lib/quran-words.ts` ↔ `countAyahWords` di `scripts/build-word-timings.mjs`, dijaga test):

1. Teks ayat dipisah spasi.
2. Token yang **hanya** berisi tanda (waqaf ۛ ۚ ۖ, tanda kecil `U+06D6–U+06ED`, tatweel) bukan kata — digabung ke kata sebelumnya untuk tampilan.
3. Muqaththa'at (الٓمٓ) dihitung satu kata.

---

## 4. Data

```
public/data/word-timings/v1/{reciterId}/{NNN}.json   ← 114 file per qari (±1,4 MB per qari)
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
- Gaya: latar `emerald-200/80`, teks `emerald-900`, transisi warna 150 ms, **tanpa** padding/margin (tidak menggeser layout).

---

## 7. Batasan & Pekerjaan Lanjutan

- Qari default (Al-Juhaynee) belum didukung — pertimbangkan mengganti qari default ke salah satu qari yang didukung, atau membuat data waktu sendiri (forced alignment) untuk qari lain.
- Ketuk kata untuk memutar dari kata itu / mengulang satu kata belum ada.
- Data 2016; bila penulis quran-align merilis revisi, jalankan ulang skrip dengan versi path baru.

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 2 November 2026 | Dokumen awal — implementasi dengan data quran-align untuk 3 qari |
