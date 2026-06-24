'use client';

import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/shared/Logo';
import { routes } from '@/lib/routes';

export function Header() {
  const t = useTranslations('common');
  const tSettings = useTranslations('settings');
  const [status, setStatus] = useState<'online' | 'offline' | 'offline-ready'>('online');

  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const statusLabel =
    status === 'online'
      ? t('online')
      : status === 'offline'
        ? t('offline')
        : t('offlineReady');
  const statusColor = status === 'online' ? '#10B981' : status === 'offline' ? '#EF4444' : '#F59E0B';

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
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-3">
            <Logo size={40} priority />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">HanQuran</h1>
              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <p className="text-xs text-white/70">{statusLabel}</p>
              </div>
            </div>
          </div>
          <Link
            href={routes.settings()}
            className="p-2.5 hover:bg-white/15 rounded-full transition-colors text-white inline-flex items-center justify-center"
            aria-label={tSettings('title')}
          >
            <Settings size={24} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
