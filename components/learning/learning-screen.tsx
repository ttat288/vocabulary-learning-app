'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { WordCard } from './word-card';
import { ProgressBar } from './progress-bar';
import { ActionButtons } from './action-buttons';
import { AnimatePresence, motion } from 'framer-motion';
import { explainCache } from '@/lib/explain-cache';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface LearningScreenProps {
  onComplete: () => void;
}

export function LearningScreen({ onComplete }: LearningScreenProps) {
  const {
    currentWord,
    progress,
    isLoading,
    markAsRemembered,
    markAsNotRemembered,
    isGoalReached,
  } = useVocabulary();

  if (isLoading) {
    return (
      <div className='w-full min-h-0 flex-1 flex items-center justify-center'>
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
          className='w-12 h-12 bg-primary rounded-full'
        />
      </div>
    );
  }

  if (!currentWord || !progress) {
    return (
      <div className='w-full min-h-0 flex-1 flex items-center justify-center'>
        <p className='text-xl text-muted-foreground'>No words available</p>
      </div>
    );
  }

  const handleRemember = () => {
    markAsRemembered();

    if (isGoalReached()) {
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <div className='flex h-full min-h-0 flex-col gap-3 py-3 sm:gap-4 sm:py-4'>
      <ProgressBar current={progress.learnedToday} goal={progress.dailyGoal} />

      <div className='relative min-h-0 flex-1'>
        <div className='flex h-full min-h-0 items-start justify-center'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentWord.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className='h-full w-full'
            >
              <WordCard
                word={currentWord}
                aiEnabled={progress.aiEnabled ?? true}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className='shrink-0 pb-1'>
        <ActionButtons
          onRemember={handleRemember}
          onNotRemember={markAsNotRemembered}
          aiEnabled={progress.aiEnabled ?? true}
        />
      </div>
    </div>
  );
}

// Prefetch AI explanations for upcoming words (5 ahead). Cancel others.
export function LearningScreenPrefetchWrapper(props: LearningScreenProps) {
  const { words, currentWord, progress } = useVocabulary();
  const { language } = useLanguage();

  useEffect(() => {
    if (!progress?.aiEnabled) {
      explainCache.clear();
      return;
    }

    if (!currentWord || !words || words.length === 0) return;

    const idx = words.findIndex((w) => w.id === currentWord.id);
    if (idx < 0) return;

    const next = words.slice(idx + 1, idx + 6);
    explainCache.prefetch(next, language);

    const allowed = new Set(next.map((w) => w.id));
    allowed.add(currentWord.id);
    explainCache.cancelExcept(allowed);

    return () => {
      // On unmount, do not aggressively clear cache; let cache persist across session.
    };
  }, [currentWord?.id, words, language, progress?.aiEnabled]);

  return <LearningScreen {...props} />;
}
