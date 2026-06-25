import { describe, expect, it, vi } from 'vitest';

import {
  AUTO_FOLLOW_PROGRAMMATIC_SCROLL_MS,
  AUTO_FOLLOW_SCROLL_RESUME_MS,
  computeScrollDeltaForReadableZone,
  getAutoFollowProgrammaticScrollClearDelay,
  getAutoFollowResumeTimestamp,
  getAyahElementId,
  getReadableViewport,
  getScrollBehavior,
  isAutoFollowSuspended,
  isAyahVisibleInReadableZone,
  measureSurahDetailTopInset,
  scrollAyahIntoReadableZone,
  shouldAutoFollowScroll,
} from '@/lib/auto-follow-playback';

describe('auto-follow-playback', () => {
  const viewport = getReadableViewport(800, 200, 68);

  describe('isAyahVisibleInReadableZone', () => {
    it('menganggap ayat terlihat jika overlap zona baca', () => {
      expect(
        isAyahVisibleInReadableZone({ top: 100, bottom: 300 }, viewport),
      ).toBe(true);
    });

    it('menganggap ayat tidak terlihat jika sepenuhnya di atas zona baca', () => {
      expect(
        isAyahVisibleInReadableZone({ top: 10, bottom: 60 }, viewport),
      ).toBe(false);
    });

    it('menganggap ayat tidak terlihat jika sepenuhnya di bawah chrome bawah', () => {
      expect(
        isAyahVisibleInReadableZone({ top: 650, bottom: 750 }, viewport),
      ).toBe(false);
    });
  });

  describe('computeScrollDeltaForReadableZone', () => {
    it('mengembalikan delta negatif saat ayat di atas zona baca (wrap ke ayat pertama)', () => {
      expect(
        computeScrollDeltaForReadableZone({ top: -1200, bottom: -1000 }, viewport),
      ).toBe(-1268);
    });

    it('mengembalikan delta positif saat ayat di bawah chrome bawah', () => {
      expect(
        computeScrollDeltaForReadableZone({ top: 650, bottom: 750 }, viewport),
      ).toBe(150);
    });

    it('mengembalikan 0 jika ayat sudah dalam zona baca', () => {
      expect(
        computeScrollDeltaForReadableZone({ top: 120, bottom: 220 }, viewport),
      ).toBe(0);
    });
  });

  describe('measureSurahDetailTopInset', () => {
    it('mengukur bawah chrome sticky dari DOM', () => {
      const chrome = document.createElement('div');
      chrome.setAttribute('data-surah-detail-top-chrome', '');
      chrome.getBoundingClientRect = () =>
        ({
          top: 0,
          bottom: 248,
          left: 0,
          right: 0,
          width: 0,
          height: 248,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      document.body.appendChild(chrome);

      expect(measureSurahDetailTopInset(68)).toBe(248);

      document.body.innerHTML = '';
    });
  });

  describe('shouldAutoFollowScroll', () => {
    it('tidak scroll jika fitur dimatikan', () => {
      const element = document.createElement('div');

      expect(
        shouldAutoFollowScroll({
          enabled: false,
          isPlaying: true,
          suspendedUntil: 0,
          element,
          viewport,
        }),
      ).toBe(false);
    });

    it('tidak scroll jika audio tidak diputar', () => {
      const element = document.createElement('div');

      expect(
        shouldAutoFollowScroll({
          enabled: true,
          isPlaying: false,
          suspendedUntil: 0,
          element,
          viewport,
        }),
      ).toBe(false);
    });

    it('tidak scroll saat suspend setelah scroll manual', () => {
      const element = document.createElement('div');
      element.getBoundingClientRect = () =>
        ({
          top: 650,
          bottom: 750,
          left: 0,
          right: 0,
          width: 0,
          height: 100,
          x: 0,
          y: 650,
          toJSON: () => ({}),
        }) as DOMRect;

      expect(
        shouldAutoFollowScroll({
          enabled: true,
          isPlaying: true,
          suspendedUntil: Date.now() + 1000,
          element,
          viewport,
        }),
      ).toBe(false);
    });

    it('scroll jika ayat di luar zona baca dan tidak suspend', () => {
      const element = document.createElement('div');
      element.getBoundingClientRect = () =>
        ({
          top: 650,
          bottom: 750,
          left: 0,
          right: 0,
          width: 0,
          height: 100,
          x: 0,
          y: 650,
          toJSON: () => ({}),
        }) as DOMRect;

      expect(
        shouldAutoFollowScroll({
          enabled: true,
          isPlaying: true,
          suspendedUntil: 0,
          element,
          viewport,
        }),
      ).toBe(true);
    });

    it('tidak scroll jika ayat masih terlihat', () => {
      const element = document.createElement('div');
      element.getBoundingClientRect = () =>
        ({
          top: 120,
          bottom: 220,
          left: 0,
          right: 0,
          width: 0,
          height: 100,
          x: 0,
          y: 120,
          toJSON: () => ({}),
        }) as DOMRect;

      expect(
        shouldAutoFollowScroll({
          enabled: true,
          isPlaying: true,
          suspendedUntil: 0,
          element,
          viewport,
        }),
      ).toBe(false);
    });
  });

  describe('scrollAyahIntoReadableZone', () => {
    it('memanggil window.scrollTo dengan posisi presisi di bawah chrome atas', () => {
      const element = document.createElement('div');
      element.getBoundingClientRect = () =>
        ({
          top: -500,
          bottom: -300,
          left: 0,
          right: 0,
          width: 0,
          height: 200,
          x: 0,
          y: -500,
          toJSON: () => ({}),
        }) as DOMRect;

      const scrollTo = vi.fn();
      vi.stubGlobal('scrollTo', scrollTo);
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 3000,
      });

      scrollAyahIntoReadableZone(element, viewport, true, 3000);

      expect(scrollTo).toHaveBeenCalledWith({
        top: 2432,
        behavior: 'smooth',
      });

      vi.unstubAllGlobals();
    });

    it('memanggil window.scrollTo ke bawah jika ayat di bawah chrome bawah', () => {
      const element = document.createElement('div');
      element.getBoundingClientRect = () =>
        ({
          top: 650,
          bottom: 750,
          left: 0,
          right: 0,
          width: 0,
          height: 100,
          x: 0,
          y: 650,
          toJSON: () => ({}),
        }) as DOMRect;

      const scrollTo = vi.fn();
      vi.stubGlobal('scrollTo', scrollTo);
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 1000,
      });

      scrollAyahIntoReadableZone(element, viewport, false, 1000);

      expect(scrollTo).toHaveBeenCalledWith({
        top: 1150,
        behavior: 'instant',
      });

      vi.unstubAllGlobals();
    });
  });

  describe('getScrollBehavior', () => {
    it('mengembalikan smooth atau instant sesuai preferensi', () => {
      expect(getScrollBehavior(true)).toBe('smooth');
      expect(getScrollBehavior(false)).toBe('instant');
    });
  });

  describe('helpers', () => {
    it('getAyahElementId menghasilkan id stabil', () => {
      expect(getAyahElementId(3)).toBe('ayah-3');
    });

    it('isAutoFollowSuspended memeriksa timestamp', () => {
      expect(isAutoFollowSuspended(1000, 500)).toBe(true);
      expect(isAutoFollowSuspended(500, 1000)).toBe(false);
    });

    it('getAutoFollowResumeTimestamp menambah jeda default', () => {
      expect(getAutoFollowResumeTimestamp(1000)).toBe(
        1000 + AUTO_FOLLOW_SCROLL_RESUME_MS,
      );
    });

    it('getAutoFollowProgrammaticScrollClearDelay lebih lama untuk animasi halus', () => {
      expect(getAutoFollowProgrammaticScrollClearDelay(true)).toBe(
        AUTO_FOLLOW_PROGRAMMATIC_SCROLL_MS,
      );
      expect(getAutoFollowProgrammaticScrollClearDelay(false)).toBe(50);
    });
  });
});
