export type AppToastPayload = {
  id: number;
  message: string;
};

const TOAST_DURATION_MS = 4000;

let activeToast: AppToastPayload | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getAppToast(): AppToastPayload | null {
  return activeToast;
}

export function subscribeAppToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showAppToast(
  message: string,
  durationMs = TOAST_DURATION_MS,
): void {
  activeToast = { id: Date.now(), message };

  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }

  notifyListeners();

  dismissTimer = setTimeout(() => {
    activeToast = null;
    dismissTimer = null;
    notifyListeners();
  }, durationMs);
}

export function dismissAppToast(): void {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  activeToast = null;
  notifyListeners();
}
