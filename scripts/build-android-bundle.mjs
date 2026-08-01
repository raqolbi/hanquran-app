/**
 * Bangun Android App Bundle (AAB) untuk Play Console.
 *
 * 1) `android:sync` (web export + cap sync + patch native audio)
 * 2) `./gradlew :app:bundleRelease`
 *
 * Signing: isi `android/keystore.properties` (lihat `.example`) atau env
 * `HANQURAN_STORE_FILE`, `HANQURAN_STORE_PASSWORD`, `HANQURAN_KEY_ALIAS`,
 * `HANQURAN_KEY_PASSWORD`. Tanpa itu, Gradle memakai unsigned release
 * (tidak diterima Play) — skrip tetap menghasilkan AAB untuk verifikasi lokal.
 *
 * Spek: docs/32 Phase A5.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ANDROID = join(ROOT, 'android');

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[android:bundle] Sync web + Capacitor…');
run('npm', ['run', 'android:sync']);

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
console.log('[android:bundle] Gradle bundleRelease…');
run(gradlew, [':app:bundleRelease'], ANDROID);

const aab = join(
  ANDROID,
  'app/build/outputs/bundle/release/app-release.aab',
);
if (!existsSync(aab)) {
  console.error('[android:bundle] AAB tidak ditemukan:', aab);
  process.exit(1);
}

console.log('[android:bundle] Selesai:', aab);
