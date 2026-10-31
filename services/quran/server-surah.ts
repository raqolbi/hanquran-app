import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { AppLocale } from '@/types';

import type { DatasetManifest, DatasetSurahFile, DatasetTranslationFile } from './dataset-types';
import type { SurahData, SurahSummary } from './app-types';
import { DEFAULT_LANGUAGE, mapSurahToDetail, mapSurahToSummary } from './mappers';
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

/**
 * Muat ringkasan seluruh surat untuk halaman beranda yang di-SSG
 * (docs/36 §3). Hanya metadata surat — tanpa ayat/terjemahan.
 */
export async function readSurahListForServer(
  locale: AppLocale = 'id',
): Promise<SurahSummary[]> {
  const manifest = await readPublicJson<DatasetManifest>('data/manifest.json');
  const surahNumbers = Array.from(
    { length: manifest.surahs },
    (_, index) => index + 1,
  );

  const files = await Promise.all(surahNumbers.map((n) => readSurahFile(n)));

  return files
    .filter((file): file is DatasetSurahFile => file !== null)
    .map((file) => mapSurahToSummary(file, locale));
}
