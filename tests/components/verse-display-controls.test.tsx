import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VerseDisplayControls } from '@/components/verse-display-controls';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('VerseDisplayControls', () => {
  const defaultProps = {
    showTranslation: true,
    showTransliteration: false,
    onToggleTranslation: vi.fn(),
    onToggleTransliteration: vi.fn(),
    onFocusMode: vi.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  it('menerapkan sticky + safe-area saat sticky default aktif', () => {
    const { container } = render(<VerseDisplayControls {...defaultProps} />);
    const root = container.firstElementChild;

    expect(root?.className.includes('sticky')).toBe(true);
    expect(root?.className.includes('safe-area-inset-top')).toBe(true);
    expect(root?.className.includes('z-30')).toBe(true);
    expect(root?.className.includes('border-b')).toBe(true);
  });

  it('tidak sticky saat sticky=false', () => {
    const { container } = render(
      <VerseDisplayControls {...defaultProps} sticky={false} />,
    );
    const root = container.firstElementChild;

    expect(root?.className.includes('sticky')).toBe(false);
  });

  it('menampilkan tiga kontrol baca', () => {
    const { container } = render(<VerseDisplayControls {...defaultProps} />);
    const buttons = container.querySelectorAll('button');

    expect(buttons.length).toBe(3);
  });
});
