'use client';

import { AlertTriangle, Download, Wifi, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/types';

export type { ConnectionStatus };

type ConnectionIndicatorStatus = Extract<
  ConnectionStatus,
  'online' | 'offline_ready' | 'offline'
>;

interface OfflineStatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

interface ConnectionIndicatorProps {
  status: ConnectionIndicatorStatus;
  className?: string;
  /** Gaya ringkas di Header gradien (teks putih). */
  variant?: 'default' | 'header';
}

const INDICATOR_COLORS: Record<ConnectionIndicatorStatus, string> = {
  online: '#10B981',
  offline_ready: '#10B981',
  offline: '#9CA3AF',
};

/**
 * Indikator koneksi ringkas untuk Header — hanya 3 state (docs/12 §22).
 * State `downloading` / `download_failed` tidak ditampilkan di header.
 */
export function ConnectionIndicator({
  status,
  className,
  variant = 'default',
}: ConnectionIndicatorProps) {
  const t = useTranslations('common');

  const labels: Record<ConnectionIndicatorStatus, string> = {
    online: t('online'),
    offline_ready: t('offlineReady'),
    offline: t('offline'),
  };

  if (variant === 'header') {
    return (
      <div
        className={cn('flex items-center gap-1.5', className)}
        role="status"
        aria-live="polite"
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: INDICATOR_COLORS[status] }}
          aria-hidden
        />
        <p className="text-xs text-white/70">{labels[status]}</p>
      </div>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: INDICATOR_COLORS[status] }}
        aria-hidden
      />
      {labels[status]}
    </span>
  );
}

export function OfflineStatusBadge({
  status,
  className,
}: OfflineStatusBadgeProps) {
  const t = useTranslations('common');

  const variants: Record<
    ConnectionStatus,
    { label: string; icon: React.ReactNode; tone: string }
  > = {
    online: {
      label: t('online'),
      icon: <Wifi size={14} aria-hidden />,
      tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    offline_ready: {
      label: t('offlineReadyLong'),
      icon: <span className="text-base leading-none" aria-hidden>🟢</span>,
      tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    downloading: {
      label: t('downloading'),
      icon: <Download size={14} aria-hidden />,
      tone: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    download_failed: {
      label: t('downloadFailed'),
      icon: <AlertTriangle size={14} aria-hidden />,
      tone: 'bg-red-50 text-red-700 border-red-200',
    },
    offline: {
      label: t('offline'),
      icon: <WifiOff size={14} aria-hidden />,
      tone: 'bg-muted text-muted-foreground border-border',
    },
  };

  const variant = variants[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        variant.tone,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {variant.icon}
      {variant.label}
    </span>
  );
}
