export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahAyah {
  number: number;
  arabic: string;
  translation: string;
  transliteration: string;
}

export interface SurahSummary {
  number: number;
  arabicName: string;
  englishName: string;
  meaning: string;
  /** Arti dalam kedua bahasa UI — dipakai paint pertama (docs/21 F8). */
  meaningTranslations?: { id: string; en: string };
  ayahCount: number;
  type: RevelationType;
}

export interface SurahData extends SurahSummary {
  ayahs: SurahAyah[];
}

export interface Reciter {
  id: string;
  name: string;
  /**
   * Qari populer — **kurasi redaksi** (dikenal luas di aplikasi/radio
   * Al-Qur'an), bukan data unduhan/rating pengguna. Lihat `docs/37` §8.
   */
  popular?: boolean;
  /** Rekaman metode belajar (Muallim) — cocok untuk menghafal. */
  memorization?: boolean;
}
