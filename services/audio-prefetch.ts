/**
 * Prefetch audio tilawah — hint browser + buffer tersembunyi.
 * Prinsip: ringan, hanya ayat berikutnya (`docs/07-api-integration.md`).
 */

const PREFETCH_ATTR = 'data-hanquran-audio-prefetch';

/** Sisipkan `<link rel="prefetch">` agar browser memanaskan HTTP cache. */
export function injectAudioPrefetchHint(url: string): void {
  if (typeof document === 'undefined' || !url) return;

  if (document.head.querySelector(`link[${PREFETCH_ATTR}="${url}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'fetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  link.setAttribute(PREFETCH_ATTR, url);
  document.head.appendChild(link);
}

export function removeAudioPrefetchHints(): void {
  if (typeof document === 'undefined') return;

  document
    .querySelectorAll(`link[${PREFETCH_ATTR}]`)
    .forEach((node) => node.remove());
}

/** Buffer audio tersembunyi untuk satu URL berikutnya. */
export class AudioPrefetchBuffer {
  private readonly element: HTMLAudioElement;

  private loadedUrl: string | null = null;

  constructor(audioElement?: HTMLAudioElement) {
    this.element = audioElement ?? new Audio();
    this.element.preload = 'auto';
  }

  get elementRef(): HTMLAudioElement {
    return this.element;
  }

  get currentUrl(): string | null {
    return this.loadedUrl;
  }

  load(url: string): void {
    if (!url || this.loadedUrl === url) return;

    this.loadedUrl = url;
    this.element.src = url;
    this.element.load();
  }

  destroy(): void {
    this.element.pause();
    this.element.removeAttribute('src');
    this.element.load();
    this.loadedUrl = null;
  }
}
