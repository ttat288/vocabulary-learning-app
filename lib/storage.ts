import { UserProgress, Word } from './types';
import {
  STORAGE_KEY,
  WORDS_STORAGE_KEY,
  DEFAULT_DAILY_GOAL,
} from './constants';

const DEFAULT_PROGRESS: UserProgress = {
  dailyGoal: DEFAULT_DAILY_GOAL,
  learnedToday: 0,
  completedWords: [],
  reviewQueue: [],
  lastStudyDate: new Date().toISOString().split('T')[0],
  theme: 'dark',
  aiEnabled: true,
};

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (e) {
    console.error('[v0] Error parsing progress:', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('[v0] Error saving progress:', e);
  }
}

export function getWords(language: string = 'en'): Word[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = `${WORDS_STORAGE_KEY}-${language}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[v0] Error parsing cached words:', e);
  }

  return [];
}

export function saveWords(words: Word[], language: string = 'en'): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${WORDS_STORAGE_KEY}-${language}`;
    localStorage.setItem(key, JSON.stringify(words));
  } catch (e) {
    console.error('[v0] Error saving words:', e);
  }
}

export function getToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function isNewDay(lastStudyDate: string): boolean {
  return lastStudyDate !== getToday();
}
