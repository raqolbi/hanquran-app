import type { DatasetManifest, DatasetSurahFile, DatasetTranslationFile } from './dataset-types';
import { manifestPath, surahPath, translationPath } from './paths';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal memuat ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

const manifestCache: { value: DatasetManifest | null } = { value: null };
const surahFileCache = new Map<number, DatasetSurahFile>();
const translationFileCache = new Map<string, DatasetTranslationFile>();

export async function loadManifest(): Promise<DatasetManifest> {
  if (manifestCache.value) {
    return manifestCache.value;
  }
  const manifest = await fetchJson<DatasetManifest>(manifestPath());
  manifestCache.value = manifest;
  return manifest;
}

export async function loadSurahFile(surahNumber: number): Promise<DatasetSurahFile> {
  const cached = surahFileCache.get(surahNumber);
  if (cached) {
    return cached;
  }
  const data = await fetchJson<DatasetSurahFile>(surahPath(surahNumber));
  surahFileCache.set(surahNumber, data);
  return data;
}

export async function loadTranslationFile(
  surahNumber: number,
  language: string,
): Promise<DatasetTranslationFile | null> {
  const cacheKey = `${language}:${surahNumber}`;
  if (translationFileCache.has(cacheKey)) {
    return translationFileCache.get(cacheKey) ?? null;
  }
  try {
    const data = await fetchJson<DatasetTranslationFile>(
      translationPath(surahNumber, language),
    );
    translationFileCache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

export function parseSurahId(id: string): number {
  const parsed = Number.parseInt(id, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 114) {
    throw new Error(`ID surat tidak valid: ${id}`);
  }
  return parsed;
}
