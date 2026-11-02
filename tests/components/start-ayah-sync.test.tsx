// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const searchParamsState = vi.hoisted(() => ({
  current: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParamsState.current,
}));

import { StartAyahSync } from '@/components/start-ayah-sync';

function renderSync(onChange: (ayah: number) => void) {
  return render(
    <Suspense fallback={null}>
      <StartAyahSync onChange={onChange} />
    </Suspense>,
  );
}

describe('StartAyahSync', () => {
  afterEach(() => {
    cleanup();
    searchParamsState.current = new URLSearchParams();
  });

  it('memanggil onChange dengan ?ayah pada mount', () => {
    searchParamsState.current = new URLSearchParams('ayah=5');
    const onChange = vi.fn();

    renderSync(onChange);

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('fallback ke ayat 1 tanpa ?ayah', () => {
    const onChange = vi.fn();

    renderSync(onChange);

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('reaktif saat query berubah (back/forward, push URL)', () => {
    searchParamsState.current = new URLSearchParams('ayah=5');
    const onChange = vi.fn();
    const { rerender } = renderSync(onChange);

    expect(onChange).toHaveBeenLastCalledWith(5);

    searchParamsState.current = new URLSearchParams('ayah=9');
    rerender(
      <Suspense fallback={null}>
        <StartAyahSync onChange={onChange} />
      </Suspense>,
    );

    expect(onChange).toHaveBeenLastCalledWith(9);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('tidak memanggil ulang saat render biasa dengan query yang sama', () => {
    searchParamsState.current = new URLSearchParams('ayah=3');
    const onChange = vi.fn();
    const { rerender } = renderSync(onChange);

    rerender(
      <Suspense fallback={null}>
        <StartAyahSync onChange={onChange} />
      </Suspense>,
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('nilai tidak valid jatuh ke ayat 1', () => {
    searchParamsState.current = new URLSearchParams('ayah=abc');
    const onChange = vi.fn();

    renderSync(onChange);

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
