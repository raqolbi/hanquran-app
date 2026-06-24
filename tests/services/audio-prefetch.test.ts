import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';
import {
  AudioPrefetchBuffer,
  injectAudioPrefetchHint,
  removeAudioPrefetchHints,
} from '@/services/audio-prefetch';

const sampleUrl = fixtureAyahAudioUrl(1, 2);

describe('audio-prefetch', () => {
  beforeEach(() => {
    removeAudioPrefetchHints();
  });

  afterEach(() => {
    removeAudioPrefetchHints();
  });

  describe('injectAudioPrefetchHint', () => {
    it('menambahkan link prefetch ke head', () => {
      injectAudioPrefetchHint(sampleUrl);

      const link = document.head.querySelector(
        'link[data-hanquran-audio-prefetch]',
      );
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe(sampleUrl);
      expect(link?.getAttribute('rel')).toBe('prefetch');
    });

    it('tidak menduplikasi hint untuk URL yang sama', () => {
      injectAudioPrefetchHint(sampleUrl);
      injectAudioPrefetchHint(sampleUrl);

      const links = document.head.querySelectorAll(
        'link[data-hanquran-audio-prefetch]',
      );
      expect(links).toHaveLength(1);
    });
  });

  describe('AudioPrefetchBuffer', () => {
    it('memuat URL ke elemen audio tersembunyi', () => {
      const audio = document.createElement('audio');
      const loadSpy = vi.spyOn(audio, 'load').mockImplementation(() => {});
      const buffer = new AudioPrefetchBuffer(audio);

      buffer.load(sampleUrl);

      expect(buffer.currentUrl).toBe(sampleUrl);
      expect(audio.src).toContain('001002.mp3');
      expect(loadSpy).toHaveBeenCalled();
    });

    it('tidak memuat ulang URL yang sama', () => {
      const audio = document.createElement('audio');
      const loadSpy = vi.spyOn(audio, 'load').mockImplementation(() => {});
      const buffer = new AudioPrefetchBuffer(audio);

      buffer.load(sampleUrl);
      buffer.load(sampleUrl);

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });
});
