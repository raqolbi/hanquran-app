import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerServiceWorker } from '@/lib/register-service-worker';

describe('registerServiceWorker', () => {
  const register = vi.fn();

  beforeEach(() => {
    register.mockReset();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('mendaftarkan /sw.js di production', async () => {
    register.mockResolvedValue({ scope: '/' });

    const registration = await registerServiceWorker();

    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    expect(registration).toEqual({ scope: '/' });
  });

  it('mengembalikan null di development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const registration = await registerServiceWorker();

    expect(register).not.toHaveBeenCalled();
    expect(registration).toBeNull();
  });

  it('mengembalikan null jika service worker tidak didukung', async () => {
    vi.stubGlobal('navigator', {});

    const registration = await registerServiceWorker();

    expect(registration).toBeNull();
  });
});
