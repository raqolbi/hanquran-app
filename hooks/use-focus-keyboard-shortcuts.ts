'use client';

import { useEffect, useRef } from 'react';

interface FocusKeyboardShortcutsInput {
  /** Matikan saat dialog terbuka agar tombol tidak bentrok. */
  enabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

/** Elemen yang memakai tombol panah/spasi sendiri — jangan diambil alih. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return !!target.closest(
    'input, textarea, select, button, a[href], [role="slider"], [role="listbox"], [role="combobox"], [role="dialog"], [role="menu"]',
  );
}

/**
 * Pintasan keyboard Mode Fokus (desktop):
 * - ← ayat sebelumnya, → ayat berikutnya (searah tombol ⏮/⏭)
 * - Spasi putar/jeda
 *
 * Diabaikan bila ada tombol pengubah (Ctrl/Alt/Meta) atau fokus sedang di
 * kontrol lain (tombol, slider, input, dialog) supaya perilaku bawaannya tetap.
 */
export function useFocusKeyboardShortcuts(input: FocusKeyboardShortcutsInput): void {
  const latest = useRef(input);
  useEffect(() => {
    latest.current = input;
  });

  const { enabled } = input;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
      if (isInteractiveTarget(event.target)) return;

      const current = latest.current;
      switch (event.key) {
        case 'ArrowLeft':
          if (current.isPreviousDisabled) return;
          event.preventDefault();
          current.onPrevious();
          break;
        case 'ArrowRight':
          if (current.isNextDisabled) return;
          event.preventDefault();
          current.onNext();
          break;
        case ' ':
          if (event.repeat) return;
          event.preventDefault();
          current.onTogglePlay();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
