/** Shape mentah file `public/data/manifest.json`. */
export interface DatasetManifest {
  version: string;
  generated_at: string;
  surahs: number;
  ayahs: number;
  languages: string[];
}

/** Ayat dalam file `public/data/quran/{id}.json`. */
export interface DatasetQuranVerse {
  ayah: number;
  text: string;
  transliteration: string;
}

/** File surat tunggal di `public/data/quran/{id}.json`. */
export interface DatasetSurahFile {
  id: number;
  name_ar: string;
  name_simple: string;
  name_en: string;
  meaning: string;
  description: string;
  revelation_place: 'meccan' | 'medinan';
  ayah_count: number;
  verses: DatasetQuranVerse[];
  word_by_word: Record<string, unknown>;
  tafsir: Record<string, unknown>;
}

/** Ayat terjemahan dalam file `public/data/translations/{lang}/{id}.json`. */
export interface DatasetTranslationVerse {
  ayah: number;
  text: string;
}

/** File terjemahan surat di `public/data/translations/{lang}/{id}.json`. */
export interface DatasetTranslationFile {
  surah: number;
  language: string;
  verses: DatasetTranslationVerse[];
}
