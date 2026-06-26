# UI UX Wireframe

## HanQuran V1

---

# 1. Purpose

Dokumen ini mendefinisikan wireframe, struktur layar, hierarki informasi, dan prinsip interaksi untuk HanQuran V1.

Tujuannya:

- Menjaga UI tetap konsisten dengan vision dan arsitektur
- Menjadi acuan sebelum desain high-fidelity
- Membantu implementasi frontend lebih terarah
- Menjaga fitur hafalan tetap menjadi fokus utama

---

# 2. UX Principles

## Memorization First

UI harus membantu user secepat mungkin masuk ke aktivitas hafalan.

Target alur utama:

```text
Home
↓
Pilih surat
↓
Play / Repeat
↓
Fokus hafalan
```

---

## Simple by Default

User tidak boleh dipaksa memahami banyak kontrol sekaligus.

Prinsip:

- Tampilkan yang penting dulu
- Detail tambahan hanya muncul saat dibutuhkan
- Hindari layar yang terasa ramai

---

## Polished but Calm

V1 harus sudah terasa indah, tetapi bukan dekoratif berlebihan.

Karakter visual:

- Hangat
- Tenang
- Bersih
- Ramah anak
- Tetap layak untuk penghafal dewasa

---

## Mobile First

Karena penggunaan utama diperkirakan terjadi di HP, wireframe dimulai dari mobile lalu diperluas ke tablet/desktop.

---

# 3. Visual Direction

## Tone

HanQuran tidak boleh terasa seperti:

- Aplikasi utilitarian kaku
- Mainan anak-anak penuh distraksi
- Reader generik tanpa identitas

HanQuran harus terasa seperti:

- Teman hafalan yang lembut
- PWA modern yang ringan
- Produk islami yang bersih dan hormat terhadap konten Al-Qur'an

---

## Visual Foundation V1

Elemen visual yang disarankan:

- Latar terang hangat dengan gradient lembut
- Ornamen geometris islami yang sangat subtle
- Kartu dengan radius lembut
- Bayangan ringan
- Motion halus pada toggle, loading, dan state change

Elemen yang harus dihindari:

- Animasi besar di layar baca
- Ilustrasi yang mengganggu teks ayat
- Warna terlalu ramai
- 3D scene berat

---

## Suggested UI Tokens

### Color Mood

```text
Primary      : emerald / teal hangat
Accent       : gold lembut / sand
Surface      : off-white / warm mist
Text         : deep slate / near-black
Highlight    : soft green untuk kata aktif
Danger/Alert : muted red
```

### Typography Direction

- Arabic font harus dominan dan sangat terbaca
- Latin UI text harus modern dan tenang
- Heading tidak perlu berlebihan
- Spacing antar ayat harus lega

---

# 4. Information Architecture

- Favorites menggunakan state/filter UI, bukan route terpisah.
- Focus Mode dibuka dari ayat aktif yang sedang dipilih user.

## Primary Routes

```text
/
/surah/[id]
/surah/[id]?ayah=[n]
/focus/[surah]
/settings
```

---

## Main Navigation

V1 cukup memakai navigasi ringan:

- Home
- Settings

Elemen penting lain muncul di konteks layar:

- Continue reading
- Favorites filter
- Back to list
- Focus mode entry

---

# 5. Screen Inventory

| Screen | Purpose | Priority |
|--------|---------|----------|
| Home | Menemukan surat dan melanjutkan bacaan | P0 |
| Surah Detail | Membaca ayat, play audio, repeat, translation | P0 |
| Focus Mode | Hafalan bebas distraksi | P1 |
| Settings | Preference dan cache management | P1 |
| Empty / Error / Offline State | Menjaga UX saat data belum tersedia | P0 |

---

# 6. Home Wireframe

## Goals

- User cepat menemukan surat
- User bisa melanjutkan posisi terakhir
- User bisa melihat daftar surat tanpa kebingungan
- Favorit mudah diakses tanpa layar terpisah

---

## Mobile Wireframe

