'use client';

import type { LucideIcon } from 'lucide-react';
import {
  BookOpenCheck,
  Gauge,
  Highlighter,
  Keyboard,
  ListMusic,
  Repeat,
  Repeat2,
  Target,
  WifiOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SettingsSubpageHeader } from '@/components/settings-subpage-header';

/** Urutan bagian Cara Pakai — teks di `messages/*.json` → `help.sections`. */
const HELP_SECTIONS: ReadonlyArray<{ key: string; icon: LucideIcon }> = [
  { key: 'repeat', icon: Repeat },
  { key: 'wordLoop', icon: Repeat2 },
  { key: 'wordHighlight', icon: Highlighter },
  { key: 'speed', icon: Gauge },
  { key: 'murotal', icon: ListMusic },
  { key: 'focus', icon: Target },
  { key: 'continue', icon: BookOpenCheck },
  { key: 'offline', icon: WifiOff },
  { key: 'keyboard', icon: Keyboard },
];

export default function HelpPage() {
  const t = useTranslations('help');

  return (
    <div className="min-h-dvh bg-background pb-16">
      <SettingsSubpageHeader title={t('title')} />

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{t('intro')}</p>

        {HELP_SECTIONS.map(({ key, icon: Icon }) => {
          const items = t.raw(`sections.${key}.items`) as string[];
          return (
            <section
              key={key}
              id={key}
              aria-labelledby={`help-${key}`}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <h2
                id={`help-${key}`}
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Icon size={18} aria-hidden="true" className="shrink-0 text-primary" />
                {t(`sections.${key}.title`)}
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
