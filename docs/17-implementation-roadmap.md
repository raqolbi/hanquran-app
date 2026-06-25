# 17 — Implementation Roadmap HanQuran (ke MVP)

Dokumen ini menyusun langkah implementasi dari kondisi saat ini menuju MVP HanQuran. Ditulis dalam Bahasa Indonesia, fokus pada fitur hafalan, dan menyesuaikan dengan codebase saat ini (`hanquran-app`).

---

## 1. Ringkasan Kondisi Saat Ini
- Codebase utama ada di `hanquran-app/` (Next.js App Router).
- Komponen UI dan primitives sudah tersedia (`components/`, `components/ui/`).
- Data contoh surah ada di `lib/surahs-data.ts` — berguna untuk pengembangan awal.
- Fitur repeat, focus UI, dan player dasar telah diimplementasikan sebagai komponen (contoh: `RepeatSettingsDialog`, `FocusMode`, `AudioPlayer`).
- Branding dan dokumentasi internal lengkap (`docs/00..15`, `CLAUDE.md`).

Kesimpulan: proyek memiliki fondasi UI dan spesifikasi; butuh pekerjaan integrasi audio nyata, penyimpanan persistence, PWA/offline, quality testing, dan polishing UX untuk MVP.

---

## 2. Target MVP
MVP fokus pada pengalaman hafalan inti: pengguna dapat memilih surat, memutar audio, menggunakan fitur repeat, menyorot kata per kata (focus), dan menggunakan fungsi offline dasar.

Kriteria keberhasilan MVP (high-level):
- Pengguna dapat membuka surat, memutar audio per ayat, dan mengaktifkan repeat (1x/5x/∞) untuk ayat atau range.
- Focus Mode menyorot kata secara berurutan dan dapat diputar/dijeda.
- Audio dapat di-cache untuk pemakaian offline (download per-surah atau per-ayat minimal).
- Preferensi pengguna (qari, ukuran teks, show translation, favorites, repeat config) tersimpan.
- Aplikasi dapat dijalankan sebagai PWA pada perangkat mobile (installable, offline basic).

---

## 3. Ruang Lingkup MVP
Termasuk:
- Integrasi dataset statis `public/data/*` via `services/quran/` (Static Dataset Architecture)
- Setup **`next-intl`** untuk UI Bahasa Indonesia & English (`docs/21-i18n-and-locale.md`)
- Audio Playback (UI + controller)
- Repeat Engine (count, target, range)
- Word Highlight (Focus Mode)
- Offline caching (Cache Storage + manifest di Dexie `downloadManifest`)
- PWA setup (manifest + service worker)
- Persistensi via Dexie (`favorites`, `settings`, `lastRead`, `downloadManifest`)
- Unit & E2E tests untuk critical flows

Tidak termasuk (post-MVP):
- Multi-user server sync (account, cloud sync)
- Advanced analytics beyond basic usage
- Full content management backend
- **Media Session API** — lock screen metadata & kontrol OS (`docs/27`) — ✅ diimplementasi, rilis `0.3.0`

---

## 4. Fase Implementasi (distribusi waktu & prioritas)
Fase dibagi ke beberapa sprint/epics. Estimasi dan urutan disesuaikan dengan tim namun prioritaskan hafalan.

Fase 0 — Persiapan (1 sprint)
- Tujuan: persiapkan infra & pola arsitektur.
- Deliverables: stores skeleton (`zustand`), service worker skeleton, audio controller interface, Dexie setup (`services/db/db.ts`).
- Risiko: keputusan teknologi (library SW, schema Dexie v1).
- Kriteria selesai: skeleton tersedia, Dexie terinisialisasi, build passes.

Fase 1 — Audio Playback & Controller (1-2 sprint)
- Tujuan: implementasi playback stabil yang dapat dimainkan dari `SurahDetail` dan `FocusMode`.
- Deliverables: `AudioController` service, `useAudio` hook, integration with `AudioPlayer` UI, single-tab leadership using BroadcastChannel.
- Risiko: cross-browser audio autoplay restrictions; mitigating: user gesture start.
- Kriteria selesai: play/pause/seek/next/prev berfungsi reliably di desktop & mobile.