```text
┌──────────────────────────────────────┐
│ HanQuran                    ● Online │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Lanjutkan Bacaan Terakhir        │ │
│ │ Al-Ikhlas • Ayat 3               │ │
│ │                    [Lanjutkan]   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [ Cari Surat... ]                    │
│                                      │
│ [Semua] [Favorit]                    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Al-Fatihah                    ☆  │ │
│ │ Pembukaan • 7 ayat • Makkiyah    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Al-Baqarah                    ☆  │ │
│ │ Sapi Betina • 286 ayat          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Home                     Settings    │
└──────────────────────────────────────┘
```

---

## Desktop / Tablet Wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ HanQuran                                     Home    Settings    │
│                                                          ● Online │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────┐  ┌────────────────────────────┐ │
│ │ Lanjutkan Bacaan Terakhir    │  │ Cari Surat                │ │
│ │ Al-Ikhlas • Ayat 3           │  │ [______________________]  │ │
│ │                              │  │                           │ │
│ │              [Lanjutkan]     │  │ [Semua] [Favorit]         │ │
│ └──────────────────────────────┘  └────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Al-Fatihah                                7 ayat        ☆   │ │
│ │ Pembukaan • Makkiyah                                    │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Al-Baqarah                              286 ayat       ☆   │ │
│ │ Sapi Betina • Madaniyah                                 │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ ...                                                      │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Interaction Notes

- `Continue Reading` card hanya tampil jika data `lastRead` tersedia
- Tambahkan search field di Home di atas filter untuk menemukan surat cepat
- Filter `Favorit` mengganti isi list, bukan pindah halaman
- Filter Favorit menampilkan hanya surat yang ditandai favorit.
- Tidak perlu section favorit terpisah pada Home.
- Home harus tetap fokus pada Continue Reading, Search, dan Daftar Surat.
- Tombol favorit harus tetap mudah ditekan tanpa mengganggu aksi buka surat
- Surah card seluruhnya tappable
- Status Online/Offline pada header menunjukkan kondisi koneksi aplikasi.

---

# 7. Surah Detail Wireframe

## Goals

* Membaca ayat dengan nyaman
* Mengontrol audio tanpa bingung
* Masuk ke mode hafalan dengan cepat
* Translation dan transliterasi opsional — dikontrol dari Verse Display Controls
* Repeat inline di audio bar — tidak memenuhi layar, tidak ada kartu mengambang
* Mendukung penggunaan offline

---

## Verse Display Controls

Tiga kontrol tampilan ayat dalam **satu baris horizontal** langsung di bawah meta surat. Selalu terlihat — tidak di bottom sheet, overflow menu, atau Pengaturan.

```text
[✓ Terjemahan] [○ Transliterasi] [🎯 Fokus]
```

Spesifikasi lengkap: `docs/22-verse-display-controls.md`.

Urutan render ayat (jika semua ON): Arab → Transliterasi → Terjemahan.

---

## Mobile Wireframe

```text
┌──────────────────────────────────────┐
│ ← Daftar Surat                       │
│                                      │
│ Al-Ikhlas                        ☆   │
│ الْإِخْلَاص                          │
│ 4 ayat • Makkiyah                    │
│ ● Offline Ready                      │
│                                      │
│ [○ Terjemahan] [○ Transliterasi] [🎯 Fokus] │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ayat 1                           │ │
│ │ قُلْ هُوَ ٱللَّهُ أَحَدٌ          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ayat 2                           │ │
│ │ ٱللَّهُ ٱلصَّمَدُ                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ayat 3                           │ │
│ │ لَمْ يَلِدْ وَلَمْ يُولَدْ       │ │
│ └──────────────────────────────────┘ │
│                                      │
│══════════════════════════════════════│
│ ━━━━━━━━━●━━━━━━━━━━━               │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

### Notes

* Tap ayat untuk menjadikannya ayat aktif.
* Tombol **⏮ / ⏭** mengikuti aturan transport — lihat `docs/29-murotal-mode-spec.md` §7.2 (dalam surat saja, atau lintas surat jika Mode Murotal ON).
* Audio selalu dikontrol dari player bawah.
* Ayat aktif diberi highlight lembut.
* Audio bar sticky di bagian bawah layar.
* **Repeat inline** — `RepeatSelector` (`variant="inline"`) + badge progress **`x/y`** + tombol pengaturan (⚙) berada di **baris yang sama** dengan kontrol transport.
* Padding scroll ayat terakhir mengikuti tinggi chrome audio terukur (`useSurahDetailBottomInset`); tidak ada panel repeat mengambang.

---

## Mobile Wireframe - Repeat Belum Aktif

```text
┌──────────────────────────────────────┐
│══════════════════════════════════════│
│ ━━━━━━━━━●━━━━━━━━━━━               │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

