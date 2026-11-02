// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFocusKeyboardShortcuts } from '@/hooks/use-focus-keyboard-shortcuts';

function setup(overrides: Partial<Parameters<typeof useFocusKeyboardShortcuts>[0]> = {}) {
  const props = {
    enabled: true,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onTogglePlay: vi.fn(),
    isPreviousDisabled: false,
    isNextDisabled: false,
    ...overrides,
  };
  const hook = renderHook((p) => useFocusKeyboardShortcuts(p), { initialProps: props });
  return { props, hook };
}

function press(key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe('useFocusKeyboardShortcuts', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('panah kiri/kanan berpindah ayat, spasi putar/jeda', () => {
    const { props } = setup();
    expect(press('ArrowLeft').defaultPrevented).toBe(true);
    press('ArrowRight');
    press(' ');
    expect(props.onPrevious).toHaveBeenCalledTimes(1);
    expect(props.onNext).toHaveBeenCalledTimes(1);
    expect(props.onTogglePlay).toHaveBeenCalledTimes(1);
  });

  it('tidak berpindah bila tombol arah itu nonaktif', () => {
    const { props } = setup({ isPreviousDisabled: true });
    expect(press('ArrowLeft').defaultPrevented).toBe(false);
    expect(props.onPrevious).not.toHaveBeenCalled();
  });

  it('mengabaikan tombol pengubah dan fokus di kontrol lain', () => {
    const { props } = setup();
    press('ArrowRight', document.body, { ctrlKey: true });
    const button = document.createElement('button');
    document.body.append(button);
    press(' ', button);
    const input = document.createElement('input');
    document.body.append(input);
    press('ArrowRight', input);
    expect(props.onNext).not.toHaveBeenCalled();
    expect(props.onTogglePlay).not.toHaveBeenCalled();
  });

  it('nonaktif saat dialog terbuka (enabled=false)', () => {
    const { props } = setup({ enabled: false });
    press('ArrowRight');
    expect(props.onNext).not.toHaveBeenCalled();
  });
});
