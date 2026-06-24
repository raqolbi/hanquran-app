'use client';

import { useMemo } from 'react';

import type { Reciter } from '@/services/quran';
import { getDefaultReciterId, getReciters } from '@/services/quran';

interface UseRecitersResult {
  reciters: Reciter[];
  defaultReciterId: string;
}

export function useReciters(): UseRecitersResult {
  return useMemo(
    () => ({
      reciters: getReciters(),
      defaultReciterId: getDefaultReciterId(),
    }),
    [],
  );
}
