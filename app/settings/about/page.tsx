'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ABOUT_DATA_SOURCE_CREDITS,
  ABOUT_TECHNOLOGY_CREDITS,
} from '@/data/about-credits';
import {
  ABOUT_FOCUS_ITEM_KEYS,
  ABOUT_PHILOSOPHY_PRINCIPLE_KEYS,
  APP_NAME,
  APP_REPOSITORY_URL,
  getAppVersion,
  getRepositoryCommercialLicenseUrl,
  getRepositoryLicenseUrl,
} from '@/lib/app-about';
import { routes } from '@/lib/routes';

import { Logo } from '@/components/shared/Logo';
import { SettingsSection } from '@/components/settings-section';

export default function AboutPage() {
  const t = useTranslations('about');
  const tCredits = useTranslations('about.credits');
  const version = getAppVersion();

  return (
    <div className="min-h-dvh bg-background pb-16">
      <AboutHeader />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        <SettingsSection title={t('app.sectionTitle')}>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">
              {t('app.version', { version })}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('app.description')}
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('mission.title')}
          description={t('mission.description')}
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="leading-relaxed">{t('mission.purpose')}</p>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {t('mission.philosophyTitle')}
              </h3>
              <ul className="list-disc space-y-1.5 pl-5">
                {ABOUT_PHILOSOPHY_PRINCIPLE_KEYS.map((key) => (
                  <li key={key}>{t(`mission.principles.${key}`)}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {t('mission.focusTitle')}
              </h3>
              <ul className="list-disc space-y-1.5 pl-5">
                {ABOUT_FOCUS_ITEM_KEYS.map((key) => (
                  <li key={key}>{t(`mission.focusItems.${key}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('credits.title')}
          description={t('credits.description')}
        >
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {tCredits('dataSources.title')}
              </h3>
              <ul className="space-y-3">
                {ABOUT_DATA_SOURCE_CREDITS.map((item) => (
                  <li key={item.id} className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {tCredits(item.labelKey)}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {tCredits(item.sourceKey)}
                        <ExternalLink
                          size={14}
                          className="shrink-0"
                          aria-hidden
                        />
                        <span className="sr-only">
                          {t('credits.opensInNewTab')}
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {tCredits(item.sourceKey)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground">
                {tCredits('technology.title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tCredits('technology.description')}
              </p>
              <ul className="space-y-1.5">
                {ABOUT_TECHNOLOGY_CREDITS.map((entry) => (
                  <li
                    key={entry.labelKey}
                    className="text-sm text-muted-foreground"
                  >
                    {tCredits(entry.labelKey)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={t('repository.title')}>
          <ul className="space-y-3">
            <li>
              <a
                href={APP_REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('repository.github')}
                <ExternalLink size={14} aria-hidden />
                <span className="sr-only">{t('credits.opensInNewTab')}</span>
              </a>
            </li>
            <li>
              <a
                href={getRepositoryLicenseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('repository.license')}
                <ExternalLink size={14} aria-hidden />
                <span className="sr-only">{t('credits.opensInNewTab')}</span>
              </a>
            </li>
            <li>
              <a
                href={getRepositoryCommercialLicenseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('repository.commercialLicense')}
                <ExternalLink size={14} aria-hidden />
                <span className="sr-only">{t('credits.opensInNewTab')}</span>
              </a>
            </li>
          </ul>
        </SettingsSection>
      </main>
    </div>
  );
}

function AboutHeader() {
  const router = useRouter();
  const t = useTranslations('about');
  const tCommon = useTranslations('common');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(routes.settings());
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={tCommon('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <Logo size={24} alt="" />
        <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
      </div>
    </motion.header>
  );
}
