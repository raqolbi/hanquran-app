import 'fake-indexeddb/auto';

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
