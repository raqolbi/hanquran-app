/**
 * Mesin Ulang Kata (docs/38 §4.2–4.4).
 *
 * Siklus: seek(awal) → putar → (posisi ≥ akhir) → jeda → [jeda menirukan]
 * → seek(awal) → putar → … sampai dihentikan.
 *
 * Bekerja di atas `AudioController` yang sama dengan pemutaran ayat biasa —
 * tidak ada elemen audio kedua. Repeat ayat & Murotal ditangguhkan selama
 * mode aktif (`isWordLoopActive()` di handler `ended`), dan akhir potongan
 * dijaga sedikit sebelum akhir file agar event `ended` tidak terpicu.
 *
 * Deteksi akhir potongan (P15-1):
 * - Web: posisi dibaca langsung dari elemen audio tiap frame (rAF).
 * - Android: posisi dari event plugin (±100 ms) diinterpolasi per frame
 *   (`AudioController.getPosition`).
 * - Tab tersembunyi (rAF berhenti): `setTimeout` sesuai sisa durasi.
 */

import { trackWordLoopStarted, trackWordLoopStopped } from '@/lib/analytics';
import { getAudioController, type AudioController } from '@/services/audio-controller';
import type { WordClip } from '@/services/quran/word-clip';
import { useAudioStore } from '@/stores/audioStore';
import { useUserStore } from '@/stores/userStore';
import { useWordLoopStore, type WordLoopState } from '@/stores/wordLoopStore';
import type { AudioTrack } from '@/types';

/** Jaga jarak dari akhir file agar `ended` (Repeat/Murotal, native stop) tidak terpicu. */
const END_GUARD_SECONDS = 0.08;
/** Toleransi posisi dianggap "masih di dalam potongan" saat melanjutkan. */
const RESUME_TOLERANCE_SECONDS = 0.15;

export interface StartWordLoopInput {
  track: AudioTrack;
  clip: WordClip;
}

export type StopWordLoopReason = 'user' | 'track' | 'navigation';

let loopTrack: AudioTrack | null = null;
let frame = 0;
let tickTimer: ReturnType<typeof setTimeout> | null = null;
let gapTimer: ReturnType<typeof setTimeout> | null = null;
/** Sedang mengubah audio sendiri — perubahan store bukan aksi pengguna. */
let selfChange = false;
let unsubscribeAudio: (() => void) | null = null;
let unsubscribeEnded: (() => void) | null = null;
let generation = 0;

function currentLoop(): WordLoopState | null {
  return useWordLoopStore.getState().loop;
}

function startSeconds(loop: WordLoopState): number {
  return loop.clip.startMs / 1000;
}

function endSeconds(loop: WordLoopState, controller: AudioController): number {
  const end = loop.clip.endMs / 1000;
  const duration = controller.getDuration();
  return duration > 0 ? Math.min(end, duration - END_GUARD_SECONDS) : end;
}

function clearScheduledTick(): void {
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = null;
  }
}

function clearGapTimer(): void {
  if (gapTimer) {
    clearTimeout(gapTimer);
    gapTimer = null;
  }
}

async function withSelfChange<T>(fn: () => T | Promise<T>): Promise<T> {
  selfChange = true;
  try {
    return await fn();
  } finally {
    selfChange = false;
  }
}

function scheduleTick(): void {
  clearScheduledTick();
  const loop = currentLoop();
  const controller = getAudioController();
  if (!loop || loop.phase !== 'playing' || !controller) return;

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    const remaining =
      (endSeconds(loop, controller) - controller.getPosition()) /
      (useAudioStore.getState().playbackRate || 1);
    tickTimer = setTimeout(tick, Math.min(Math.max(remaining * 1000, 10), 250));
    return;
  }

  frame = window.requestAnimationFrame(tick);
}

function tick(): void {
  frame = 0;
  tickTimer = null;
  const loop = currentLoop();
  const controller = getAudioController();
  if (!loop || loop.phase !== 'playing' || !controller) return;
  if (!useAudioStore.getState().isPlaying) return;

  if (controller.getPosition() >= endSeconds(loop, controller)) {
    void finishCycle();
    return;
  }
  scheduleTick();
}

/** Pastikan posisi berada di awal potongan (setelah play/reload native). */
function ensureAtStart(loop: WordLoopState, controller: AudioController): void {
  const position = controller.getPosition();
  const start = startSeconds(loop);
  if (
    Math.abs(position - start) > RESUME_TOLERANCE_SECONDS ||
    position >= endSeconds(loop, controller)
  ) {
    controller.seek(start);
  }
}

/**
 * @param afterEnded trek baru saja berakhir — putar dulu (native memuat ulang
 *   dari 0; resume ExoPlayer setelah ended sering diam), baru seek.
 */
async function playFromStart(afterEnded = false): Promise<void> {
  const loop = currentLoop();
  const controller = getAudioController();
  if (!loop || !controller || !loopTrack) return;

  const token = generation;
  await withSelfChange(async () => {
    if (!afterEnded) controller.seek(startSeconds(loop));
    if (!useAudioStore.getState().isPlaying) {
      await controller.play(loopTrack!);
    }
  });
  if (token !== generation) return;

  const latest = currentLoop();
  if (!latest) return;
  if (!useAudioStore.getState().isPlaying) {
    // Gagal memutar (mis. offline) — hentikan, jangan berputar diam-diam.
    stopWordLoop('track');
    return;
  }
  ensureAtStart(latest, controller);
  scheduleTick();
}

