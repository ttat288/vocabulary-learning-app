'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { WordCard } from './word-card';
import { AiCard } from './ai-card';
import { ProgressBar } from './progress-bar';
import { ActionButtons } from './action-buttons';
import { AnimatePresence, motion } from 'framer-motion';
import { explainCache } from '@/lib/explain-cache';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BotOff } from 'lucide-react';
import { useExplain } from '@/hooks/use-explain';
import { useLanguage } from '@/contexts/language-context';
import {
  DEFAULT_EXPLAIN_ACTION,
  type ExplainAction,
  type ExplainActionInput,
  type ExplainRequestOptions,
} from '@/lib/explain-actions';

interface LearningScreenProps {
  onComplete: () => void;
}

const RAPID_ADVANCE_LIMIT = 5;
const RAPID_ADVANCE_WINDOW_MS = 8_000;
const AI_AUTO_DISABLED_NOTICE_MS = 5_500;

export function LearningScreen({ onComplete }: LearningScreenProps) {
  const {
    currentWord,
    progress,
    isLoading,
    markAsRemembered,
    markAsNotRemembered,
    isGoalReached,
  } = useVocabulary();
  const { language } = useLanguage();
  const {
    explanation,
    isLoading: isAiLoading,
    error,
    status,
    action,
    explain,
    retry,
    clear,
  } = useExplain();
  const currentWordRef = useRef(currentWord);
  const rapidAdvanceTimestampsRef = useRef<number[]>([]);
  const lastRequestOptionsRef = useRef<ExplainRequestOptions>({
    action: DEFAULT_EXPLAIN_ACTION,
  });
  const [showAiAutoDisabledNotice, setShowAiAutoDisabledNotice] =
    useState(false);

  useEffect(() => {
    currentWordRef.current = currentWord;
  }, [currentWord]);

  useEffect(() => {
    if (progress?.aiEnabled) return;
    rapidAdvanceTimestampsRef.current = [];
  }, [progress?.aiEnabled]);

  useEffect(() => {
    lastRequestOptionsRef.current = { action: DEFAULT_EXPLAIN_ACTION };
    clear();
  }, [clear, currentWord?.id, language, progress?.aiEnabled]);

  useEffect(() => {
    if (!showAiAutoDisabledNotice) return;

    const timer = setTimeout(() => {
      setShowAiAutoDisabledNotice(false);
    }, AI_AUTO_DISABLED_NOTICE_MS);

    return () => clearTimeout(timer);
  }, [showAiAutoDisabledNotice]);

  const shouldDisableAiForRapidAdvance = () => {
    if (!(progress?.aiEnabled ?? false)) return false;

    const now = Date.now();
    const recentTimestamps = rapidAdvanceTimestampsRef.current
      .filter((timestamp) => now - timestamp <= RAPID_ADVANCE_WINDOW_MS)
      .concat(now);

    rapidAdvanceTimestampsRef.current = recentTimestamps;

    if (recentTimestamps.length < RAPID_ADVANCE_LIMIT) return false;

    rapidAdvanceTimestampsRef.current = [];
    return true;
  };

  const disableAiForRapidAdvance = () => {
    window.dispatchEvent(
      new CustomEvent('toggleAi', { detail: { enabled: false } }),
    );
    explainCache.clear();
    setShowAiAutoDisabledNotice(true);
  };

  const requestActionExplain = useCallback(
    async (selectedAction: ExplainAction, input: ExplainActionInput = {}) => {
      const word = currentWordRef.current;
      if (!word || !(progress?.aiEnabled ?? false)) return;

      const options = {
        ...input,
        action: selectedAction,
      };

      lastRequestOptionsRef.current = options;
      await explain(word, options);
    },
    [explain, progress?.aiEnabled],
  );

  const handleRetry = useCallback(async () => {
    const word = currentWordRef.current;
    if (!word) return;
    await retry(word, lastRequestOptionsRef.current);
  }, [retry]);

  const resetAiPanel = useCallback(() => {
    lastRequestOptionsRef.current = { action: DEFAULT_EXPLAIN_ACTION };
    clear();
  }, [clear]);

  const getCurrentWord = useCallback(() => currentWordRef.current, []);

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

  const goalReached = isGoalReached();

  const handleRemember = () => {
    if (goalReached) {
      onComplete();
      return;
    }

    const shouldDisableAi = shouldDisableAiForRapidAdvance();
    const sessionCompletedCount = (progress.sessionCompletedWords ?? []).length;
    const shouldCompleteAfterRemember =
      sessionCompletedCount + 1 >= progress.dailyGoal;

    markAsRemembered();

    if (shouldDisableAi) {
      disableAiForRapidAdvance();
    }

    if (shouldCompleteAfterRemember) {
      setTimeout(() => onComplete(), 500);
    }
  };

  const handleNotRemember = () => {
    if (goalReached) return;

    const shouldDisableAi = shouldDisableAiForRapidAdvance();
    const sessionCompletedCount = (progress.sessionCompletedWords ?? []).length;
    const shouldCompleteAfterReview =
      sessionCompletedCount + 1 >= progress.dailyGoal;
    markAsNotRemembered();

    if (shouldDisableAi) {
      disableAiForRapidAdvance();
    }

    if (shouldCompleteAfterReview) {
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <div className='flex h-full min-h-0 flex-col gap-3 py-3 sm:gap-4 sm:py-4'>
      <AnimatePresence>
        {showAiAutoDisabledNotice && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className='fixed right-3 top-20 z-50 max-w-xs rounded-lg border border-pink-200 dark:border-purple-800 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/40 px-4 py-3 text-card-foreground shadow-lg sm:right-4'
            role='status'
            aria-live='polite'
          >
            <div className='flex items-start gap-3'>
              <BotOff className='mt-0.5 h-4 w-4 shrink-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-0.5 text-white' />
              <p className='text-sm leading-5'>
                AI đã tự động tắt vì bạn học quá nhanh.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProgressBar
        current={(progress.sessionCompletedWords ?? []).length}
        goal={progress.dailyGoal}
      />

      <div className='relative min-h-0 flex-1'>
        <div className='flex h-full min-h-0 items-start justify-center'>
          <div
            className={
              progress.aiEnabled
                ? 'grid h-full min-h-0 w-full gap-4 lg:grid-cols-[minmax(0,1fr)_23rem]'
                : 'grid h-full min-h-0 w-full'
            }
          >
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
                  aiEnabled={progress.aiEnabled ?? false}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {progress.aiEnabled && (
                <AiCard
                  activeAction={action}
                  explanation={explanation}
                  error={error}
                  getWord={getCurrentWord}
                  isLoading={isAiLoading}
                  onExplain={requestActionExplain}
                  onReset={resetAiPanel}
                  onRetry={handleRetry}
                  status={status}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className='shrink-0 pb-1'>
        <ActionButtons
          onRemember={handleRemember}
          onNotRemember={handleNotRemember}
          aiEnabled={progress.aiEnabled ?? false}
          isComplete={goalReached}
        />
      </div>
    </div>
  );
}

export function LearningScreenPrefetchWrapper(props: LearningScreenProps) {
  const { progress } = useVocabulary();

  useEffect(() => {
    if (!progress?.aiEnabled) {
      explainCache.clear();
    }
  }, [progress?.aiEnabled]);

  return <LearningScreen {...props} />;
}
