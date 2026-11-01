import type { LocalePair } from '@/lib/locale-text';

/**
 * Merender kedua bahasa sekaligus; CSS memilih berdasarkan
 * `<html data-app-locale>` sebelum paint pertama (docs/21 §5.6).
 * Tanpa atribut (SSR/no-JS) teks `id` yang tampil.
 */
export function LocaleText({ pair }: { pair: LocalePair }) {
  return (
    <>
      <span data-locale="id" lang="id">
        {pair.id}
      </span>
      <span data-locale="en" lang="en">
        {pair.en}
      </span>
    </>
  );
}
