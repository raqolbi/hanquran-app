'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { routes } from '@/lib/routes';
import { useUserStore } from '@/stores/userStore';
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
  type ConnectionStatus,
} from '@/components/offline-status-badge';
import {
  SettingsRow,
  SettingsSection,
} from '@/components/settings-section';

import { useReciters } from '@/hooks/use-reciters';

type TextSize = 'small' | 'medium' | 'large';

const TEXT_SIZE_PX: Record<TextSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
};

const LOCALE_OPTIONS: ReadonlyArray<SegmentedOption<AppLocale>> = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
];

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const appLocale = useUserStore((s) => s.settings.appLocale);
  const reciterId = useUserStore((s) => s.settings.reciterId);
  const updateSettings = useUserStore((s) => s.updateSettings);

  const { reciters } = useReciters();
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [smoothAnimation, setSmoothAnimation] = useState(true);

  const [connectionStatus] = useState<ConnectionStatus>('offline_ready');
  const [audioCacheMb, setAudioCacheMb] = useState(24);
  const [quranDataCached, setQuranDataCached] = useState(true);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const textSizeOptions: ReadonlyArray<SegmentedOption<TextSize>> = [
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
    setAudioCacheMb(0);
    setQuranDataCached(false);
    setConfirmClearOpen(false);
  };

  const handleLocaleChange = (locale: AppLocale) => {
    void updateSettings({ appLocale: locale });
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
              onChange={setTextSize}
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
            <OfflineStatusBadge status={connectionStatus} />

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">{t('offline.audioCached')}</dt>
                <dd className="font-medium text-foreground">
                  {audioCacheMb} MB
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
              onClick={() => setConfirmClearOpen(true)}
              disabled={audioCacheMb === 0 && !quranDataCached}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 size={16} />
              {t('offline.clearCache')}
            </button>
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
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
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
                    onCheckedChange={setSmoothAnimation}
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
  size: TextSize;
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
        style={{ fontSize: TEXT_SIZE_PX[size], lineHeight: 1.9 }}
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
}

function ClearCacheDialog({
  open,
  onOpenChange,
  onConfirm,
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
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-destructive/10 px-5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            {t('clearCache')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
