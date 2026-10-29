/**
 * Generate `public/og/og-default.png` (1200×630) untuk social preview —
 * `docs/35-seo-spec.md` §4 T5. Render HTML via puppeteer (devDependency),
 * screenshot sekali; hasilnya di-commit ke repo.
 *
 * Jalankan: `node scripts/generate-og-image.mjs`
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import puppeteer from 'puppeteer';

const WIDTH = 1200;
const HEIGHT = 630;

// Puppeteer di repo ini memakai Chrome bawaan; bila tidak ter-download,
// fallback ke Chromium sistem (mis. `/snap/bin/chromium`).
const SYSTEM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/snap/bin/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter(Boolean);

const executablePath = SYSTEM_CANDIDATES.find((candidate) => existsSync(candidate));

const LOGO = path.join(process.cwd(), 'public', 'branding', 'logo-with-text.png');
const OUT_DIR = path.join(process.cwd(), 'public', 'og');
const OUT_FILE = path.join(OUT_DIR, 'og-default.png');

// Data URI — `file://` diblokir saat `page.setContent` (origin about:blank).
const logoDataUri = `data:image/png;base64,${(await readFile(LOGO)).toString('base64')}`;

const pageHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: linear-gradient(135deg, #0F766E 0%, #134E4A 60%, #0F172A 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    position: relative; overflow: hidden;
  }
  body::before {
    content: ''; position: absolute; top: -180px; right: -180px;
    width: 480px; height: 480px; border-radius: 50%;
    background: rgba(250, 250, 248, 0.06);
  }
  .card {
    display: flex; flex-direction: column; align-items: center; gap: 28px;
    padding: 56px 72px; border-radius: 28px;
    background: rgba(250, 250, 248, 0.07);
    border: 1px solid rgba(250, 250, 248, 0.14);
  }
  img.logo { width: 320px; }
  .tagline {
    color: rgba(250, 250, 248, 0.95);
    font-size: 40px; font-weight: 600; letter-spacing: 0.2px;
  }
  .sub {
    color: rgba(250, 250, 248, 0.65);
    font-size: 26px; font-weight: 400;
  }
</style></head>
<body>
  <div class="card">
    <img class="logo" src="${logoDataUri}" alt="HanQuran" />
    <div class="sub">Aplikasi Hafalan Al-Qur'an</div>
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(pageHtml, { waitUntil: 'networkidle0' });
  await mkdir(OUT_DIR, { recursive: true });
  await page.screenshot({ path: OUT_FILE, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  await writeFile(path.join(OUT_DIR, '.gitkeep'), '');
  console.log(`OG image ditulis: ${OUT_FILE}`);
} finally {
  await browser.close();
}
