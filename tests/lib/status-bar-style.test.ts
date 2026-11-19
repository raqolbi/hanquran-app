import { describe, expect, it } from 'vitest';

import { resolveStatusBarIcons } from '@/lib/status-bar-style';

describe('resolveStatusBarIcons', () => {
  it('tanpa edge-to-edge (Android lama) selalu ikon terang di atas status bar teal', () => {
    expect(resolveStatusBarIcons({ pathname: '/settings', edgeToEdge: false })).toBe('light');
    expect(resolveStatusBarIcons({ pathname: '/', edgeToEdge: false })).toBe('light');
  });

  it('edge-to-edge: Beranda bergradien memakai ikon terang', () => {
    expect(resolveStatusBarIcons({ pathname: '/', edgeToEdge: true })).toBe('light');
    expect(resolveStatusBarIcons({ pathname: '/index.html', edgeToEdge: true })).toBe('light');
  });

  it('edge-to-edge: subhalaman berlatar putih memakai ikon gelap', () => {
    expect(resolveStatusBarIcons({ pathname: '/settings.html', edgeToEdge: true })).toBe('dark');
    expect(resolveStatusBarIcons({ pathname: '/surah/1', edgeToEdge: true })).toBe('dark');
    expect(resolveStatusBarIcons({ pathname: '/murotal.html', edgeToEdge: true })).toBe('dark');
  });
});
