'use client';

import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';

import { useUserStore } from '@/stores/userStore';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

/**
 * Menerapkan preferensi aksesibilitas global: kontras tinggi & animasi halus.
 * Persistensi: `settings.contrastMode`, `settings.smoothAnimation` (Dexie).
 */
export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const contrastMode = useUserStore((s) => s.settings.contrastMode);
  const smoothAnimation = useUserStore((s) => s.settings.smoothAnimation);
  const initialized = useUserStore((s) => s.initialized);

  const highContrast = initialized && contrastMode === 'high';
  const motionEnabled = !initialized || smoothAnimation;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.contrast = highContrast ? 'high' : 'default';
    root.dataset.motion = motionEnabled ? 'smooth' : 'reduced';
  }, [highContrast, motionEnabled]);

  return (
    <MotionConfig reducedMotion={motionEnabled ? 'never' : 'always'}>
      {children}
    </MotionConfig>
  );
}
