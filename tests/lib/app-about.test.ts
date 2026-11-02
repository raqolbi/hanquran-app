import { afterEach, describe, expect, it, vi } from 'vitest';

import packageJson from '@/package.json';
import {
  APP_NAME,
  APP_REPOSITORY_URL,
  getAppVersion,
  getRepositoryCommercialLicenseUrl,
  getRepositoryLicenseUrl,
} from '@/lib/app-about';
import { routes } from '@/lib/routes';

describe('app-about', () => {
  it('mengembalikan versi dari package.json', () => {
    expect(getAppVersion()).toBe(packageJson.version);
  });

  it('menyediakan metadata aplikasi tetap', () => {
    expect(APP_NAME).toBe('HanQuran');
    expect(APP_REPOSITORY_URL).toBe('https://github.com/raqolbi/hanquran-app');
  });

  it('membangun URL lisensi repository', () => {
    expect(getRepositoryLicenseUrl()).toBe(
      `${APP_REPOSITORY_URL}/blob/main/LICENSE`,
    );
    expect(getRepositoryCommercialLicenseUrl()).toBe(
      `${APP_REPOSITORY_URL}/blob/main/COMMERCIAL-LICENSE.md`,
    );
  });
});

describe('routes.settingsAbout', () => {
  it('mengarah ke /settings/about', () => {
    expect(routes.settingsAbout()).toBe('/settings/about');
  });
});

describe('tautan pembuat via env', () => {
  it('tidak dipasang → bawaan; dikosongkan → disembunyikan', async () => {
    const { resolvePublicUrl, resolvePublicText } = await import('@/lib/app-about');
    const fallback = 'https://fallback.example';
    expect(resolvePublicUrl(undefined, fallback)).toBe(fallback);
    expect(resolvePublicUrl('', fallback)).toBe('');
    expect(resolvePublicUrl('   ', fallback)).toBe('');
    expect(resolvePublicUrl('-', fallback)).toBe('');
    expect(resolvePublicText(undefined, 'Nama')).toBe('Nama');
    expect(resolvePublicText('', 'Nama')).toBe('');
    expect(resolvePublicText(' - ', 'Nama')).toBe('');
    expect(resolvePublicText(' Baru ', 'Nama')).toBe('Baru');
  });

  it('menerima https dan menyembunyikan skema lain', async () => {
    const { resolvePublicUrl } = await import('@/lib/app-about');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fallback = 'https://fallback.example';
    expect(resolvePublicUrl('https://www.threads.com/@akun', fallback)).toBe(
      'https://www.threads.com/@akun',
    );
    expect(resolvePublicUrl('javascript:alert(1)', fallback)).toBe('');
    expect(resolvePublicUrl('http://x.com/a', fallback)).toBe('');
    expect(resolvePublicUrl('bukan url', fallback)).toBe('');
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  it('mengambil handle @ dari URL Threads', async () => {
    const { deriveThreadsHandle } = await import('@/lib/app-about');
    expect(deriveThreadsHandle('https://www.threads.com/@akun.baru', 'Nama')).toBe(
      '@akun.baru',
    );
    expect(deriveThreadsHandle('https://www.threads.com/', 'Nama')).toBe('Nama');
    expect(deriveThreadsHandle('', '')).toBe('HanQuran');
  });
});

describe('env dikosongkan di UI', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock('next-intl');
  });

  it('footer menyembunyikan tautan & baris yang env-nya dikosongkan', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_THREADS_URL', '');
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_X_URL', 'https://x.com/akun');
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_NAME', '');
    vi.stubEnv('NEXT_PUBLIC_ORGANIZATION_URL', '-');
    // `whileInView` di footer butuh IntersectionObserver (tidak ada di jsdom).
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.resetModules();
    vi.doMock('next-intl', () => {
      const t = Object.assign((key: string) => key, {
        rich: (key: string) => key,
      });
      return { useTranslations: () => t };
    });
    const { render, screen, cleanup } = await import('@testing-library/react');
    const { createElement } = await import('react');
    const { HomeFooter } = await import('@/components/home-footer');

    render(createElement(HomeFooter));
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://x.com/akun']);
    expect(screen.queryByText('madeBy')).toBeNull();
    expect(screen.queryByText('fromQolcore')).toBeNull();
    expect(screen.queryByText('·')).toBeNull();
    cleanup();
  });

  it('Gerbang Threads tidak tampil bila URL Threads dikosongkan', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_THREADS_URL', '');
    vi.resetModules();
    const { renderHook } = await import('@testing-library/react');
    const { useThreadsGate } = await import('@/hooks/use-threads-gate');
    const { result } = renderHook(() => useThreadsGate());
    expect(result.current.showOverlay).toBe(false);
  });

  it('Gerbang Threads tetap tampil bila env tidak dipasang', async () => {
    vi.resetModules();
    const { renderHook } = await import('@testing-library/react');
    const { useThreadsGate } = await import('@/hooks/use-threads-gate');
    const { result } = renderHook(() => useThreadsGate());
    expect(result.current.showOverlay).toBe(true);
  });
});
