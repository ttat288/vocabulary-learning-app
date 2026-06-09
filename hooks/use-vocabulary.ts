'use client';

import { useState, useEffect, useCallback } from 'react';
import { DailyGoal, Word, UserProgress } from '@/lib/types';
import {
  getProgress,
  saveProgress,
  getWords,
  saveWords,
  getToday,
  isNewDay,
} from '@/lib/storage';
import { useLanguage } from '@/contexts/language-context';
import { explainCache } from '@/lib/explain-cache';
import { DEFAULT_THEME_PRESET, ThemePreset } from '@/lib/themes';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const buildSessionWordIds = useCallback(
    (sourceWords: Word[], baseProgress: UserProgress, goal: DailyGoal) => {
      const validWordIds = new Set(sourceWords.map((word) => word.id));
      const sessionIds: string[] = [];

      for (const item of baseProgress.reviewQueue) {
        if (
          validWordIds.has(item.wordId) &&
          !sessionIds.includes(item.wordId)
        ) {
          sessionIds.push(item.wordId);
        }
        if (sessionIds.length >= goal) return sessionIds;
      }

      for (const word of sourceWords) {
        if (
          !baseProgress.completedWords.includes(word.id) &&
          !sessionIds.includes(word.id)
        ) {
          sessionIds.push(word.id);
        }
        if (sessionIds.length >= goal) return sessionIds;
      }

      return sessionIds;
    },
    [],
  );

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
          sessionWordIds: [],
          sessionCompletedWords: [],
          lastStudyDate: getToday(),
          reviewQueue: currentProgress.reviewQueue.map((item) => ({
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

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      if (!detail || typeof detail.enabled !== 'boolean') return;

      setProgress((previousProgress) => {
        const baseProgress = previousProgress ?? getProgress();
        const updatedProgress = {
          ...baseProgress,
          aiEnabled: detail.enabled,
        };

        saveProgress(updatedProgress);

        if (!detail.enabled) {
          explainCache.clear();
        }

        return updatedProgress;
      });
    };

    window.addEventListener('toggleAi', handler as EventListener);
    return () =>
      window.removeEventListener('toggleAi', handler as EventListener);
  }, []);

  // Update current word when progress or words change
  useEffect(() => {
    if (!progress || words.length === 0) {
      setCurrentWord(null);
      return;
    }

    // Ensure review queue references valid words from the current language list.
    const validReviewQueue = progress.reviewQueue.filter((item) =>
      words.some((word) => word.id === item.wordId),
    );

    if (validReviewQueue.length !== progress.reviewQueue.length) {
      const updatedProgress = { ...progress, reviewQueue: validReviewQueue };
      saveProgress(updatedProgress);
      setProgress(updatedProgress);
      return;
    }

    let nextWord: Word | null = null;

    const sessionWordIds =
      progress.sessionWordIds && progress.sessionWordIds.length > 0
        ? progress.sessionWordIds
        : buildSessionWordIds(words, progress, progress.dailyGoal);

    const sessionCompletedWords = progress.sessionCompletedWords ?? [];

    // Check if we've completed all words in the session goal
    if (sessionCompletedWords.length >= progress.dailyGoal) {
      return;
    }

    const nextWordId = sessionWordIds.find(
      (wordId) => !sessionCompletedWords.includes(wordId),
    );

    if (nextWordId) {
      nextWord = words.find((w) => w.id === nextWordId) || null;
    }

    if (!nextWord) {
      const availableWords = words.filter(
        (w) => !progress.completedWords.includes(w.id),
      );
      nextWord = availableWords[0] || null;
    }

    setCurrentWord(nextWord);
  }, [progress, words, buildSessionWordIds]);

  const markAsRemembered = useCallback(() => {
    if (!progress || !currentWord || !words.length) return;

    const updatedProgress = { ...progress };
    const sessionCompletedWords = updatedProgress.sessionCompletedWords ?? [];

    // Remove from review queue if present
    updatedProgress.reviewQueue = updatedProgress.reviewQueue.filter(
      (item) => item.wordId !== currentWord.id,
    );

    // Add to completed words if not already there
    if (!updatedProgress.completedWords.includes(currentWord.id)) {
      updatedProgress.completedWords.push(currentWord.id);
    }
    if (!sessionCompletedWords.includes(currentWord.id)) {
      updatedProgress.sessionCompletedWords = [
        ...sessionCompletedWords,
        currentWord.id,
      ];
      updatedProgress.learnedToday += 1;
    }

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
  }, [progress, currentWord, words.length]);

  const markAsNotRemembered = useCallback(() => {
    if (!progress || !currentWord || !words.length) return;

    const updatedProgress = { ...progress };
    const sessionCompletedWords = updatedProgress.sessionCompletedWords ?? [];

    // Add to review queue or update review count
    const existingIndex = updatedProgress.reviewQueue.findIndex(
      (item) => item.wordId === currentWord.id,
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
    if (!sessionCompletedWords.includes(currentWord.id)) {
      updatedProgress.sessionCompletedWords = [
        ...sessionCompletedWords,
        currentWord.id,
      ];
    }

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
  }, [progress, currentWord, words.length]);

  const resetProgress = useCallback(() => {
    const newProgress: UserProgress = {
      dailyGoal: progress?.dailyGoal || 10,
      learnedToday: 0,
      completedWords: [],
      sessionWordIds: [],
      sessionCompletedWords: [],
      reviewQueue: [],
      lastStudyDate: getToday(),
      theme: progress?.theme || 'dark',
      themePreset: progress?.themePreset || DEFAULT_THEME_PRESET,
      aiEnabled: progress?.aiEnabled ?? false,
    };
    saveProgress(newProgress);
    setProgress(newProgress);
  }, [progress]);

  const updateDailyGoal = useCallback(
    (goal: DailyGoal) => {
      const baseProgress = getProgress();
      const updated = {
        ...baseProgress,
        dailyGoal: goal,
        learnedToday: 0,
        sessionWordIds: buildSessionWordIds(words, baseProgress, goal),
        sessionCompletedWords: [],
      };
      saveProgress(updated);
      setProgress(updated);
    },
    [words, buildSessionWordIds],
  );

  const toggleTheme = useCallback(() => {
    if (!progress) return;
    const newTheme: UserProgress['theme'] =
      progress.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...progress, theme: newTheme };
    saveProgress(updated);
    setProgress(updated);
    window.dispatchEvent(new Event('themeChanged'));
  }, [progress]);

  const setThemePreset = useCallback(
    (themePreset: ThemePreset) => {
      if (!progress) return;
      const updated = { ...progress, themePreset };
      saveProgress(updated);
      setProgress(updated);
      window.dispatchEvent(new Event('themeChanged'));
    },
    [progress],
  );

  const setAiEnabled = useCallback(
    (enabled: boolean) => {
      if (!progress) return;
      const updated = { ...progress, aiEnabled: enabled };
      saveProgress(updated);
      setProgress(updated);

      if (!enabled) {
        explainCache.clear();
      }
    },
    [progress],
  );

  const getAvailableWordsCount = useCallback(() => {
    if (!progress || !words.length) return 0;
    return words.filter((w) => !progress.completedWords.includes(w.id)).length;
  }, [progress, words]);

  const isGoalReached = useCallback(() => {
    if (!progress) return false;
    const sessionCompletedWords = progress.sessionCompletedWords ?? [];
    return sessionCompletedWords.length >= progress.dailyGoal;
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
    setThemePreset,
    setAiEnabled,
    getAvailableWordsCount,
    isGoalReached,
  };
}
