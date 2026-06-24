/**
 * Sinkronisasi konfigurasi & runtime repeat lintas tab — BroadcastChannel.
 * Spesifikasi: `docs/15-state-management.md` (Bagian 11.4).
 */

import { useRepeatStore } from '@/stores/repeatStore';
import type { RepeatConfig, RepeatRuntime } from '@/types';

export const REPEAT_TAB_CHANNEL = 'hanquran:repeat';

export type RepeatTabMessage =
  | {
      type: 'config-changed';
      tabId: string;
      config: RepeatConfig;
      runtime: RepeatRuntime;
      timestamp: number;
    }
  | {
      type: 'cycle-tick';
      tabId: string;
      runtime: RepeatRuntime;
      timestamp: number;
    };

function createTabId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class RepeatTabSync {
  private channel: BroadcastChannel | null = null;

  private readonly tabId: string;

  constructor() {
    this.tabId = createTabId();

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(REPEAT_TAB_CHANNEL);
      this.channel.onmessage = (event: MessageEvent<RepeatTabMessage>) => {
        this.handleMessage(event.data);
      };
    }
  }

  getTabId(): string {
    return this.tabId;
  }

  notifyConfigChanged(config: RepeatConfig, runtime: RepeatRuntime): void {
    this.post({
      type: 'config-changed',
      tabId: this.tabId,
      config,
      runtime,
      timestamp: Date.now(),
    });
  }

  notifyCycleTick(runtime: RepeatRuntime): void {
    this.post({
      type: 'cycle-tick',
      tabId: this.tabId,
      runtime,
      timestamp: Date.now(),
    });
  }

  destroy(): void {
    this.channel?.close();
    this.channel = null;
  }

  private handleMessage(message: RepeatTabMessage): void {
    if (!message || message.tabId === this.tabId) return;

    switch (message.type) {
      case 'config-changed':
        useRepeatStore.setState({
          config: message.config,
          runtime: message.runtime,
        });
        break;
      case 'cycle-tick':
        useRepeatStore.setState({ runtime: message.runtime });
        break;
      default:
        break;
    }
  }

  private post(message: RepeatTabMessage): void {
    try {
      this.channel?.postMessage(message);
    } catch {
      // Kanal tidak tersedia — abaikan.
    }
  }
}

let singleton: RepeatTabSync | null = null;

export function getRepeatTabSync(): RepeatTabSync | null {
  if (typeof window === 'undefined') return null;

  if (!singleton) {
    singleton = new RepeatTabSync();
  }

  return singleton;
}

/** Hanya untuk pengujian — reset singleton. */
export function resetRepeatTabSync(): void {
  singleton?.destroy();
  singleton = null;
}
