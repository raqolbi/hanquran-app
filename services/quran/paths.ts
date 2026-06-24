const DATA_BASE = '/data';

/** Format nomor surat tiga digit, mis. 1 → `001`. */
export function formatSurahId(surahNumber: number): string {
  return String(surahNumber).padStart(3, '0');
}

/** Format kode ayat EveryAyah, mis. surat 1 ayat 1 → `001001`. */
export function formatAyahCode(surahNumber: number, ayahNumber: number): string {
  return `${formatSurahId(surahNumber)}${String(ayahNumber).padStart(3, '0')}`;
}

export function manifestPath(): string {
  return `${DATA_BASE}/manifest.json`;
}

export function surahPath(surahNumber: number): string {
  return `${DATA_BASE}/quran/${formatSurahId(surahNumber)}.json`;
}

export function translationPath(surahNumber: number, language: string): string {
  return `${DATA_BASE}/translations/${language}/${formatSurahId(surahNumber)}.json`;
}
