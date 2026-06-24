/**
 * Sinkronisasi pemutaran audio lintas tab — BroadcastChannel.
 * Spesifikasi: `docs/15-state-management.md` (Bagian 10.2).
 */

import type { AudioTrack } from '@/types';

export const AUDIO_TAB_CHANNEL = 'hanquran:audio';

export type AudioTabMessage =
  | {
      type: 'claim-play';
      tabId: string;
      track: AudioTrack;
      timestamp: number;
    }
  | {
      type: 'pause';
      tabId: string;
      timestamp: number;
    }
  | {
      type: 'seek';
      tabId: string;
      currentTime: number;
      timestamp: number;
    }
  | {
      type: 'track-changed';
      tabId: string;
      track: AudioTrack;
      timestamp: number;
    };

function createTabId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class AudioTabSync {
  private channel: BroadcastChannel | null = null;

  private readonly tabId: string;

  private onRemoteInterrupt: (() => void) | null = null;

  private lastClaimTimestamp = 0;

  constructor() {
    this.tabId = createTabId();

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(AUDIO_TAB_CHANNEL);
      this.channel.onmessage = (event: MessageEvent<AudioTabMessage>) => {
        this.handleMessage(event.data);
      };
    }
  }

  getTabId(): string {
    return this.tabId;
  }

  setRemoteInterruptHandler(handler: () => void): void {
    this.onRemoteInterrupt = handler;
  }

  /** Tab ini mengklaim leadership pemutaran. */
  notifyClaimPlay(track: AudioTrack): void {
    this.lastClaimTimestamp = Date.now();
    this.post({
      type: 'claim-play',
      tabId: this.tabId,
      track,
      timestamp: this.lastClaimTimestamp,
    });
  }

  notifyPause(): void {
    this.post({
      type: 'pause',
      tabId: this.tabId,
      timestamp: Date.now(),
    });
  }

  notifySeek(currentTime: number): void {
    this.post({
      type: 'seek',
      tabId: this.tabId,
      currentTime,
      timestamp: Date.now(),
    });
  }

  notifyTrackChanged(track: AudioTrack): void {
    this.post({
      type: 'track-changed',
      tabId: this.tabId,
      track,
      timestamp: Date.now(),
    });
  }

  destroy(): void {
    this.channel?.close();
    this.channel = null;
    this.onRemoteInterrupt = null;
  }

  private handleMessage(message: AudioTabMessage): void {
    if (!message || message.tabId === this.tabId) return;

    switch (message.type) {
      case 'claim-play':
        if (message.timestamp >= this.lastClaimTimestamp) {
          this.onRemoteInterrupt?.();
        }
        break;
      case 'track-changed':
      case 'seek':
        if (message.timestamp > this.lastClaimTimestamp) {
          this.onRemoteInterrupt?.();
        }
        break;
      case 'pause':
        break;
      default:
        break;
    }
  }

  private post(message: AudioTabMessage): void {
    try {
      this.channel?.postMessage(message);
    } catch {
      // Kanal tidak tersedia — abaikan.
    }
  }
}
