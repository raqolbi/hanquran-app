'use client';

import { motion } from 'motion/react';

interface AyahCardProps {
  number: number;
  arabic: string;
  translation?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  showTranslation?: boolean;
  onClick?: () => void;
}

export function AyahCard({
  number,
  arabic,
  translation,
  isActive = false,
  isCompleted = false,
  showTranslation = false,
  onClick,
}: AyahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'border-primary bg-emerald-50'
          : isCompleted
          ? 'border-border bg-emerald-50'
          : 'border-border bg-white hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isActive && (
          <div className="text-lg">▶</div>
        )}
        {isCompleted && !isActive && (
          <div className="text-lg text-primary">✓</div>
        )}
        <span className="text-sm font-medium text-muted-foreground">Ayat {number}</span>
      </div>

      <div className="mb-4">
        <p
          className="text-4xl font-serif text-foreground leading-relaxed text-center"
          style={{ lineHeight: 1.9 }}
          dir="rtl"
        >
          {arabic}
        </p>
      </div>

      {showTranslation && translation && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {translation}
          </p>
        </div>
      )}
    </motion.div>
  );
}
