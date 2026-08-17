# 32 — Platform Android dengan CapacitorJS

**Tanggal:** 31 Juli 2026  
**Status:** 📋 Audit kelayakan & spesifikasi kebutuhan (belum diimplementasi)  
**Versi aplikasi yang diaudit:** `0.5.0` (package.json) / PWA Next.js  
**Mengacu:** `docs/04-system-architecture.md`, `docs/20-mvp-freeze.md`, `docs/23-static-dataset-architecture.md`, `docs/30-offline-behavior-spec.md`, `docs/27-media-session-api-spec.md`, `docs/25-deployment-vercel.md`

---

## 1. Ringkasan Eksekutif

| Pertanyaan | Jawaban |
|------------|---------|
| Apakah HanQuran **bisa** di-build sebagai APK Android via CapacitorJS? | **Ya — memungkinkan**, dengan perubahan build & penyesuaian platform |
| Apakah **semua** fitur saat ini cocok tanpa perubahan? | **Tidak** — sebagian besar cocok; beberapa perlu adaptasi atau plugin native |
| Apakah ini menggantikan PWA? | **Tidak** — Capacitor adalah **saluran distribusi tambahan**; PWA/web tetap jalur utama |
| Apakah build PWA & Android dipisah? | **Ya, dua pipeline build** — dari **satu repo / satu codebase** (bukan dua repo) |
| Bagaimana tetap “up to date”? | Setiap merge ke `main` → Vercel update PWA otomatis; Android ikut **sumber yang sama**, dirilis ke Play Store lewat cadensi rilis (bukan tiap commit ke production) |
| Rekomendasi | **Layak dilanjutkan** sebagai fase Growth, setelah pipeline **static export** Next.js stabil |

HanQuran sudah selaras dengan prinsip yang mendukung Capacitor:

- **Offline First** + dataset statis `public/data/*` (~5,7 MB)
- **Mobile First** + UI hampir seluruhnya `'use client'`
- **Tanpa backend / tanpa akun**
- Audio berbasis **HTML5 Audio** + Cache Storage
- Persistensi pengguna via **Dexie (IndexedDB)**

Hambatan utama bukan “fitur bisnis tidak cocok”, melainkan **cara Next.js saat ini di-build** (server Next + Service Worker origin web), yang harus diselaraskan agar aset bisa dibundle ke WebView Android.

---

## 2. Tujuan Dokumen

Dokumen ini menetapkan:

1. Hasil audit kelayakan CapacitorJS untuk APK Android
2. Matriks kecocokan fitur HanQuran terhadap WebView Capacitor
3. Solusi hambatan plug-and-play dengan **zero regression PWA** (§3.4)
4. Kebutuhan teknis, produk, dan operasional sebelum implementasi
5. Pendekatan arsitektur & dual pipeline (§6 / §6.5)
6. Task development berurutan (§13) — juga diringkas di `docs/18` Phase 9

Dokumen ini **bukan** izin mengubah scope MVP Freeze (`docs/20`) tanpa Change Control. Platform Android native/APK adalah **perluasan distribusi**, bukan pengganti kriteria MVP PWA.

---

## 3. Kondisi Saat Ini (Baseline)

### 3.1 Stack

| Lapisan | Teknologi saat ini |
|---------|-------------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TailwindCSS 4, Motion |
| State | Zustand |
| Persistensi pengguna | Dexie → IndexedDB |
| Konten Quran | Dataset statis `public/data/*` |
| Audio | `HTMLAudioElement` + CDN `everyayah.com` |
| Offline shell | Service Worker kustom (`public/sw.js`) + Cache Storage |
| Deploy | Vercel (`docs/25`) — **bukan** `output: 'export'` |
| Distribusi mobile | PWA (manifest, install banner, splash) |
| Capacitor / proyek `android/` | **Belum ada** |

### 3.2 Fitur produk yang diaudit

| Modul | Fitur |
|-------|--------|
| Quran | Daftar 114 surat, detail surat, terjemahan, transliterasi, favorit, pencarian |
| Audio | Putar per ayat, kecepatan, prefetch, Auto Download Audio |
| Hafalan | Repeat, Mode Fokus, Mode Murotal, Auto Follow |
| Resume | Last read / Lanjutkan Hafalan |
| Offline | Precache dataset + Simpan Offline audio per surat |
| Sistem | i18n UI (`id`/`en`), Settings, About, Media Session, PWA install |
| Observabilitas | Vercel Analytics (production web) |

### 3.3 Karakteristik yang mendukung Capacitor

```text
✅ Hampir semua halaman adalah Client Component
✅ Tidak ada middleware Next.js
✅ Tidak ada autentikasi / API server milik sendiri
✅ images.unoptimized = true (sudah siap static-friendly)
✅ Dataset Quran kecil (~5,7 MB) — layak di-bundle dalam APK
✅ Safe-area CSS sudah dipakai (notch / gesture bar)
✅ Dexie + Cache Storage + HTML Audio berjalan di Chromium WebView modern
```

### 3.4 Karakteristik yang menghambat “plug-and-play”

Hambatan di bawah **bukan alasan menolak Capacitor**. Semuanya bisa diselesaikan dengan **profil build Android terpisah** + **adapter tipis**, tanpa mengubah perilaku PWA di Vercel.

| # | Hambatan | Solusi (PWA tetap seperti sekarang) |
|---|----------|-------------------------------------|
| A | `next.config.mjs` memakai `headers()` — tidak ada di static export | Branch config lewat env `HANQURAN_TARGET`. Vercel **tidak** set env ini → `headers()` + build PWA **identik**. Hanya `build:android` yang set `HANQURAN_TARGET=android` → `output: 'export'` dan **tanpa** `headers()`. |
| B | Belum ada `generateStaticParams` untuk `/surah/[id]` & `/focus/[id]` | Tambah `generateStaticParams` (id `1..114`). Ini **additive** untuk App Router: di Vercel tidak mengubah UX runtime; wajib agar static export Android menghasilkan halaman per surat. |
| C | Offline mengandalkan Service Worker + origin HTTPS web | **Web:** SW tetap seperti sekarang (`registerServiceWorker` production). **Android:** shell + dataset sudah di dalam APK (`webDir`); di native, SW boleh di-skip atau hanya dipakai untuk cache audio — lewat guard `isNativePlatform()`. Tidak mengubah alur PWA. |
| D | `next/font/google` (Geist) | `next/font` mengunduh font **saat build** lalu self-host di bundle. Web: biarkan. Android: font ikut ter-embed di `out/` setelah `build:android` (pastikan CI/dev punya jaringan saat build). Tidak perlu ganti font di PWA. |
| E | `@vercel/analytics` tidak relevan di APK | Guard render: tampilkan Analytics hanya jika **bukan** native / bukan target android. Di Vercel production tanpa env android → Analytics **tetap jalan**. |
| F | Media Session & background audio di WebView ≠ Chrome PWA | **Web:** biarkan implementasi `media-session.ts` apa adanya. **Android:** terima batasan dulu (best effort); task terpisah untuk plugin/foreground service. Tidak ada regresi PWA. |
| G | Banner install PWA tidak relevan di APK | `InstallBanner` return `null` jika `isNativePlatform()`. Di browser/PWA → perilaku **sama**. |

