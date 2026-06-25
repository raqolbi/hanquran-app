'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { RepeatProgressBadge } from '@/components/repeat-progress-badge';
import { type RepeatCount, type RepeatTarget } from '@/lib/repeat-options';
import { cn } from '@/lib/utils';

interface RepeatStatusProps {
  targetType: RepeatTarget;
  repeatCount: RepeatCount;
  currentCycle: number;
  activeAyah: number;
  totalAyahs: number;
  rangeFrom?: number;
  rangeTo?: number;
  surahName: string;
  className?: string;
}

export function RepeatStatus({
  targetType,
  repeatCount,
  currentCycle,
  activeAyah,
  totalAyahs,
  rangeFrom,
  rangeTo,
  surahName,
  className,
}: RepeatStatusProps) {
  const t = useTranslations('repeat');

  let contextLabel: string;
  let detail: string | null = null;

  switch (targetType) {
    case 'current_ayah': {
      contextLabel = t('statusActiveAyah');
      detail = t('atAyah', { ayah: activeAyah });
      break;
    }
    case 'ayah_range': {
      const from = rangeFrom ?? 1;
      const to = rangeTo ?? totalAyahs;
      contextLabel = t('statusRange', { from, to });
      detail = t('atAyah', { ayah: activeAyah });
      break;
    }
    case 'entire_surah': {
      contextLabel = t('statusSurah', { name: surahName });
      detail = t('atAyahOfTotal', { current: activeAyah, total: totalAyahs });
      break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden className="text-sm leading-none">
            🟢
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {contextLabel}
          </span>
        </div>
        <RepeatProgressBadge
          current={currentCycle}
          total={repeatCount}
          className="text-xs"
        />
      </div>
      {detail ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </motion.div>
  );
}

export type { RepeatStatusProps };
