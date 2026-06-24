import { AYAH_AUDIO_BASE_URL } from '@/services/quran/audio-config';

const DEFAULT_RECITER = 'Alafasy_128kbps';

/** URL audio tilawah contoh untuk pengujian. */
export function fixtureAyahAudioUrl(
  surah: number,
  ayah: number,
  reciterId = DEFAULT_RECITER,
): string {
  return `${AYAH_AUDIO_BASE_URL}/${reciterId}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
}

export { DEFAULT_RECITER, AYAH_AUDIO_BASE_URL };
