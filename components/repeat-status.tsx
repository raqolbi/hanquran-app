'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { INFINITE, type RepeatCount, type RepeatTarget } from '@/lib/repeat-options';

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

  const totalLabel = repeatCount === INFINITE ? '∞' : `${repeatCount}`;
  const isInfinite = repeatCount === INFINITE;

  let title: string;
  let details: string[];

  switch (targetType) {
    case 'current_ayah': {
      const remainingCount = Math.max(0, (repeatCount as number) - currentCycle + 1);
      const remainingLabel = isInfinite
        ? t('remainingInfinite')
        : t('remainingCount', { count: remainingCount });
      title = t('statusActiveAyah');
      details = [t('statusAyahDetail', { ayah: activeAyah, remaining: remainingLabel })];
      break;
    }
    case 'ayah_range': {
      const from = rangeFrom ?? 1;
      const to = rangeTo ?? totalAyahs;
      title = t('statusRange', { from, to });
      details = [
        t('cycleProgress', { current: currentCycle, total: totalLabel }),
        t('atAyah', { ayah: activeAyah }),
      ];
      break;
    }
    case 'entire_surah': {
      title = t('statusSurah', { name: surahName });
      details = [
        t('cycleProgress', { current: currentCycle, total: totalLabel }),
        t('atAyahOfTotal', { current: activeAyah, total: totalAyahs }),
      ];
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
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="text-sm leading-none">
          🟢
        </span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="mt-0.5 space-y-0.5">
        {details.map((line) => (
          <p key={line} className="text-xs text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export type { RepeatStatusProps };
