'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NativeAwareLink } from '@/components/native-aware-link';
import { SURAH_DETAIL_FULL_CHROME_SELECTOR } from '@/lib/auto-follow-playback';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Bilah tipis yang menempel di atas halaman surat setelah header penuh
 * (judul, Simpan Offline, sakelar baca) tergulir keluar layar.
 * Header penuh tidak lagi sticky, jadi area baca saat menggulir jauh lebih luas.
 */
export function SurahCompactBar({
  surahName,
  activeAyah,
  onFocusMode,
}: {
  surahName: string;
  activeAyah: number;
  onFocusMode: () => void;
}) {
  const t = useTranslations('surah');
  const tCommon = useTranslations('common');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => {
      const chrome = document.querySelector(SURAH_DETAIL_FULL_CHROME_SELECTOR);
      setShown(chrome ? chrome.getBoundingClientRect().bottom <= 0 : false);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      data-surah-detail-compact-bar
      aria-hidden={!shown}
      inert={!shown}
      className={cn(
        'fixed inset-x-0 top-0 z-30 border-b border-border bg-background pt-safe',
        'transition-transform duration-200 ease-out motion-reduce:transition-none',
        shown ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <NativeAwareLink
          href={routes.home()}
          className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-secondary"
          aria-label={tCommon('backToSurahList')}
        >
          <ArrowLeft size={20} className="text-foreground" />
        </NativeAwareLink>
        <p className="min-w-0 flex-1 truncate">
          <span className="font-semibold text-foreground">{surahName}</span>
          <span className="text-sm text-muted-foreground">
            {' · '}
            {t('compactAyah', { n: activeAyah })}
          </span>
        </p>
        <button
          type="button"
          onClick={onFocusMode}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-secondary"
          aria-label={t('compactFocus')}
        >
          <Target size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
