'use client';

import { AlertTriangle, Download, Wifi, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export type ConnectionStatus =
  | 'online'
  | 'offline_ready'
  | 'downloading'
  | 'download_failed'
  | 'offline';

interface OfflineStatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
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
    >
      {variant.icon}
      {variant.label}
    </span>
  );
}
