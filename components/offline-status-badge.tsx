'use client';

import { AlertTriangle, Download, Wifi, WifiOff } from 'lucide-react';

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

interface BadgeVariant {
  label: string;
  icon: React.ReactNode;
  tone: string;
}

const VARIANTS: Record<ConnectionStatus, BadgeVariant> = {
  online: {
    label: 'Online',
    icon: <Wifi size={14} aria-hidden />,
    tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  offline_ready: {
    label: 'Offline Siap Digunakan',
    icon: <span className="text-base leading-none" aria-hidden>🟢</span>,
    tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  downloading: {
    label: 'Sedang Mengunduh',
    icon: <Download size={14} aria-hidden />,
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  download_failed: {
    label: 'Gagal Mengunduh',
    icon: <AlertTriangle size={14} aria-hidden />,
    tone: 'bg-red-50 text-red-700 border-red-200',
  },
  offline: {
    label: 'Offline',
    icon: <WifiOff size={14} aria-hidden />,
    tone: 'bg-muted text-muted-foreground border-border',
  },
};

/**
 * Spec §21: Badge status koneksi & cache.
 * Mendukung 5 state: online, offline_ready, downloading, download_failed, offline.
 */
export function OfflineStatusBadge({
  status,
  className,
}: OfflineStatusBadgeProps) {
  const variant = VARIANTS[status];

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