#### Aturan emas: zero regression PWA

```text
1. Default build (tanpa HANQURAN_TARGET) === perilaku hari ini (Vercel/PWA)
2. Semua cabang native hanya aktif jika:
     - process.env.HANQURAN_TARGET === 'android' (build-time), ATAU
     - Capacitor.isNativePlatform() (runtime di WebView)
3. Jangan mengubah spek offline web (docs/30) demi Android
4. Jangan mematikan SW di production web
5. Uji regressi: setelah tiap PR Android, smoke PWA di preview Vercel tetap hijau
```

#### Pola kode yang aman

```text
lib/platform.ts          ← isNativeAndroid(), isWebPwa()  (baru, tipis)
next.config.mjs          ← branch HANYA jika HANQURAN_TARGET=android
app/layout.tsx           ← Analytics: if (!isAndroidBuild) …
lib/register-service-worker.ts  ← early-return jika native (opsional)
components/.../install-banner.tsx ← hidden jika native
scripts/build-android.*  ← set env + export + cap sync (baru)
android/                 ← artefak Capacitor (baru; tidak dibaca Vercel)
```

Detail operasional dual pipeline: §6.5. Task implementasi: §13.

---

## 4. Verdict Kelayakan

### 4.1 Keputusan audit

> **MEMUNGKINKAN** menambahkan platform Android dengan CapacitorJS, dengan syarat pipeline build digeser ke **static web assets** yang di-serve oleh Capacitor WebView, plus penyesuaian offline/audio native-aware.

### 4.2 Skor kecocokan (ringkas)

| Area | Skor | Keterangan |
|------|------|------------|
| Baca Quran + dataset lokal | Tinggi | Cocok sekali |
| Settings / favorit / last read (Dexie) | Tinggi | Cocok |
| Repeat / Focus / Murotal (logika) | Tinggi | Cocok |
| Unduh & putar audio CDN | Sedang–Tinggi | Perlu config jaringan + uji WebView |
| Offline shell via Service Worker | Sedang | Perlu desain ulang / dual strategy |
| Lock screen / background audio | Sedang–Rendah | Butuh plugin atau mitigasi eksplisit |
| Analytics Vercel / deploy Next server | Rendah (non-blocker) | Nonaktifkan atau ganti di native |
| Build Next → APK tanpa refactor | Rendah | **Wajib** static export atau strategi setara |

### 4.3 Alternatif yang dievaluasi

| Opsi | Ringkas | Rekomendasi |
|------|---------|-------------|
| **A. Capacitor + static export Next** | Bundle `out/` ke Android WebView | **Dipilih** |
| B. Capacitor load URL remote (Vercel) | APK tipis, butuh jaringan untuk shell | Ditolak untuk Offline First |
| C. TWA / Trusted Web Activity | Bungkus PWA dari Play Store | Alternatif ringan; kurang kontrol native |
| D. Rewrite React Native / Flutter | Native penuh | Overkill vs value V1; ditunda |
| E. Tetap PWA saja | Sudah ada | Tetap dipertahankan parallel |

---

## 5. Matriks Kompatibilitas Fitur

Legenda:

- ✅ Cocok / bekerja dengan sedikit atau tanpa ubah
- ⚠️ Cocok dengan syarat / adaptasi
- ❌ Tidak cocok tanpa solusi pengganti
- ➖ Tidak relevan di APK

| Fitur | Status | Catatan untuk Capacitor Android |
|-------|--------|----------------------------------|
| Daftar & detail 114 surat | ✅ | Bundle `public/data/*` ke assets |
| Terjemahan `id` / `en` | ✅ | Sudah di dataset statis |
| Transliterasi & Verse Display Controls | ✅ | Murni client |
| Favorit surat | ✅ | Dexie di WebView |
| Lanjutkan Hafalan / last read | ✅ | Dexie |
| Mode Fokus | ✅ | Client routing; butuh static paths |
| Repeat (ayat / range / surat) | ✅ | Logika JS; BroadcastChannel lintas-tab ➖ di native (satu WebView) |
| Mode Murotal | ✅ | Sama seperti web; tergantung audio tersedia |
| Auto Follow Playback | ✅ | Scroll/DOM — uji gesture & keyboard inset |
| Audio per ayat (HTML5) | ⚠️ | Izinkan HTTPS ke CDN; uji autoplay policy WebView |
| Prefetch ayat berikutnya | ⚠️ | Sama; pastikan CORS/CDN tetap OK dari WebView |
| Simpan Offline audio | ⚠️ | Cache Storage di WebView; pantau kuota & clear data OS |
| Auto Download Audio | ⚠️ | Sama seperti Simpan Offline |
| Precache dataset via SW install | ⚠️ | SW didukung di Android WebView modern **jika** origin aman (`https://localhost` Capacitor); tetap uji cold start offline |
| Cold start offline penuh (shell + baca) | ⚠️ | Ideal: aset app sudah di APK → kurang bergantung SW untuk shell; SW tetap untuk audio cache |
| Media Session (lock screen) | ⚠️ | Sering **lebih lemah** di WebView vs Chrome; fallback graceful sudah ada |
| Background audio (layar mati / app di belakang) | ⚠️→❌* | *Tanpa plugin/Foreground Service, OS dapat mematikan WebView audio* |
| PWA manifest / install banner | ➖ | Sembunyikan bila `Capacitor.isNativePlatform()` |
| Splash PWA web | ⚠️ | Ganti/dukung splash native Capacitor |
| Safe area / notch | ⚠️ | Sudah pakai `env(safe-area-*)`; sinkronkan StatusBar/edge-to-edge |
| i18n UI next-intl | ✅ | Bundle messages; tanpa server |
| Halaman Tentang | ✅ | Client |
| Vercel Analytics | ➖/⚠️ | Nonaktif di native; opsional ganti nanti |
| Deploy Vercel (web) | ✅ | Tetap untuk PWA; terpisah dari pipeline APK |
| Deep link / App Link | ⚠️ | Opsional fase 2 (`hanquran.app/surah/…`) |
| Push notification | ❌ | Belum ada di produk; jangan scope-kan sekarang |
| Kamera / mikrofon / login sosial | ➖ | Tidak dipakai V1 |

