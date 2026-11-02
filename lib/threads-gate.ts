/** Delay gimmick sebelum tombol Lanjut aktif — spek `docs/34`. */
export const THREADS_GATE_CONTINUE_DELAY_MS = 5000;

export const THREADS_GATE_STORAGE_KEY = 'hanquran:threads-gate-completed';

/**
 * Penanda pra-paint di `<html>` untuk pengguna yang sudah menyelesaikan gate.
 * Skrip inline di `app/layout.tsx` menyetelnya sebelum paint, CSS
 * `app/globals.css` menyembunyikan overlay SSR agar tidak berkedip (docs/34 §14).
 */
export const THREADS_GATE_COMPLETED_ATTRIBUTE = 'data-threads-gate-completed';

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
    const raw = window.localStorage.getItem(THREADS_GATE_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    return isCompletedRecord(JSON.parse(raw));
  } catch {
    return false;
  }
}

/**
 * Simpan status selesai. Mengembalikan `false` bila storage tidak tersedia
 * (mode privat / diblokir / kuota penuh) — pemanggil tetap harus menutup
 * overlay agar pengguna tidak terkunci.
 */
export function completeThreadsGate(now = Date.now()): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const record: CompletedRecord = { completedAt: now };
  try {
    window.localStorage.setItem(
      THREADS_GATE_STORAGE_KEY,
      JSON.stringify(record),
    );
    return true;
  } catch {
    return false;
  }
}

/** Untuk pengujian. */
export function clearThreadsGateCompletion(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(THREADS_GATE_STORAGE_KEY);
  } catch {
    // Storage tidak tersedia — tidak ada yang perlu dihapus.
  }
}

/**
 * Skrip pra-paint: jika flag completed valid, tandai `<html>` supaya overlay
 * yang sudah ada di HTML awal disembunyikan sebelum paint pertama.
 * Hanya membaca localStorage — tidak menulis, tidak menyentuh data pengguna.
 */
export function buildThreadsGateInitScript(): string {
  const key = JSON.stringify(THREADS_GATE_STORAGE_KEY);
  const attribute = JSON.stringify(THREADS_GATE_COMPLETED_ATTRIBUTE);

  return `(function(){try{var r=window.localStorage.getItem(${key});if(!r)return;var v=JSON.parse(r);if(v&&typeof v.completedAt==="number"&&isFinite(v.completedAt)){document.documentElement.setAttribute(${attribute},"true")}}catch(e){}})();`;
}

export function isThreadsGateContinueReady(
  clickedAt: number,
  now = Date.now(),
): boolean {
  return now - clickedAt >= THREADS_GATE_CONTINUE_DELAY_MS;
}
