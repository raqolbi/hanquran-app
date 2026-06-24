'use client';

import { useUserStore } from '@/stores/userStore';

/**
 * Preferensi tampilan bacaan ayat — persisten di Dexie `settings`.
 * Spesifikasi: `docs/22-verse-display-controls.md`
 */
export function useReadingDisplay() {
  const showTranslation = useUserStore((s) => s.settings.translationVisible);
  const showTransliteration = useUserStore(
    (s) => s.settings.transliterationVisible,
  );
  const updateSettings = useUserStore((s) => s.updateSettings);

  const toggleTranslation = () => {
    void updateSettings({ translationVisible: !showTranslation });
  };

  const toggleTransliteration = () => {
    void updateSettings({ transliterationVisible: !showTransliteration });
  };

  return {
    showTranslation,
    showTransliteration,
    toggleTranslation,
    toggleTransliteration,
  };
}