## Repeat Status Variants

> **Catatan:** Fraksi progress **`x/y`** (`RepeatProgressBadge`) tampil di audio bar saat sesi repeat aktif. Kartu `RepeatStatus` penuh hanya di variant `panel` / preview dialog.

### Repeat Ayat Aktif

Saat repeat berjalan, badge **`[2/5]`** muncul di antara select jumlah dan tombol ⚙.

```text
┌──────────────────────────────────────┐
│══════════════════════════════════════│
│ ━━━━━━━━━●━━━━━━━━━━━               │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

---

### Repeat Range Ayat

Misal user memilih:

```text
Ayat 1 → Ayat 5
Repeat 5x
```

Tampilan player:

```text
┌──────────────────────────────────────┐
│══════════════════════════════════════│
│ ━━━━━━━━━●━━━━━━━━━━━               │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

---

### Repeat Surat

Misal user memilih seluruh surat:

```text
Surat Al-Ikhlas
Repeat 5x
```

Tampilan player:

```text
┌──────────────────────────────────────┐
│══════════════════════════════════════│
│ ━━━━━━━━━●━━━━━━━━━━━               │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

---

## Ayat Aktif Saat Sedang Diputar

Untuk menghindari kebingungan ayat mana yang sedang berjalan:

```text
┌──────────────────────────────────┐
│ Ayat 1                           │
│ قُلْ هُوَ ٱللَّهُ أَحَدٌ          │
└──────────────────────────────────┘

┌══════════════════════════════════┐
│ ▶ Ayat 2                         │
│ ٱللَّهُ ٱلصَّمَدُ                │
└══════════════════════════════════┘

┌──────────────────────────────────┐
│ Ayat 3                           │
│ لَمْ يَلِدْ وَلَمْ يُولَدْ       │
└──────────────────────────────────┘
```

---

## Word Highlight Saat Audio Berjalan

```text
قُلْ هُوَ [ٱللَّهُ] أَحَدٌ
```

atau

```text
قُلْ [هُوَ] ٱللَّهُ أَحَدٌ
```

sesuai timing audio.

---

## Repeat Range + Highlight

Contoh saat Range 1-5 aktif:

```text
Range Ayat 1-5
Siklus 2 / 5
Sedang di Ayat 3
```

dan di daftar ayat:

```text
Ayat 1 ✓
Ayat 2 ✓

▶ Ayat 3
لَمْ يَلِدْ وَلَمْ يُولَدْ

Ayat 4
Ayat 5
```

---

## Repeat Surat + Highlight

Contoh saat Surat Al-Ikhlas aktif:

```text
Surat Al-Ikhlas
Siklus 2 / 5
Sedang di Ayat 3 dari 4
```

dan daftar ayat:

```text
Ayat 1 ✓
Ayat 2 ✓

▶ Ayat 3
لَمْ يَلِدْ وَلَمْ يُولَدْ

