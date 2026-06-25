import { describe, expect, it } from 'vitest';

import { SHORT_LANDSCAPE_MEDIA, DESKTOP_DIALOG_MEDIA } from '@/lib/viewport';

describe('viewport media queries', () => {
  it('menargetkan landscape dengan tinggi viewport terbatas', () => {
    expect(SHORT_LANDSCAPE_MEDIA).toContain('landscape');
    expect(SHORT_LANDSCAPE_MEDIA).toContain('max-height');
  });

  it('desktop dialog membutuhkan lebar dan tinggi cukup', () => {
    expect(DESKTOP_DIALOG_MEDIA).toContain('min-width: 768px');
    expect(DESKTOP_DIALOG_MEDIA).toContain('min-height');
  });
});
