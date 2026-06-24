'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
}

interface SegmentedControlProps<Value extends string> {
  value: Value;
  onChange: (next: Value) => void;
  options: ReadonlyArray<SegmentedOption<Value>>;
  ariaLabel: string;
  className?: string;
}

/**
 * Inline single-select segmented control.
 *
 * Visual: pill-style group of buttons; active segment uses primary fill.
 * Use for short option sets (≤ 4 items) where the choice is mutually exclusive,
 * e.g. ukuran teks: Kecil / Sedang / Besar.
 */
export function SegmentedControl<Value extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex w-full rounded-lg border border-border bg-muted p-1',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
