'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { APP_AUTHOR_THREADS_URL } from '@/lib/app-about';
import {
  THREADS_GATE_CONTINUE_DELAY_MS,
  completeThreadsGate,
  isThreadsGateCompleted,
  isThreadsGateContinueReady,
} from '@/lib/threads-gate';

export type ThreadsGateStatus = 'pending' | 'waiting' | 'ready' | 'completed';

export interface UseThreadsGateResult {
  status: ThreadsGateStatus;
  showOverlay: boolean;
  isContinueEnabled: boolean;
  showOpenFailedHint: boolean;
  threadsUrl: string;
  openThreads: () => void;
  continueToApp: () => void;
}

function remainingDelayMs(clickedAt: number, now = Date.now()): number {
  return clickedAt + THREADS_GATE_CONTINUE_DELAY_MS - now;
}

/**
 * Overlay Gate Threads sekali pakai — `docs/34-threads-gate-spec.md`.
 * Overlay hanya setelah mount (useEffect) agar HTML SSR = hidrasi klien.
 */
export function useThreadsGate(): UseThreadsGateResult {
  const [status, setStatus] = useState<ThreadsGateStatus>('pending');
  const [storageReady, setStorageReady] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const clickedAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current == null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(() => {
    if (isThreadsGateCompleted()) {
      setStatus('completed');
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (status !== 'waiting') {
      return;
    }

    const clickedAt = clickedAtRef.current;
    if (clickedAt == null) {
      return;
    }

    const syncFromWallClock = () => {
      const origin = clickedAtRef.current;
      if (origin == null) {
        return;
      }

      if (isThreadsGateContinueReady(origin)) {
        setStatus('ready');
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        syncFromWallClock();
      }
    };

    const remaining = remainingDelayMs(clickedAt);
    if (remaining <= 0) {
      setStatus('ready');
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      syncFromWallClock();
    }, remaining);

    window.addEventListener('focus', syncFromWallClock);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('focus', syncFromWallClock);
      document.removeEventListener('visibilitychange', onVisible);
      clearTimer();
    };
  }, [clearTimer, status]);

  const openThreads = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setOpenFailed(true);
    }

    if (clickedAtRef.current != null) {
      return;
    }

    clickedAtRef.current = Date.now();
    setStatus('waiting');
  }, []);

  const continueToApp = useCallback(() => {
    if (status !== 'ready') {
      return;
    }

    completeThreadsGate();
    clearTimer();
    setStatus('completed');
  }, [clearTimer, status]);

  return {
    status,
    showOverlay: storageReady && status !== 'completed',
    isContinueEnabled: status === 'ready',
    showOpenFailedHint: status === 'ready' && openFailed,
    threadsUrl: APP_AUTHOR_THREADS_URL,
    openThreads,
    continueToApp,
  };
}