### 5.1 Prinsip Offline First di APK

Di web, Offline First = **SW precache shell + dataset**, audio via unduh eksplisit.

Di APK Capacitor, model yang disarankan:

| Lapisan | Sumber di Android |
|---------|-------------------|
| Shell aplikasi (HTML/JS/CSS) | **Bundle dalam APK** (Capacitor `webDir`) |
| Dataset Quran `public/data/*` | **Bundle dalam APK** (sama) |
| Preferensi pengguna | Dexie (IndexedDB WebView) |
| Audio tilawah | Cache Storage **atau** (fase lanjut) Filesystem Capacitor |
| Pembaruan konten/app | Rilis APK baru / partial update terkontrol |

Ini **lebih kuat** untuk cold start offline dibanding PWA (tidak menunggu install SW pertama), selama static export memasukkan seluruh dataset.

---

## 6. Pendekatan Arsitektur yang Disarankan

### 6.1 Diagram target

```text
┌─────────────────────────────────────────────────────────┐
│                 Sumber tunggal (repo)                    │
│         Next.js App + services/ + public/data            │
└────────────────────────────┬────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   next build (web/Vercel)        next build + output:'export'
   PWA + Service Worker           → folder out/ (static)
              │                             │
              ▼                             ▼
         Pengguna web                npx cap sync android
         / PWA install                      │
                                            ▼
                                   Android WebView (Capacitor)
                                   + plugin StatusBar / App / …
                                            │
                                            ▼
                                         APK / AAB
```

### 6.2 Keputusan build

| Keputusan | Pilihan |
|-----------|---------|
| Mode Capacitor | **Bundled static assets** (`webDir` = `out`) |
| Server remote di production APK | **Tidak** (bertentangan Offline First) |
| Static export Next | **Wajib** untuk jalur Android |
| Pertahankan PWA | **Ya** — dua target build dari satu codebase |
| Service Worker di native | **Opsional/adaptif** — jangan andalkan sebagai satu-satunya cara offline shell |

### 6.3 Perubahan Next.js yang diperlukan (kebutuhan)

Semua perubahan di bawah **harus memenuhi aturan emas §3.4** (PWA default tidak berubah).

1. **Profil static export hanya untuk Android**
   - `HANQURAN_TARGET=android` → `output: 'export'`
   - Tanpa env itu → config Vercel/PWA **seperti sekarang** (termasuk `headers()` untuk SW)
2. **`generateStaticParams`** untuk `/surah/[id]` dan `/focus/[id]` (id `1..114`) — aman untuk web + wajib untuk export
3. Pastikan tidak ada API Route / server-only feature yang memblokir export **pada profil android**
4. Font: biarkan `next/font`; verifikasi hasil `out/` berisi file font (bukan request runtime ke Google di perangkat offline)
5. Guard **Vercel Analytics** saat native / target android — web production tetap pakai Analytics
6. Sembunyikan **InstallBanner** hanya saat `isNativePlatform()`
7. Registrasi SW: web tetap; native skip atau mode audio-only — jangan ubah kondisi `NODE_ENV === 'production'` untuk web

### 6.4 Plugin Capacitor yang diperkirakan dibutuhkan

| Plugin | Prioritas | Alasan |
|--------|-----------|--------|
| `@capacitor/core` + `@capacitor/android` | P0 | Fondasi |
| `@capacitor/status-bar` | P0 | Warna status bar / contrast dengan theme `#0F766E` |
| `@capacitor/splash-screen` | P0 | Ganti/dukung splash PWA |
| `@capacitor/app` | P0 | Back button Android, state active/background |
| `@capacitor/network` | P1 | Selaras indikator offline yang sudah ada |
| `@capacitor/filesystem` + preferensi audio lokal | P2 | Jika Cache Storage WebView tidak cukup andal |
| Plugin audio background / foreground service | P1–P2 | Agar tilawah & murojaah tetap jalan saat layar mati |
| `@capacitor/browser` / App Links | P2 | Buka kredit/tautan eksternal dengan aman |

Overlay Gate Threads (`docs/34`) **tidak** menambah plugin ini di spek awal: origin `https://www.threads.com` keluar WebView lewat perilaku default Capacitor. Uji di APK; naikkan ke P1 hanya jika default gagal.

> Jangan menambah plugin “berjaga-jaga”. Setiap plugin harus punya use case dari matriks §5.

### 6.5 Strategi dual pipeline — PWA utama + Android tambahan

Model yang disarankan untuk keinginan produk:

> **PWA tetap jalur utama** (Vercel auto-deploy dari `main`).  
> **APK/AAB Android** adalah platform tambahan di Play Store.  
> **Satu repo** — perubahan fitur ditulis sekali; kedua platform memakai sumber yang sama.

#### Prinsip

| Prinsip | Makna |
|---------|--------|
| Satu sumber kebenaran | Kode UI/fitur di `app/`, `components/`, `services/`, `stores/`, `public/data/` — **tidak digandakan** ke repo Android terpisah |
| Dua artefak build | Pipeline **web** dan pipeline **android** terpisah, karena output & constraint-nya berbeda |
| Web = continuous | Push/merge ke `main` → Vercel build + deploy PWA (perilaku sekarang dipertahankan) |
| Android = release train | Kode di `main` selalu “siap di-sync”; **publikasi Play Store** mengikuti versi/tag, bukan setiap commit |
| Jangan load URL Vercel di APK production | APK membundle static assets agar Offline First tetap valid |

Ini **bukan** monorepo dua aplikasi. Ini **satu aplikasi, dua target build**.

#### Apa yang dipisah vs apa yang tidak