Fase 2 — Repeat Engine & UI (1 sprint)
- Tujuan: implementasi repeat logic sesuai spec (current_ayah, ayah_range, entire_surah) dan integrasi ke player.
- Deliverables: `repeatStore`, UI integration, `RepeatSettingsDialog` persistence.
- Risiko: edge cases pada transition antara ayat saat target range selesai; mitigating: comprehensive unit tests.
- Kriteria selesai: user dapat mengonfigurasi repeat dan engine menjalankan siklus sesuai konfigurasi.

Fase 3 — Word Highlight (Focus Mode) (1 sprint)
- Tujuan: menyempurnakan word-by-word highlighting, timing, dan kontrol play/pause.
- Deliverables: `FocusMode` polish, `AyahWordHighlight` accessibility, sync between audio and highlight (if audio present).
- Risiko: sinkronisasi audio vs highlight; mitigating: implement optional audio-sync later — MVP can use simulated timings per word as fallback.
- Kriteria selesai: highlight berjalan dan dapat di-pause/diteruskan; user dapat pindah ayat.

Fase 4 — Offline First & Caching (2 sprint)
- Tujuan: memungkinkan penggunaan tanpa koneksi internet untuk surat yang sudah diunduh.
- Deliverables: Service Worker (runtime caching), `download-manager` service, Cache Storage untuk audio, manifest di Dexie tabel `downloadManifest`.
- Risiko: Cache quota, cross-browser inconsistencies; mitigating: chunked downloads and size quotas, graceful fallback.
- Kriteria selesai: user dapat mengunduh minimal 1 surat dan memutarnya saat offline.

Fase 5 — PWA & Packaging (0.5 sprint)
- Tujuan: membuat aplikasi installable dan bekerja offline sebagian.
- Deliverables: web app manifest, icons, service worker registration, basic offline UI messages.
- Risiko: platform-specific require (iOS limited PWA features).
- Kriteria selesai: browser shows install prompt, app loads offline shell.

Fase 6 — Testing & QA (1 sprint parallel)
- Tujuan: memastikan stabilitas MVP.
- Deliverables: unit tests for audio/repeat logic, integration/E2E flows (playback, repeat, download), accessibility checks.
- Risiko: flaky tests for audio timing; use mocking for audio element in tests.
- Kriteria selesai: critical flows covered and passing tests.

Fase 7 — Release & Monitoring (0.5 sprint)
- Tujuan: rilis MVP, monitor crash/usage, collect feedback.
- Deliverables: release notes, rollout plan, basic analytics hook.
- Risiko: regressions in offline behavior; mitigate with staged rollout.
- Kriteria selesai: MVP released to target audience, no critical regressions.

---

## 5. Ketergantungan Antar Fitur
- Audio Playback (Fase1) adalah prasyarat untuk Repeat Engine (Fase2) dan Audio-Highlight sync (Fase3).
- Repeat Engine butuh AudioController dan Store (Audio + Repeat) untuk state.
- Offline First (Fase4) bergantung pada Download Manager & SW skeleton (Fase0).
- PWA (Fase5) dependent on Service Worker (Fase4) dan manifest assets.
- Testing (Fase6) harus mulai sejak Fase0 untuk testable architecture.

---

## 6. Risiko Teknis (utama)
- Cross-browser audio behavior (autoplay, background playback): mitigasi — require user gesture to start, test on major browsers; **Media Session API** (`docs/27`) — ✅ diimplementasi untuk lock screen (rilis `0.3.0`).
- Storage quota & Cache eviction: mitigasi — manifest + size limits, allow user to manage cache in Settings.
- Service Worker complexity & SW/client sync: mitigasi — clear messaging protocol and retries.
- Timing/sync between audio & highlight: mitigasi — support two modes: timed-simulated highlight (MVP) and later audio-synced mode.
- Build / dependency mismatches (Next.js 16+): mitigasi — pin dependencies and CI build check.

---

## 7. Strategi Pengujian
- Unit tests: repeat logic, store reducers, util functions.
- Integration tests: `AudioController` interactions with store and UI (mock audio element).
- E2E tests: critical flows (open surah, play audio, set repeat, download, offline play) via Playwright or Cypress.
- Accessibility: automated a11y scan (axe) and manual keyboard tests for focus mode.
- Performance: measure initial bundle and service worker caching impact.

Test cadence: setiap feature branch harus memiliki unit tests; CI runs lint, typecheck, unit tests, and E2E on release candidate.

