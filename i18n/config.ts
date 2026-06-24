import type { AppLocale } from '@/types';

export const locales = ['id', 'en'] as const satisfies readonly AppLocale[];

export const defaultLocale: AppLocale = 'id';

export type Locale = (typeof locales)[number];
