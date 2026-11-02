'use client';

import { useEffect, useId, useRef, type KeyboardEvent } from 'react';

import { LocaleText } from '@/components/shared/locale-text';
import { Logo } from '@/components/shared/Logo';
import { useThreadsGate } from '@/hooks/use-threads-gate';
import { APP_AUTHOR_THREADS_HANDLE } from '@/lib/app-about';
import { getLocalePair } from '@/lib/locale-text';
import { THREADS_GATE_COMPLETED_ATTRIBUTE } from '@/lib/threads-gate';

const TITLE = getLocalePair('threadsGate', 'title');
const BODY = getLocalePair('threadsGate', 'body', {
  handle: APP_AUTHOR_THREADS_HANDLE,
});
const OPEN_THREADS = getLocalePair('threadsGate', 'openThreads');
const CONTINUE = getLocalePair('threadsGate', 'continue');
const OPEN_FAILED_HINT = getLocalePair('threadsGate', 'openFailedHint');
const OPENS_IN_NEW_TAB = getLocalePair('about.credits', 'opensInNewTab');

const primaryButtonClassName =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const secondaryButtonClassName =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Overlay kustom — bukan Dialog Base UI.
 * Dialog menandai sibling `data-base-ui-inert` dan memicu hydration mismatch.
 */
export function ThreadsGate() {
  const titleId = useId();
  const bodyId = useId();
  const threadsLinkRef = useRef<HTMLAnchorElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
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

    // Pengguna lama: overlay sudah disembunyikan CSS pra-paint. Jangan kunci
    // scroll/fokus walau status React belum sempat berubah ke `completed`.
    if (
      document.documentElement.hasAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE)
    ) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previousFocus = document.activeElement as HTMLElement | null;
    const restoreInert = makeBackgroundInert(overlayRef.current);
    threadsLinkRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreInert();
      previousFocus?.focus?.();
    };
  }, [showOverlay]);

  // Fokus berputar di dalam overlay (Tab / Shift+Tab). Esc sengaja tidak
  // menutup — gerbang memang wajib diselesaikan (docs/34).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusables = getFocusable(overlayRef.current);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !overlayRef.current?.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !overlayRef.current?.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!showOverlay) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      data-threads-gate-overlay=""
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
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
            <LocaleText pair={TITLE} />
          </h2>
          <p id={bodyId} className="text-sm text-muted-foreground">
            <LocaleText pair={BODY} />
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
            <LocaleText pair={OPEN_THREADS} />
            <span className="sr-only">
              <LocaleText pair={OPENS_IN_NEW_TAB} />
            </span>
          </a>

          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={!isContinueEnabled}
            aria-disabled={!isContinueEnabled}
            onClick={continueToApp}
          >
            <LocaleText pair={CONTINUE} />
          </button>
        </div>

        {showOpenFailedHint ? (
          <p className="mt-3 text-xs text-muted-foreground">
            <LocaleText pair={OPEN_FAILED_HINT} />
          </p>
        ) : null}
      </div>
    </div>
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Tandai semua saudara overlay (di setiap tingkat hingga `<body>`) sebagai
 * `inert`: tidak bisa difokus/diklik dan tidak dibaca pembaca layar selama
 * gerbang tampil (docs/39 A2). Mengembalikan fungsi pemulih.
 */
function makeBackgroundInert(overlay: HTMLElement | null): () => void {
  if (!overlay || typeof document === 'undefined') return () => {};

  const changed: HTMLElement[] = [];
  let node: HTMLElement | null = overlay;
  while (node && node !== document.body && node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (
        sibling !== node &&
        sibling instanceof HTMLElement &&
        !sibling.inert &&
        sibling.tagName !== 'SCRIPT' &&
        sibling.tagName !== 'STYLE'
      ) {
        sibling.inert = true;
        changed.push(sibling);
      }
    }
    node = node.parentElement;
  }

  return () => {
    for (const element of changed) element.inert = false;
  };
}

