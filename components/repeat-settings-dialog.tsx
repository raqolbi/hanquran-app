'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  REPEAT_OPTIONS,
  formatRepeatCount,
  type RepeatCount,
  type RepeatTarget,
} from '@/lib/repeat-options';

export interface RepeatSettingsConfig {
  repeatCount: RepeatCount;
  targetType: RepeatTarget;
  fromAyah?: number;
  toAyah?: number;
}

interface RepeatSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  repeatCount: RepeatCount;
  targetType: RepeatTarget;
  fromAyah?: number;
  toAyah?: number;

  currentAyah: number;
  totalAyahs: number;
  surahName: string;

  onApply: (config: RepeatSettingsConfig) => void;
}

const TARGET_OPTIONS: ReadonlyArray<{
  value: RepeatTarget;
  label: string;
  hint: string;
}> = [
  {
    value: 'current_ayah',
    label: 'Ayat Aktif',
    hint: 'Mengulang ayat yang sedang aktif.',
  },
  {
    value: 'ayah_range',
    label: 'Range Ayat',
    hint: 'Mengulang range ayat tertentu.',
  },
  {
    value: 'entire_surah',
    label: 'Surat Ini',
    hint: 'Mengulang seluruh surat dari awal sampai akhir.',
  },
];

export function RepeatSettingsDialog(props: RepeatSettingsDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengaturan Repeat</DialogTitle>
            <DialogDescription>
              Pilih jumlah dan target pengulangan.
            </DialogDescription>
          </DialogHeader>
          <RepeatSettingsForm {...props} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pengaturan Repeat</DrawerTitle>
          <DrawerDescription>
            Pilih jumlah dan target pengulangan.
          </DrawerDescription>
        </DrawerHeader>
        <RepeatSettingsForm {...props} />
      </DrawerContent>
    </Drawer>
  );
}

function RepeatSettingsForm({
  open,
  onOpenChange,
  repeatCount,
  targetType,
  fromAyah,
  toAyah,
  currentAyah,
  totalAyahs,
  surahName,
  onApply,
}: RepeatSettingsDialogProps) {
  const [draftCount, setDraftCount] = React.useState<RepeatCount>(repeatCount);
  const [draftTarget, setDraftTarget] = React.useState<RepeatTarget>(targetType);
  const [draftFrom, setDraftFrom] = React.useState<number>(fromAyah ?? 1);
  const [draftTo, setDraftTo] = React.useState<number>(toAyah ?? totalAyahs);

  // Reset drafts each time the dialog opens, so reopening shows current config.
  React.useEffect(() => {
    if (open) {
      setDraftCount(repeatCount);
      setDraftTarget(targetType);
      setDraftFrom(fromAyah ?? 1);
      setDraftTo(toAyah ?? totalAyahs);
    }
  }, [open, repeatCount, targetType, fromAyah, toAyah, totalAyahs]);

  const rangeValid =
    draftTarget !== 'ayah_range' ||
    (draftFrom >= 1 &&
      draftTo <= totalAyahs &&
      draftFrom <= draftTo);

  const preview = buildPreview({
    targetType: draftTarget,
    repeatCount: draftCount,
    currentAyah,
    fromAyah: draftFrom,
    toAyah: draftTo,
    surahName,
  });

  const handleApply = () => {
    if (!rangeValid) return;
    onApply({
      repeatCount: draftCount,
      targetType: draftTarget,
      fromAyah: draftTarget === 'ayah_range' ? draftFrom : undefined,
      toAyah: draftTarget === 'ayah_range' ? draftTo : undefined,
    });
    onOpenChange(false);
  };

  return (
    <div className="space-y-6">
      {/* Jumlah Repeat */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Jumlah Repeat
        </h3>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Jumlah repeat">
          {REPEAT_OPTIONS.map((option) => {
            const selected = draftCount === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDraftCount(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 transition-all duration-200 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <span className="text-2xl leading-none">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Target</h3>
        <div className="space-y-2" role="radiogroup" aria-label="Target repeat">
          {TARGET_OPTIONS.map((option) => {
            const selected = draftTarget === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDraftTarget(option.value)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-white',
                  )}
                  aria-hidden
                >
                  {selected && <Check size={12} className="text-white" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Range Inputs - only when ayah_range */}
      <AnimatePresence initial={false}>
        {draftTarget === 'ayah_range' && (
          <motion.section
            key="range-inputs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <h3 className="text-sm font-semibold text-foreground">
                Range Ayat
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Dari Ayat"
                  min={1}
                  max={totalAyahs}
                  value={draftFrom}
                  onChange={setDraftFrom}
                />
                <NumberField
                  label="Sampai Ayat"
                  min={1}
                  max={totalAyahs}
                  value={draftTo}
                  onChange={setDraftTo}
                />
              </div>
              {!rangeValid && (
                <p className="text-xs text-destructive">
                  Range harus di antara 1 dan {totalAyahs}, serta Dari ≤ Sampai.
                </p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Live Preview */}
      <section className="rounded-xl border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Preview
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={preview}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="mt-1 text-sm font-medium text-foreground"
          >
            {preview}
          </motion.p>
        </AnimatePresence>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={!rangeValid}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({ label, min, max, value, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

function buildPreview(args: {
  targetType: RepeatTarget;
  repeatCount: RepeatCount;
  currentAyah: number;
  fromAyah: number;
  toAyah: number;
  surahName: string;
}): string {
  const count = formatRepeatCount(args.repeatCount);

  switch (args.targetType) {
    case 'current_ayah':
      return `Ayat ${args.currentAyah} • ${count}`;
    case 'ayah_range':
      return `Ayat ${args.fromAyah}-${args.toAyah} • ${count}`;
    case 'entire_surah':
      return `${args.surahName} • ${count}`;
  }
}
