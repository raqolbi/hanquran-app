'use client';

import { motion } from 'motion/react';
import { useId, useState } from 'react';

import { LocaleText } from '@/components/shared/locale-text';
import { getLocalePair } from '@/lib/locale-text';

interface SearchInputProps {
  onSearch?: (query: string) => void;
}

// Label bilingual pra-paint (docs/21 §6.1 F8): placeholder asli tidak bisa
// di-swap CSS, jadi hint dirender sebagai elemen terpisah.
const SEARCH_PLACEHOLDER = getLocalePair('home', 'searchPlaceholder');
const SEARCH_LABEL = getLocalePair('home', 'searchAriaLabel');

export function SearchInput({ onSearch }: SearchInputProps) {
  const inputId = useId();
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="w-full"
    >
      <div className="relative w-full">
        <label htmlFor={inputId} className="sr-only">
          <LocaleText pair={SEARCH_LABEL} />
        </label>
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
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {value === '' ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <LocaleText pair={SEARCH_PLACEHOLDER} />
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
