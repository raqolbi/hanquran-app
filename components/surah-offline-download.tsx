'use client';

import { Download, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { OfflineStatusBadge } from '@/components/offline-status-badge';
import { useSurahOfflineDownload } from '@/hooks/use-surah-offline-download';
import { cn } from '@/lib/utils';

interface SurahOfflineDownloadProps {
  surahId: number;
  ayahCount: number;
  reciterId: string;
  className?: string;
}

/**
 * Aksi unduh audio surat untuk pemakaian offline (docs/15 §12.3–12.4).
 * Ditempatkan di Surah Detail — bukan di setiap kartu daftar surat.
 */
export function SurahOfflineDownload({
  surahId,
  ayahCount,
  reciterId,
  className,
}: SurahOfflineDownloadProps) {
  const t = useTranslations('surah');
  const {
    saveOffline,
    isOfflineReady,
    isDownloading,
    canSave,
    badgeStatus,
    progress,
    errorMessage,
    downloadStatus,
  } = useSurahOfflineDownload({ surahId, ayahCount, reciterId });

  if (isOfflineReady) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {badgeStatus ? <OfflineStatusBadge status={badgeStatus} /> : null}

      {isDownloading && progress ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {t('offlineDownloadProgress', {
            completed: progress.completed,
            total: progress.total,
          })}
        </p>
      ) : null}

      {downloadStatus === 'failed' && errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void saveOffline()}
        disabled={!canSave}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
        aria-label={t('saveOfflineAriaLabel')}
      >
        {isDownloading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <Download size={16} aria-hidden />
        )}
        {isDownloading ? t('saveOfflineDownloading') : t('saveOffline')}
      </button>

      {!canSave && !isDownloading && downloadStatus !== 'failed' ? (
        <p className="text-xs text-muted-foreground">{t('saveOfflineUnavailable')}</p>
      ) : null}
    </div>
  );
}
