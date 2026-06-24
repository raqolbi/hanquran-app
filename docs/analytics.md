# Analytics — HanQuran

HanQuran memakai **[Vercel Analytics](https://vercel.com/docs/analytics)** untuk page views otomatis dan **custom events** untuk perilaku inti aplikasi.

- Komponen `<Analytics />` — `app/layout.tsx` (production)
- Custom events — `lib/analytics/` (abstraction layer)

Jangan memanggil `track()` dari `@vercel/analytics` langsung di komponen. Gunakan helper di `lib/analytics/analytics.ts`.

---

## Event yang tersedia

| Event | Helper | Kapan dicatat |
|-------|--------|----------------|
| `surah_opened` | `trackSurahOpened()` | Pengguna membuka layar surat (Detail / Fokus), sekali per mount |
| `audio_play` | `trackAudioPlay()` | Trek audio **baru** mulai diputar (bukan resume / progress) |
| `bookmark_created` | `trackBookmarkCreated()` | Favorit surat **berhasil** ditambahkan ke Dexie |
| `last_read_updated` | `trackLastReadUpdated()` | Posisi `lastRead` **berubah** dan tersimpan |
| `repeat_enabled` | `trackRepeatEnabled()` | Pengguna menyimpan konfigurasi repeat dari dialog |

---

## Payload

### `surah_opened`

```ts
{
  surahId: number;
  surahName: string; // `englishName` dari dataset
}
```

### `audio_play`

```ts
{
  surahId: number;
  ayahNumber: number;
  reciterId?: string;
}
```

### `bookmark_created`

```ts
{
  surahId: number;
  ayahNumber: number; // ayat aktif di Detail; default `1` dari Beranda
}
```

### `last_read_updated`

```ts
{
  surahId: number;
  ayahNumber: number;
}
```

### `repeat_enabled`

```ts
{
  mode: 'ayah' | 'range'; // `current_ayah` / `entire_surah` → `ayah`; `ayah_range` → `range`
}
```

---

## Lokasi implementasi

| Area | File |
|------|------|
| Definisi event & tipe | `lib/analytics/events.ts` |
| Helper `track*` | `lib/analytics/analytics.ts` |
| Vercel `<Analytics />` | `app/layout.tsx` |
| Buka surat | `hooks/use-track-surah-opened.ts` → `app/surah/[id]/page.tsx`, `app/focus/[id]/page.tsx` |
| Putar audio | `services/audio-controller.ts` — method `play()` saat URL trek berubah |
| Favorit / bookmark | `stores/userStore.ts` — `toggleFavorite()` setelah `db.favorites.put` |
| Last read | `stores/userStore.ts` — `setLastViewed()` setelah perubahan |
| Repeat | `stores/repeatStore.ts` — `applyConfig()` setelah persist |

---

## Menghindari duplikasi

- **Surah opened** — `useRef` di `useTrackSurahOpened`; tidak di `render`.
- **Audio play** — hanya saat `!sameUrl` di `AudioController.play()`; `resume()` tidak mencatat.
- **Bookmark** — hanya cabang **tambah** favorit setelah Dexie sukses.
- **Last read** — guard `surahId` + `ayahNumber` di `setLastViewed` sebelum tulis & track.
- **Repeat** — hanya pada `applyConfig` (aksi simpan dialog), bukan setiap siklus repeat.

---

## Menambah event baru

1. Tambah konstanta di `ANALYTICS_EVENTS` (`lib/analytics/events.ts`).
2. Definisikan interface payload di file yang sama.
3. Tambah `trackNamaEvent()` di `lib/analytics/analytics.ts` yang memanggil `sendEvent()`.
4. Export dari `lib/analytics/index.ts`.
5. Panggil dari **store / service / hook** pada titik aksi pengguna — bukan di JSX render.
6. Tambah tes di `tests/lib/analytics.test.ts`.
7. Perbarui tabel di dokumen ini.

---

## Pengujian lokal

Custom events hanya dikirim saat `NODE_ENV === 'production'` (selaras `<Analytics />`).

Untuk verifikasi:

```bash
npm run build && npm start
```

Buka aplikasi di production build lokal atau deployment Vercel, lalu periksa **Vercel Dashboard → Analytics → Events**.

---

Dokumen ini disimpan sebagai `docs/analytics.md`.
