/**
 * Menormalkan teks pencarian agar matching longgar:
 * spasi, strip (-), apostrof, dan tanda baca diabaikan;
 * huruf dobel digabung; h di akhir dihapus (variasi transliterasi).
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\u0600-\u06ff]/gu, '')
    .replace(/(.)\1+/g, '$1')
    .replace(/h$/u, '');
}

export function matchesSurahSearch(
  query: string,
  surah: {
    englishName: string;
    meaning: string;
    arabicName: string;
    number?: number;
  },
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const fields = [
    normalizeSearchText(surah.englishName),
    normalizeSearchText(surah.meaning),
    normalizeSearchText(surah.arabicName),
  ];

  if (fields.some((field) => field.includes(normalizedQuery))) {
    return true;
  }

  if (
    surah.number !== undefined &&
    String(surah.number) === normalizedQuery
  ) {
    return true;
  }

  return false;
}