Ayat 4
```

---

## Bottom Sheet - Pengaturan Repeat

```text
┌─────────────────────────────┐
│ Pengaturan Repeat           │
├─────────────────────────────┤
│ Repeat Count               │
│                             │
│ ○ 🐣 1x                     │
│ ● 🐥 5x                     │
│ ○ 🐤 10x                    │
│ ○ 🦜 25x                    │
│ ○ 🦅 50x                    │
│ ○ ♾️ Infinite               │
│                             │
│ Target                     │
│                             │
│ ● Ayat Aktif               │
│ ○ Range Ayat               │
│ ○ Surat Ini                │
│                             │
│ [ Terapkan ]               │
└─────────────────────────────┘
```

---

## Bottom Sheet - Repeat Range

```text
┌─────────────────────────────┐
│ Repeat Range                │
├─────────────────────────────┤
│ Dari Ayat   [ 1 ]           │
│ Sampai Ayat [ 5 ]           │
│                             │
│ [ Terapkan ]               │
└─────────────────────────────┘
```

---

## Mobile Wireframe - Translation ON

```text
┌──────────────────────────────────────┐
│ ← Daftar Surat                       │
│                                      │
│ Al-Ikhlas                        ☆   │
│ 4 ayat • Makkiyah                    │
│                                      │
│ [✓ Terjemahan] [✓ Transliterasi] [🎯 Fokus] │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ayat 1                           │ │
│ │ قُلْ هُوَ ٱللَّهُ أَحَدٌ          │ │
│ │ Qul huwallahu ahad               │ │
│ │                                  │ │
│ │ Katakanlah: Dialah Allah,        │ │
│ │ Yang Maha Esa.                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ayat 2                           │ │
│ │ ٱللَّهُ ٱلصَّمَدُ                │ │
│ │                                  │ │
│ │ Allah tempat meminta             │ │
│ │ segala sesuatu.                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│══════════════════════════════════════│
│ ⏮      ▶      ❚❚      ⏭            │
│                                      │
│ ━━━━━━━━━●━━━━━━━━━━━               │
│══════════════════════════════════════│
└──────────────────────────────────────┘
```

---

## Desktop / Tablet Wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ ← Daftar Surat                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Al-Ikhlas                                              ☆         │
│ الْإِخْلَاص                                                        │
│ 4 ayat • Makkiyah • ● Offline Ready                              │
│                                                                  │
│ [○ Terjemahan] [○ Transliterasi] [🎯 Fokus]                     │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Ayat 1                                                     │ │
│ │ قُلْ هُوَ ٱللَّهُ أَحَدٌ                                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Ayat 2                                                     │ │
│ │ ٱللَّهُ ٱلصَّمَدُ                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ ━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━                            │
│                                                                  │
│ [🐥 5x ▼][⚙]              ⏮   ▶/⏸   ⏭                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Desktop / Tablet - Translation ON

```text
┌──────────────────────────────────────────────────────────────────┐
│ ← Daftar Surat                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Al-Ikhlas                                              ☆         │
│ 4 ayat • Makkiyah                                                │
│                                                                  │
│ [✓ Terjemahan] [○ Transliterasi] [🎯 Fokus]                     │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Ayat 1                                                     │ │
│ │ قُلْ هُوَ ٱللَّهُ أَحَدٌ                                   │ │
│ │                                                            │ │
│ │ Katakanlah: Dialah Allah, Yang Maha Esa.                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Ayat 2                                                     │ │
│ │ ٱللَّهُ ٱلصَّمَدُ                                           │ │
│ │                                                            │ │
│ │ Allah tempat meminta segala sesuatu.                       │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ ⏮        ▶        ❚❚        ⏭                                  │
│                                                                  │
│ ━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Desktop / Tablet — Target Repeat Dialog

```text
┌───────────────────────────────┐
│ Target Repeat                 │
├───────────────────────────────┤
│ ● Ayat Aktif                  │
│ ○ Range Ayat                  │
│ ○ Surat Ini                   │
└───────────────────────────────┘
```

## Desktop / Tablet — Repeat Range Dialog
```text
┌───────────────────────────────┐
│ Repeat Range                  │
├───────────────────────────────┤
│ Dari Ayat : [   1   ]         │
│ Sampai    : [   5   ]         │
│                               │
│            [ Terapkan ]       │
└───────────────────────────────┘
```

Notes:
- Desktop menggunakan status variant repeat yang sama dengan Mobile.

---

## Interaction Notes

* Audio bar sticky di bawah pada mobile.
* Tap ayat untuk menjadikannya ayat aktif.
* Ayat aktif memiliki highlight lembut.
* Verse Display Controls selalu terlihat di bawah header surat (satu baris horizontal).
* Toggle Terjemahan dan Transliterasi mengubah preferensi global (`settings`) — bukan per-surat.
* Mode Fokus mempertahankan state Terjemahan dan Transliterasi; hanya mengubah layout baca.
* Urutan render ayat: Arab → Transliterasi → Terjemahan (konsisten di Surah Detail dan Focus Mode).
* Repeat default menggunakan target "Ayat Aktif".
* Tap Repeat Selector membuka Bottom Sheet Pengaturan Repeat.
* Target repeat lanjutan tersedia melalui bottom sheet pengaturan repeat.
* Repeat status hanya muncul saat repeat sedang aktif.
* Offline status harus terlihat jelas tetapi tidak mengganggu fokus membaca.
* Saat target adalah Ayat Aktif, playback berhenti setelah jumlah repeat selesai.
* Saat target adalah Range Ayat atau Surat Ini, playback berjalan otomatis sampai satu siklus selesai sebelum mengurangi counter repeat.
* Offline Ready menunjukkan surat dan audio sudah tersedia untuk penggunaan tanpa koneksi internet.

