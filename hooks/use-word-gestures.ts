'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Tahan sebelum mulai memilih rentang di layar sentuh (docs/38 §3.2). */
export const WORD_LONG_PRESS_MS = 350;
/** Gerak jari lebih dari ini sebelum tahan selesai = gulir, bukan pilih. */
const MOVE_CANCEL_PX = 10;

export interface WordSelection {
  anchor: number;
  current: number;
}

interface UseWordGesturesInput {
  enabled: boolean;
  /** Ketuk/klik satu kata. `extend` = Shift ditekan (perluas rentang). */
  onTap: (index: number, extend: boolean) => void;
  /** Rentang selesai dipilih (urutan bebas, inklusif). */
  onRange: (anchor: number, current: number) => void;
}

function wordIndexAt(
  container: HTMLElement,
  x: number,
  y: number,
): number | null {
  const element = document.elementFromPoint(x, y);
  const word = element?.closest<HTMLElement>('[data-word-index]');
  if (!word || !container.contains(word)) return null;
  const index = Number(word.dataset.wordIndex);
  return Number.isInteger(index) ? index : null;
}

function wordIndexOf(target: EventTarget | null, container: HTMLElement): number | null {
  if (!(target instanceof Element)) return null;
  const word = target.closest<HTMLElement>('[data-word-index]');
  if (!word || !container.contains(word)) return null;
  const index = Number(word.dataset.wordIndex);
  return Number.isInteger(index) ? index : null;
}

/**
 * Gestur kata untuk Ulang Kata:
 * - ketuk/klik → `onTap`
 * - sentuh: tekan lama ±350 ms lalu seret → `onRange` (gulir biasa tidak
 *   memicu pilihan karena gerak sebelum 350 ms membatalkan)
 * - mouse: tekan lalu seret ke kata lain → `onRange`
 * - keyboard: Enter/Spasi (+Shift) pada kata → `onTap`; ←/→/Home/End
 *   memindah fokus antar-kata (roving tabindex — satu tab stop per ayat)
 *
 * Seluruhnya lewat event delegation pada wadah teks ayat, jadi tidak ada
 * listener per kata.
 */
export function useWordGestures(
  containerRef: RefObject<HTMLElement | null>,
  { enabled, onTap, onRange }: UseWordGesturesInput,
): WordSelection | null {
  const [selection, setSelection] = useState<WordSelection | null>(null);
  const handlers = useRef({ onTap, onRange });
  useEffect(() => {
    handlers.current = { onTap, onRange };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    let pointerId: number | null = null;
    let pointerType = '';
    let startX = 0;
    let startY = 0;
    let anchor: number | null = null;
    let current: number | null = null;
    let selecting = false;
    /** Gestur barusan menghasilkan rentang — klik berikutnya diabaikan. */
    let suppressClick = false;
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    const clearLongPress = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = null;
    };

    const reset = () => {
      clearLongPress();
      pointerId = null;
      anchor = null;
      current = null;
      selecting = false;
      setSelection(null);
    };

    const beginSelecting = () => {
      if (anchor === null) return;
      selecting = true;
      current ??= anchor;
      setSelection({ anchor, current });
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(10);
        } catch {
          // abaikan
        }
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerId !== null) return;
      suppressClick = false;
      const index = wordIndexOf(event.target, container);
      if (index === null) return;
      pointerId = event.pointerId;
      pointerType = event.pointerType;
      startX = event.clientX;
      startY = event.clientY;
      anchor = index;
      current = index;
      if (pointerType !== 'mouse') {
        longPressTimer = setTimeout(beginSelecting, WORD_LONG_PRESS_MS);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId || anchor === null) return;

      if (!selecting) {
        if (pointerType === 'mouse') {
          const index = wordIndexAt(container, event.clientX, event.clientY);
          if (index !== null && index !== anchor) {
            current = index;
            beginSelecting();
          }
          return;
        }
        const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
        if (moved > MOVE_CANCEL_PX) reset(); // gulir halaman
        return;
      }

      const index = wordIndexAt(container, event.clientX, event.clientY);
      if (index !== null && index !== current) {
        current = index;
        setSelection({ anchor, current: index });
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      if (selecting && anchor !== null && current !== null) {
        suppressClick = true;
        handlers.current.onRange(anchor, current);
      }
      reset();
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerId === pointerId) reset();
    };

    // Tahan jari di atas kata: cegah gulir hanya saat sedang memilih.
    const onTouchMove = (event: TouchEvent) => {
      if (selecting && event.cancelable) event.preventDefault();
    };

    // Menu konteks (tekan lama) di Android/desktop mengganggu pemilihan.
    const onContextMenu = (event: Event) => {
      if (wordIndexOf(event.target, container) !== null) event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      const index = wordIndexOf(event.target, container);
      if (index === null) return;
      event.stopPropagation();
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      handlers.current.onTap(index, event.shiftKey);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const index = wordIndexOf(event.target, container);
      if (index === null) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        handlers.current.onTap(index, event.shiftKey);
        return;
      }

      // Roving focus antar-kata (hanya satu kata di urutan Tab). Teks RTL:
      // panah kiri = kata berikutnya, panah kanan = kata sebelumnya.
      const words = container.querySelectorAll<HTMLElement>('[data-word-index]');
      let target: number | null = null;
      if (event.key === 'ArrowLeft') target = index + 1;
      else if (event.key === 'ArrowRight') target = index - 1;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = words.length - 1;
      if (target === null || event.altKey || event.ctrlKey || event.metaKey) return;

      event.preventDefault();
      event.stopPropagation();
      words[Math.min(Math.max(target, 0), words.length - 1)]?.focus();
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('contextmenu', onContextMenu);
    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);

    return () => {
      clearLongPress();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('contextmenu', onContextMenu);
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
      setSelection(null);
    };
  }, [containerRef, enabled]);

  return selection;
}
