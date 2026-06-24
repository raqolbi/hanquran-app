'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SearchInputProps {
  onSearch?: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const t = useTranslations('home');
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mx-4 sm:mx-6 lg:mx-auto mb-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            aria-label={t('searchAriaLabel')}
          />
        </div>
      </div>
    </motion.div>
  );
}
