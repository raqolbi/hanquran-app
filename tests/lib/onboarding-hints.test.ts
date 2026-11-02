// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  isHintSeen,
  markHintSeen,
  resetHintsForTest,
  useHintSeen,
} from '@/lib/onboarding-hints';

describe('onboarding-hints', () => {
  afterEach(() => {
    window.localStorage.clear();
    resetHintsForTest();
  });

  it('belum dilihat → tandai → tersimpan di localStorage', () => {
    expect(isHintSeen('word-loop')).toBe(false);
    markHintSeen('word-loop');
    expect(isHintSeen('word-loop')).toBe(true);
    expect(window.localStorage.getItem('hanquran:hint-seen:word-loop')).toBe('1');
    expect(isHintSeen('word-loop-stop')).toBe(false);
  });

  it('hook ikut berubah saat petunjuk ditandai', () => {
    const { result } = renderHook(() => useHintSeen('word-loop-stop'));
    expect(result.current).toBe(false);
    act(() => markHintSeen('word-loop-stop'));
    expect(result.current).toBe(true);
  });
});
