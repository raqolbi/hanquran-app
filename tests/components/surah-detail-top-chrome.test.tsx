// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SurahDetailTopChrome } from '@/components/surah-detail-top-chrome';

describe('SurahDetailTopChrome', () => {
  afterEach(() => {
    cleanup();
  });

  // Header penuh ikut tergulir; bilah tipis `SurahCompactBar` yang menempel.
  it('membungkus header dan kontrol dalam satu blok yang ikut tergulir', () => {
    const { container } = render(
      <SurahDetailTopChrome>
        <header>Surah Header</header>
        <div>Reading Controls</div>
      </SurahDetailTopChrome>,
    );

    const root = container.firstElementChild;
    expect(root?.className.includes('sticky')).toBe(false);
    expect(root?.className.includes('pt-safe')).toBe(true);
    expect(root?.className.includes('bg-background')).toBe(true);
    expect(root?.hasAttribute('data-surah-detail-top-chrome')).toBe(true);
    expect(screen.getByText('Surah Header')).toBeTruthy();
    expect(screen.getByText('Reading Controls')).toBeTruthy();
  });
});
