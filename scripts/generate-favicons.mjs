/**
 * Generate favicon App Router (docs/35-seo-spec.md §4 T8):
 * - `app/icon.png` — 512×512, latar transparan (tab browser)
 * - `app/apple-icon.png` — 180×180, latar #FAFAF8 (iOS menaruh sudut membulat)
 *
 * Jalankan: `node scripts/generate-favicons.mjs`
 * Butuh Chromium (fallback sistem seperti script OG).
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import puppeteer from 'puppeteer';

const LOGO = path.join(process.cwd(), 'public', 'branding', 'logo.png');
const logoDataUri = `data:image/png;base64,${(await readFile(LOGO)).toString('base64')}`;

const SYSTEM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/snap/bin/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter(Boolean);

const executablePath = SYSTEM_CANDIDATES.find((candidate) => existsSync(candidate));

const pageHtml = (background) => `<!doctype html>
<html>
<head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 100%; height: 100vh; background: ${background};
    display: flex; align-items: center; justify-content: center;
  }
  img { width: 72%; height: auto; }
</style></head>
<body><img src="${logoDataUri}" alt="" /></body>
</html>`;

async function renderIcon(page, size, background, outFile, transparent = false) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(pageHtml(background), { waitUntil: 'load' });
  await page.screenshot({ path: outFile, omitBackground: transparent });
  console.log(`Favicon ditulis: ${outFile} (${size}×${size})`);
}

const browser = await puppeteer.launch({
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await renderIcon(page, 512, 'transparent', path.join('app', 'icon.png'), true);
  await renderIcon(page, 180, '#FAFAF8', path.join('app', 'apple-icon.png'));
} finally {
  await browser.close();
}
