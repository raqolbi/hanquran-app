# 38 — Ulang Kata (Word Loop) untuk Hafalan per Kata

**Tanggal:** 2 November 2026
**Status:** 📝 Spesifikasi — belum diimplementasi (task: `docs/18` Phase 15)
**Bergantung pada:** `docs/37-word-highlight-spec.md` (data waktu per kata quran-align)
**Mengacu:** `docs/29-murotal-mode-spec.md`, `docs/12-component-spec.md` (Repeat), `docs/15-state-management.md`

---

## 1. Ringkasan

Pengguna yang ingin menghafal **per kata atau per frasa** bisa:

1. **Ketuk satu kata** → audio memutar kata itu berulang terus.
2. **Seret dari kata A ke kata B** → audio memutar rentang kata A–B berulang terus.
3. **Ketuk lagi kata/rentang yang sedang diulang** (atau tombol **Berhenti** di chip) → pengulangan berhenti.

Fitur ini memanfaatkan data waktu per kata yang sama dengan sorot kata (`docs/37`), sehingga hanya tersedia untuk **12 qari bertanda "Sorot kata"**. Tidak ada data baru yang perlu diunduh.

Prinsip produk: **Memorization First** — mendengar potongan kecil berulang-ulang, lalu menirukannya, adalah cara menghafal yang umum dipakai (talaqqi per kata/frasa).

---

## 2. Istilah

| Istilah | Arti |
|---------|------|
| Ulang kata | Mode pemutaran yang mengulang potongan audio milik satu kata/rentang kata di dalam satu ayat |
| Rentang | Kata `from`..`to` (inklusif–eksklusif, sama dengan `WordRange` di `docs/37`) di **satu ayat** |
| Segmen | Potongan waktu dari quran-align `[kataAwal, kataSesudahAkhir, mulaiMs, selesaiMs]`; satu segmen bisa memuat >1 kata |
| Jeda menirukan | Diam sejenak di antara pengulangan agar pengguna sempat menirukan |

---

## 3. Interaksi

### 3.1 Ketuk kata

| Kondisi | Hasil |
|---------|-------|
| Ketuk kata di **ayat aktif**, ulang kata **mati** | Mulai ulang kata untuk kata itu |
| Ketuk kata di **ayat lain** | Ayat itu menjadi aktif, lalu mulai ulang kata untuk kata itu |
| Ketuk kata yang **sedang diulang** (atau di dalam rentang yang sedang diulang) | Berhenti mengulang; audio dijeda di akhir potongan |
| Ketuk kata **lain** saat sedang mengulang | Pindah ke kata baru (langsung, tanpa berhenti dulu) |
| Qari tidak punya data waktu / ayat tidak punya segmen | Tidak memulai; tampil toast "Ulang kata tersedia untuk qari bertanda Sorot kata" |

Ketuk di **luar** kata (ruang kosong kartu) tetap berperilaku seperti sekarang: memilih ayat.

### 3.2 Seret rentang

- **Tekan lama ±350 ms** pada sebuah kata, lalu **seret** ke kata lain di ayat yang sama → rentang terpilih (sorotan pilihan mengikuti jari).
- Lepas jari → mulai ulang rentang.
- Rentang dibatasi **satu ayat**. Menyeret ke luar ayat → berhenti di kata pertama/terakhir ayat itu.
- Tekan lama dipakai (bukan seret langsung) agar tidak bentrok dengan **gulir halaman** di layar sentuh.
- Desktop: klik-tahan lalu seret dengan mouse; atau **Shift + klik** kata kedua untuk memperluas rentang.

### 3.3 Aksesibilitas & keyboard

- Saat ayat aktif dan data tersedia, setiap kata di ayat aktif adalah tombol (`role="button"`, `aria-pressed` saat diulang, `aria-label` = "Ulang kata ke-N").
- **Enter/Spasi** = ketuk kata; **Shift + Enter** pada kata kedua = perluas rentang.
- Chip status punya tombol **Berhenti** yang bisa difokus; **Esc** juga menghentikan.
- Pengumuman `aria-live="polite"`: "Mengulang kata 3" / "Mengulang kata 3–5" / "Berhenti mengulang".

### 3.4 Tampilan

- Kata/rentang yang diulang diberi **bingkai amber** (`data-loop="true"`), berbeda dari pil hijau "sedang dibaca" (`docs/37` §6) — keduanya bisa tampil bersamaan.
- Saat menyeret: kata yang terpilih diberi latar amber transparan.
- **Chip status** mengambang di atas `AudioPlayer`: `🔁 Mengulang kata 3–5 · 7×` + tombol **Berhenti**.
- Mode Fokus: perilaku sama; chip di posisi yang sama.

---

## 4. Perilaku Audio

### 4.1 Batas potongan

