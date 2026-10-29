import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

async function loadSchema() {
  return await import('@/lib/schema-org');
}

describe('schema-org', () => {
  it('WebSite memuat url absolut dari SITE_URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hanquran.example.com/';
    const { buildWebSiteSchema } = await loadSchema();
    const schema = buildWebSiteSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://hanquran.example.com/');
    expect(schema.inLanguage).toBe('id');
  });

  it('breadcrumb surat dua level bernomor urut', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hanquran.example.com';
    const { buildSurahBreadcrumbSchema } = await loadSchema();
    const surah = {
      number: 36,
      englishName: 'Yaasin',
      arabicName: 'يس',
      meaning: 'Yaseen',
      ayahCount: 83,
      type: 'Meccan',
      ayahs: [],
    } as never;

    const schema = buildSurahBreadcrumbSchema(surah);
    const items = schema.itemListElement as { position: number; name: string; item: string }[];

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(items).toHaveLength(2);
    expect(items[0]!.position).toBe(1);
    expect(items[0]!.item).toBe('https://hanquran.example.com/');
    expect(items[1]!.name).toBe('Surat Yaasin');
    expect(items[1]!.item).toBe('https://hanquran.example.com/surah/36');
  });

  it('halaman surat rujuk breadcrumb + ukuran metadata inti', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hanquran.example.com';
    const { buildSurahPageSchema } = await loadSchema();
    const surah = {
      number: 1,
      englishName: 'Al-Faatiha',
      arabicName: 'الفاتحة',
      ayahCount: 7,
      ayahs: [],
    } as never;

    const schema = buildSurahPageSchema(surah);

    expect(schema['@type']).toBe('ContentPage');
    expect(schema.alternateName).toBe('الفاتحة');
    expect((schema.breadcrumb as Record<string, unknown>)['@type']).toBe(
      'BreadcrumbList',
    );
  });
});
