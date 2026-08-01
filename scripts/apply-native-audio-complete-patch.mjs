/**
 * Patch @capgo/capacitor-native-audio (Android) untuk HanQuran.
 * Jalankan sebelum `cap sync` / assemble — lihat package.json `cap:sync`.
 *
 * 1) dispatchComplete: tetap PAUSED + currentlyPlayingAssetId (antar ayat)
 * 2) Notifikasi: prev/next ayat (bukan ±15 detik)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const target = join(
  process.cwd(),
  'node_modules/@capgo/capacitor-native-audio/android/src/main/java/ee/forgr/audio/NativeAudio.java',
);

/** @type {{ id: string; marker: string; original: string; patched: string }[]} */
const PATCHES = [
  {
    id: 'dispatchComplete-paused',
    marker: 'Keep PAUSED + currentlyPlayingAssetId',
    original: `    public void dispatchComplete(String assetId) {
        JSObject ret = new JSObject();
        ret.put("assetId", assetId);
        notifyListeners("complete", ret);

        updateTrackedPlaybackState(assetId, PlaybackStateCompat.STATE_STOPPED);

        if (assetId != null && assetId.equals(currentlyPlayingAssetId)) {
            clearNotification();
            currentlyPlayingAssetId = null;
        }
        notifyPlaybackState(assetId, "complete");
    }`,
    patched: `    public void dispatchComplete(String assetId) {
        JSObject ret = new JSObject();
        ret.put("assetId", assetId);
        notifyListeners("complete", ret);

        // Keep PAUSED + currentlyPlayingAssetId so notification Play still works.
        // Upstream cleared the id and notification, which made MediaSession onPlay a no-op.
        updateTrackedPlaybackState(assetId, PlaybackStateCompat.STATE_PAUSED);

        if (assetId != null && assetId.equals(currentlyPlayingAssetId) && showNotification) {
            updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
            updateNotification(assetId);
        }
        notifyPlaybackState(assetId, "complete");
    }`,
  },
  {
    id: 'notification-prev-next',
    marker: 'HanQuran: notification previous/next track',
    original: `                public void onRewind() {
                    handleCurrentMediaAction("rewinding", (audioId, asset) -> {
                        double currentPosition = asset.getCurrentPosition();
                        double duration = asset.getDuration();
                        double newPosition = clampSeekPositionSeconds(currentPosition, duration, -NOTIFICATION_SKIP_SECONDS);
                        asset.setCurrentPosition(newPosition);
                        updatePlaybackState(resolvePlaybackState(audioId, asset), asset);
                        notifyPlaybackState(audioId, "remoteRewind");
                        Log.d(TAG, "Rewind 15s: " + currentPosition + " -> " + newPosition);
                    });
                }

                @Override
                public void onFastForward() {
                    handleCurrentMediaAction("fast forwarding", (audioId, asset) -> {
                        double currentPosition = asset.getCurrentPosition();
                        double duration = asset.getDuration();
                        double newPosition = clampSeekPositionSeconds(currentPosition, duration, NOTIFICATION_SKIP_SECONDS);
                        asset.setCurrentPosition(newPosition);
                        updatePlaybackState(resolvePlaybackState(audioId, asset), asset);
                        notifyPlaybackState(audioId, "remoteFastForward");
                        Log.d(TAG, "Fast forward 15s: " + currentPosition + " -> " + newPosition);
                    });
                }`,
    patched: `                public void onRewind() {
                    // HanQuran: notification previous/next track (not ±15s seek).
                    handleCurrentMediaAction("skipping to previous", (audioId, asset) -> {
                        notifyPlaybackState(audioId, "remotePrevious");
                    });
                }

                @Override
                public void onSkipToPrevious() {
                    handleCurrentMediaAction("skipping to previous", (audioId, asset) -> {
                        notifyPlaybackState(audioId, "remotePrevious");
                    });
                }

                @Override
                public void onFastForward() {
                    handleCurrentMediaAction("skipping to next", (audioId, asset) -> {
                        notifyPlaybackState(audioId, "remoteNext");
                    });
                }

                @Override
                public void onSkipToNext() {
                    handleCurrentMediaAction("skipping to next", (audioId, asset) -> {
                        notifyPlaybackState(audioId, "remoteNext");
                    });
                }`,
  },
  {
    id: 'notification-actions-ui',
    marker: 'HanQuran: prev/next notification actions',
    original: `            .addAction(
                new NotificationCompat.Action.Builder(
                    android.R.drawable.ic_media_rew,
                    "Rewind 15 seconds",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        PlaybackStateCompat.ACTION_REWIND
                    )
                ).build()
            )
            .addAction(
                new NotificationCompat.Action.Builder(
                    isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                    isPlaying ? "Pause" : "Play",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        isPlaying ? PlaybackStateCompat.ACTION_PAUSE : PlaybackStateCompat.ACTION_PLAY
                    )
                ).build()
            )
            .addAction(
                new NotificationCompat.Action.Builder(
                    android.R.drawable.ic_media_ff,
                    "Fast forward 15 seconds",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        PlaybackStateCompat.ACTION_FAST_FORWARD
                    )
                ).build()
            )`,
    patched: `            // HanQuran: prev/next notification actions (ayah navigation).
            .addAction(
                new NotificationCompat.Action.Builder(
                    android.R.drawable.ic_media_previous,
                    "Previous",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
                    )
                ).build()
            )
            .addAction(
                new NotificationCompat.Action.Builder(
                    isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                    isPlaying ? "Pause" : "Play",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        isPlaying ? PlaybackStateCompat.ACTION_PAUSE : PlaybackStateCompat.ACTION_PLAY
                    )
                ).build()
            )
            .addAction(
                new NotificationCompat.Action.Builder(
                    android.R.drawable.ic_media_next,
                    "Next",
                    androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(
                        getContext(),
                        PlaybackStateCompat.ACTION_SKIP_TO_NEXT
                    )
                ).build()
            )`,
  },
  {
    id: 'playback-state-actions-init',
    marker: 'HanQuran: SKIP_TO_PREVIOUS/NEXT in init session',
    original: `            PlaybackStateCompat.ACTION_PLAY |
                PlaybackStateCompat.ACTION_PAUSE |
                PlaybackStateCompat.ACTION_STOP |
                PlaybackStateCompat.ACTION_REWIND |
                PlaybackStateCompat.ACTION_FAST_FORWARD |
                PlaybackStateCompat.ACTION_SEEK_TO
        );
        mediaSession.setPlaybackState(stateBuilder.build());

        // Set callback for media button events`,
    patched: `            PlaybackStateCompat.ACTION_PLAY |
                PlaybackStateCompat.ACTION_PAUSE |
                PlaybackStateCompat.ACTION_STOP |
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                PlaybackStateCompat.ACTION_REWIND |
                PlaybackStateCompat.ACTION_FAST_FORWARD |
                PlaybackStateCompat.ACTION_SEEK_TO
        );
        // HanQuran: SKIP_TO_PREVIOUS/NEXT in init session
        mediaSession.setPlaybackState(stateBuilder.build());

        // Set callback for media button events`,
  },
  {
    id: 'playback-state-actions-update',
    marker: 'HanQuran: SKIP_TO_PREVIOUS/NEXT in updatePlaybackState',
    original: `            .setActions(
                PlaybackStateCompat.ACTION_PLAY |
                    PlaybackStateCompat.ACTION_PAUSE |
                    PlaybackStateCompat.ACTION_STOP |
                    PlaybackStateCompat.ACTION_REWIND |
                    PlaybackStateCompat.ACTION_FAST_FORWARD |
                    PlaybackStateCompat.ACTION_SEEK_TO
            );
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void syncCurrentPlaybackState(String reason) {`,
    patched: `            .setActions(
                PlaybackStateCompat.ACTION_PLAY |
                    PlaybackStateCompat.ACTION_PAUSE |
                    PlaybackStateCompat.ACTION_STOP |
                    PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                    PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                    PlaybackStateCompat.ACTION_REWIND |
                    PlaybackStateCompat.ACTION_FAST_FORWARD |
                    PlaybackStateCompat.ACTION_SEEK_TO
            );
        // HanQuran: SKIP_TO_PREVIOUS/NEXT in updatePlaybackState
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void syncCurrentPlaybackState(String reason) {`,
  },
];

if (!existsSync(target)) {
  console.warn('[native-audio-patch] Plugin Java tidak ditemukan, lewati.');
  process.exit(0);
}

let source = readFileSync(target, 'utf8');
let applied = 0;
let skipped = 0;

for (const patch of PATCHES) {
  if (source.includes(patch.marker)) {
    console.log(`[native-audio-patch] ${patch.id}: sudah terpasang.`);
    skipped += 1;
    continue;
  }
  if (!source.includes(patch.original)) {
    console.error(
      `[native-audio-patch] ${patch.id}: pola tidak cocok — periksa versi plugin.`,
    );
    process.exit(1);
  }
  source = source.replace(patch.original, patch.patched);
  applied += 1;
  console.log(`[native-audio-patch] ${patch.id}: diterapkan.`);
}

if (applied > 0) {
  writeFileSync(target, source);
}

console.log(
  `[native-audio-patch] Selesai (applied=${applied}, skipped=${skipped}).`,
);