---

## 8. Strategi Rilis
- Alpha internal: rilis ke test group dengan staged rollout.
- Beta: undang pengguna terbatas, tambahkan feedback capture.
- Production: roll out 100% jika kualitas stabil.

Rilis checklist:
- Lint & TypeScript pass
- Unit & Integration tests passing
- PWA & offline verified on target devices
- Release notes & rollback plan

---

## 9. Checklist MVP (deliverable per fitur)
- [ ] Dexie setup (`services/db/db.ts`) dengan 13 tabel
- [x] Service layer `services/quran/` — loader, hooks, integrasi halaman
- [ ] AudioController & useAudio hook
- [ ] AudioPlayer UI integrated with controller
- [ ] Repeat engine functional (count, range, target)
- [ ] RepeatSettingsDialog persisting config ke Dexie
- [ ] Focus Mode word highlight working
- [ ] Service Worker skeleton registered
- [ ] Download manager storing audio in Cache Storage
- [ ] Manifest unduhan di Dexie `downloadManifest`
- [ ] Persist favorites & user settings via Dexie
- [ ] PWA manifest & icons
- [ ] Unit tests for repeat & audio logic
- [ ] E2E tests for core flows

---

## 10. Rekomendasi Urutan Pengerjaan (prioritas)
1. Fase0 — Persiapan: skeleton stores, SW basic, IndexedDB helper
2. Fase1 — Audio Playback & Controller
3. Fase2 — Repeat Engine & UI
4. Fase3 — Focus Mode (word highlight polish)
5. Fase4 — Offline First & Download Manager
6. Fase5 — PWA packaging
7. Fase6 — Testing & QA (parallel after Fase1)
8. Fase7 — Release & Monitoring

Rationale: audio + repeat + focus adalah inti hafalan; caching/PWA meningkatkan pengalaman mobile dan offline.

---

## Lampiran Teknis & Tugas Implementasi Cepat
- Konten Quran via `services/quran/` — fetch `public/data/*`, cache in-memory.
- Data pengguna: `zustand` stores + **Dexie** (akses langsung dari action store).
- Service Worker: implement minimal runtime caching & message channel to client.
- Prefer incremental delivery: deliver audio play first with streaming, add prefetch/download next.

---

## 11. Evolusi Platform

Arsitektur HanQuran dirancang mendukung tiga fase evolusi. Schema Dexie sudah menyiapkan tabel untuk fase Growth sejak V1.

### MVP (V1)

Fitur inti hafalan:

- Membaca Al-Quran (teks Arab + terjemahan)
- Audio per ayat (streaming + offline cache)
- Repeat engine (current ayah, ayah range, entire surah)
- Focus Mode (word highlight)
- Favorites & last read
- Offline basic (download per surat)
- PWA installable

Tabel Dexie aktif: `surahs`, `ayahs`, `translations`, `wordTimings`, `reciters`, `favorites`, `lastRead`, `settings`, `downloadManifest`

---

### Growth Phase (V2)

Fitur hafalan lanjutan:

- Progress hafalan per surat (% ayat yang dihafal)
- Murajaah terjadwal dan riwayat sesi
- Statistik aktivitas harian
- Catatan per ayat
- Bookmark ayat spesifik
- Target hafalan
- Dashboard progress
- **Media Session API** — metadata surat/ayat di lock screen, kontrol Play/Pause OS (`docs/27`) — ✅ diimplementasi, rilis `0.3.0`
- **Mode Murotal** — tilawah berkelanjutan ayat → surat (`docs/29`) — ✅ diimplementasi, rilis `0.3.0`

Tabel Dexie ditambahkan: `bookmarks`, `memorization_progress`, `murajaah_sessions`, `statistics`, `notes`

---

### Future Phase (V3+)

Platform hafalan multi-device:

- Akun pengguna (opsional, privacy-first)
- Sinkronisasi progress antar perangkat
- Multi-device support
- Family profiles
- AI Murajaah (validasi bacaan)
- Cloud backup

Schema extension: tambah field `syncId`, `deviceId`, `syncedAt` via Dexie migration. Infrastruktur lokal (Zustand + Dexie) tetap menjadi primary layer; cloud hanya sebagai backup/sync layer.

---

Dokumen ini disimpan sebagai `docs/17-implementation-roadmap.md`.

