import { describe, expect, it } from 'vitest';

import * as focusLayout from '@/app/focus/[id]/layout';
import * as surahLayout from '@/app/surah/[id]/layout';
import { SURAH_AYAH_COUNTS } from '@/lib/surah-ayah-counts';

describe('static params surat', () => {
  it.each([
    ['/surah/[id]', surahLayout],
    ['/focus/[id]', focusLayout],
  ])('%s men-prerender 114 surat & menolak id lain (dynamicParams=false)', (
    _label,
    layout,
  ) => {
    const params = layout.generateStaticParams();

    expect(layout.dynamicParams).toBe(false);
    expect(params).toHaveLength(SURAH_AYAH_COUNTS.length);
    expect(params[0]).toEqual({ id: '1' });
    expect(params.at(-1)).toEqual({ id: '114' });
  });
});
