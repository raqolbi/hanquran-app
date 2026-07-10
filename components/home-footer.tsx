'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/shared/Logo';
import {
  APP_AUTHOR_NAME,
  APP_AUTHOR_THREADS_URL,
  APP_AUTHOR_X_URL,
  APP_NAME,
  QOLCORE_URL,
} from '@/lib/app-about';

const linkClassName =
  'font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

export function HomeFooter() {
  const t = useTranslations('home.footer');
  const tAbout = useTranslations('about.credits');

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="pt-2"
      aria-label={APP_NAME}
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/[0.05] via-background to-background px-5 py-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />

        <div className="mx-auto flex max-w-xs flex-col items-center gap-2.5">
          <Logo size={28} alt="" />
          <p className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</p>

          <p className="text-xs text-muted-foreground">
            {t.rich('madeBy', {
              name: APP_AUTHOR_NAME,
              author: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </p>

          <nav aria-label={t('socialAriaLabel')}>
            <div className="flex items-center justify-center gap-2 text-xs">
              <a
                href={APP_AUTHOR_THREADS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {t('threads')}
                <span className="sr-only">{tAbout('opensInNewTab')}</span>
              </a>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <a
                href={APP_AUTHOR_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {t('x')}
                <span className="sr-only">{tAbout('opensInNewTab')}</span>
              </a>
            </div>
          </nav>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t.rich('fromQolcore', {
              company: (chunks) => (
                <a
                  href={QOLCORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {chunks}
                  <span className="sr-only">{tAbout('opensInNewTab')}</span>
                </a>
              ),
            })}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
