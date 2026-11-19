// @vitest-environment jsdom
/** Bilah tipis muncul setelah header penuh tergulir keluar layar. */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SurahCompactBar } from '@/components/surah-compact-bar';
import { measureSurahDetailTopInset } from '@/lib/auto-follow-playback';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, v?: Record<string, unknown>) =>
    `${ns}.${key}${v ? ':' + Object.values(v).join(',') : ''}`,
}));

afterEach(() => cleanup());

function setChromeBottom(el: HTMLElement, bottom: number) {
  el.getBoundingClientRect = () => ({ bottom, top: bottom - 300 }) as DOMRect;
}

describe('SurahCompactBar', () => {
  it('tersembunyi saat header penuh terlihat, tampil setelah tergulir', async () => {
    const onFocus = vi.fn();
    render(
      <>
        <div data-surah-detail-top-chrome data-testid="chrome" />
        <SurahCompactBar surahName="Al-Mulk" activeAyah={12} onFocusMode={onFocus} />
      </>,
    );
    const chrome = screen.getByTestId('chrome');
    const bar = document.querySelector('[data-surah-detail-compact-bar]') as HTMLElement;
    setChromeBottom(chrome, 300);
    await act(async () => window.dispatchEvent(new Event('scroll')));
    expect(bar.getAttribute('aria-hidden')).toBe('true');

    setChromeBottom(chrome, -20);
    await act(async () => window.dispatchEvent(new Event('scroll')));
    expect(bar.getAttribute('aria-hidden')).toBe('false');
    expect(bar.textContent).toContain('Al-Mulk');
    expect(bar.textContent).toContain('surah.compactAyah:12');
    fireEvent.click(screen.getByLabelText('surah.compactFocus'));
    expect(onFocus).toHaveBeenCalled();
  });

  it('zona baca memakai chrome terbawah yang masih terlihat', () => {
    const chrome = document.createElement('div');
    chrome.setAttribute('data-surah-detail-top-chrome', '');
    const bar = document.createElement('div');
    bar.setAttribute('data-surah-detail-compact-bar', '');
    document.body.append(chrome, bar);
    setChromeBottom(chrome, -200);
    setChromeBottom(bar, 80);
    expect(measureSurahDetailTopInset()).toBe(80);
    chrome.remove();
    bar.remove();
  });
});