async function finishCycle(): Promise<void> {
  const loop = currentLoop();
  const controller = getAudioController();
  if (!loop || !controller) return;

  const cycles = loop.cycles + 1;
  const gapMs = useUserStore.getState().settings.wordLoopGapMs ?? 1000;

  if (gapMs <= 0) {
    useWordLoopStore.getState().patch({ cycles });
    await withSelfChange(() => controller.seek(startSeconds(loop)));
    scheduleTick();
    return;
  }

  useWordLoopStore.getState().patch({ cycles, phase: 'gap' });
  await withSelfChange(() => controller.pause());

  clearGapTimer();
  gapTimer = setTimeout(() => {
    gapTimer = null;
    const latest = currentLoop();
    if (!latest || latest.phase !== 'gap') return;
    useWordLoopStore.getState().patch({ phase: 'playing' });
    void playFromStart();
  }, gapMs);
}

function handleAudioChange(
  state: ReturnType<typeof useAudioStore.getState>,
  prev: ReturnType<typeof useAudioStore.getState>,
): void {
  const loop = currentLoop();
  if (!loop || !loopTrack) return;

  // Trek lain diputar (⏮/⏭, Murotal, ayat lain) atau sesi dihentikan.
  if (state.currentTrack !== prev.currentTrack) {
    if (!state.currentTrack || state.currentTrack.url !== loopTrack.url) {
      stopWordLoop('track');
      return;
    }
  }

  if (selfChange || state.isPlaying === prev.isPlaying) return;

  if (!state.isPlaying && loop.phase === 'playing') {
    // Dijeda pengguna (tombol, layar kunci, tab lain).
    clearScheduledTick();
    useWordLoopStore.getState().patch({ phase: 'paused' });
    return;
  }

  if (state.isPlaying && loop.phase !== 'playing') {
    // Dilanjutkan pengguna — kembali ke awal potongan bila di luar potongan.
    clearGapTimer();
    useWordLoopStore.getState().patch({ phase: 'playing' });
    const controller = getAudioController();
    if (controller) {
      const position = controller.getPosition();
      if (
        position < startSeconds(loop) - RESUME_TOLERANCE_SECONDS ||
        position >= endSeconds(loop, controller)
      ) {
        void withSelfChange(() => controller.seek(startSeconds(loop)));
      }
    }
    scheduleTick();
  }
}

function handleEnded(): void {
  // Cadangan: file berakhir sebelum potongan selesai (mis. durasi belum
  // diketahui). Putar ulang segera — `play()` sinkron mencegah native stop.
  const loop = currentLoop();
  if (!loop || !loopTrack) return;
  clearScheduledTick();
  clearGapTimer();
  useWordLoopStore.getState().patch({ cycles: loop.cycles + 1, phase: 'playing' });
  void playFromStart(true);
}

function attach(controller: AudioController): void {
  unsubscribeAudio ??= useAudioStore.subscribe(handleAudioChange);
  unsubscribeEnded ??= controller.onEnded(handleEnded);
}

function detach(): void {
  unsubscribeAudio?.();
  unsubscribeAudio = null;
  unsubscribeEnded?.();
  unsubscribeEnded = null;
}

/**
 * Mulai (atau pindah ke) potongan baru. Mengembalikan `false` bila audio
 * tidak bisa diputar.
 */
export async function startWordLoop({ track, clip }: StartWordLoopInput): Promise<boolean> {
  const controller = getAudioController();
  if (!controller) return false;

  const previous = currentLoop();
  generation += 1;
  const token = generation;
  clearScheduledTick();
  clearGapTimer();

  loopTrack = track;
  const loop: WordLoopState = {
    surahId: track.surahId,
    ayahNumber: track.ayahNumber,
    reciterId: track.reciterId,
    range: clip.range,
    clip: { startMs: clip.startMs, endMs: clip.endMs },
    cycles: 0,
    phase: 'playing',
  };
  useWordLoopStore.getState().set(loop);
  attach(controller);

  const sameTrack = useAudioStore.getState().currentTrack?.url === track.url;
  await withSelfChange(async () => {
    if (sameTrack) {
      controller.seek(startSeconds(loop));
      if (!useAudioStore.getState().isPlaying) await controller.play(track);
    } else {
      await controller.play(track);
    }
  });
  if (token !== generation) return true;

  if (!useAudioStore.getState().isPlaying) {
    stopWordLoop('track');
    return false;
  }
  ensureAtStart(loop, controller);
  scheduleTick();

  if (!previous) {
    trackWordLoopStarted({
      surahId: track.surahId,
      ayahNumber: track.ayahNumber,
      reciterId: track.reciterId,
      wordCount: clip.range.to - clip.range.from,
    });
  }
  return true;
}

/**
 * Hentikan Ulang Kata. `user` → audio juga dijeda; alasan lain (pindah
 * trek/halaman) membiarkan audio apa adanya.
 */
export function stopWordLoop(reason: StopWordLoopReason = 'user'): void {
  const loop = currentLoop();
  if (!loop) return;

  generation += 1;
  clearScheduledTick();
  clearGapTimer();
  detach();
  loopTrack = null;
  useWordLoopStore.getState().set(null);

  if (reason === 'user' && useAudioStore.getState().isPlaying) {
    getAudioController()?.pause();
  }
  trackWordLoopStopped({ cycles: loop.cycles });
}

/** Play/Pause saat Ulang Kata aktif — jeda/lanjut siklus, mode tetap aktif. */
export function toggleWordLoopPause(): void {
  const loop = currentLoop();
  const controller = getAudioController();
  if (!loop || !controller || !loopTrack) return;

  if (loop.phase === 'playing') {
    controller.pause();
    return;
  }
  // gap/paused → lanjut dari awal potongan (lihat handleAudioChange).
  void controller.play(loopTrack);
}

/** Hanya untuk test. */
export function resetWordLoopEngine(): void {
  generation += 1;
  clearScheduledTick();
  clearGapTimer();
  detach();
  loopTrack = null;
  selfChange = false;
  useWordLoopStore.getState().set(null);
}
