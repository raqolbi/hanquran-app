import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dismissAppToast,
  getAppToast,
  showAppToast,
  subscribeAppToast,
} from '@/lib/app-toast';

describe('app-toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dismissAppToast();
  });

  afterEach(() => {
    dismissAppToast();
    vi.useRealTimers();
  });

  it('menampilkan dan menghapus toast otomatis', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAppToast(listener);

    showAppToast('Audio tidak tersedia offline');

    expect(getAppToast()?.message).toBe('Audio tidak tersedia offline');
    expect(listener).toHaveBeenCalled();

    vi.advanceTimersByTime(4000);

    expect(getAppToast()).toBeNull();
    unsubscribe();
  });

  it('dapat ditutup manual', () => {
    showAppToast('Pesan uji');

    dismissAppToast();

    expect(getAppToast()).toBeNull();
  });
});
