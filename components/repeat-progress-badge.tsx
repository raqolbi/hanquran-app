'use client';

import { useTranslations } from 'next-intl';

import { formatRepeatProgressLabel } from '@/lib/repeat-progress';
import { INFINITE, type RepeatCount } from '@/lib/repeat-options';
import { cn } from '@/lib/utils';

interface RepeatProgressBadgeProps {
  current: number;
  total: RepeatCount;
  className?: string;
}

export function RepeatProgressBadge({
  current,
  total,
  className,
}: RepeatProgressBadgeProps) {
  const t = useTranslations('repeat');
  const label = formatRepeatProgressLabel(current, total);
  const totalLabel = total === INFINITE ? '∞' : String(total);

  return (
    <span
      className={cn(
        'shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-emerald-800',
        className,
      )}
      aria-label={t('progressAriaLabel', { current, total: totalLabel })}
    >
      {label}
    </span>
  );
}
