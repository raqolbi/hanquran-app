/** Kunci runtime `downloadStatuses` di `useOfflineStore`. */
export function downloadManifestKey(
  surahId: number,
  reciterId: string,
): string {
  return `${surahId}:${reciterId}`;
}
