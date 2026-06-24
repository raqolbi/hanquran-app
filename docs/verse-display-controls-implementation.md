# Laporan Implementasi — Verse Display Controls

**Tanggal:** 2025-06-24  
**Spesifikasi:** `docs/22-verse-display-controls.md`

---

## Implementasi Sebelumnya

| Aspek | Kondisi |
|-------|---------|
| Kontrol baca | `ActionBar` — 2 tombol (`Terjemahan ON/OFF`, `Mode Fokus`) |
| Transliterasi | Data ada di dataset, **tidak** ditampilkan di UI |
| Persistensi terjemahan | State lokal `useState(false)` di halaman surat |
| Pengaturan | Section Terjemahan di `/settings` (bertentangan dengan spec) |
| Focus Mode | Hanya teks Arab; mengabaikan preferensi terjemahan/transliterasi |
| Urutan render | Arab → Terjemahan (tanpa transliterasi) |

---

## Perbedaan dari Dokumentasi

1. Hanya 2 kontrol, bukan 3 (`Transliterasi` hilang)
2. Label pill `ON/OFF`, bukan `✓` / `○`
3. Toggle terjemahan tidak persisten (Dexie)
4. Terjemahan juga di Settings — seharusnya hanya di Surah Detail
5. Focus Mode tidak mewarisi preferensi baca

---

## File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `components/verse-display-controls.tsx` | **Baru** — 3 kontrol satu baris |
| `components/action-bar.tsx` | Re-export legacy → `VerseDisplayControls` |
| `components/ayah-card.tsx` | Transliterasi + urutan Arab → Transliterasi → Terjemahan |
| `hooks/use-reading-display.ts` | **Baru** — hook preferensi persisten |
| `app/surah/[id]/page.tsx` | Wire ke store + kontrol baru |
| `app/focus/[id]/page.tsx` | Warisi preferensi; tampilkan transliterasi/terjemahan |
| `app/settings/page.tsx` | Hapus section Terjemahan |
| `types/index.ts` | `transliterationVisible` |
| `services/db/db.ts` | Default `transliterationVisible: false` |
| `stores/userStore.ts` | Migrasi field `transliterationVisible` |
| `messages/id.json`, `messages/en.json` | Label `Terjemahan`, `Transliterasi`, `Fokus` |

---

## Validasi

- [x] Tiga kontrol selalu terlihat di bawah header surat
- [x] Fokus = navigasi, bukan toggle persisten
- [x] Terjemahan & transliterasi persisten di Dexie
- [x] Focus Mode mewarisi preferensi
- [x] Repeat, audio player, navigasi tidak diubah
