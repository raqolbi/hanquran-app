'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/shared/Logo';
import { navigateApp } from '@/lib/navigate';
import { isAndroidBuild, isNativePlatform } from '@/lib/platform';
import { routes } from '@/lib/routes';

/** Header halaman turunan Pengaturan (Tentang, Cara Pakai): kembali + judul. */
export function SettingsSubpageHeader({ title }: { title: string }) {
  const router = useRouter();
  const tCommon = useTranslations('common');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      if (isAndroidBuild() || isNativePlatform()) {
        navigateApp(routes.settings(), (href) => router.push(href));
        return;
      }
      router.back();
      return;
    }
    navigateApp(routes.settings(), (href) => router.push(href));
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
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </motion.header>
  );
}