| Dipisah (per platform) | Tidak dipisah (bersama) |
|------------------------|-------------------------|
| Perintah build (`build` vs `build:android`) | Komponen, hooks, stores, services |
| Konfigurasi Next (SW/headers web vs `output: 'export'` Android) | Dataset `public/data/*`, branding, i18n messages |
| Deploy: Vercel vs Play Console / CI AAB | Aturan domain & spek fitur di `docs/` |
| Shell native (`android/`, plugin Capacitor) | Logika hafalan, audio controller, Dexie schema |
| Analytics Vercel (web only) | UI Bahasa Indonesia / label produk |

#### Alur rilis yang disarankan

```text
Developer push / merge ke main
        │
        ├──► [Otomatis] Vercel → PWA production/preview
        │         Pengguna web/PWA langsung dapat update
        │
        └──► [CI opsional] build:android + cap sync + assemble
                  │
                  ├── Artefak AAB disimpan (Internal Testing / sideload)
                  │     → tim QA bisa uji APK dari commit terbaru
                  │
                  └── Publikasi Play Store Production
                        HANYA saat tag vX.Y.Z / workflow manual
                        → review Google + update bertahap pengguna store
```

#### Harapan “up to date” yang realistis

| Platform | Kapan pengguna dapat perubahan dari `main`? |
|----------|-----------------------------------------------|
| Web / PWA | Hampir segera setelah deploy Vercel sukses |
| APK Play Store | Setelah rilis AAB baru **dan** pengguna meng-update aplikasi (atau auto-update Play) |

Jadi: **kodebase** selalu selaras; **distribusi** Android sengaja lebih lambat. Itu normal dan sehat untuk store.

Agar Android tidak “tertinggal jauh”:

1. **Internal / closed testing** di Play — CI bisa upload AAB dari `main` (atau nightly) tanpa mengganggu production
2. **Cadensi rilis production** tetap (mis. tiap sprint / tiap tag semver) — sama seperti versi web di `RELEASE.md`
3. **Checklist paritas** sebelum tag: uji PWA di Vercel preview + smoke APK dari artefak CI commit yang sama

#### Sketsa script (satu `package.json`)

```text
npm run build              → jalur Vercel / PWA (SW + next build seperti sekarang)
npm run build:android      → NEXT_PUBLIC_PLATFORM=android + static export → out/
npm run cap:sync           → npx cap sync android
npm run android:open       → npx cap open android
npm run android:bundle     → build:android && cap:sync && ./gradlew bundleRelease
```

`next.config` mem-branch lewat env (contoh: `process.env.HANQURAN_TARGET === 'android'` → `output: 'export'`, tanpa `headers()` yang hanya untuk server). Deploy Vercel **tidak** meng-set env itu → perilaku PWA tidak berubah.

#### Kebijakan CI (rekomendasi)

| Trigger | Web (Vercel) | Android |
|---------|--------------|---------|
| PR | Preview URL | Opsional: compile check `build:android` (tanpa upload store) |
| Merge `main` | **Production PWA otomatis** | Build AAB → Internal Testing (opsional otomatis) |
| Tag `v*` / manual release | Catatan rilis web | Upload AAB → Closed/Production track |

Jangan auto-promote ke **Production** Play di setiap push `main` — review store, versionCode, dan rollback lebih sulit daripada Vercel.

#### OTA (opsional, fase lanjut) — jangan jadi fondasi awal

Layanan seperti Capgo / Ionic Appflow bisa mendorong update lapisan web di dalam APK tanpa menunggu review Play (dengan batasan kebijakan Google).

- **Fase awal:** tidak perlu — cukup dual build + release train
- **Fase lanjut:** pertimbangkan hanya jika cadensi store terasa terlalu lambat untuk bugfix JS murni
- OTA **tidak** menggantikan rilis store untuk perubahan native (plugin, permission, versionCode)

#### Anti-pola yang dihindari

| Anti-pola | Mengapa ditolak |
|-----------|-----------------|
| Repo terpisah “hanquran-android” yang copy UI | Drift fitur; double maintenance |
| APK hanya WebView ke `hanquran.app` | Melanggar Offline First; cold start butuh jaringan |
| Satu perintah build untuk web+android tanpa branch config | Mudah merusak SW/Vercel atau gagal export |
| Harapkan APK production = commit `main` terakhir setiap hari | Tidak realistis di ekosistem Play Store |

#### Keputusan produk yang dikunci di sini

1. **PWA = primary** — tidak diganggu oleh pipeline Android  
2. **Android = secondary distribution** — Play Store  
3. **Pisah build, satu repo** — ya  
4. **Sinkronisasi** = merge ke `main` meng-update sumber bersama; PWA live otomatis; Android mengikuti lewat internal track + rilis ber-tag  

---

## 7. Kebutuhan untuk Menambahkan Platform Android

### 7.1 Kebutuhan lingkungan pengembang

| Kebutuhan | Keterangan |
|-----------|------------|
| Node.js + npm/pnpm | Sama seperti web |
| Android Studio (Ladybug+ disarankan) | SDK, emulator, build APK/AAB |
| JDK 17+ | Sesuai AGP Capacitor terkini |
| Android SDK + platform tools | API level sesuai Capacitor (cek docs versi yang dipilih) |
| Perangkat fisik Android | Wajib untuk uji audio background & Media Session |
| Akun Google Play Console | Hanya jika distribusi Play Store (bukan syarat prototype lokal) |

### 7.2 Kebutuhan repositori & konfigurasi

| Artefak | Keterangan |
|---------|------------|
| `capacitor.config.ts` | `appId`, `appName`, `webDir: 'out'` |
| Folder `android/` | Dihasilkan `cap add android` — commit atau generate di CI (putuskan satu kebijakan) |
| Script npm | `build:web`, `build:android`, `cap:sync`, `cap:open` |
| `AndroidManifest.xml` / Network Security | Izinkan HTTPS ke CDN audio; jangan enable cleartext sembarangan |
| Ikon & splash native | Dari `branding/logo.png` via `npm run cap:assets` (`@capacitor/assets`) |
| `.gitignore` | Sesuaikan `android/` local properties, keystore |

### 7.3 Kebutuhan identitas aplikasi

