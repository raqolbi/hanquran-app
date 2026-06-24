'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { Header } from '@/components/header';
import { ContinueReading } from '@/components/continue-reading';
import { SearchInput } from '@/components/search-input';
import { FilterChips } from '@/components/filter-chips';
import { SurahCard } from '@/components/surah-card';
import { DataLoadErrorFallback } from '@/components/shared/ErrorFallback';
import { useSurahList } from '@/hooks/use-surah-list';

export default function Home() {
  const t = useTranslations('errors');
  const tLoading = useTranslations('loading');
  const { surahs, loading, error, retry } = useSurahList();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>(['Al-Faatiha', 'Al-Baqarah']);

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        surah.englishName.toLowerCase().includes(query) ||
        surah.meaning.toLowerCase().includes(query) ||
        surah.arabicName.includes(searchQuery);
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'favorites' && favorites.includes(surah.englishName));
      return matchesSearch && matchesFilter;
    });
  }, [surahs, searchQuery, selectedFilter, favorites]);

  const handleToggleFavorite = (surahName: string) => {
    setFavorites((prev) =>
      prev.includes(surahName)
        ? prev.filter((s) => s !== surahName)
        : [...prev, surahName],
    );
  };

  const surahsWithFavorites = filteredSurahs.map((surah) => ({
    ...surah,
    isFavorited: favorites.includes(surah.englishName),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-8 sm:pb-12">
        <ContinueReading surahId={2} surah="Al-Baqarah" ayah={142} totalAyahs={286} />

        <SearchInput onSearch={setSearchQuery} />

        <FilterChips onFilterChange={setSelectedFilter} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {loading ? (
            <p className="py-12 text-center text-muted-foreground">{tLoading('surahList')}</p>
          ) : error ? (
            <DataLoadErrorFallback
              message={error}
              onRetry={retry}
              variant="inline"
              showHomeButton={false}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {surahsWithFavorites.length > 0 ? (
                surahsWithFavorites.map((surah, index) => (
                  <motion.div
                    key={surah.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                  >
                    <SurahCard
                      number={surah.number}
                      arabicName={surah.arabicName}
                      englishName={surah.englishName}
                      meaning={surah.meaning}
                      ayahCount={surah.ayahCount}
                      type={surah.type}
                      isFavorited={surah.isFavorited}
                      onToggleFavorite={() => handleToggleFavorite(surah.englishName)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-12 text-center"
                >
                  <svg
                    className="w-12 h-12 text-muted-foreground mb-4"
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
                  <p className="text-muted-foreground">{t('noSearchResults')}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
