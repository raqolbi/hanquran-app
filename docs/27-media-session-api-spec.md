# 27 — Spesifikasi Media Session API

**Tanggal:** 25 Juni 2026  
**Status:** ✅ Diimplementasi — dirilis **`0.3.0`**
**Versi rilis:** `0.3.0` (Media Session termasuk dalam rilis gabungan)
**Mengacu:** `docs/04-system-architecture.md` §7, `docs/15-state-management.md` §10, `docs/18-development-tasks.md` Phase 2b

---

## 1. Ringkasan

HanQuran akan mengintegrasikan **Media Session API** (`navigator.mediaSession`) agar pemutaran audio tilawah dikenali sebagai sesi media oleh sistem operasi — bukan sekadar tab browser.

**Manfaat bagi pengguna:**

- Metadata surat, ayat, dan qari tampil di lock screen / kontrol media OS (jika platform mendukung)
- Kontrol **Play** dan **Pause** dari lock screen tanpa membuka aplikasi
- **Progress bar** pemutaran di notifikasi media OS — **jika browser menampilkannya** (lihat §6)
- Peluang lebih baik agar audio tetap berjalan saat layar terkunci atau aplikasi di background — **selama browser mengizinkan**

**Batasan eksplisit:** fitur ini **tidak menjamin** audio selalu berjalan di background di semua perangkat. Perilaku bergantung pada browser, OS, dan apakah PWA terpasang di layar utama.

---

## 2. Latar Belakang & Motivasi

| Konteks | Detail |
|---------|--------|
| Arsitektur audio saat ini | `AudioController` memegang satu `HTMLAudioElement`; state di `useAudioStore` |
| Metadata tersedia | `AudioTrack`: `surahId`, `ayahNumber`, `reciterId`, `url` |
| Metadata belum di OS | ~~Belum ada integrasi~~ → `services/media-session.ts` terintegrasi dengan `AudioController` |
| Use case utama | Penghafal mendengarkan sambil layar terkunci atau berpindah aplikasi |
| Risiko terdokumentasi | `docs/17-implementation-roadmap.md` §6 — cross-browser background playback |

Media Session API adalah standar web yang dirancang untuk kasus ini dan selaras dengan prinsip **Memorization First** + **Mobile First**.

---

## 3. Ruang Lingkup

### Termasuk ✅ (v0.2.0)

| Item | Keterangan |
|------|------------|
| Metadata | Judul: nama surat + nomor ayat; artis: nama qari; album: «HanQuran»; artwork: ikon PWA |
| `playbackState` | Sinkron `playing` / `paused` dengan `useAudioStore.isPlaying` |
| `setPositionState` | Sinkron `duration`, `position`, `playbackRate` dari `HTMLAudioElement` — untuk progress bar OS |
| Action handlers | `play`, `pause`, `seekto` — delegasi ke `AudioController` |
| Navigasi ayat (P2) | `previoustrack`, `nexttrack` — dari Surah Detail / Focus Mode |
| Integrasi titik tunggal | Service `media-session.ts` dipanggil dari `AudioController` |
| Fallback graceful | No-op jika `navigator.mediaSession` tidak tersedia |
| Uji manual | Android Chrome + Firefox + iOS Safari (tab & PWA terpasang) |

### Opsional (belum / terbatas platform)

| Item | Keterangan |
|------|------------|
| `seekbackward` / `seekforward` | Lompat ±10 detik — jika OS menampilkan tombol (belum diimplementasi) |

### Tidak termasuk ❌

| Item | Alasan |
|------|--------|
| Wake Lock API | Di luar scope; tidak diperlukan untuk MVP Media Session |
| Notifikasi persisten kustom | Media Session sudah memakai kontrol OS |
| Audio background saat tab ditutup sepenuhnya | Batasan platform; bukan Service Worker audio |
| Perubahan schema Dexie | Tidak ada data persisten baru |

---

## 4. Klasifikasi Prioritas

| Aspek | Nilai |
|-------|-------|
| Product Backlog | **PB-016** — Post-MVP / Growth (P1) |
| MVP blocker | **Tidak** — tidak memblokir rilis `0.1.0` |
| Versi target | **`0.3.0`** (Media Session termasuk rilis gabungan) |
| Sprint disarankan | Setelah MVP `0.1.0` stabil; paralel dengan uji PWA mobile |

