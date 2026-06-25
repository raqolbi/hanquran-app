# 27 — Spesifikasi Media Session API

**Tanggal:** 25 Juni 2026  
**Status:** 📋 Spesifikasi — belum diimplementasi  
**Versi target rilis:** `0.2.0`  
**Mengacu:** `docs/04-system-architecture.md` §7, `docs/15-state-management.md` §10, `docs/18-development-tasks.md` Phase 2b

---

## 1. Ringkasan

HanQuran akan mengintegrasikan **Media Session API** (`navigator.mediaSession`) agar pemutaran audio tilawah dikenali sebagai sesi media oleh sistem operasi — bukan sekadar tab browser.

**Manfaat bagi pengguna:**

- Metadata surat, ayat, dan qari tampil di lock screen / kontrol media OS (jika platform mendukung)
- Kontrol **Play** dan **Pause** dari lock screen tanpa membuka aplikasi
- Peluang lebih baik agar audio tetap berjalan saat layar terkunci atau aplikasi di background — **selama browser mengizinkan**

**Batasan eksplisit:** fitur ini **tidak menjamin** audio selalu berjalan di background di semua perangkat. Perilaku bergantung pada browser, OS, dan apakah PWA terpasang di layar utama.

---

## 2. Latar Belakang & Motivasi

| Konteks | Detail |
|---------|--------|
| Arsitektur audio saat ini | `AudioController` memegang satu `HTMLAudioElement`; state di `useAudioStore` |
| Metadata tersedia | `AudioTrack`: `surahId`, `ayahNumber`, `reciterId`, `url` |
| Metadata belum di OS | Belum ada integrasi `navigator.mediaSession` |
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
| Action handlers | `play`, `pause` — delegasi ke `AudioController` |
| Integrasi titik tunggal | Service `media-session.ts` dipanggil dari `AudioController` |
| Fallback graceful | No-op jika `navigator.mediaSession` tidak tersedia |
| Uji manual | Android Chrome + iOS Safari (tab & PWA terpasang) |

### Opsional (fase sama, P2)

| Item | Keterangan |
|------|------------|
| `previoustrack` | Navigasi ke ayat sebelumnya (Surah Detail / Focus Mode) |
| `nexttrack` | Navigasi ke ayat berikutnya |
| `seekbackward` / `seekforward` | Lompat ±10 detik (jika OS menampilkan tombol) |

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
| Versi target | **`0.2.0`** |
| Sprint disarankan | Setelah MVP `0.1.0` stabil; paralel dengan uji PWA mobile |

---

## 5. Arsitektur

### 5.1 Diagram alur

```text
UI (AudioPlayer / FocusModePlayer)
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
| `services/media-session.ts` | Set metadata, `playbackState`, daftarkan/hapus action handlers |
| `services/audio-controller.ts` | Panggil media session pada `play`, `pause`, `resume`, ganti trek, `ended`, `reset` |

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
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
}): void;
export function updateMediaSessionMetadata(input: MediaSessionMetadataInput): void;
export function setMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void;
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
| `previoustrack` (opsional) | Callback dari halaman aktif — navigasi ayat −1 |
| `nexttrack` (opsional) | Callback dari halaman aktif — navigasi ayat +1 |

Handler harus idempotent dan selaras dengan **single-tab leadership** (`AudioTabSync`): tab follower tidak menjadi sumber kebenaran playback.

### 5.6 Lifecycle

| Event `AudioController` | Aksi Media Session |
|-------------------------|-------------------|
| `play(track)` — trek baru | `updateMediaSessionMetadata` + `playbackState = 'playing'` |
| `resume()` | `playbackState = 'playing'` |
| `pause()` | `playbackState = 'paused'` |
| `reset()` / tidak ada trek | `clearMediaSession()` atau `playbackState = 'none'` |
| `ended` | Metadata tetap ayat terakhir; `playbackState = 'paused'` sampai ayat berikutnya atau repeat |

---

## 6. Dukungan Platform (perkiraan)

| Platform | Metadata lock screen | Play/Pause | Next/Prev | Catatan |
|----------|---------------------|------------|-----------|---------|
| Android Chrome | ✅ | ✅ | ⚠️ bervariasi | PWA terpasang disarankan |
| Android Firefox | ✅ | ✅ | ⚠️ | |
| iOS Safari 16+ | ⚠️ | ✅ | Terbatas | Uji wajib di perangkat nyata |
| iOS PWA (Add to Home) | ⚠️ lebih baik dari tab | ✅ | Terbatas | Disarankan untuk penghafal |
| Desktop Chrome/Edge | Kontrol media OS | ✅ | ✅ | Taskbar / media overlay |

**Keputusan QA:** checklist manual di `docs/18` Phase 2b wajib diisi sebelum tag `v0.2.0`.

---

## 7. Kriteria Penerimaan

1. Saat audio diputar, lock screen (atau kontrol media OS) menampilkan nama surat dan nomor ayat — di platform yang mendukung.
2. Nama qari tampil sebagai artis/subtitle.
3. Tombol Play/Pause di lock screen mengontrol pemutaran yang sama dengan UI aplikasi.
4. Mengganti ayat memperbarui metadata dalam ≤ 500 ms setelah trek baru dimulai.
5. Jika API tidak tersedia, aplikasi berperilaku sama seperti sekarang — tanpa error di konsol.
6. Unit test: mock `navigator.mediaSession`; verifikasi pemanggilan metadata dan handlers.
7. Tidak ada regresi pada `AudioTabSync` dan repeat otomatis.

---

## 8. Strategi Pengujian

### Unit (`tests/services/media-session.test.ts`)

- Mock `navigator.mediaSession`
- Metadata ter-set dengan field benar
- Handler `play`/`pause` memanggil callback
- `isMediaSessionSupported()` false → semua export no-op

### Integrasi (`tests/services/audio-controller.test.ts`)

- Extend test existing: setelah `play()`, metadata ter-update (mock)

### Manual (wajib sebelum rilis 0.2.0)

| # | Skenario | Android | iOS tab | iOS PWA |
|---|----------|---------|---------|---------|
| 1 | Play ayat → lock screen tampil metadata | | | |
| 2 | Pause dari lock screen | | | |
| 3 | Resume dari lock screen | | | |
| 4 | Ganti ayat → metadata berubah | | | |
| 5 | Audio lanjut ±30 detik layar terkunci | | | |
| 6 | Dua tab — hanya leader merespons OS control | | | |

---

## 9. Dampak pada Dokumen & Kode

| Area | Perubahan |
|------|-----------|
| `services/media-session.ts` | **Baru** |
| `services/audio-controller.ts` | Integrasi lifecycle |
| `hooks/use-audio.ts` | Tidak wajib diubah (abstraksi controller) |
| `stores/audioStore.ts` | Tidak diubah |
| `package.json` | Versi → `0.2.0` saat rilis fitur |
| `RELEASE.md` | Entri `[0.2.0]` |
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
| `RELEASE.md` | Rencana 0.2.0 |

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 25 Juni 2026 | Dokumen awal — scope, arsitektur, kriteria penerimaan, rencana v0.2.0 |

---

Dokumen ini disimpan sebagai `docs/27-media-session-api-spec.md`.
