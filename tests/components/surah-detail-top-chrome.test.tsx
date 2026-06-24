import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SurahDetailTopChrome } from '@/components/surah-detail-top-chrome';

describe('SurahDetailTopChrome', () => {
  afterEach(() => {
    cleanup();
  });

  it('membungkus header dan kontrol dalam satu blok sticky', () => {
    const { container } = render(
      <SurahDetailTopChrome>
        <header>Surah Header</header>
        <div>Reading Controls</div>
      </SurahDetailTopChrome>,
    );

    const root = container.firstElementChild;
    expect(root?.className.includes('sticky')).toBe(true);
    expect(root?.className.includes('safe-area-inset-top')).toBe(true);
    expect(root?.className.includes('z-30')).toBe(true);
    expect(screen.getByText('Surah Header')).toBeTruthy();
    expect(screen.getByText('Reading Controls')).toBeTruthy();
  });
});
