'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

import { LocaleText } from '@/components/shared/locale-text';
import { getLocalePair } from '@/lib/locale-text';

interface FilterChipsProps {
  onFilterChange?: (filterId: string) => void;
}

const FILTER_OPTIONS = [
  { id: 'all', label: getLocalePair('common', 'all') },
  { id: 'favorites', label: getLocalePair('common', 'favorites') },
];

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [selected, setSelected] = useState('all');

  const handleSelect = (id: string) => {
    setSelected(id);
    onFilterChange?.(id);
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="flex gap-2">
        {FILTER_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option.id)}
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selected === option.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-foreground hover:bg-muted border border-border'
            }`}
            aria-pressed={selected === option.id}
          >
            <LocaleText pair={option.label} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
