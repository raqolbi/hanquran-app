'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Semua' },
  { id: 'favorites', label: 'Favorit' },
];

interface FilterChipsProps {
  onFilterChange?: (filterId: string) => void;
}

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [selected, setSelected] = useState('all');

  const handleSelect = (id: string) => {
    setSelected(id);
    onFilterChange?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 mb-8"
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
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
