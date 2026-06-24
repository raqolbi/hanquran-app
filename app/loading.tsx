import { LogoWithText } from '@/components/shared/Logo';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat"
      className="flex min-h-dvh items-center justify-center bg-background px-6"
    >
      <div className="flex flex-col items-center gap-6">
        <LogoWithText size={72} priority />
        <div
          aria-hidden
          className="h-1 w-32 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#0F766E]" />
        </div>
      </div>
    </div>
  );
}
