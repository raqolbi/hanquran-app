'use client';

import { motion } from 'motion/react';
import { ChevronDown, Settings } from 'lucide-react';
import { useState } from 'react';

import {
  REPEAT_OPTIONS,
  getRepeatOption,
  type RepeatCount,
} from '@/lib/repeat-options';
import { RepeatStatus, type RepeatStatusProps } from './repeat-status';

interface RepeatSelectorProps {
  count: RepeatCount;
  isActive?: boolean;
  statusProps?: RepeatStatusProps;
  onOpenSettings?: () => void;
  onCountChange?: (count: RepeatCount) => void;
}

export function RepeatSelector({
  count,
  isActive = false,
  statusProps,
  onOpenSettings,
  onCountChange,
}: RepeatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = getRepeatOption(count);

  const handleSelect = (value: RepeatCount) => {
    onCountChange?.(value);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Repeat</span>
        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Pengaturan Repeat"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-white hover:border-primary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{currentOption.emoji}</span>
            <span className="text-sm font-medium text-foreground">{currentOption.label}</span>
          </span>
          <ChevronDown size={18} className="text-muted-foreground" />
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50"
          >
            {REPEAT_OPTIONS.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                  count === option.value
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-lg">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {isActive && statusProps && <RepeatStatus {...statusProps} />}
    </div>
  );
}
