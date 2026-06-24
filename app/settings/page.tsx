'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { routes } from '@/lib/routes';

import { Logo } from '@/components/shared/Logo';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/ui/segmented-control';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  OfflineStatusBadge,
  type ConnectionStatus,
} from '@/components/offline-status-badge';
import {
  SettingsRow,
  SettingsSection,
} from '@/components/settings-section';

import { useReciters } from '@/hooks/use-reciters';

// ---------- Domain types ----------

type TextSize = 'small' | 'medium' | 'large';

const TEXT_SIZE_OPTIONS: ReadonlyArray<SegmentedOption<TextSize>> = [
  { value: 'small', label: 'Kecil' },
  { value: 'medium', label: 'Sedang' },
  { value: 'large', label: 'Besar' },
];

// Arabic font sizes follow design-system.md (32 / 40 / 48 px)
const TEXT_SIZE_PX: Record<TextSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
};

// ---------- Page ----------

export default function SettingsPage() {
  const { reciters, defaultReciterId } = useReciters();
  const [qari, setQari] = useState(defaultReciterId);
  const [showTranslation, setShowTranslation] = useState(true);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [smoothAnimation, setSmoothAnimation] = useState(true);

  // Offline state — fake but selectable so design QA can preview all 5 variants.
  const [connectionStatus] = useState<ConnectionStatus>('offline_ready');
  const [audioCacheMb, setAudioCacheMb] = useState(24);
  const [quranDataCached, setQuranDataCached] = useState(true);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const selectedQariName =
    reciters.find((reciter) => reciter.id === qari)?.name ?? 'Pilih qari';

  const handleClearCache = () => {
    setAudioCacheMb(0);
    setQuranDataCached(false);
    setConfirmClearOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background pb-16">
      <SettingsHeader />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        {/* Qari */}
        <SettingsSection
          title="Qari"
          description="Pilih suara qari favorit untuk bacaan audio."
        >
          <Select value={qari} onValueChange={setQari}>
            <SelectTrigger aria-label="Pilih qari">
              <SelectValue placeholder="Pilih qari">{selectedQariName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {reciters.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsSection>

        {/* Terjemahan */}
        <SettingsSection
          title="Terjemahan"
          description="Atur tampilan terjemahan ayat secara default."
        >
          <SettingsRow
            label={
              showTranslation
                ? 'Tampilkan terjemahan'
                : 'Sembunyikan terjemahan'
            }
            description="Berlaku pada semua surat."
            control={
              <Switch
                checked={showTranslation}
                onCheckedChange={setShowTranslation}
                aria-label="Tampilkan terjemahan"
              />
            }
          />
        </SettingsSection>

        {/* Ukuran Teks */}
        <SettingsSection
          title="Ukuran Teks"
          description="Ukuran teks Arab pada layar baca dan Mode Fokus."
        >
          <div className="space-y-4">
            <SegmentedControl
              value={textSize}
              onChange={setTextSize}
              options={TEXT_SIZE_OPTIONS}
              ariaLabel="Ukuran teks Arab"
            />
            <TextSizePreview size={textSize} />
          </div>
        </SettingsSection>

        {/* Offline & Cache */}
        <SettingsSection
          title="Offline & Cache"
          description="Status data tersimpan untuk penggunaan tanpa internet."
        >
          <div className="space-y-4">
            <OfflineStatusBadge status={connectionStatus} />

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Audio tersimpan</dt>
                <dd className="font-medium text-foreground">
                  {audioCacheMb} MB
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Data Al-Qur'an</dt>
                <dd className="font-medium text-foreground">
                  {quranDataCached ? 'Tersimpan' : 'Belum tersimpan'}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              disabled={audioCacheMb === 0 && !quranDataCached}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 size={16} />
              Hapus Cache
            </button>
          </div>
        </SettingsSection>

        {/* Aksesibilitas */}
        <SettingsSection
          title="Aksesibilitas"
          description="Sesuaikan tampilan agar lebih nyaman digunakan."
        >
          <div className="divide-y divide-border">
            <div className="pb-4">
              <SettingsRow
                label="Kontras tinggi"
                description="Tingkatkan kontras teks dan latar."
                control={
                  <Switch
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                    aria-label="Aktifkan kontras tinggi"
                  />
                }
              />
            </div>
            <div className="pt-4">
              <SettingsRow
                label="Animasi halus"
                description="Matikan untuk mengurangi gerakan pada layar."
                control={
                  <Switch
                    checked={smoothAnimation}
                    onCheckedChange={setSmoothAnimation}
                    aria-label="Aktifkan animasi halus"
                  />
                }
              />
            </div>
          </div>
        </SettingsSection>
      </main>

      <ClearCacheDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        onConfirm={handleClearCache}
      />
    </div>
  );
}

// ---------- Page sub-components ----------

function SettingsHeader() {
  const router = useRouter();

  // Settings is a leaf screen; "Back" should return to whichever screen
  // opened it. Fall back to Home if there is no history (e.g. direct URL).
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(routes.home());
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        <Logo size={24} alt="" />
        <h1 className="text-lg font-semibold text-foreground">Pengaturan</h1>
      </div>
    </motion.header>
  );
}

interface TextSizePreviewProps {
  size: TextSize;
}

function TextSizePreview({ size }: TextSizePreviewProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Pratinjau
      </p>
      <motion.p
        key={size}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        dir="rtl"
        className="text-center font-serif text-foreground"
        style={{ fontSize: TEXT_SIZE_PX[size], lineHeight: 1.9 }}
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </motion.p>
    </div>
  );
}

interface ClearCacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function ClearCacheDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearCacheDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus cache?</DialogTitle>
          <DialogDescription>
            Audio dan data Al-Qur'an yang sudah tersimpan akan dihapus. Kamu
            perlu koneksi internet untuk memuatnya kembali.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-destructive/10 px-5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            Hapus Cache
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
