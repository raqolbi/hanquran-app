# HanQuran

### Open Source Quran Memorization Platform

---

# Vision

> Menjadi platform open source terbaik untuk membantu umat Islam menghafal, murojaah, dan berinteraksi dengan Al-Qur'an secara sederhana, indah, dan dapat diakses oleh semua kalangan.

---

# Mission

- Mempermudah proses hafalan Al-Qur'an.
- Menyediakan pengalaman murojaah yang efektif.
- Membuat pembelajaran Al-Qur'an lebih menarik untuk anak-anak.
- Menyediakan aplikasi yang dapat digunakan secara offline.
- Mengembangkan ekosistem Al-Qur'an berbasis komunitas dan open source.

---

# Product Positioning

**HanQuran bukan sekadar Quran Reader.**

HanQuran adalah:

> **Open Source Quran Memorization Platform**

Fokus utama:

- Hafalan (Tahfidz)
- Murojaah
- Repeat Learning
- Audio Guided Learning

Fokus sekunder:

- Membaca Al-Qur'an
- Terjemahan ayat (dataset, terpisah dari bahasa UI)
- Tadabbur

---

## Multilingual Application UI

Antarmuka aplikasi (menu, label, dialog, pengaturan) mendukung:

- **Bahasa Indonesia** (`id`)
- **English** (`en`)

Framework: **`next-intl`**. Detail: `docs/21-i18n-and-locale.md`.

Teks Arab Al-Qur'an, transliterasi, audio, dan dataset Quran **tidak** mengikuti pengaturan bahasa UI.

---

# Core Philosophy

## Simplicity First

Pengguna tidak perlu:

- Registrasi
- Login
- Konfigurasi rumit

Cukup:

```text
Buka aplikasi
↓
Pilih surat
↓
Tekan Repeat
↓
Mulai menghafal
```

---

## Memorization First

Semua keputusan produk dievaluasi berdasarkan pertanyaan:

> "Apakah fitur ini membantu pengguna menghafal Al-Qur'an lebih baik?"

Jika tidak, fitur tersebut bukan prioritas.

---

## Offline First

Al-Qur'an harus tetap dapat dipelajari meskipun:

- Internet lambat
- Tidak ada sinyal
- Sedang bepergian

---

## Open by Design

Seluruh kode sumber tersedia untuk komunitas.

Tujuan:

- Transparan
- Mudah dikembangkan
- Mudah diaudit
- Dapat digunakan oleh pesantren, sekolah, komunitas, dan individu

---

# Target Users

### Anak-anak

Belajar hafalan dengan visual yang menarik.

### Orang Tua

Mendampingi hafalan anak.

### Penghafal Al-Qur'an

Murojaah dan penguatan hafalan.

### Komunitas Pendidikan Islam

- TPQ
- Madrasah
- Pesantren
- Rumah Tahfidz

---

# Key Differentiators

## Word-by-Word Audio Highlight

Setiap kata yang sedang dibaca akan ditandai secara real-time.

Membantu:

- Mengikuti bacaan
- Menghafal lebih cepat
- Memahami struktur ayat

---

## Smart Repeat

Repeat dibuat sangat sederhana dan ramah anak.

Contoh:

```text
🐣 1x
🐥 5x
🐤 10x
🦜 25x
🦅 50x
♾️ Infinite
```

---

## Focus Mode

Layar bebas distraksi.

Hanya menampilkan:

- Ayat
- Audio
- Repeat
- Indikator progress hafalan minimal

---

## Murojaah Mode

Visi jangka panjang untuk playlist hafalan otomatis berdasarkan surat atau juz.

Status:

```text
Bukan scope inti V1
```

---

## Offline Memorization

Audio dan data surat dapat disimpan untuk penggunaan tanpa internet.

---

# Technology Direction

Frontend:

- Next.js
- TypeScript
- TailwindCSS

PWA:

- Service Worker
- Workbox

Storage:

- IndexedDB
- Dexie

Data Source:

- Dataset statis `public/data/*`

Deployment:

- Self-hosted
- Vercel
- Cloudflare

---

# Open Source Principles

Lisensi yang cocok:

- MIT License (paling fleksibel)
- Apache License 2.0 (lebih kuat untuk kontribusi komunitas)

Untuk proyek komunitas seperti HanQuran, saya cenderung memilih **Apache 2.0**, karena tetap permisif tetapi memberikan perlindungan paten yang lebih baik jika suatu saat proyek berkembang besar.

---

# Long-Term Vision

HanQuran diharapkan berkembang menjadi:

```text
HanQuran Reader
        ↓
HanQuran Memorization
        ↓
HanQuran Murojaah
        ↓
HanQuran Family
        ↓
HanQuran Community
```

Sehingga tidak hanya menjadi aplikasi membaca Al-Qur'an, tetapi sebuah platform open source yang membantu perjalanan menghafal Al-Qur'an dari anak-anak hingga dewasa.