| Item | Contoh / catatan |
|------|------------------|
| Application ID | mis. `app.hanquran.android` (finalkan sebelum rilis store) |
| Nama tampilan | `HanQuran` |
| VersionName / VersionCode | Selaraskan dengan semver web (`0.5.0` → mapping eksplisit) |
| Signing key | Keystore rilis terpisah; **jangan** commit ke git |
| Privacy policy URL | Wajib jika Play Store (meski tanpa akun pengguna) |
| Data safety form | Jelaskan: data lokal on-device; audio dari CDN pihak ketiga |

### 7.4 Kebutuhan produk / UX native

| Item | Kebutuhan |
|------|-----------|
| Tombol Back sistem | Map ke navigasi in-app (jangan langsung kill saat di nested route) |
| Splash native | Konsisten dengan branding HanQuran |
| Install banner PWA | Hidden di native |
| Pesan offline | Tetap Bahasa Indonesia; bedakan “belum unduh audio” vs “tidak ada jaringan” |
| Izin runtime | Hindari izin sensitif; MVP tidak butuh mikrofon/kamera/lokasi |
| Edge-to-edge | Status bar + safe-area selaras design system |

### 7.5 Kebutuhan QA (wajib lulus sebelum rilis APK publik)

| # | Skenario | Diharapkan |
|---|----------|------------|
| 1 | Install APK, airplane mode, cold start | Beranda + buka surat mana pun: teks tampil |
| 2 | Online → Simpan Offline satu surat → airplane → putar | Audio dari cache |
| 3 | Airplane tanpa unduh audio | Baca OK; Play disabled + toast (sama spek web) |
| 4 | Mode Fokus + Repeat | Perilaku sama web |
| 5 | Mode Murotal lintas ayat/surat (audio ready) | Lanjut sesuai spek `docs/29` |
| 6 | App ke background / layar mati saat play | Audio **tetap jalan** di APK (adapter native §10.1); PWA mengikuti batasan browser |
| 7 | Rotasi / short-landscape | Layout tidak rusak (sudah ada pola web) |
| 8 | Ganti bahasa UI id↔en | Persist setelah kill process |
| 9 | Update APK | Dexie user data tidak hilang |
| 10 | Clear storage OS | Perilaku pulih seperti install baru (dataset dari APK tetap ada) |

### 7.6 Kebutuhan CI/CD (fase lanjut)

| Item | Keterangan |
|------|------------|
| Job build export | `.github/workflows/android-export.yml` — `npm run build:android` + test di PR/`main` |
| Job build AAB | `.github/workflows/android-aab.yml` — `npm run android:bundle`; signing via secret / `keystore.properties` |
| Artefak | AAB untuk Play; APK debug untuk sideload internal |
| Web pipeline | Tidak diganggu (Vercel tetap) |
| Versi | `package.json` → Android `versionName` / `versionCode` di `app/build.gradle` |
| Privasi store | `docs/33-play-store-privacy-and-data-safety.md` |

### 7.7 Kebutuhan legal & distribusi

| Item | Keterangan |
|------|------------|
| Lisensi HCCL | Pastikan distribusi APK selaras `LICENSE` / `COMMERCIAL-LICENSE.md` |
| Kredit qari & CDN | Tetap tampil di Tentang; CDN pihak ketiga tetap disebut |
| Play Store listing | Screenshot, deskripsi ID, kategori Education |
| Pembaruan konten Quran | Proses rilis APK jika dataset berubah (atau mekanisme update aset terpisah di fase nanti) |

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Static export merusak asumsi deploy Vercel | Regresi web | Dua profil build terpisah; uji PWA setelah perubahan config |
| SW + bundle APK bentrok (cache stale) | Bug offline sulit di-debug | Feature-detect native; nonaktifkan SW shell di Capacitor jika perlu |
| Background audio dimatikan OS | Hafalan sambil layar mati gagal | Plugin/foreground service; dokumentasikan batasan jika ditunda |
| Kuota Cache Storage WebView | Audio offline hilang | Monitor; evaluasi Filesystem API Capacitor |
| CDN everyayah.com down / diblokir | Streaming gagal | Spek offline tetap; pertimbangkan mirror di fase Growth |
| Ukuran APK membengkak | Download store lambat | Dataset ~6 MB + JS; pantau; jangan bundle seluruh audio ke APK |
| Duplikasi effort PWA vs Android | Biaya maintenance | Satu codebase; native hanya adapter tipis |
| Scope creep “harus terasa native” | Delay | Batasi V1 Android = **paritas fitur web**, bukan redesign UI |

---

## 9. Fase Implementasi yang Disarankan

### Fase 0 — Spike (1–3 hari)

- PoC: `output: 'export'` + `generateStaticParams` 114 surat
- `cap init` + `cap add android`
- Buka 1 surat + putar 1 ayat di emulator
- Catat: SW, Media Session, background audio

**Gate:** cold start offline baca surat berhasil dari APK.

### Fase 1 — Paritas baca & settings

- Bundle dataset penuh
- Dexie settings/favorit/last read
- Nonaktifkan PWA install UI di native
- StatusBar + Splash + back button

**Gate:** checklist QA #1, #8, #4 (tanpa audio offline).

### Fase 2 — Paritas audio & offline audio

- Network config CDN
- Simpan Offline + Auto Download di WebView
- Uji kuota & airplane mode

**Gate:** QA #2, #3, #5.

### Fase 3 — Audio latar & store-ready

- Solusi background playback
- Ikon/splash store, signing, privacy policy
- CI AAB (opsional)

**Gate:** QA #6, #9, #10 + uji perangkat fisik ≥2 vendor.

### Fase 4 — Polish (opsional)

- App Links
- Filesystem untuk audio
- Analytics native (jika dibutuhkan produk)

---

## 10. Kriteria Penerimaan Dokumen Ini (Definition of Ready)

Sebelum coding Capacitor dimulai, tim harus menyepakati:

1. **Application ID** final → `app.hanquran.android` (terpakai)
2. Apakah Android V1 **wajib** background audio, atau cukup “best effort” seperti batasan PWA → **wajib di APK via adapter native** (§10.1); PWA tidak berubah
3. Apakah folder `android/` di-commit ke git → ya (proyek Gradle di repo)
4. Apakah static export dipakai hanya untuk Android atau juga untuk web hosting alternatif → **hanya Android** (`HANQURAN_TARGET`)
5. Change Control terhadap `docs/20` jika Android APK dijadikan kriteria rilis resmi → belum; PWA tetap saluran utama

### 10.1 Keputusan & hasil uji A4 — Media Session / background audio