---

# 8. Focus Mode Wireframe

## Goals

- Membantu hafalan tanpa distraksi
- Menonjolkan ayat aktif
- Memudahkan repeat terus-menerus
- Memberi rasa tenang dan fokus
- **Mempertahankan** preferensi Terjemahan dan Transliterasi dari sesi Surah Detail

## Prinsip Konten

> Mode Fokus mengubah cara ayat disajikan, bukan konten apa yang ditampilkan.

Urutan render (jika semua aktif): Arab → Transliterasi → Terjemahan. Lihat `docs/22-verse-display-controls.md` (Bagian 4).

---

## Mobile Wireframe

```text
┌──────────────────────────────────────┐
│ Keluar                    Ayat 1 / 4 │
│                                      │
│                                      │
│         قُلْ هُوَ ٱللَّهُ أَحَدٌ      │
│                                      │
│      Highlight kata aktif            │
│                                      │
│                                      │
│ ───────────●───────────             │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
└──────────────────────────────────────┘
```

> **Navigasi ayat:** `⏮` / `⏭` berada di baris kontrol audio (`AudioPlayer`), **bukan** tombol teks terpisah — layout **identik** dengan Surah Detail (`docs/12-component-spec.md` §11).

### Repeat Range Ayat

```text
┌──────────────────────────────────────┐
│ Keluar                    Ayat 1 / 4 │
│                                      │
│                                      │
│         قُلْ هُوَ ٱللَّهُ أَحَدٌ      │
│                                      │
│      Highlight kata aktif            │
│                                      │
│                                      │
│ ───────────●───────────             │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
└──────────────────────────────────────┘
```

### Repeat Surat

```text
┌──────────────────────────────────────┐
│ Keluar                    Ayat 1 / 4 │
│                                      │
│                                      │
│         قُلْ هُوَ ٱللَّهُ أَحَدٌ      │
│                                      │
│      Highlight kata aktif            │
│                                      │
│                                      │
│ ───────────●───────────             │
│                                      │
│ [🐥 5x ▼][2/5][⚙]     ⏮   ▶/⏸   ⏭      │
└──────────────────────────────────────┘
```

---

## Desktop / Tablet Wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ Keluar Focus                                      Ayat 1 / 4     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                  قُلْ هُوَ ٱللَّهُ أَحَدٌ                         │
│                                                                  │
│                  Highlight kata aktif                            │
│                                                                  │
│                                                                  │
│                ━━━━━━━━━●━━━━━━━━━                               │
│                                                                  │
│        [🐥 5x ▼][⚙]              ⏮   ▶/⏸   ⏭                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Repeat Range Ayat

```text
┌──────────────────────────────────────────────────────────────────┐
│ Keluar Focus                                      Ayat 3 / 5     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                  لَمْ يَلِدْ وَلَمْ يُولَدْ                      │
│                                                                  │
│                  Highlight kata aktif                            │
│                                                                  │
│                                                                  │
│                ━━━━━━━━━●━━━━━━━━━                               │
│                                                                  │
│        [🐥 5x ▼][⚙]              ⏮   ▶/⏸   ⏭                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Repeat Surat

```text
┌──────────────────────────────────────────────────────────────────┐
│ Keluar Focus                                      Ayat 3 / 4     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                  لَمْ يَلِدْ وَلَمْ يُولَدْ                      │
│                                                                  │
│                  Highlight kata aktif                            │
│                                                                  │
│                                                                  │
│                ━━━━━━━━━●━━━━━━━━━                               │
│                                                                  │
│        [🐥 5x ▼][⚙]              ⏮   ▶/⏸   ⏭                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Interaction Notes

