/** Mock BroadcastChannel untuk pengujian sinkronisasi lintas tab. */
export class MockBroadcastChannel {
  static readonly peers = new Map<string, Set<MockBroadcastChannel>>();

  static reset(): void {
    MockBroadcastChannel.peers.clear();
  }

  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public readonly name: string) {
    if (!MockBroadcastChannel.peers.has(name)) {
      MockBroadcastChannel.peers.set(name, new Set());
    }
    MockBroadcastChannel.peers.get(name)!.add(this);
  }

  postMessage(data: unknown): void {
    for (const peer of MockBroadcastChannel.peers.get(this.name) ?? []) {
      if (peer !== this) {
        peer.onmessage?.({ data } as MessageEvent);
      }
    }
  }

  close(): void {
    MockBroadcastChannel.peers.get(this.name)?.delete(this);
  }
}