**Keputusan produk (diperbarui 1 Agustus 2026):**  
- **PWA / browser:** tetap spek `docs/27` (Web Media Session + batasan browser) — **tidak diubah**.  
- **APK Capacitor:** Media Session lock-screen + tilawah saat background/layar mati **wajib** lewat adapter native, diaktifkan hanya jika `isNativePlatform()`.

**Stack native (hanya APK):**
1. `@capgo/capacitor-native-audio` dengan `backgroundPlayback: true` + `showNotification: true` — MediaPlayer/ExoPlayer + FGS notifikasi media (wajib; tanpa FGS Android 14+ menghentikan audio / menolak start service).
2. Metadata & kontrol play/pause notifikasi lewat NativeAudio (bukan `@capgo/capacitor-media-session` saat play — start FGS MediaSession dari state background memicu crash `ForegroundServiceStartNotAllowedException`).
3. Cache offline: `resolveNativePlayablePath` menulis blob Cache Storage ke `Directory.Cache` lalu memutar `file://`.

**Temuan uji (SM-T225 / Android 14):**  
- WebView: `'mediaSession' in navigator === false`; `HTMLAudioElement` tidak mempertahankan progress di background.  
- Capgo MediaSession FGS: ditolak / crash jika `setMetadata` dipanggil saat app sudah non-foreground (`uidState: TPSL`).  
- NativeAudio + notifikasi FGS: jalur yang dipakai untuk tilawah latar.

**Kontrak zero-regression PWA (§3.4):** `AudioController` + `media-session.ts` tetap jalur Web di browser; cabang native hanya jika `isNativePlatform()`. Tidak ada perubahan perilaku Chrome/PWA.

| Skenario APK | Diharapkan |
|--------------|------------|
| Metadata + play/pause di notifikasi / kontrol media | Tampil saat tilawah aktif |
| Prev/next di notifikasi | Navigasi **ayat** (bukan ±15 detik) |
| Play di notifikasi setelah pause mid-track | Lanjut dari posisi pause |
| Ayat selesai tanpa advance berikutnya | Notifikasi **disembunyikan** (bukan Play yatim) |
| Kembali ke Beranda / tinggalkan surat|fokus | Sesi stop + notifikasi hilang |
| App ke background (HOME) saat play | Audio **tetap jalan** |
| Layar mati saat play | Audio **tetap jalan** |
| Satu ayat selesai (Repeat/Murotal) | Hanya **satu** advance — event `complete` di-debounce |
| Putar ulang ayat yang sama setelah selesai | Mulai dari awal (`restart`), bukan `resume` di akhir trek |
| Mode Murotal antar ayat (satu surat) + background | Lanjut ayat berikutnya via `playAyah` (tanpa reload) |
| Mode Murotal lintas surat | Intent di `sessionStorage` + hard nav; auto-play surat berikutnya |
| PWA production | Identik sebelum fitur ini |

**Catatan Murotal + background:** `backgroundPlayback` bersifat global pada NativeAudio (bukan flag khusus Murotal). Antar-ayat dalam surat tidak perlu navigasi — cocok di background. Lintas surat memakai hard `location.replace` di APK; tanpa persist intent, auto-play surat berikutnya hilang (diperbaiki lewat `sessionStorage` di `lib/murotal-pending-play.ts`).

**Bug Play notifikasi (diperbaiki):** upstream `dispatchComplete` mengosongkan `currentlyPlayingAssetId` → Play mid-session rawan no-op; patch `scripts/apply-native-audio-complete-patch.mjs` menjaga sesi PAUSED antar ayat. **Sesi benar-benar berhenti** (ayat terakhir tanpa advance, navigasi ke Beranda): `stopPlayback()` / `dismissOrphanNativeAudioSession` memanggil `NativeAudio.stop` agar notifikasi hilang — jangan sisakan tombol Play yatim. **Kontrol samping notifikasi:** patch mengganti ±15 detik menjadi prev/next ayat (`remotePrevious` / `remoteNext` → `setMediaSessionTrackNavigation`).

**Jeda antar ayat (bukan delay produk):** tidak ada `setTimeout` antar ayat. Jedanya dari reload native per ayat (`unload` → resolve path/cache → `preload` → `play`) demi andal ExoPlayer setelah `STATE_ENDED`.

**Skip notifikasi / seek ujung:** tombol samping tidak lagi seek ±15 dtk (hindari `complete` palsu di ayat pendek). Prev/next menekan `complete` residual ~800ms; seek scrubber ke ujung juga tidak memicu advance murotal/repeat.

**Keluar saat async lintas surat:** `cancelCrossSurahNavigation` membatalkan token + pending; Back/`history_back` dari halaman putar memanggil `stopPlaybackSession` agar tidak ada notifikasi yatim.

---

## 11. Dampak ke Dokumentasi Lain

| Dokumen | Dampak jika Capacitor diadopsi |
|---------|--------------------------------|
| `docs/04-system-architecture.md` | Tambah cabang distribusi Android WebView |
| `docs/16-folder-structure.md` | Tambah `android/`, `capacitor.config.ts`, script build |
| `docs/17-implementation-roadmap.md` | Fase Growth: platform Android |
| `docs/18-development-tasks.md` | Phase 9 + pointer ke §13 dokumen ini |
| `docs/25-deployment-vercel.md` | Tetap web; silang-tautan ke dokumen ini |
| `docs/30-offline-behavior-spec.md` | Perlu addendum perilaku native |
| `README.md` | Sebut APK sebagai saluran opsional setelah implementasi |
| `docs/32` §3.4 / §13 | Solusi hambatan plug-and-play + task development Android |

Dokumen ini (`docs/32`) adalah **sumber kebenaran** untuk kebutuhan Capacitor sampai digantikan spek implementasi yang lebih rinci.

---

## 12. Kesimpulan

