'use client';

import { useEffect, useId, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/shared/Logo';
import { useThreadsGate } from '@/hooks/use-threads-gate';

const primaryButtonClassName =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const secondaryButtonClassName =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Overlay kustom — bukan Dialog Base UI.
 * Dialog menandai sibling `data-base-ui-inert` dan memicu hydration mismatch.
 */
export function ThreadsGate() {
  const t = useTranslations('threadsGate');
  const tAbout = useTranslations('about.credits');
  const titleId = useId();
  const bodyId = useId();
  const threadsLinkRef = useRef<HTMLAnchorElement>(null);
  const {
    showOverlay,
    isContinueEnabled,
    showOpenFailedHint,
    threadsUrl,
    openThreads,
    continueToApp,
  } = useThreadsGate();

  useEffect(() => {
    if (!showOverlay) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    threadsLinkRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showOverlay]);

  if (!showOverlay) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center text-card-foreground"
      >
        <div className="mb-4 flex flex-col items-center gap-1.5">
          <Logo size={40} alt="" />
          <h2 id={titleId} className="text-lg font-semibold leading-tight text-foreground">
            {t('title')}
          </h2>
          <p id={bodyId} className="text-sm text-muted-foreground">
            {t('body')}
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <a
            ref={threadsLinkRef}
            href={threadsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClassName}
            onClick={openThreads}
          >
            {t('openThreads')}
            <span className="sr-only">{tAbout('opensInNewTab')}</span>
          </a>

          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={!isContinueEnabled}
            aria-disabled={!isContinueEnabled}
            onClick={continueToApp}
          >
            {t('continue')}
          </button>
        </div>

        {showOpenFailedHint ? (
          <p className="mt-3 text-xs text-muted-foreground">{t('openFailedHint')}</p>
        ) : null}
      </div>
    </div>
  );
}
