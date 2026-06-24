/** Format byte ke megabyte untuk tampilan ringkasan cache. */
export function formatMegabytes(bytes: number, fractionDigits = 1): string {
  if (bytes <= 0) return '0';
  return (bytes / (1024 * 1024)).toFixed(fractionDigits);
}
