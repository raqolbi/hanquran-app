import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockBroadcastChannel } from '@/tests/helpers/mock-broadcast-channel';
import {
  REPEAT_TAB_CHANNEL,
  RepeatTabSync,
  resetRepeatTabSync,
} from '@/services/repeat-tab-sync';
import { useRepeatStore } from '@/stores/repeatStore';
import type { RepeatConfig } from '@/types';

const sampleConfig: RepeatConfig = {
  target: 'current_ayah',
  count: 5,
  range: null,
};

const sampleRuntime = {
  cycleIndex: 2,
  isActive: true,
  lastBoundary: 1,
};

describe('RepeatTabSync', () => {
  beforeEach(() => {
    MockBroadcastChannel.reset();
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    resetRepeatTabSync();
    useRepeatStore.setState({
      config: { target: 'current_ayah', count: 1, range: null },
      runtime: { cycleIndex: 0, isActive: false, lastBoundary: null },
      initialized: true,
    });
  });

  afterEach(() => {
    resetRepeatTabSync();
    vi.unstubAllGlobals();
  });

  it('menggunakan kanal hanquran:repeat', () => {
    const sync = new RepeatTabSync();
    expect(MockBroadcastChannel.peers.has(REPEAT_TAB_CHANNEL)).toBe(true);
    sync.destroy();
  });

  it('config-changed dari tab lain memperbarui useRepeatStore', () => {
    const syncA = new RepeatTabSync();
    const syncB = new RepeatTabSync();

    syncB.notifyConfigChanged(sampleConfig, sampleRuntime);

    expect(useRepeatStore.getState().config).toEqual(sampleConfig);
    expect(useRepeatStore.getState().runtime).toEqual(sampleRuntime);

    syncA.destroy();
    syncB.destroy();
  });

  it('cycle-tick dari tab lain memperbarui runtime repeat', () => {
    const syncA = new RepeatTabSync();
    const syncB = new RepeatTabSync();

    syncB.notifyCycleTick(sampleRuntime);

    expect(useRepeatStore.getState().runtime).toEqual(sampleRuntime);

    syncA.destroy();
    syncB.destroy();
  });

  it('tidak menerapkan pesan dari tab yang sama', () => {
    const sync = new RepeatTabSync();

    sync.notifyConfigChanged(sampleConfig, sampleRuntime);

    expect(useRepeatStore.getState().config.count).toBe(1);

    sync.destroy();
  });
});
