/**
 * Jalankan audit Lighthouse (mobile) terhadap server produksi lokal.
 *
 * Prasyarat: `npm run build && npm run start` (atau set PERF_BASE_URL).
 * Output: `reports/lighthouse/<slug>.json` + ringkasan di stdout.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const reportsDir = path.join(rootDir, 'reports', 'lighthouse');

const DEFAULT_ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'surah-1', path: '/surah/1' },
  { slug: 'settings', path: '/settings' },
];

const THRESHOLD = 80;

function parseRoutesArg() {
  const routesFlag = process.argv.find((arg) => arg.startsWith('--routes='));
  if (!routesFlag) return DEFAULT_ROUTES;

  return routesFlag
    .replace('--routes=', '')
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const slug = segment === '/' ? 'home' : segment.replace(/^\//, '').replace(/\//g, '-');
      return { slug, path: segment.startsWith('/') ? segment : `/${segment}` };
    });
}

async function runAudit(baseUrl, route) {
  const url = new URL(route.path, baseUrl).href;
  const chrome = await chromeLauncher.launch({
    chromePath: await puppeteer.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        formFactor: 'mobile',
        screenEmulation: { mobile: true },
        throttling: {
          cpuSlowdownMultiplier: 4,
        },
      },
      undefined,
    );

    if (!result?.lhr) {
      throw new Error(`Lighthouse tidak mengembalikan LHR untuk ${url}`);
    }

    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, category]) => [
        key,
        Math.round((category.score ?? 0) * 100),
      ]),
    );

    fs.mkdirSync(reportsDir, { recursive: true });
    const outPath = path.join(reportsDir, `${route.slug}.json`);
    fs.writeFileSync(outPath, result.report);

    return { url, outPath, scores };
  } finally {
    await chrome.kill();
  }
}

function printSummary(rows) {
  console.log('\n=== Lighthouse (mobile) ===\n');
  for (const row of rows) {
    console.log(row.url);
    for (const [key, score] of Object.entries(row.scores)) {
      const ok = score >= THRESHOLD ? '✓' : '✗';
      console.log(`  ${ok} ${key}: ${score}`);
    }
    console.log(`  → ${row.outPath}\n`);
  }
}

function assertThresholds(rows) {
  const failures = [];
  for (const row of rows) {
    for (const [key, score] of Object.entries(row.scores)) {
      if (score < THRESHOLD) {
        failures.push(`${row.url} — ${key} ${score} < ${THRESHOLD}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error('Ambang Lighthouse tidak terpenuhi:');
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    if (!process.argv.includes('--soft')) {
      process.exitCode = 1;
    }
  }
}

async function main() {
  const baseUrl = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
  const routes = parseRoutesArg();

  const rows = [];
  for (const route of routes) {
    rows.push(await runAudit(baseUrl, route));
  }

  printSummary(rows);
  assertThresholds(rows);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
