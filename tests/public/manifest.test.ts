import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('public/manifest.json', () => {
  const manifestPath = resolve(process.cwd(), 'public/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    theme_color: string;
    background_color: string;
    icons: Array<{ src: string; sizes: string; type: string }>;
  };

  it('memiliki metadata PWA wajib', () => {
    expect(manifest.name).toBe('HanQuran');
    expect(manifest.short_name).toBe('HanQuran');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0F766E');
    expect(manifest.background_color).toBe('#FAFAF8');
  });

  it('mendefinisikan ikon 192 dan 512', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });
});
