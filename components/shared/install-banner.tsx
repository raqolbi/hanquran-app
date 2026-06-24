'use client';

import { motion } from 'motion/react';
import { Download, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useInstallPrompt } from '@/hooks/use-install-prompt';

export function InstallBanner() {
  const t = useTranslations('pwa');
  const { showBanner, canNativePrompt, isIosHint, promptInstall, dismissBanner } =
    useInstallPrompt();

  if (!showBanner) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      aria-label={t('installAriaLabel')}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Download size={18} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{t('installTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isIosHint ? t('installIOSHint') : t('installDescription')}
          </p>

          {canNativePrompt ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('installAction')}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={dismissBanner}
          className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('installDismiss')}
        >
          <X size={18} />
        </button>
      </div>
    </motion.section>
  );
}
