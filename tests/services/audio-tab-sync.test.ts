import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockBroadcastChannel } from '@/tests/helpers/mock-broadcast-channel';
import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';
import {
  AUDIO_TAB_CHANNEL,
  AudioTabSync,
} from '@/services/audio-tab-sync';

const sampleTrack = {
  surahId: 1,
  ayahNumber: 1,
  reciterId: 'Alafasy_128kbps',
  url: fixtureAyahAudioUrl(1, 1),
};

describe('AudioTabSync', () => {
  beforeEach(() => {
    MockBroadcastChannel.reset();
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menggunakan kanal hanquran:audio', () => {
    const sync = new AudioTabSync();
    expect(
      MockBroadcastChannel.peers.has(AUDIO_TAB_CHANNEL),
    ).toBe(true);
    sync.destroy();
  });

  it('claim-play dari tab lain memicu interrupt', () => {
    const syncA = new AudioTabSync();
    const syncB = new AudioTabSync();
    const interruptA = vi.fn();

    syncA.setRemoteInterruptHandler(interruptA);
    syncB.notifyClaimPlay(sampleTrack);

    expect(interruptA).toHaveBeenCalledTimes(1);

    syncA.destroy();
    syncB.destroy();
  });

  it('tidak menginterrupt diri sendiri', () => {
    const sync = new AudioTabSync();
    const interrupt = vi.fn();
    sync.setRemoteInterruptHandler(interrupt);

    sync.notifyClaimPlay(sampleTrack);

    expect(interrupt).not.toHaveBeenCalled();
    sync.destroy();
  });

  it('tab dengan claim lebih baru memenangkan konflik', () => {
    const syncA = new AudioTabSync();
    const syncB = new AudioTabSync();
    const interruptA = vi.fn();
    const interruptB = vi.fn();
    const nowSpy = vi.spyOn(Date, 'now');

    syncA.setRemoteInterruptHandler(interruptA);
    syncB.setRemoteInterruptHandler(interruptB);

    nowSpy.mockReturnValueOnce(1000);
    syncA.notifyClaimPlay(sampleTrack);
    expect(interruptA).not.toHaveBeenCalled();

    nowSpy.mockReturnValueOnce(2000);
    interruptB.mockClear();
    syncB.notifyClaimPlay({ ...sampleTrack, ayahNumber: 2 });

    expect(interruptA).toHaveBeenCalledTimes(1);
    expect(interruptB).not.toHaveBeenCalled();

    nowSpy.mockRestore();
    syncA.destroy();
    syncB.destroy();
  });
});
