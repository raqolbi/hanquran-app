import type { AppLocale } from '@/types';

import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';

/**
 * Teks bilingual untuk **paint pertama** (docs/21 §5.6, F8).
 *
 * `next-intl` baru memakai locale tersimpan setelah Dexie selesai dibaca,
 * sehingga label yang hanya dirender dengan locale aktif akan berkedip
 * Indonesia untuk pengguna `en`. Untuk label kecil di atas lipatan, kedua
 * bahasa dirender sekaligus dan CSS memilih berdasarkan
 * `<html data-app-locale>` (lihat `app/globals.css`).
 *
 * Bundle klien sudah memuat kedua berkas pesan lewat `IntlProvider`; impor di
 * sini tidak menambah unduhan baru.
 */

export interface LocalePair {
  id: string;
  en: string;
}

const messagesByLocale: Record<AppLocale, unknown> = {
  id: idMessages,
  en: enMessages,
};

function readMessage(messages: unknown, namespace: string, key: string): string {
  let node: unknown = messages;

  for (const part of [...namespace.split('.'), ...key.split('.')]) {
    if (!node || typeof node !== 'object') {
      return '';
    }
    node = (node as Record<string, unknown>)[part];
  }

  return typeof node === 'string' ? node : '';
}

/** Ambil teks `id` dan `en` untuk namespace/kunci pesan yang sama. */
export function getLocalePair(namespace: string, key: string): LocalePair {
  return {
    id: readMessage(messagesByLocale.id, namespace, key),
    en: readMessage(messagesByLocale.en, namespace, key),
  };
}
