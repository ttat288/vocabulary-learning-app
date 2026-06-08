export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export interface ReviewQueueItem {
  wordId: string;
  reviewedCount: number;
}

export interface UserProgress {
  dailyGoal: number;
  learnedToday: number;
  completedWords: string[];
  reviewQueue: ReviewQueueItem[];
  lastStudyDate: string;
  theme: 'dark' | 'light';
  aiEnabled?: boolean;
}

export type DailyGoal = 10 | 20 | 50 | 'unlimited';

export interface LearningState {
  currentWordIndex: number;
  currentWord: Word | null;
  isLearned: boolean;
  reviewQueueIndex: number;
}