- Hilangkan header/footer normal
- Background lebih tenang dibanding halaman biasa
- Tidak ada elemen dekoratif yang bergerak aktif di layar ini
- Tombol keluar focus mode harus selalu mudah ditemukan
- Focus Mode memakai **`AudioPlayer` + `RepeatSelector` inline** — layout chrome bawah identik dengan Surah Detail.
- Tidak ada teks hint sinkronisasi repeat; state repeat dibagi via `useRepeatStore`.
- **Landscape HP (`short-landscape`):** header surat lebih ringkas, chrome atas tidak sticky; `RepeatSettingsDialog` memakai Drawer (bukan Dialog) agar konten dapat di-scroll.

---

# 9. Settings Wireframe

## Goals

- Pengaturan simpel
- Tidak terlalu teknis
- Mendukung aksesibilitas dasar
- Membantu user memahami status cache dan offline

---

## Mobile Wireframe

```text
┌──────────────────────────────────────┐
│ ← Kembali            Pengaturan      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Bahasa Aplikasi                  │ │
│ │ [Bahasa Indonesia] [English]     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ukuran Teks Arab                 │ │
│ │ [Kecil] [Sedang] [Besar]         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Reciter                          │ │
│ │ [Misyari Alafasy ▼]              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Playback                         │ │
│ │ Auto Follow Playback  [On/Off]   │ │
│ │ Otomatis menggulir layar agar    │ │
│ │ ayat yang sedang diputar tetap   │ │
│ │ terlihat.                        │ │
│ │                                  │ │
│ │ Mode Murotal          [On/Off]   │ │
│ │ Putar tilawah berkelanjutan.     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Kontras Tinggi                   │ │
│ │ [On / Off]                       │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Offline & Cache                  │ │
│ │ Status: Online                   │ │
│ │ Audio tersimpan: 24 MB           │ │
│ │ Data Quran     : Cached          │ │
│ │                                  │ │
│ │ Auto Download Audio   [Off]      │ │
│ │ Simpan otomatis audio ayat yang  │ │
│ │ Anda putar agar bisa didengar    │ │
│ │ offline nanti.                   │ │
│ │                                  │ │
│ │ [Bersihkan Cache]                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Tentang HanQuran            →    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Desktop/Tablet Wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ ← Kembali                                      Pengaturan        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────┐   ┌─────────────────────┐               │
│ │ Bahasa Aplikasi     │   │ Ukuran Teks Arab    │               │
│ │ ID / EN             │   │ Kecil Sedang Besar  │               │
│ └─────────────────────┘   └─────────────────────┘               │
│                                                                  │
│ ┌─────────────────────┐   ┌─────────────────────┐               │
│ │ Reciter             │   │ Playback            │               │
│ │ Misyari Alafasy ▼   │   │ Auto Follow [ON/OFF]│               │
│ │                     │   │ Mode Murotal [OFF]  │               │
│ └─────────────────────┘   └─────────────────────┘               │
│                                                                  │
│ ┌─────────────────────┐   ┌─────────────────────┐               │
│ │ Kontras Tinggi      │   │                     │               │
│ │      ON / OFF       │   │                     │               │
│ └─────────────────────┘   └─────────────────────┘               │
│                                                                  │
│ ┌─────────────────────┐   ┌─────────────────────┐               │
│ │ Offline & Cache     │   │                     │               │
│ │ Audio: 24 MB        │   │                     │               │
│ │ Auto Download [OFF] │   │                     │               │
│ │ [ Bersihkan Cache ] │   │ Tentang HanQuran →  │               │
│ └─────────────────────┘   └─────────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Layar Tentang HanQuran (`/settings/about`)

```text
┌──────────────────────────────────────┐
│ ← Kembali      Tentang HanQuran      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ HanQuran                         │ │
│ │ Versi 0.3.0 (dari package.json)  │ │
│ │ Deskripsi singkat aplikasi…      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Tentang HanQuran                 │ │
│ │ Tujuan, filosofi, fokus…         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Credits                          │ │
│ │ Data · Audio · Teknologi         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Repository & Lisensi             │ │
│ │ GitHub · HCCL                    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Spesifikasi lengkap: `docs/26-about-screen-spec.md`.

