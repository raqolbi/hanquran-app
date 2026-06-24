'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FavoritesProps {
  favorites: string[];
  onToggleFavorite: (surah: string) => void;
}

export function Favorites({ favorites, onToggleFavorite }: FavoritesProps) {
  const t = useTranslations('home');
  const [isShowingFavorites, setIsShowingFavorites] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 mb-6"
    >
      <button
        onClick={() => setIsShowingFavorites(!isShowingFavorites)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors border border-border/50"
      >
        <div className="flex items-center gap-2">
          <Heart 
            size={18} 
            className={`transition-all ${isShowingFavorites ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          />
          <span className="font-medium text-foreground">{t('myFavorites')}</span>
          {favorites.length > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full ml-2">
              {favorites.length}
            </span>
          )}
        </div>
        <span className={`text-lg transition-transform ${isShowingFavorites ? 'rotate-180' : ''}`}>
          ∨
        </span>
      </button>

      {isShowingFavorites && favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 p-4 rounded-xl bg-secondary/30 border border-border/30"
        >
          <div className="flex flex-wrap gap-2">
            {favorites.map((surah) => (
              <div
                key={surah}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border/50"
              >
                <span className="text-sm font-medium text-foreground">{surah}</span>
                <button
                  onClick={() => onToggleFavorite(surah)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <Heart size={14} className="fill-red-500 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isShowingFavorites && favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-4 rounded-xl bg-secondary/30 text-center text-muted-foreground text-sm"
        >
          {t('favoritesEmpty')}
        </motion.div>
      )}
    </motion.div>
  );
}
