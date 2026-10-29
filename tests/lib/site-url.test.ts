import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

async function importSiteUrl(): Promise<string> {
  const mod = await import('@/lib/site-url');
  return mod.SITE_URL;
}

describe('site-url', () => {
  it('fallback localhost tanpa env', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    expect(await importSiteUrl()).toBe('http://localhost:3000');
  });

  it('memakai NEXT_PUBLIC_SITE_URL bila tersedia', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hanquran.example.com/';
    expect(await importSiteUrl()).toBe('https://hanquran.example.com');
  });

  it('fallback ke VERCEL_URL (skema https ditambahkan)', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = 'hanquran.vercel.app';
    expect(await importSiteUrl()).toBe('https://hanquran.vercel.app');
  });

  it('membuang trailing slash yang ganda', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hanquran.example.com///';
    expect(await importSiteUrl()).toBe('https://hanquran.example.com');
  });
});
