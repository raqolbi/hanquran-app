/**
 * Quran service layer — Static Dataset Architecture.
 * Sumber kebenaran: `public/data/*`. Tanpa Dexie.
 * Spesifikasi: `docs/23-static-dataset-architecture.md`
 */

export type {
  DatasetManifest,
  DatasetQuranVerse,
  DatasetSurahFile,
  DatasetTranslationFile,
  DatasetTranslationVerse,
} from './dataset-types';

export type {
  Reciter,
  RevelationType,
  SurahAyah,
  SurahData,
  SurahSummary,
} from './app-types';

export { AYAH_AUDIO_BASE_URL } from './audio-config';
export { formatAyahCode, formatSurahId } from './paths';
export { getManifest, getSurah, getSurahList, getSurahSummary } from './quran-service';
export {
  buildAyahAudioUrl,
  getDefaultReciterId,
  getNextAyahPrefetchUrl,
  getReciterById,
  getReciters,
} from './audio-service';
