/**
 * Ukur ukuran artefak build Next.js (.next/static).
 * Output: `reports/bundle-summary.json` + ringkasan di stdout.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const staticDir = path.join(rootDir, '.next', 'static');
const reportsDir = path.join(rootDir, 'reports');

const BUDGET_KB = {
  totalJsCss: 2048,
  largestChunk: 300,
};

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
    } else if (/\.(js|css)$/.test(entry.name)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function formatKb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

function main() {
  if (!fs.existsSync(staticDir)) {
    console.error('Folder .next/static tidak ditemukan. Jalankan `npm run build` terlebih dahulu.');
    process.exit(1);
  }

  const files = walkFiles(staticDir);
  const rows = files
    .map((filePath) => ({
      file: path.relative(staticDir, filePath),
      bytes: fs.statSync(filePath).size,
      kind: filePath.endsWith('.css') ? 'css' : 'js',
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
  const jsBytes = rows.filter((r) => r.kind === 'js').reduce((s, r) => s + r.bytes, 0);
  const cssBytes = rows.filter((r) => r.kind === 'css').reduce((s, r) => s + r.bytes, 0);
  const largest = rows[0];

  const summary = {
    measuredAt: new Date().toISOString(),
    totals: {
      allKb: formatKb(totalBytes),
      jsKb: formatKb(jsBytes),
      cssKb: formatKb(cssBytes),
      fileCount: rows.length,
    },
    largestChunk: largest
      ? { file: largest.file, kb: formatKb(largest.bytes) }
      : null,
    topChunks: rows.slice(0, 15).map((row) => ({
      file: row.file,
      kb: formatKb(row.bytes),
      kind: row.kind,
    })),
    budgets: BUDGET_KB,
    withinBudget: {
      totalJsCss: formatKb(totalBytes) <= BUDGET_KB.totalJsCss,
      largestChunk: largest
        ? formatKb(largest.bytes) <= BUDGET_KB.largestChunk
        : true,
    },
  };

  fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, 'bundle-summary.json');
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log('=== Bundle size (.next/static) ===\n');
  console.log(`Total JS+CSS: ${summary.totals.allKb} KB (${summary.totals.fileCount} file)`);
  console.log(`  JS:  ${summary.totals.jsKb} KB`);
  console.log(`  CSS: ${summary.totals.cssKb} KB`);
  if (largest) {
    console.log(`Largest: ${summary.largestChunk.kb} KB — ${summary.largestChunk.file}`);
  }
  console.log(`\nBudget total ≤ ${BUDGET_KB.totalJsCss} KB: ${summary.withinBudget.totalJsCss ? '✓' : '✗'}`);
  console.log(`Budget chunk ≤ ${BUDGET_KB.largestChunk} KB: ${summary.withinBudget.largestChunk ? '✓' : '✗'}`);
  console.log(`\n→ ${outPath}`);

  if (!summary.withinBudget.totalJsCss || !summary.withinBudget.largestChunk) {
    process.exitCode = 1;
  }
}

main();
