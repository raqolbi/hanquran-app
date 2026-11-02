// ESLint flat config (docs/39 C2). Aturan dasar Next.js + Core Web Vitals +
// TypeScript. Tetap di ESLint 9: plugin react/import/jsx-a11y bawaan
// eslint-config-next belum mendukung ESLint 10.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'android/**',
      'node_modules/**',
      'reports/**',
      '.kilo/**',
      'next-env.d.ts',
      'public/sw-precache-manifest.js',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Variabel/argumen berawalan `_` sengaja tidak dipakai (mis. membuang
      // prop dari spread).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // Aturan baru React Compiler. Ada 13 pola "sinkronkan state dari
      // sumber eksternal di effect" yang aman tetapi perlu refactor
      // bertahap — sementara peringatan, bukan error (docs/39 C2).
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['tests/**'],
    rules: {
      // Mock `next/link` di test memakai <a> biasa.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

export default config;
