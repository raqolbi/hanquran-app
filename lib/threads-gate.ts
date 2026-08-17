/** Delay gimmick sebelum tombol Lanjut aktif — spek `docs/34`. */
export const THREADS_GATE_CONTINUE_DELAY_MS = 5000;

const STORAGE_KEY = 'hanquran:threads-gate-completed';

interface CompletedRecord {
  completedAt: number;
}

function isCompletedRecord(value: unknown): value is CompletedRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const completedAt = (value as CompletedRecord).completedAt;
  return typeof completedAt === 'number' && Number.isFinite(completedAt);
}

/** True jika overlay sudah diselesaikan di origin ini. */
export function isThreadsGateCompleted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }

    return isCompletedRecord(JSON.parse(raw));
  } catch {
    return false;
  }
}

export function completeThreadsGate(now = Date.now()): void {
  if (typeof window === 'undefined') {
    return;
  }

  const record: CompletedRecord = { completedAt: now };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/** Untuk pengujian. */
export function clearThreadsGateCompletion(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function isThreadsGateContinueReady(
  clickedAt: number,
  now = Date.now(),
): boolean {
  return now - clickedAt >= THREADS_GATE_CONTINUE_DELAY_MS;
}
