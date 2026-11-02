/**
 * Struktur credits untuk layar Tentang HanQuran.
 * Label teks via i18n (`about.credits.*`); href opsional untuk tautan eksternal.
 */

export type AboutDataSourceCredit = {
  id: 'quranText' | 'quranDataset' | 'transliteration' | 'audioMurottal' | 'wordTimings';
  labelKey: string;
  sourceKey: string;
  href?: string;
};

/** Sumber data konten Al-Qur'an — satu kelompok «Sumber Data». */
export const ABOUT_DATA_SOURCE_CREDITS: readonly AboutDataSourceCredit[] = [
  {
    id: 'quranText',
    labelKey: 'dataSources.quranText.label',
    sourceKey: 'dataSources.quranText.source',
    href: 'https://tanzil.net/',
  },
  {
    id: 'quranDataset',
    labelKey: 'dataSources.quranDataset.label',
    sourceKey: 'dataSources.quranDataset.source',
    href: 'https://github.com/raqolbi/hanquran-data-generator',
  },
  {
    id: 'transliteration',
    labelKey: 'dataSources.transliteration.label',
    sourceKey: 'dataSources.transliteration.source',
    href: 'https://equran.id/',
  },
  {
    id: 'audioMurottal',
    labelKey: 'dataSources.audioMurottal.label',
    sourceKey: 'dataSources.audioMurottal.source',
  },
  {
    // Wajib atribusi — data berlisensi CC BY 4.0.
    id: 'wordTimings',
    labelKey: 'dataSources.wordTimings.label',
    sourceKey: 'dataSources.wordTimings.source',
    href: 'https://github.com/cpfair/quran-align',
  },
] as const;
