interface SurahDetailScrollSpacerProps {
  /** Tinggi bebas scroll di bawah daftar ayat (px), sudah termasuk chrome terukur. */
  height: number;
}

/**
 * Spacer di akhir daftar ayat agar ayat terakhir dapat discroll
 * sepenuhnya di atas audio player.
 */
export function SurahDetailScrollSpacer({ height }: SurahDetailScrollSpacerProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none w-full shrink-0"
      style={{ height: `${height}px` }}
    />
  );
}
