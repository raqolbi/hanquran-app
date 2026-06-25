import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('public/offline.html', () => {
  const html = readFileSync(
    resolve(process.cwd(), 'public/offline.html'),
    'utf8',
  );

  it('berisi pesan offline dalam Bahasa Indonesia', () => {
    expect(html).toContain('Anda sedang offline');
    expect(html).toContain('Muat ulang');
    expect(html).toContain('lang="id"');
  });

  it('mandiri tanpa aset eksternal', () => {
    expect(html).not.toContain('src="/icons/');
    expect(html).toContain('<svg');
  });
});

describe('public/sw.js shell cache', () => {
  const sw = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

  it('mendefinisikan cache shell dan precache offline.html', () => {
    expect(sw).toContain('hanquran-shell-v2');
    expect(sw).toContain('/offline.html');
    expect(sw).toContain('handleNavigation');
  });

  it('mem-precache manifest build + app-shell route dinamis', () => {
    expect(sw).toContain('__SW_PRECACHE__');
    expect(sw).toContain('precacheOnInstall');
    expect(sw).toContain('appShellRouteFor');
  });
});
