import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { AppLocale } from '@/types';

import type { SurahData } from './app-types';
import type {
  DatasetSurahFile,
  DatasetTranslationFile,
} from './dataset-types';
import { DEFAULT_LANGUAGE, mapSurahToDetail } from './mappers';
import { formatSurahId, translationPath } from './paths';

/**
 * Sisi server build untuk SEO — `docs/35-seo-spec.md` §4 T1.
 * Halaman `app/surah/[id]/page.tsx` memakai ini untuk SSG konten ayat +
 * `generateMetadata` per surat. Bundle klien TIDAK memakai modul ini.
 */

async function readPublicJson<T>(relativePath: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'public', relativePath);
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function readSurahFile(
  surahNumber: number,
): Promise<DatasetSurahFile | null> {
  try {
    return await readPublicJson<DatasetSurahFile>(
      `data/quran/${formatSurahId(surahNumber)}.json`,
    );
  } catch {
    return null;
  }
}

async function readTranslationFile(
  surahNumber: number,
  language: string,
): Promise<DatasetTranslationFile | undefined> {
  try {
    return await readPublicJson<DatasetTranslationFile>(
      translationPath(surahNumber, language),
    );
  } catch {
    return undefined;
  }
}

/** Muat konten surat (termasuk terjemahan default `id`) dari `public/data/*`. */
export async function readSurahForServer(
  surahNumber: number,
  locale: AppLocale = 'id',
): Promise<SurahData | null> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return null;
  }

  const surahFile = await readSurahFile(surahNumber);
  if (!surahFile) {
    return null;
  }

  const translationFile = await readTranslationFile(
    surahNumber,
    DEFAULT_LANGUAGE,
  );
  return mapSurahToDetail(surahFile, translationFile, locale);
}
