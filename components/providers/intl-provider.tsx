'use client';

import { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';

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

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
