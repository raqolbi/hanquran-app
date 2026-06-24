'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ARABIC_TEXT_SIZE_PX,
  fontSizeToTextSize,
  textSizeToFontSize,
  type ArabicTextSize,
} from '@/lib/arabic-text-size';
import { routes } from '@/lib/routes';
import { formatMegabytes } from '@/lib/format-bytes';
import { clearOfflineAudioCache } from '@/services/cache-manager';
import { useUserStore } from '@/stores/userStore';
import { selectBadgeVariant, useOfflineStore } from '@/stores/offlineStore';
import { normalizeReciterId } from '@/lib/reciter-preference';

import { Logo } from '@/components/shared/Logo';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/ui/segmented-control';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  OfflineStatusBadge,
} from '@/components/offline-status-badge';
import {
  SettingsRow,
  SettingsSection,
} from '@/components/settings-section';

import { useReciters } from '@/hooks/use-reciters';
import { useIsClient } from '@/hooks/use-is-client';

const LOCALE_OPTIONS: ReadonlyArray<SegmentedOption<AppLocale>> = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
];

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const appLocale = useUserStore((s) => s.settings.appLocale);
  const reciterId = useUserStore((s) => s.settings.reciterId);
  const fontSize = useUserStore((s) => s.settings.fontSize);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const textSize = fontSizeToTextSize(fontSize);

  const { reciters } = useReciters();
  const contrastMode = useUserStore((s) => s.settings.contrastMode);
  const smoothAnimation = useUserStore((s) => s.settings.smoothAnimation);

  const badgeStatus = useOfflineStore(selectBadgeVariant);
  const totalSizeBytes = useOfflineStore((s) => s.manifestSummary.totalSizeBytes);
  const audioCacheMb = formatMegabytes(totalSizeBytes);
  const quranDataCached = true;

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [clearCacheError, setClearCacheError] = useState<string | null>(null);
  const [offlineUiReady, setOfflineUiReady] = useState(false);
  const isClient = useIsClient();
  const offlineReady = isClient && offlineUiReady;

  useEffect(() => {
    let cancelled = false;

    void useOfflineStore
      .getState()
      .refreshManifest()
      .finally(() => {
        if (!cancelled) {
          setOfflineUiReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayBadgeStatus = offlineReady ? badgeStatus : 'online';
  const displayAudioCacheMb = offlineReady
    ? audioCacheMb
    : formatMegabytes(0);
  const clearCacheDisabled =
    !offlineReady || totalSizeBytes === 0 || isClearingCache;

  const textSizeOptions: ReadonlyArray<SegmentedOption<ArabicTextSize>> = [
    { value: 'small', label: t('textSize.small') },
    { value: 'medium', label: t('textSize.medium') },
    { value: 'large', label: t('textSize.large') },
  ];

  const localeOptions = LOCALE_OPTIONS.map((option) => ({
    ...option,
    label: t(`language.${option.value}`),
  }));

  const selectedQariName =
    reciters.find((reciter) => reciter.id === reciterId)?.name ??
    t('qari.selectPlaceholder');

  const handleReciterChange = (value: string) => {
    void updateSettings({ reciterId: value });
  };

  const handleClearCache = () => {
    setClearCacheError(null);
    setIsClearingCache(true);

    void clearOfflineAudioCache()
      .then(() => {
        setConfirmClearOpen(false);
      })
      .catch(() => {
        setClearCacheError(t('offline.clearCacheFailed'));
      })
      .finally(() => {
        setIsClearingCache(false);
      });
  };

  const handleLocaleChange = (locale: AppLocale) => {
    void updateSettings({ appLocale: locale });
  };

  const handleTextSizeChange = (size: ArabicTextSize) => {
    void updateSettings({ fontSize: textSizeToFontSize(size) });
  };

  const handleHighContrastChange = (enabled: boolean) => {
    void updateSettings({ contrastMode: enabled ? 'high' : 'default' });
  };

  const handleSmoothAnimationChange = (enabled: boolean) => {
    void updateSettings({ smoothAnimation: enabled });
  };

  return (
    <div className="min-h-dvh bg-background pb-16">
      <SettingsHeader />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        <SettingsSection
          title={t('language.title')}
          description={t('language.description')}
        >
          <SegmentedControl
            value={appLocale}
            onChange={handleLocaleChange}
            options={localeOptions}
            ariaLabel={t('language.ariaLabel')}
          />
        </SettingsSection>

        <SettingsSection
          title={t('qari.title')}
          description={t('qari.description')}
        >
          <Select
            value={normalizeReciterId(reciterId)}
            onValueChange={handleReciterChange}
          >
            <SelectTrigger aria-label={t('qari.selectAriaLabel')}>
              <SelectValue placeholder={t('qari.selectPlaceholder')}>
                {selectedQariName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {reciters.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsSection>

        <SettingsSection
          title={t('textSize.title')}
          description={t('textSize.description')}
        >
          <div className="space-y-4">
            <SegmentedControl
              value={textSize}
              onChange={handleTextSizeChange}
              options={textSizeOptions}
              ariaLabel={t('textSize.ariaLabel')}
            />
            <TextSizePreview size={textSize} />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('offline.title')}
          description={t('offline.description')}
        >
          <div className="space-y-4">
            <OfflineStatusBadge status={displayBadgeStatus} />

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">{t('offline.audioCached')}</dt>
                <dd className="font-medium text-foreground">
                  {displayAudioCacheMb} MB
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">{t('offline.quranData')}</dt>
                <dd className="font-medium text-foreground">
                  {quranDataCached ? tCommon('cached') : tCommon('notCached')}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => {
                setClearCacheError(null);
                setConfirmClearOpen(true);
              }}
              disabled={clearCacheDisabled}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 size={16} />
              {t('offline.clearCache')}
            </button>

            {clearCacheError ? (
              <p className="text-sm text-destructive" role="alert">
                {clearCacheError}
              </p>
            ) : null}
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('accessibility.title')}
          description={t('accessibility.description')}
        >
          <div className="divide-y divide-border">
            <div className="pb-4">
              <SettingsRow
                label={t('accessibility.highContrast')}
                description={t('accessibility.highContrastDescription')}
                control={
                  <Switch
                    checked={contrastMode === 'high'}
                    onCheckedChange={handleHighContrastChange}
                    aria-label={t('accessibility.highContrastAriaLabel')}
                  />
                }
              />
            </div>
            <div className="pt-4">
              <SettingsRow
                label={t('accessibility.smoothAnimation')}
                description={t('accessibility.smoothAnimationDescription')}
                control={
                  <Switch
                    checked={smoothAnimation}
                    onCheckedChange={handleSmoothAnimationChange}
                    aria-label={t('accessibility.smoothAnimationAriaLabel')}
                  />
                }
              />
            </div>
          </div>
        </SettingsSection>
      </main>

      <ClearCacheDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        onConfirm={handleClearCache}
        isClearing={isClearingCache}
      />
    </div>
  );
}

function SettingsHeader() {
  const router = useRouter();
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(routes.home());
    }
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

interface TextSizePreviewProps {
  size: ArabicTextSize;
}

function TextSizePreview({ size }: TextSizePreviewProps) {
  const tCommon = useTranslations('common');

  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {tCommon('preview')}
      </p>
      <motion.p
        key={size}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        dir="rtl"
        className="text-center font-serif text-foreground"
        style={{ fontSize: ARABIC_TEXT_SIZE_PX[size], lineHeight: 1.9 }}
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </motion.p>
    </div>
  );
}

interface ClearCacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isClearing?: boolean;
}

function ClearCacheDialog({
  open,
  onOpenChange,
  onConfirm,
  isClearing = false,
}: ClearCacheDialogProps) {
  const t = useTranslations('settings.offline');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clearCacheTitle')}</DialogTitle>
          <DialogDescription>{t('clearCacheDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isClearing}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isClearing}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-destructive/10 px-5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            {isClearing ? t('clearCacheInProgress') : t('clearCache')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