---

## 5. Arsitektur

### 5.1 Diagram alur

```text
UI (AudioPlayer — Surah Detail & Focus Mode)
      │
      ▼
useAudio() ──► AudioController ──► HTMLAudioElement
      │                │
      │                ▼
      │         media-session.ts
      │                │
      ▼                ▼
useAudioStore    navigator.mediaSession
```

### 5.2 Modul baru

| File | Tanggung jawab |
|------|----------------|
| `services/media-session.ts` | Set metadata, `playbackState`, `setPositionState`, daftarkan action handlers |
| `services/audio-controller.ts` | Panggil media session pada lifecycle audio + `timeupdate` / `loadedmetadata` |

**Prinsip:** `media-session.ts` tidak memegang `HTMLAudioElement` dan tidak menulis langsung ke store — hanya menerima callback atau referensi controller.

### 5.3 API service (konsep)

```ts
interface MediaSessionMetadataInput {
  surahId: number;
  surahName: string;       // terlokalisasi (locale aktif)
  ayahNumber: number;
  reciterName: string;     // label tampilan qari
  artworkUrl?: string;     // default: /icons/icon-512.png
}

// Contoh surface publik
export function isMediaSessionSupported(): boolean;
export function bindMediaSession(handlers: {
  onPlay: () => void | Promise<void>;
  onPause: () => void;
  onSeekTo?: (seconds: number) => void;
}): void;
export function setMediaSessionTrackNavigation(handlers: {
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
}): () => void;
export function updateMediaSessionMetadata(input: MediaSessionMetadataInput): void;
export function setMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void;
export function setMediaSessionPositionState(state: {
  duration: number;
  position: number;
  playbackRate?: number;
}): void;
export function syncMediaSessionFromTrack(track: AudioTrack, state: 'playing' | 'paused' | 'none'): Promise<void>;
export function clearMediaSession(): void;
```

### 5.4 Pemetaan metadata

| Field Media Session | Sumber HanQuran | Contoh (ID) |
|-------------------|-----------------|-------------|
| `title` | `surahName` + ayat | `Al-Fatihah — Ayat 3` |
| `artist` | `reciterName` | `Mishary Rashid Alafasy` |
| `album` | Konstanta / i18n | `HanQuran` |
| `artwork[]` | `public/icons/icon-512.png` | Ikon PWA |

Nama surat di-resolve via `services/quran/` atau cache ringan; **bukan** hardcode di controller.

### 5.5 Action handlers

| Action | Perilaku |
|--------|----------|
| `play` | `AudioController.resume()` atau `play(currentTrack)` jika ada trek |
| `pause` | `AudioController.pause()` |
| `seekto` | `AudioController.seek(seekTime)` — geser dari progress bar notifikasi (jika OS mendukung) |
| `previoustrack` | Callback dari halaman aktif — navigasi ayat −1 |
| `nexttrack` | Callback dari halaman aktif — navigasi ayat +1 |

Handler harus idempotent dan selaras dengan **single-tab leadership** (`AudioTabSync`): tab follower tidak menjadi sumber kebenaran playback.

### 5.6 Lifecycle

| Event `AudioController` | Aksi Media Session |
|-------------------------|-------------------|
| `play(track)` — trek baru | `updateMediaSessionMetadata` + `playbackState = 'playing'` + `setPositionState` |
| `timeupdate` / `loadedmetadata` | `setPositionState` diperbarui dari `currentTime` / `duration` |
| `seek()` | `setPositionState` diperbarui |
| `resume()` | `playbackState = 'playing'` + `setPositionState` |
| `pause()` | `playbackState = 'paused'` + `setPositionState` |
| `reset()` / tidak ada trek | `clearMediaSession()` atau `playbackState = 'none'` |
| `ended` | Metadata tetap ayat terakhir; `playbackState = 'paused'`; posisi di-reset ke 0 |

---

## 6. Dukungan Platform

> **Catatan penting:** Media Session API **didukung secara tidak merata** antar browser. Memanggil `setPositionState` di kode **tidak menjamin** progress bar muncul di UI notifikasi — tampilan akhir ditentukan oleh integrasi browser ↔ OS. MDN mencatat `setPositionState` **bukan Baseline** (belum konsisten di semua browser utama).