1. **Memungkinkan** membangun APK Android HanQuran dengan CapacitorJS karena aplikasi sudah static-dataset, client-heavy, offline-oriented, dan tanpa backend.
2. **Fitur inti hafalan** (baca, repeat, fokus, murotal, settings, favorit, resume) **cocok** untuk WebView.
3. **Titik kritis** yang harus dikerjakan dulu: **static export Next.js**, **static paths 114 surat**, **strategi offline shell di APK**, dan **ekspektasi jujur untuk Media Session / background audio**.
4. Capacitor **bukan pengganti PWA**; ini saluran distribusi Play Store / sideload yang selaras prinsip Offline First *jika* aset di-bundle, bukan di-load dari URL remote.
5. Strategi operasional: **satu repo, dua pipeline** — Vercel continuous untuk PWA; Android release train (+ internal testing) dari commit yang sama (§6.5).
6. Mulai dari **Fase 0 spike** sebelum komitmen store — validasi background audio dan static export adalah gate teknis terbesar.
7. Hambatan “plug-and-play” (§3.4) diselesaikan lewat **profil build terpisah + guard native**, bukan dengan mengubah PWA.

---

## 13. Task Development — Penambahan Platform Android

**Sumber kebenaran task Android.** Ringkasan juga dicatat di `docs/18-development-tasks.md` Phase 9.

**Kontrak:** setiap task di bawah **tidak boleh** mengubah perilaku PWA/Vercel default. Uji regressi web disebut eksplisit di gate.

**Legenda:** `[NEW]` `[UPDATE]` `[TEST]` `[DOC]` — prioritas **P0** (blocker Android) · **P1** (paritas) · **P2** (store/polish)

### Phase A0 — Spike & fondasi (gate teknis)

- [x] [NEW] Helper platform `lib/platform.ts` (`isNativePlatform`, `isAndroidBuild`)
  - Tujuan: satu pintu deteksi native vs web
  - Ketergantungan: —
  - Prioritas: P0

- [x] [UPDATE] Branch `next.config.mjs` via `HANQURAN_TARGET`
  - Tujuan: default = PWA sekarang; `android` = `output: 'export'` tanpa `headers()`
  - File: `next.config.mjs`
  - Ketergantungan: —
  - Prioritas: P0
  - Gate regressi: `npm run build` (tanpa env) sukses; SW headers masih ada di config web

- [x] [NEW] Script `build:android` (+ opsional `scripts/build-android.mjs`)
  - Tujuan: `HANQURAN_TARGET=android` → generate precache jika perlu → export → folder `out/`
  - File: `package.json`, `scripts/`
  - Ketergantungan: branch next.config
  - Prioritas: P0

- [x] [NEW] `generateStaticParams` di `app/surah/[id]/page.tsx` dan `app/focus/[id]/page.tsx`
  - Tujuan: id `1..114` untuk static export
  - Ketergantungan: —
  - Prioritas: P0
  - Catatan: additive; tidak mengubah UX PWA

- [x] [TEST] Smoke: `build:android` menghasilkan `out/` yang bisa dibuka (file server lokal)
  - Tujuan: pastikan export tidak error (font, rute, asset)
  - Prioritas: P0

- [x] [NEW] Init Capacitor (`capacitor.config.ts`, `appId`, `webDir: 'out'`)
  - Tujuan: fondasi proyek native
  - Ketergantungan: `out/` berhasil
  - Prioritas: P0

- [x] [NEW] `npx cap add android` + kebijakan commit folder `android/`
  - Tujuan: proyek Gradle siap di repo atau didokumentasikan cara generate
  - Prioritas: P0

- [x] [TEST] Spike emulator: buka Beranda + 1 surat + putar 1 ayat
  - Tujuan: bukti jalur WebView hidup
  - Prioritas: P0
  - Catatan spike (perangkat `R9RRC06QRFT`): Capacitor WebView **tidak** resolve `/surah/1` → `surah/1.html`. Solusi: `toStaticExportHref` + hard-nav `NativeAwareLink` / `navigateApp` pada build Android. Capacitor **8.5.0**.

### Phase A1 — Isolasi PWA (zero regression)

- [x] [UPDATE] Guard Vercel Analytics di `app/layout.tsx`
  - Tujuan: Analytics hanya di web production
  - Prioritas: P0
  - Catatan: `enableVercelAnalytics = production && !isAndroidBuild()`; event custom juga di-guard lewat `isAnalyticsEnabled()`

- [x] [UPDATE] Sembunyikan `InstallBanner` / prompt PWA saat native
  - File: `components/shared/install-banner.tsx`, `hooks/use-install-prompt.ts`
  - Prioritas: P0
  - Catatan: `showBanner` mensyaratkan `!isNativePlatform()`

- [x] [UPDATE] Guard registrasi Service Worker di native
  - File: `lib/register-service-worker.ts`
  - Tujuan: PWA web tidak berubah; Android tidak double-cache shell
  - Prioritas: P0
  - Catatan: native → skip register + unregister registrasi yang ada

- [x] [TEST] Regressi PWA: preview/production build tanpa `HANQURAN_TARGET`
  - Checklist: SW register, install banner (browser), offline shell spek `docs/30`, Analytics production
  - Prioritas: P0
  - Hasil: `npm run build` (tanpa env android) sukses; `headers()` SW tetap di `next.config.mjs`; unit test guard A1 hijau

### Phase A2 — Paritas baca & settings di APK

- [x] [NEW] Plugin `@capacitor/status-bar` + tema `#0F766E`
  - Prioritas: P1
  - Catatan: `StatusBar` style DARK + `backgroundColor #0F766E`; verifikasi perangkat `getInfo().color === '#0F766E'`

- [x] [NEW] Plugin `@capacitor/splash-screen` selaras branding
  - Prioritas: P1
  - Catatan: splash dari `cap:assets` + `SplashScreen.hide()` setelah bootstrap; tema launch `#FAFAF8`

- [x] [NEW] Plugin `@capacitor/app` — tombol Back → navigasi in-app
  - Prioritas: P1
  - Catatan: `lib/android-back.ts` + `lib/native-shell.ts`; Back dari `/settings.html` → Beranda

- [x] [TEST] Cold start airplane mode: Beranda + buka surat mana pun (teks OK)
  - Prioritas: P0
  - Catatan: teks surat dari aset bundled (`/surah/114.html` menampilkan Arab); airplane via adb di perangkat uji tidak selalu memutus Wi‑Fi — teks tetap OK offline-first

- [x] [TEST] Settings, locale id/en, favorit, last read persist setelah kill process
  - Prioritas: P1
  - Catatan: Settings id/en tampil; favorit + Dexie `hanquran-db`; setelah force-stop ada «Lanjutkan»

- [x] [TEST] Mode Fokus + Repeat di emulator/perangkat
  - Prioritas: P1
  - Catatan: navigasi Surah → Fokus (`/focus/1.html`) OK di tablet; kontrol Repeat tetap di UI (komponen existing)

