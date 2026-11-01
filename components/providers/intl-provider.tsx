'use client';

import { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import { APP_LOCALE_ATTRIBUTE, writeCachedAppLocale } from '@/lib/app-locale';
import { useUserStore } from '@/stores/userStore';
import type { AppLocale } from '@/types';

import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';

const messagesByLocale: Record<AppLocale, typeof idMessages> = {
  id: idMessages,
  en: enMessages,
};

interface IntlProviderProps {
  children: React.ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const locale = useUserStore((s) => s.settings.appLocale);
  const initialized = useUserStore((s) => s.initialized);

  // Jangan sentuh atribut pra-paint sebelum Dexie selesai: skrip inline di
  // `app/layout.tsx` sudah memilih locale dari cache. Setelah `initialized`,
  // Dexie menjadi sumber kebenaran dan cache disegarkan (docs/21 §6.1).
  useEffect(() => {
    if (!initialized) {
      return;
    }

    const root = document.documentElement;
    root.setAttribute(APP_LOCALE_ATTRIBUTE, locale);
    root.lang = locale;
    writeCachedAppLocale(locale);
  }, [initialized, locale]);

  // Sebelum `initialized`, pakai `id` agar render klien = HTML server
  // (tidak ada hydration mismatch). Teks bilingual & `data-app-locale`
  // menangani tampilan paint pertama.
  const activeLocale = initialized ? locale : 'id';

  return (
    <NextIntlClientProvider
      locale={activeLocale}
      messages={messagesByLocale[activeLocale]}
      timeZone="Asia/Jakarta"
    >
      {children}
    </NextIntlClientProvider>
  );
}
