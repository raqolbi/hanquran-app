import { beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

/** Node `--localstorage-file` tanpa path menyediakan objek localStorage rusak di jsdom. */
function ensureLocalStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const { localStorage } = window;
  const needsPolyfill =
    !localStorage ||
    typeof localStorage.getItem !== 'function' ||
    typeof localStorage.setItem !== 'function' ||
    typeof localStorage.removeItem !== 'function';

  if (!needsPolyfill) {
    return;
  }

  const store = new Map<string, string>();
  const polyfill = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: polyfill,
    configurable: true,
    writable: true,
  });
}

ensureLocalStorage();
beforeEach(() => {
  ensureLocalStorage();
});

/** jsdom tidak menyediakan MediaError — diperlukan untuk pengujian audio. */
if (typeof globalThis.MediaError === 'undefined') {
  class MediaErrorPolyfill {
    static readonly MEDIA_ERR_ABORTED = 1;
    static readonly MEDIA_ERR_NETWORK = 2;
    static readonly MEDIA_ERR_DECODE = 3;
    static readonly MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
    code = 0;
    message = '';
  }
  globalThis.MediaError = MediaErrorPolyfill as unknown as typeof MediaError;
}

/**
 * `Blob` jsdom tidak punya `.stream()`, sehingga `new Response(new Blob())`
 * (Response milik Node/undici) melempar "object.stream is not a function".
 * Pakai `Blob` Node agar test Cache Storage berjalan (docs/39 C3).
 */
if (typeof window !== 'undefined') {
  const { Blob: NodeBlob } = await import('node:buffer');
  if (typeof (new globalThis.Blob([]) as Blob & { stream?: unknown }).stream !== 'function') {
    globalThis.Blob = NodeBlob as unknown as typeof Blob;
  }
}
