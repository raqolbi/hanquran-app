'use client';

import { motion } from 'motion/react';

interface ActionBarProps {
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  onFocusMode?: () => void;
}

export function ActionBar({
  showTranslation = false,
  onToggleTranslation,
  onFocusMode,
}: ActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3"
    >
      <button
        onClick={onToggleTranslation}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          showTranslation
            ? 'bg-primary text-white'
            : 'bg-secondary text-foreground border border-border'
        }`}
      >
        {showTranslation ? 'Terjemahan ON' : 'Terjemahan OFF'}
      </button>

      <button
        onClick={onFocusMode}
        className="px-4 py-2 rounded-lg font-medium text-sm bg-secondary text-foreground border border-border hover:border-primary/50 transition-all duration-200"
      >
        Mode Fokus
      </button>
    </motion.div>
  );
}