---

## Interaction Notes

- Semua setting harus langsung terasa hasilnya
- `Clear cache` perlu konfirmasi
- Bahasa setting harus ramah non-teknis
- Label UI mengikuti `settings.appLocale` (`id` | `en`) via `next-intl` — lihat `docs/21-i18n-and-locale.md`
- **Playback:** toggle Auto Follow Playback & Mode Murotal — `docs/28-playback-settings.md`, `docs/29-murotal-mode-spec.md`

---

# 10. States and Feedback

## Loading State

Gunakan skeleton atau placeholder lembut.

Contoh:

- List surat loading
- Ayat loading
- Audio loading

Prinsip:

- Tidak membuat layout melompat
- Tidak terlalu ramai

---

## Empty State

### Favorites Empty

```text
Belum ada surat favorit.
Tandai surat yang sering dihafal agar lebih cepat dibuka.
```

### Last Read Empty

```text
Belum ada bacaan terakhir.
Mulai dari surat favoritmu.
```

---

## Error State

Contoh pesan:

- `Tidak dapat memuat daftar surat.`
- `Ayat belum tersedia.`
- `Audio tidak dapat diputar saat ini.`

Error state harus menyediakan aksi yang jelas:

- `Coba lagi`
- `Kembali`

---

## Offline State

Indikator offline sebaiknya:

- Ringkas
- Terlihat
- Tidak panik

Contoh:

```text
Offline • Menampilkan data tersimpan
```

---

# 11. Component States & Design Tokens

Dokumen ini melengkapi wireframe agar implementasi visual lebih konsisten dan mengurangi interpretasi saat desain maupun development.

---

## Color Tokens

### Primary

```text
HanQuran Emerald
#0F766E
```

Digunakan untuk:

* Tombol utama
* Link aktif
* Player aktif
* Ayat aktif
* Repeat aktif

---

### Secondary

```text
Emerald Bright
#10B981
```

Digunakan untuk:

* Hover
* Progress
* Highlight ringan
* Active state

---

### Accent

```text
Guidance Gold
#FBBF24
```

Digunakan untuk:

* Favorite
* Status penting
* Cahaya / guidance indicator

---

### Surface

```text
Background
#FAFAF8

Card
#FFFFFF

Border
#E5E7EB
```

---

### Text

```text
Primary
#111827

Secondary
#6B7280

Disabled
#9CA3AF
```

---

## Typography

### Arabic Text

```text
Weight: Regular
Line Height: Long
Alignment: Center
```

Karakteristik:

* Dominan
* Sangat mudah dibaca
* Menjadi fokus utama layar

---

### UI Text

```text
Font:
Plus Jakarta Sans

Weights:
400
500
600
700
```

---

## Ayat Card States

### Default

```text
Background : White
Border     : Gray-200
Radius     : 16px
```

```text
┌──────────────────────┐
│ Ayat 1               │
│ قُلْ هُوَ ٱللَّهُ أَحَدٌ │
└──────────────────────┘
```

---

### Active Playing

```text
Background : Emerald-50
Border     : Emerald-500
```

```text
┌══════════════════════┐
│ ▶ Ayat 2            │
│ ٱللَّهُ ٱلصَّمَدُ    │
└══════════════════════┘
```

User harus langsung tahu ayat mana yang sedang diputar.

---

### Completed (Range / Surat)

```text
Background : Emerald-50
Border     : Transparent
Text       : Emerald
```

```text
✓ Ayat 1
✓ Ayat 2
▶ Ayat 3
Ayat 4
Ayat 5
```

---

## Word Highlight State

Saat audio berjalan:

```text
قُلْ هُوَ [ٱللَّهُ] أَحَدٌ
```

Style:

```text
Background : #D1FAE5
Text       : #065F46
Radius     : 8px
```

Prinsip:

* Lembut
* Tidak menyilaukan
* Tidak mengganggu fokus membaca

---

## Favorite Button

### Inactive

```text
☆
Color: Gray-400
```

### Active

```text
★
Color: #FBBF24
```

---

## Translation Toggle

> **Digantikan:** Kontrol Terjemahan dan Transliterasi kini bagian dari **Verse Display Controls** di bawah header surat. Lihat `docs/22-verse-display-controls.md`.