### Phase A3 — Audio & offline audio

- [x] [UPDATE] Network security / cleartext policy: izinkan HTTPS CDN `everyayah.com` saja
  - File: Android network config
  - Prioritas: P0
  - Catatan: `network_security_config.xml` + `usesCleartextTraffic=false`; domain `everyayah.com` HTTPS

- [x] [TEST] Stream audio online di WebView
  - Prioritas: P0
  - Catatan: tablet — Putar → Jeda + request `.mp3` CDN

- [x] [TEST] Simpan Offline satu surat → airplane → putar penuh
  - Prioritas: P0
  - Catatan: Al-Ikhlas (112) 4/4 cache; offline play via blob URL dari Cache Storage. Perbaikan: `serviceWorker.ready` hang di native → `getRegistrations()` + timeout; `resolvePlayableAudioUrl` untuk play tanpa SW

- [x] [TEST] Offline tanpa unduh: Play disabled + toast (paritas `docs/30`)
  - Prioritas: P0
  - Catatan: Al-Kawthar tanpa cache → toast «Audio tidak tersedia offline…»

- [x] [TEST] Mode Murotal + Auto Download (jika ON) di native
  - Prioritas: P1
  - Catatan: toggle Settings Murotal + Unduh otomatis OK di perangkat

- [ ] [NEW] Plugin `@capacitor/network` (opsional) selaras indikator offline
  - Prioritas: P2

### Phase A4 — Audio latar & Media Session (eksplisit terpisah)

- [x] [DOC] Catat hasil aktual Media Session + background audio di WebView (perangkat fisik)
  - Tujuan: ekspektasi produk jujur sebelum store
  - Prioritas: P1
  - Hasil baseline WebView + keputusan adapter native: **§10.1**

- [x] [NEW] Solusi background playback (plugin / foreground service) — **wajib APK, zero regression PWA**
  - Ketergantungan: keputusan §10.1
  - Prioritas: P1
  - File: `services/media-session.ts`, `services/native-media-session.ts`, `services/native-audio-player.ts`, `services/resolve-native-audio-path.ts`, `services/audio-controller.ts`
  - Implementasi: `@capgo/capacitor-media-session` + `@capgo/capacitor-native-audio` (`backgroundPlayback`) hanya via `isNativePlatform()`

- [x] [TEST] Layar mati / app background saat tilawah
  - Prioritas: P1
  - Gate: audio tetap jalan di APK setelah adapter; PWA `npm run build` tidak regres
  - Verifikasi SM-T225: NativeAudio `currentTime` lanjut setelah HOME hingga `complete`; MediaSession notifikasi aktif; tanpa crash FGS

### Phase A5 — Rilis Play Store & CI

- [x] [NEW] Ikon launcher + splash store dari `branding/` / `public/icons`
  - Prioritas: P1
  - Cara: `npm run cap:assets` (`scripts/prepare-capacitor-assets.mjs` + `@capacitor/assets`)
  - Sumber: `branding/logo.png` → `assets/` → `android/app/src/main/res/mipmap-*`

- [x] [NEW] Signing config (keystore di secret; tidak di git)
  - Prioritas: P0 untuk rilis publik
  - File: `android/app/build.gradle` (keystore.properties / env `HANQURAN_*`); `android/keystore.properties.example`; `.gitignore`

- [x] [NEW] Script `android:bundle` → AAB
  - Prioritas: P1
  - File: `scripts/build-android-bundle.mjs`, `npm run android:bundle`
  - `versionName` / `versionCode` dari `package.json` (mis. `0.5.0` → code `500`)

- [x] [NEW] CI: PR check `build:android` (tanpa upload store)
  - Tujuan: cegah regresi export tanpa mengganggu Vercel
  - Prioritas: P1
  - File: `.github/workflows/android-export.yml`

- [x] [NEW] CI: merge `main` / tag → artefak AAB Internal Testing (opsional)
  - Prioritas: P2
  - File: `.github/workflows/android-aab.yml` (`workflow_dispatch` + tag `v*`); upload Play tetap manual setelah secret keystore

- [x] [NEW] Workflow tag `v*` → artefak AAB (manual approval upload Play)
  - Prioritas: P2
  - Catatan: job menghasilkan artifact AAB; publish ke track Internal dilakukan di Play Console (atau langkah CI terpisah setelah service account siap)

- [x] [DOC] Privacy policy + Data safety Play Console
  - Prioritas: P0 untuk store
  - File: `docs/33-play-store-privacy-and-data-safety.md` (host URL produksi saat domain final)

- [x] [DOC] Update `README.md` + `docs/25` silang-tautan Android (PWA tetap utama)
  - Prioritas: P2

- [x] [UPDATE] `docs/30` addendum perilaku native (singkat)
  - Prioritas: P1
  - File: `docs/30-offline-behavior-spec.md` §10

### Urutan pengerjaan yang memudahkan

```text
A0 spike (config branch + export + cap add + 1 ayat)
    ↓
A1 isolasi PWA (guard analytics/SW/banner + regressi web)
    ↓
A2 baca/settings offline cold start
    ↓
A3 audio CDN + Simpan Offline
    ↓
A4 background audio (keputusan produk)
    ↓
A5 signing, CI, Play Console
```

Jangan mulai A5 store sebelum A1 regressi PWA hijau dan A3 offline audio lulus di perangkat fisik.

### Definition of Done — platform Android V1

- [ ] `npm run build` (PWA) perilaku & spek offline web tidak regres
- [ ] `npm run build:android` + APK/AAB installable
- [ ] Cold start offline: baca 114 surat dari aset bundle
- [ ] Minimal 1 surat audio offline siap putar
- [ ] Install banner tidak muncul di APK
- [ ] Back button & splash/status bar layak
- [x] Batasan Media Session / background terdokumentasi atau sudah dimitigasi sesuai keputusan produk

---

## 14. Riwayat

| Tanggal | Perubahan |
|---------|-----------|
| 31 Juli 2026 | Dokumen awal — audit kelayakan + kebutuhan platform Android CapacitorJS |
| 31 Juli 2026 | Tambah §6.5 strategi dual pipeline (PWA utama, Android tambahan, satu repo) |
| 31 Juli 2026 | §3.4 diperluas: solusi per hambatan + aturan zero regression PWA; tambah §13 task development |
