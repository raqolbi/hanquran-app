#!/usr/bin/env node
/**
 * Siapkan sumber `@capacitor/assets` dari `branding/logo.png`.
 *
 * Logo sumber 1536×1024 (landscape, transparan). Capacitor Assets butuh
 * kotak ≥1024×1024 (ikon) dan ≥2732×2732 (splash). Skrip ini:
 * - memotong konten logo
 * - menempatkannya di safe zone adaptive icon (~66%)
 * - menulis `assets/logo.png`, `icon-*.png`, dan `splash*.png`
 */

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceLogo = join(root, 'branding', 'logo.png');
const outDir = join(root, 'assets');

/** Latar ikon / splash terang — selaras PWA `manifest.json`. */
const BG_LIGHT = { r: 250, g: 250, b: 248, alpha: 1 };
/** Latar gelap — logo guidelines `#0F172A`. */
const BG_DARK = { r: 15, g: 23, b: 42, alpha: 1 };

const ICON_SIZE = 1024;
/** Safe zone adaptive icon ≈ 66% kanvas. */
const SAFE_RATIO = 0.62;
const SPLASH_SIZE = 2732;
const SPLASH_LOGO_RATIO = 0.42;

async function extractLogoMark() {
  const image = sharp(sourceLogo).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX <= minX || maxY <= minY) {
    throw new Error(`Gagal mendeteksi konten logo di ${sourceLogo}`);
  }

  // Padding kecil agar anti-alias tepi tidak terpotong.
  const pad = 8;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2);
  const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2);

  return sharp(sourceLogo)
    .ensureAlpha()
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
}

async function fitOnCanvas(mark, size, maxRatio, background) {
  const maxSide = Math.round(size * maxRatio);
  const fitted = await sharp(mark)
    .resize({
      width: maxSide,
      height: maxSide,
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const left = Math.round((size - fitted.info.width) / 2);
  const top = Math.round((size - fitted.info.height) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: fitted.data, left, top }])
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const mark = await extractLogoMark();

  const logo = await fitOnCanvas(mark, ICON_SIZE, SAFE_RATIO, {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  });
  const iconForeground = logo;
  const iconOnly = await fitOnCanvas(mark, ICON_SIZE, SAFE_RATIO, BG_LIGHT);
  const iconBackground = await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: BG_LIGHT,
    },
  })
    .png()
    .toBuffer();

  const splash = await fitOnCanvas(mark, SPLASH_SIZE, SPLASH_LOGO_RATIO, BG_LIGHT);
  const splashDark = await fitOnCanvas(mark, SPLASH_SIZE, SPLASH_LOGO_RATIO, BG_DARK);

  const writes = [
    ['logo.png', logo],
    ['icon-only.png', iconOnly],
    ['icon-foreground.png', iconForeground],
    ['icon-background.png', iconBackground],
    ['splash.png', splash],
    ['splash-dark.png', splashDark],
  ];

  for (const [name, buffer] of writes) {
    const path = join(outDir, name);
    await sharp(buffer).png().toFile(path);
    const meta = await sharp(path).metadata();
    console.log(`[prepare-capacitor-assets] ${name} → ${meta.width}×${meta.height}`);
  }

  console.log('[prepare-capacitor-assets] Sumber siap di assets/');
}

main().catch((error) => {
  console.error('[prepare-capacitor-assets] Gagal:', error);
  process.exit(1);
});
