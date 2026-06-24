'use client';

import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ConnectionIndicator } from '@/components/offline-status-badge';
import { Logo } from '@/components/shared/Logo';
import { routes } from '@/lib/routes';
import {
  selectConnectionIndicatorStatus,
  useOfflineStore,
} from '@/stores/offlineStore';

export function Header() {
  const tSettings = useTranslations('settings');
  const connectionStatus = useOfflineStore(selectConnectionIndicatorStatus);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40"
      style={{
        background: 'linear-gradient(135deg, #C4844A 0%, #2D9B8C 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Logo size={40} priority />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-white tracking-tight">HanQuran</h1>
              <ConnectionIndicator
                status={connectionStatus}
                variant="header"
                className="mt-1.5"
              />
            </div>
          </div>
          <Link
            href={routes.settings()}
            className="shrink-0 p-2.5 hover:bg-white/15 rounded-full transition-colors text-white inline-flex items-center justify-center"
            aria-label={tSettings('title')}
          >
            <Settings size={24} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