- `startMs` = `mulaiMs` segmen pertama yang memuat kata `from`; `endMs` = `selesaiMs` segmen terakhir yang memuat kata `to - 1`.
- Kata yang berada di **segmen gabungan** (satu segmen >1 kata) tidak bisa dipisah: potongan diperluas ke seluruh segmen, dan sorotan pilihan ikut melebar agar jujur kepada pengguna.
- Bantalan: mulai `−60 ms`, selesai `+120 ms` (dibatasi ke `0..durasi`) agar awal/akhir kata tidak terpotong. Nilai bisa disetel setelah uji dengar.

### 4.2 Siklus

```
seek(startMs - pad) → play → (posisi ≥ endMs + pad) → pause
    → [jeda menirukan] → seek(startMs - pad) → play → …
```

- Berulang **tanpa batas** sampai dihentikan (sesuai permintaan). Penghitung pengulangan ditampilkan di chip.
- **Jeda menirukan** (Pengaturan → Playback): `0 / 1 / 2 / 3 detik`, default **1 detik**. Bisa juga "otomatis = 1× durasi potongan" (P2).
- Kecepatan putar (`playbackRate`) tetap berlaku.

### 4.3 Deteksi akhir potongan

- **Web:** pantau posisi dengan `requestAnimationFrame` saat mode aktif (event `timeupdate` ±250 ms terlalu kasar); jadwalkan `pause` tepat saat `currentTime ≥ endMs`.
- **Android (plugin audio native):** posisi dari event `currentTime`; bila frekuensinya kurang rapat, pakai timer berbasis sisa durasi `(endMs − posisi) / rate` lalu konfirmasi dengan `getCurrentTime()`. **Spike wajib** sebelum implementasi (task P15-1).
- Toleransi target: akhir potongan meleset ≤ 80 ms.

### 4.4 Interaksi dengan fitur lain

| Fitur | Saat ulang kata aktif |
|-------|------------------------|
| Repeat ayat (`useRepeatStore`) | **Ditangguhkan** — tidak menghitung siklus; lanjut lagi setelah ulang kata berhenti |
| Mode Murotal | Ditangguhkan — tidak pindah ayat/surat |
| Tombol ⏮/⏭ | Menghentikan ulang kata lalu berperilaku normal |
| Play/Pause | Jeda/lanjut siklus ulang kata (tidak menghentikan mode) |
| Ganti qari | Menghentikan ulang kata |
| Pindah ayat (ketuk kartu lain / auto follow) | Menghentikan ulang kata |
| Sorot kata | Tetap berjalan (pil hijau bergerak di dalam rentang) |
| Media Session (layar kunci) | Judul tetap ayat; Next/Prev = perilaku ⏮/⏭ |
| Offline | Bekerja bila audio ayat & data waktu surat tersedia (`docs/37` §5) |

### 4.5 Status (state)

State runtime baru — **tidak** dipersist (hilang saat pindah halaman):

```ts
interface WordLoopState {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  range: WordRange;          // kata yang dipilih
  clip: { startMs: number; endMs: number }; // sudah termasuk perluasan segmen
  cycles: number;            // jumlah pengulangan selesai
  phase: 'playing' | 'pausing'; // pausing = dalam jeda menirukan
}
```

Pemilik: store runtime baru `useWordLoopStore` **atau** slice di `useRepeatStore` (diputuskan di P15-2; `docs/15` §3 mewajibkan keputusan eksplisit untuk store baru).

Pengaturan baru (persist Dexie `settings`): `wordLoopGapMs: 0 | 1000 | 2000 | 3000` (default 1000).

---

## 5. Batasan

- Hanya 12 qari bertanda Sorot kata; Al-Juhaynee & Warsh tidak.
- Akurasi waktu data ±73 ms; kata yang sangat pendek (huruf/partikel) bisa terdengar terpotong — bantalan §4.1 membantu.
- Rentang tidak bisa melintasi ayat (audio per ayat adalah file terpisah).
- Ayat yang tidak punya segmen (mis. 10:1, 13:1) tidak mendukung ulang kata.

---

## 6. Analytics

| Event | Payload | Kapan |
|-------|---------|-------|
| `word_loop_started` | `{ surahId, ayahNumber, reciterId, wordCount }` | Ulang kata dimulai |
| `word_loop_stopped` | `{ cycles }` | Ulang kata dihentikan |

Tambahkan ke `docs/analytics.md` saat implementasi.

---

## 7. Kriteria Selesai

- Ketuk kata → kata itu terdengar berulang dengan jeda sesuai pengaturan; ketuk lagi → berhenti.
- Tekan lama + seret → rentang terpilih terdengar berulang; rentang yang memotong segmen gabungan diperluas dan terlihat.
- Gulir halaman di HP tidak memicu pemilihan rentang.
- Repeat ayat & Murotal tidak berjalan selama ulang kata, dan kembali normal setelahnya.
- Bekerja di web (Chrome, Safari iOS) dan APK Android; akhir potongan meleset ≤ 80 ms pada uji 20 kata acak.
- Keyboard & pembaca layar bisa memulai/menghentikan ulang kata.
- Qari tanpa data menampilkan pesan, tidak error.

---

## Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 2 November 2026 | Dokumen awal — spesifikasi ketuk kata & seret rentang |
