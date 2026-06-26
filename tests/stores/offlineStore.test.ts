import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  selectBadgeVariant,
  selectConnectionIndicatorStatus,
  useOfflineStore,
} from '@/stores/offlineStore';

describe('offlineStore selectors', () => {
  beforeEach(() => {
    useOfflineStore.setState({
      connectionStatus: 'online',
      downloadStatuses: {},
      manifestSummary: { surahsCached: 0, totalSizeBytes: 0 },
      audioCacheRevision: 0,
      initialized: false,
    });
  });

  afterEach(() => {
    useOfflineStore.setState({
      connectionStatus: 'online',
      downloadStatuses: {},
      manifestSummary: { surahsCached: 0, totalSizeBytes: 0 },
      audioCacheRevision: 0,
    });
  });

  it('selectBadgeVariant mengembalikan online saat terhubung', () => {
    expect(selectBadgeVariant(useOfflineStore.getState())).toBe('online');
  });

  it('selectBadgeVariant memprioritaskan downloading', () => {
    useOfflineStore.setState({
      downloadStatuses: { '1:Alafasy_128kbps': 'downloading' },
    });
    expect(selectBadgeVariant(useOfflineStore.getState())).toBe('downloading');
  });

  it('selectBadgeVariant mengembalikan offline_ready saat offline dengan cache', () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      manifestSummary: { surahsCached: 2, totalSizeBytes: 1024 },
    });
    expect(selectBadgeVariant(useOfflineStore.getState())).toBe('offline_ready');
  });

  it('selectBadgeVariant mengembalikan offline_ready dari runtime cache tanpa manifest', () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      manifestSummary: { surahsCached: 0, totalSizeBytes: 4096 },
    });
    expect(selectBadgeVariant(useOfflineStore.getState())).toBe('offline_ready');
  });

  it('selectConnectionIndicatorStatus menyembunyikan downloading di header', () => {
    useOfflineStore.setState({
      downloadStatuses: { '1:Alafasy_128kbps': 'downloading' },
    });
    expect(selectConnectionIndicatorStatus(useOfflineStore.getState())).toBe(
      'online',
    );
  });

  it('selectConnectionIndicatorStatus menampilkan offline tanpa cache', () => {
    useOfflineStore.setState({ connectionStatus: 'offline' });
    expect(selectConnectionIndicatorStatus(useOfflineStore.getState())).toBe(
      'offline',
    );
  });

  it('notifyAudioCacheUpdated menaikkan audioCacheRevision', () => {
    expect(useOfflineStore.getState().audioCacheRevision).toBe(0);
    useOfflineStore.getState().notifyAudioCacheUpdated();
    expect(useOfflineStore.getState().audioCacheRevision).toBe(1);
  });
});
