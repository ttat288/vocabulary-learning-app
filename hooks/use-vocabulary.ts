'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, UserProgress, ReviewQueueItem } from '@/lib/types';
import { getProgress, saveProgress, getWords, saveWords, getToday, isNewDay } from '@/lib/storage';
import { useLanguage } from '@/contexts/language-context';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Load words for current language
      let cachedWords = getWords(language);
      if (cachedWords.length === 0) {
        const res = await fetch(`/api/words?lang=${language}`);
        cachedWords = await res.json();
        saveWords(cachedWords, language);
      }
      setWords(cachedWords);

      // Load progress and handle daily reset
      let currentProgress = getProgress();
      if (isNewDay(currentProgress.lastStudyDate)) {
        currentProgress = {
          ...currentProgress,
          learnedToday: 0,
          lastStudyDate: getToday(),
          reviewQueue: currentProgress.reviewQueue.map(item => ({
            ...item,
            reviewedCount: Math.max(0, item.reviewedCount - 1),
          })),
        };
        saveProgress(currentProgress);
      }
      setProgress(currentProgress);
      setIsLoading(false);
    };

    init();
  }, [language]);

  // Update current word when progress or words change
  useEffect(() => {
    if (!progress || words.length === 0) {
      setCurrentWord(null);
      return;
    }

    // If review queue has items, show the first one
    if (progress.reviewQueue.length > 0) {
      const reviewItem = progress.reviewQueue[0];
      const word = words.find(w => w.id === reviewItem.wordId);
      setCurrentWord(word || null);
    } else {
      // Get next word from main list (first word not completed)
      const availableWords = words.filter(
        w => !progress.completedWords.includes(w.id)
      );
      setCurrentWord(availableWords[0] || null);
    }
  }, [progress, words]);

  const markAsRemembered = useCallback(() => {
    if (!progress || !currentWord || !words.length) return;

    const updatedProgress = { ...progress };

    // Remove from review queue if present
    updatedProgress.reviewQueue = updatedProgress.reviewQueue.filter(
      item => item.wordId !== currentWord.id
    );

    // Add to completed words if not already there
    if (!updatedProgress.completedWords.includes(currentWord.id)) {
      updatedProgress.completedWords.push(currentWord.id);
      updatedProgress.learnedToday += 1;
    }

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
  }, [progress, currentWord, words.length]);

  const markAsNotRemembered = useCallback(() => {
    if (!progress || !currentWord || !words.length) return;

    const updatedProgress = { ...progress };

    // Add to review queue or update review count
    const existingIndex = updatedProgress.reviewQueue.findIndex(
      item => item.wordId === currentWord.id
    );

    if (existingIndex >= 0) {
      // Move to end and increment review count
      const item = updatedProgress.reviewQueue.splice(existingIndex, 1)[0];
      item.reviewedCount += 1;
      updatedProgress.reviewQueue.push(item);
    } else {
      // Add new review item
      updatedProgress.reviewQueue.push({
        wordId: currentWord.id,
        reviewedCount: 1,
      });
    }

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
  }, [progress, currentWord, words.length]);

  const resetProgress = useCallback(() => {
    const newProgress: UserProgress = {
      dailyGoal: progress?.dailyGoal || 10,
      learnedToday: 0,
      completedWords: [],
      reviewQueue: [],
      lastStudyDate: getToday(),
      theme: progress?.theme || 'dark',
    };
    saveProgress(newProgress);
    setProgress(newProgress);
  }, [progress]);

  const updateDailyGoal = useCallback((goal: number) => {
    if (!progress) return;
    const updated = { ...progress, dailyGoal: goal };
    saveProgress(updated);
    setProgress(updated);
  }, [progress]);

  const toggleTheme = useCallback(() => {
    if (!progress) return;
    const newTheme = progress.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...progress, theme: newTheme };
    saveProgress(updated);
    setProgress(updated);
  }, [progress]);

  const getAvailableWordsCount = useCallback(() => {
    if (!progress || !words.length) return 0;
    return words.filter(w => !progress.completedWords.includes(w.id)).length;
  }, [progress, words]);

  const isGoalReached = useCallback(() => {
    if (!progress) return false;
    if (progress.dailyGoal === 'unlimited') return false;
    return progress.learnedToday >= progress.dailyGoal;
  }, [progress]);

  return {
    words,
    progress,
    currentWord,
    isLoading,
    markAsRemembered,
    markAsNotRemembered,
    resetProgress,
    updateDailyGoal,
    toggleTheme,
    getAvailableWordsCount,
    isGoalReached,
  };
}
