/**
 * Validasi dasar PWA (manifest + service worker) via Puppeteer.
 * Lighthouse 12+ tidak lagi menyediakan kategori PWA terpisah.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const reportsDir = path.join(rootDir, 'reports');

const CHECKS = [
  {
    id: 'manifest_link',
    label: 'Link rel=manifest di HTML',
    weight: 25,
  },
  {
    id: 'manifest_valid',
    label: 'public/manifest.json valid (name, icons, start_url)',
    weight: 25,
  },
  {
    id: 'service_worker',
    label: 'Service worker terdaftar saat halaman dimuat',
    weight: 30,
  },
  {
    id: 'theme_color',
    label: 'theme-color / themeColor tersedia',
    weight: 20,
  },
];

function scoreManifestFile() {
  const manifestPath = path.join(rootDir, 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { pass: false, detail: 'manifest.json tidak ditemukan' };
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const ok =
      Boolean(manifest.name) &&
      Boolean(manifest.start_url) &&
      Array.isArray(manifest.icons) &&
      manifest.icons.length > 0;
    return {
      pass: ok,
      detail: ok ? 'manifest.json valid' : 'field wajib manifest kurang',
    };
  } catch {
    return { pass: false, detail: 'manifest.json tidak bisa di-parse' };
  }
}

async function auditPage(baseUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 60_000 });

    const manifestHref = await page.$eval('link[rel="manifest"]', (el) => el.href).catch(() => null);
    const themeColor = await page
      .$eval('meta[name="theme-color"]', (el) => el.content)
      .catch(() => null);
    const hasSw = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return Boolean(reg);
    });

    return {
      manifest_link: {
        pass: Boolean(manifestHref),
        detail: manifestHref ?? 'tidak ada <link rel="manifest">',
      },
      manifest_valid: scoreManifestFile(),
      service_worker: {
        pass: hasSw,
        detail: hasSw ? 'service worker aktif' : 'belum ada registrasi SW',
      },
      theme_color: {
        pass: Boolean(themeColor),
        detail: themeColor ? `theme-color=${themeColor}` : 'meta theme-color tidak ditemukan',
      },
    };
  } finally {
    await browser.close();
  }
}

function computeScore(results) {
  let earned = 0;
  let total = 0;
  const rows = [];

  for (const check of CHECKS) {
    total += check.weight;
    const result = results[check.id];
    const pass = result?.pass ?? false;
    if (pass) earned += check.weight;
    rows.push({
      id: check.id,
      label: check.label,
      pass,
      detail: result?.detail ?? '',
      weight: check.weight,
    });
  }

  return {
    score: Math.round((earned / total) * 100),
    rows,
  };
}

async function main() {
  const baseUrl = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
  const results = await auditPage(baseUrl);
  const { score, rows } = computeScore(results);

  const summary = {
    measuredAt: new Date().toISOString(),
    url: baseUrl,
    score,
    threshold: 80,
    checks: rows,
  };

  fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, 'pwa-summary.json');
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log('=== PWA smoke audit ===\n');
  for (const row of rows) {
    console.log(`${row.pass ? '✓' : '✗'} ${row.label} — ${row.detail}`);
  }
  console.log(`\nSkor PWA (smoke): ${score} (ambang ≥ 80)`);
  console.log(`→ ${outPath}\n`);

  if (score < 80) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
