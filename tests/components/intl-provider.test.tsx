import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IntlProvider } from '@/components/providers/intl-provider';
import { APP_LOCALE_STORAGE_KEY } from '@/lib/app-locale';
import { useUserStore } from '@/stores/userStore';

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe('IntlProvider — resync locale', () => {
  const init = vi.fn(async () => {});

  beforeEach(() => {
    init.mockClear();
    useUserStore.setState({ init });
  });

  afterEach(() => {
    cleanup();
  });

  it('memuat ulang locale saat halaman dipulihkan dari bfcache', () => {
    render(<IntlProvider>isi</IntlProvider>);

    const pageshow = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(pageshow, 'persisted', { value: true });
    window.dispatchEvent(pageshow);

    expect(init).toHaveBeenCalledTimes(1);
  });

  it('mengabaikan pageshow biasa (bukan restore)', () => {
    render(<IntlProvider>isi</IntlProvider>);

    window.dispatchEvent(new Event('pageshow'));

    expect(init).not.toHaveBeenCalled();
  });

  it('menyusul locale yang diubah di tab lain', () => {
    render(<IntlProvider>isi</IntlProvider>);

    window.dispatchEvent(
      new StorageEvent('storage', { key: APP_LOCALE_STORAGE_KEY, newValue: 'en' }),
    );

    expect(init).toHaveBeenCalledTimes(1);
  });

  it('mengabaikan perubahan localStorage kunci lain', () => {
    render(<IntlProvider>isi</IntlProvider>);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'hanquran:threads-gate-completed' }),
    );

    expect(init).not.toHaveBeenCalled();
  });
});
