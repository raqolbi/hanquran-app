import { describe, expect, it } from 'vitest';

import { downloadManifestKey } from '@/services/download-manifest-key';

describe('downloadManifestKey', () => {
  it('membentuk kunci unik per surat dan qari', () => {
    expect(downloadManifestKey(1, 'Alafasy_128kbps')).toBe('1:Alafasy_128kbps');
    expect(downloadManifestKey(1, 'Hudhaify_128kbps')).toBe('1:Hudhaify_128kbps');
  });
});
