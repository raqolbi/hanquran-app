import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTrackSurahOpened } from '@/hooks/use-track-surah-opened';

const trackSurahOpenedMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/analytics', () => ({
  trackSurahOpened: trackSurahOpenedMock,
}));

function SurahTracker({
  surah,
}: {
  surah: { number: number; englishName: string };
}) {
  useTrackSurahOpened(surah);
  return null;
}

describe('useTrackSurahOpened', () => {
  beforeEach(() => {
    trackSurahOpenedMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('mencatat surah_opened sekali saat mount', () => {
    const surah = { number: 1, englishName: 'Al-Fatihah' };

    const { rerender } = render(<SurahTracker surah={surah} />);

    expect(trackSurahOpenedMock).toHaveBeenCalledTimes(1);
    expect(trackSurahOpenedMock).toHaveBeenCalledWith({
      surahId: 1,
      surahName: 'Al-Fatihah',
    });

    rerender(<SurahTracker surah={surah} />);

    expect(trackSurahOpenedMock).toHaveBeenCalledTimes(1);
  });

  it('mencatat ulang saat surahId berubah', () => {
    const { rerender } = render(
      <SurahTracker surah={{ number: 1, englishName: 'Al-Fatihah' }} />,
    );

    rerender(<SurahTracker surah={{ number: 2, englishName: 'Al-Baqarah' }} />);

    expect(trackSurahOpenedMock).toHaveBeenCalledTimes(2);
    expect(trackSurahOpenedMock).toHaveBeenLastCalledWith({
      surahId: 2,
      surahName: 'Al-Baqarah',
    });
  });
});
