import { describe, expect, it } from 'vitest';

import { AYAH_AUDIO_BASE_URL } from '@/services/quran/audio-config';
import { buildAyahAudioUrl, getDefaultReciterId, getNextAyahPrefetchUrl } from '@/services/quran/audio-service';

describe('services/quran/audio-service', () => {
  it('membangun URL audio tilawah untuk satu ayat', () => {
    const reciterId = getDefaultReciterId();
    const url = buildAyahAudioUrl(reciterId, 1, 1);

    expect(url.startsWith(`${AYAH_AUDIO_BASE_URL}/`)).toBe(true);
    expect(url).toContain('/001001.mp3');
  });

  it('getNextAyahPrefetchUrl mengembalikan ayat berikutnya', () => {
    const reciterId = getDefaultReciterId();
    const url = getNextAyahPrefetchUrl(reciterId, 1, 1, 7);

    expect(url).toBe(buildAyahAudioUrl(reciterId, 1, 2));
  });

  it('getNextAyahPrefetchUrl null di ayat terakhir', () => {
    const reciterId = getDefaultReciterId();
    expect(getNextAyahPrefetchUrl(reciterId, 1, 7, 7)).toBeNull();
  });
});
