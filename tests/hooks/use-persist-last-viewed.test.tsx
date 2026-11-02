// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePersistLastViewed } from '@/hooks/use-persist-last-viewed';
import { useUserStore } from '@/stores/userStore';

describe('usePersistLastViewed', () => {
  const setLastViewed = vi.fn(async () => {});

  beforeEach(() => {
    setLastViewed.mockClear();
    useUserStore.setState({ initialized: true, setLastViewed });
  });

  it('tidak menyimpan saat surat hanya dibuka (belum ada interaksi)', () => {
    renderHook(() => usePersistLastViewed(2, 1, false));
    expect(setLastViewed).not.toHaveBeenCalled();
  });

  it('menyimpan setelah ada interaksi dan mengikuti perpindahan ayat', () => {
    const { rerender } = renderHook(
      ({ ayah, engaged }) => usePersistLastViewed(2, ayah, engaged),
      { initialProps: { ayah: 1, engaged: false } },
    );
    expect(setLastViewed).not.toHaveBeenCalled();

    rerender({ ayah: 1, engaged: true });
    expect(setLastViewed).toHaveBeenLastCalledWith(2, 1);

    rerender({ ayah: 5, engaged: true });
    expect(setLastViewed).toHaveBeenLastCalledWith(2, 5);
  });

  it('menunggu store siap', () => {
    useUserStore.setState({ initialized: false });
    renderHook(() => usePersistLastViewed(2, 3, true));
    expect(setLastViewed).not.toHaveBeenCalled();
  });
});