### OFF

```text
○ Terjemahan
```

### ON

```text
✓ Terjemahan
```

Warna:

```text
ON  : Emerald
OFF : Gray
```

---

## Repeat Selector

### Default

```text
[ 🐥 5x ▼ ]
```

Style:

```text
Height : 40px
Radius : 999px
```

---

### Active

```text
Background : Emerald
Text       : White
```

```text
[ 🐥 5x ▼ ]
```

---

## Audio Player

### Container

```text
Background : White
Border Top : Gray-200
Shadow     : Soft
Min Height : ~112px (progress + baris transport + repeat inline)
```

Player harus selalu sticky pada mobile (`fixed bottom`).

### Layout

```text
Baris 1 : Progress bar (full width)
Baris 2 : [RepeatSelector inline][x/y][⚙]  ···  ⏮  ▶/⏸  ⏭
```

`RepeatSelector` tidak lagi berupa kartu mengambang di sisi kanan.

---

### Progress Bar

```text
Track    : Gray-200
Progress : Emerald
Thumb    : Emerald
```

---

## Offline Badge

### Ready

```text
● Offline Ready
```

Style:

```text
Text : Emerald
```

---

### Downloading

```text
⬇ Mengunduh Audio...
```

Style:

```text
Text : Amber
```

---

### Failed

```text
⚠ Audio Belum Tersedia Offline
```

Style:

```text
Text : Red
```

---

## Motion Guidelines

Durasi:

```text
150ms - 250ms
```

Gunakan untuk:

* Toggle
* Repeat selector
* Bottom sheet
* Ayat aktif berpindah

Hindari:

* Bounce
* Parallax
* Animasi besar

---

## Border Radius

```text
Card      : 16px
Button    : 12px
Chip      : 999px
Dialog    : 20px
BottomSheet : 24px
```

---

## Shadow

Gunakan shadow ringan:

```text
0 4px 12px rgba(0,0,0,0.05)
```

Tujuan:

* Memberi depth
* Tetap terasa tenang
* Tidak seperti aplikasi game

---

# 12. Responsive Behavior

## Mobile

- Layout satu kolom
- Audio bar sticky bottom
- Tap target minimal 44x44 px
- Spacing cukup lega untuk anak dan orang tua

---

## Tablet

- Masih dominan satu kolom untuk konten ayat
- Kartu dan control bisa lebih lebar
- Fokus tetap pada keterbacaan

---

## Desktop

- Header lebih lengkap
- Lebar konten ayat tetap dibatasi agar nyaman dibaca
- Jangan buat teks ayat terlalu melebar

---

# 13. Key Component Notes

## Continue Reading Card

Harus terasa sebagai CTA utama sekunder di home.

Isi minimal:

- Nama surat
- Nomor ayat
- Tombol `Lanjutkan`

---

## Repeat Selector

Harus:

- Mudah dipahami anak
- Tetap jelas untuk user dewasa
- Tidak terasa seperti game berlebihan

Label utama bisa memakai ikon + angka.

---

## Ayat Card

Harus memuat:

- Nomor ayat
- Teks Arab
- Translation opsional

Interaksi:

- Tap ayat untuk menjadikannya ayat aktif
- Audio diputar melalui player global

Saat aktif:

- Highlight lembut
- Bukan warna keras yang melelahkan mata

---

# 14. Accessibility Notes

- Kontras teks harus memenuhi WCAG AA untuk teks UI
- Arabic font tetap jelas di ukuran besar
- Kontrol utama harus punya label yang jelas
- Ikon repeat tidak boleh menjadi satu-satunya penanda arti
- Focus state keyboard tetap terlihat di tablet/desktop

---

# 15. Suggested Design Handoff Order

1. Home
2. Surah Detail
3. Focus Mode
4. Settings
5. State variants: loading, error, empty, offline

Urutan ini mengikuti prioritas implementasi V1.

---

# 16. Next Step After Wireframe

Setelah dokumen ini, tahap berikutnya idealnya:

1. Menentukan visual tokens final
2. Membuat high-fidelity mockup mobile
3. Membuat design state untuk audio, repeat, dan highlight
4. Menyiapkan komponen UI dasar untuk implementasi frontend
