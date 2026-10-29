import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('memuat home + 114 surat, tanpa focus/settings', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    expect(entries).toHaveLength(115);
    expect(urls[0]).toMatch(/\/$/); // home berakhir dengan /
    expect(urls.filter((u) => /\/surah\/\d+$/.test(u))).toHaveLength(114);
    expect(urls.some((u) => u.includes('/focus'))).toBe(false);
    expect(urls.some((u) => u.includes('/settings'))).toBe(false);
    expect(urls).toContain(new URL('/surah/114', urls[0]).toString());
  });

  it('setiap entri punya lastModified valid', () => {
    for (const e of sitemap()) {
      expect(e.lastModified, e.url).toBeInstanceOf(Date);
      expect(Number.isNaN(e.lastModified!.getTime()), e.url).toBe(false);
      expect(e.changeFrequency, 'tanpa changefreq').toBeUndefined();
      expect(e.priority, 'tanpa priority').toBeUndefined();
    }
  });
});
