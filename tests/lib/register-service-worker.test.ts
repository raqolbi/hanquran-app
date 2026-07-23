import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerServiceWorker } from '@/lib/register-service-worker';

describe('registerServiceWorker', () => {
  const register = vi.fn();
  const addEventListener = vi.fn();

  beforeEach(() => {
    register.mockReset();
    addEventListener.mockReset();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        addEventListener,
        controller: null,
      },
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
    expect(addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
    );
    expect(registration).toEqual({ scope: '/' });
  });

  it('reload saat controllerchange setelah update SW', async () => {
    register.mockResolvedValue({ scope: '/' });
    const reload = vi.fn();
    vi.stubGlobal('window', { location: { reload } });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        addEventListener,
        controller: {},
      },
    });

    await registerServiceWorker();

    const handler = addEventListener.mock.calls[0]?.[1] as () => void;
    handler();
    handler(); // kedua kalinya diabaikan (refreshing guard)

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('tidak reload pada controllerchange install pertama', async () => {
    register.mockResolvedValue({ scope: '/' });
    const reload = vi.fn();
    vi.stubGlobal('window', { location: { reload } });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        addEventListener,
        controller: null,
      },
    });

    await registerServiceWorker();

    const handler = addEventListener.mock.calls[0]?.[1] as () => void;
    handler();

    expect(reload).not.toHaveBeenCalled();
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
