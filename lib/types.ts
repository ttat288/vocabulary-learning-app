import { ThemeMode, ThemePreset } from './themes';

export interface Word {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export interface ReviewQueueItem {
  wordId: string;
  reviewedCount: number;
}

export type DailyGoal = number;

export interface UserProgress {
  dailyGoal: DailyGoal;
  learnedToday: number;
  completedWords: string[];
  sessionWordIds?: string[];
  sessionCompletedWords?: string[];
  reviewQueue: ReviewQueueItem[];
  lastStudyDate: string;
  theme: ThemeMode;
  themePreset?: ThemePreset;
  aiEnabled?: boolean;
}

export interface LearningState {
  currentWordIndex: number;
  currentWord: Word | null;
  isLearned: boolean;
  reviewQueueIndex: number;
}