### 6.1 Matriks fitur per platform

| Platform | Metadata | Play/Pause | Progress bar | Seek / scrub | Next/Prev ayat |
|----------|----------|------------|--------------|--------------|----------------|
| Android Chrome | ✅ | ✅ | ✅ | ⚠️ `seekto` bervariasi | ⚠️ bervariasi |
| Android Firefox | ✅ | ✅ | ❌ | ❌ | ❌ |
| iOS Safari 16+ | ⚠️ | ✅ | ⚠️ minimal | Terbatas | Terbatas |
| iOS PWA (Add to Home) | ⚠️ lebih baik dari tab | ✅ | ⚠️ | Terbatas | Terbatas |
| Desktop Chrome/Edge | Kontrol media OS | ✅ | ⚠️ bervariasi | ⚠️ | ⚠️ |
| Desktop Firefox | Kontrol media OS | ✅ | ⚠️ bervariasi | ⚠️ | ⚠️ |

**Rekomendasi pengguna:** untuk pengalaman lock screen lengkap (metadata + progress bar), gunakan **Chrome Android** atau **PWA terpasang via Chrome**.

### 6.2 Progress bar (`setPositionState`)

Progress bar di notifikasi media **bukan** bagian dari `MediaMetadata` (judul/artis). Browser memerlukan pemanggilan eksplisit:

```ts
navigator.mediaSession.setPositionState({
  duration: audio.duration,   // harus > 0 dan finite
  position: audio.currentTime,
  playbackRate: audio.playbackRate,
});
```

HanQuran memanggil ini dari `AudioController` pada `timeupdate`, `loadedmetadata`, `play`, `resume`, `pause`, dan `seek`.

**Syarat agar bar muncul (di browser yang mendukung UI-nya):**

1. `duration` audio sudah termuat (`loadedmetadata`) — bar tidak muncul saat `duration` masih `0` / `NaN`
2. `position` diperbarui berkala saat audio berjalan
3. Browser **meneruskan** position state ke UI notifikasi OS

### 6.3 Keterbatasan Firefox Android

Ini **bukan bug HanQuran** — keterbatasan integrasi Firefox dengan Media Session di Android.

