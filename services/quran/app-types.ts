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
  ayahCount: number;
  type: RevelationType;
}

export interface SurahData extends SurahSummary {
  ayahs: SurahAyah[];
}

export interface Reciter {
  id: string;
  name: string;
}
