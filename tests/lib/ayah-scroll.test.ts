// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { scrollToAyah } from '@/lib/ayah-scroll';

describe('scrollToAyah', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('scroll ke kartu ayat yang ada di DOM', () => {
    const card = document.createElement('div');
    card.id = 'ayah-3';
    document.body.appendChild(card);
    const scrollSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {});

    expect(scrollToAyah(3, 0)).toBe(true);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  it('tidak scroll bila kartu ayat belum dirender', () => {
    const scrollSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {});

    expect(scrollToAyah(42, 0)).toBe(false);
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
