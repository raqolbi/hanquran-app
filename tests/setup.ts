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