| Temuan | Detail |
|--------|--------|
| Gejala | Hanya tombol **Play/Pause** di kontrol media; **tanpa progress bar**, tanpa seek, tanpa next/previous |
| API di sisi web | `setPositionState`, `seekto`, `previoustrack`, `nexttrack` **sudah dipanggil** dengan benar |
| Akar masalah | Firefox tidak meneruskan position state & action tambahan ke UI MediaSession Android |
| Referensi | [Mozilla Bug 1964027](https://bugzilla.mozilla.org/show_bug.cgi?id=1964027), [webcompat #154747](https://webcompat.com/issues/154747) |

**Implikasi QA:** jangan menjadikan progress bar Firefox Android sebagai kriteria gagal/lulus fitur. Verifikasi progress bar di **Chrome Android** sebagai referensi utama.

### 6.4 Perilaku yang diharapkan HanQuran vs platform

| Kondisi | Perilaku HanQuran | UI OS |
|---------|-------------------|-------|
| `navigator.mediaSession` tidak ada | No-op, audio UI normal | Tanpa kontrol media |
| API ada, `duration` belum valid | Metadata + Play/Pause; `setPositionState` ditunda | Bar mungkin belum muncul ±1 detik |
| Chrome Android, audio jalan | Semua sinkron | Metadata + bar + Play/Pause |
| Firefox Android, audio jalan | Semua sinkron di sisi web | Metadata + Play/Pause saja |

**Keputusan QA:** checklist manual di `docs/18` Phase 2b wajib diisi sebelum deploy production. Kolom Firefox dicatat sebagai **known limitation**, bukan regresi.

---

## 7. Kriteria Penerimaan

1. Saat audio diputar, lock screen (atau kontrol media OS) menampilkan nama surat dan nomor ayat — di platform yang mendukung.
2. Nama qari tampil sebagai artis/subtitle.
3. Tombol Play/Pause di lock screen mengontrol pemutaran yang sama dengan UI aplikasi.
4. Progress bar tampil dan bergerak di **Chrome Android** setelah `duration` valid; **Firefox Android dikecualikan** (§6.3).
5. Mengganti ayat memperbarui metadata dalam ≤ 500 ms setelah trek baru dimulai.
6. Geser progress bar di notifikasi (jika OS menawarkan) memanggil `seekto` dan mengubah posisi audio — di browser yang mendukung.
7. Jika API tidak tersedia, aplikasi berperilaku sama seperti sekarang — tanpa error di konsol.
8. Unit test: mock `navigator.mediaSession`; verifikasi metadata, position state, dan handlers.
9. Tidak ada regresi pada `AudioTabSync` dan repeat otomatis.

---

## 8. Strategi Pengujian

### Unit (`tests/services/media-session.test.ts`)

- Mock `navigator.mediaSession`
- Metadata ter-set dengan field benar
- `setPositionState` dipanggil dengan `duration` / `position` valid
- Handler `play` / `pause` / `seekto` memanggil callback
- `isMediaSessionSupported()` false → semua export no-op

### Integrasi (`tests/services/audio-controller.test.ts`)

- Extend test existing: setelah `play()`, metadata ter-update; `timeupdate` memperbarui position state

### Manual — ✅ Lulus (25 Juni 2026)

| # | Skenario | Chrome Android | Firefox Android | iOS tab | iOS PWA |
|---|----------|----------------|-----------------|---------|---------|
| 1 | Play ayat → lock screen tampil metadata | ✅ | ✅ | ✅ | ✅ |
| 2 | Pause dari lock screen | ✅ | ✅ | ✅ | ✅ |
| 3 | Resume dari lock screen | ✅ | ✅ | ✅ | ✅ |
| 4 | Ganti ayat → metadata berubah | ✅ | ✅ | ✅ | ✅ |
| 5 | Progress bar tampil & bergerak | ✅ | N/A (known limitation) | ✅ | ✅ |
| 6 | Geser bar notifikasi → posisi audio berubah | ✅ | N/A | — | — |
| 7 | Audio lanjut ±30 detik layar terkunci | ✅ | ✅ | ✅ | ✅ |
| 8 | Dua tab — hanya leader merespons OS control | ✅ | ✅ | ✅ | ✅ |

---

## 9. Dampak pada Dokumen & Kode

| Area | Perubahan |
|------|-----------|
| `services/media-session.ts` | ✅ Diimplementasi |
| `services/audio-controller.ts` | ✅ Integrasi lifecycle |
| `hooks/use-surah-repeat-playback.ts` | ✅ `setMediaSessionTrackNavigation` |
| `hooks/use-audio.ts` | Tidak wajib diubah (abstraksi controller) |
| `stores/audioStore.ts` | Tidak diubah |
| `package.json` | Versi → `0.3.0` |
| `RELEASE.md` | Entri `[0.3.0]` |
| Analytics | Tidak ada event baru (opsional: track di fase berikutnya) |

---

## 10. Dokumen Terkait

| Dokumen | Pembaruan |
|---------|-----------|
| `docs/27-media-session-api-spec.md` | Dokumen ini |
| `docs/02-product-backlog.md` | PB-016 |
| `docs/03-user-stories.md` | US-004b |
| `docs/04-system-architecture.md` | §7 Media Session |
| `docs/05-module-catalog.md` | §4.2 Audio Module |
| `docs/15-state-management.md` | §10.5 |
| `docs/16-folder-structure.md` | `media-session.ts` |
| `docs/17-implementation-roadmap.md` | Fase Growth |
| `docs/18-development-tasks.md` | Phase 2b |
| `docs/20-mvp-freeze.md` | §5.6 Growth |
| `RELEASE.md` | Riwayat `0.3.0` |

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 25 Juni 2026 | Dokumen awal — scope, arsitektur, kriteria penerimaan, rencana v0.2.0 |
| 25 Juni 2026 | Implementasi `setPositionState` + `seekto`; §6 diperluas — matriks platform, keterbatasan Firefox Android |
| 25 Juni 2026 | Sinkron checklist `docs/18` — implementasi kode selesai; uji manual §8 menunggu sebelum tag rilis |
| 25 Juni 2026 | Uji manual §8 **lulus** — semua skenario berhasil di perangkat fisik |

---

Dokumen ini disimpan sebagai `docs/27-media-session-api-spec.md`.
