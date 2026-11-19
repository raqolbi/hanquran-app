import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { storedAudioUsage, usesFileAudioStore } from '@/services/audio-store/audio-store';

export interface AudioCacheStats {
  entryCount: number;
  totalSizeBytes: number;
}

/** Ukur ukuran aktual cache audio di Cache Storage (sumber kebenaran tampilan Settings). */
export async function measureAudioCacheStats(): Promise<AudioCacheStats> {
  // APK: audio di folder data (`docs/30` §2.2a).
  if (usesFileAudioStore()) {
    const usage = await storedAudioUsage();
    return { entryCount: usage.files, totalSizeBytes: usage.bytes };
  }
  if (typeof caches === 'undefined') {
    return { entryCount: 0, totalSizeBytes: 0 };
  }

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    if (typeof cache.keys !== 'function') {
      return { entryCount: 0, totalSizeBytes: 0 };
    }

    const requests = await cache.keys();
    let totalSizeBytes = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;
      const blob = await response.blob();
      totalSizeBytes += blob.size;
    }

    return { entryCount: requests.length, totalSizeBytes };
  } catch {
    return { entryCount: 0, totalSizeBytes: 0 };
  }
}
