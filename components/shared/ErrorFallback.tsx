'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

/** Fallback untuk error React tak terduga (ErrorBoundary). */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  return (
    <div
      role="alert"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6 py-12 text-center"
    >
      <Logo size={40} className="opacity-80" />
      <div className="flex max-w-md flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Terjadi kesalahan
        </h1>
        <p className="text-sm text-muted-foreground">
          Aplikasi mengalami masalah yang tidak terduga. Coba muat ulang halaman
          atau kembali ke beranda.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message ? (
          <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={handleReload}>
          Muat ulang
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Ke beranda
        </Button>
      </div>
    </div>
  );
}

interface DataLoadErrorFallbackProps {
  /** Pesan error spesifik (dari hook / terjemahan). */
  message: string;
  onRetry?: () => void;
  /** `inline` — di dalam layout halaman; `page` — layar penuh tanpa header. */
  variant?: 'inline' | 'page';
  showHomeButton?: boolean;
}

/** Fallback untuk kegagalan muat dataset (fetch `public/data/*`). */
export function DataLoadErrorFallback({
  message,
  onRetry,
  variant = 'page',
  showHomeButton = true,
}: DataLoadErrorFallbackProps) {
  const t = useTranslations('errors');

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-5 px-6 text-center',
        variant === 'page' ? 'min-h-[100dvh] bg-background py-12' : 'py-12',
      )}
    >
      <div className="flex max-w-md flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {t('dataLoadTitle')}
        </h2>
        <p className="text-sm font-medium text-destructive">{message}</p>
        <p className="text-sm text-muted-foreground">{t('dataLoadHint')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" onClick={onRetry}>
            {t('retryLoad')}
          </Button>
        ) : null}
        {showHomeButton ? (
          <Button
            type="button"
            variant={onRetry ? 'outline' : 'default'}
            onClick={() => {
              window.location.href = '/';
            }}
          >
            {t('backToHome')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
