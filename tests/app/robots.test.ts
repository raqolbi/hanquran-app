import { afterEach, describe, expect, it, vi } from 'vitest';

import robots from '@/app/robots';

describe('robots', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('mengizinkan seluruh situs kecuali focus & settings', () => {
    const result = robots();
    const [rule] = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(rule?.userAgent).toBe('*');
    expect(rule?.allow).toBe('/');
    expect(rule?.disallow).toEqual(['/focus', '/settings']);
  });

  it('menunjuk sitemap absolut', () => {
    const result = robots();

    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
    expect(result.sitemap).toMatch(/^https?:\/\//);
  });
});
