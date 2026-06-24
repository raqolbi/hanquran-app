'use client';

import * as React from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Generic wrapper untuk setiap kelompok pengaturan.
 * Mengikuti spec §17: card putih, radius 16px, padding 16px.
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-2"
    >
      <header className="px-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div
        className={cn(
          'rounded-2xl border border-border bg-white p-4 shadow-sm',
          className,
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  control: React.ReactNode;
}

/**
 * Baris label + control standar untuk dipakai di dalam SettingsSection.
 * Mis. label "Tampilkan terjemahan" + Switch.
 */
export function SettingsRow({ label, description, control }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
