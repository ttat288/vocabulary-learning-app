export const DAILY_GOALS = [10, 20, 50] as const;
export const DEFAULT_DAILY_GOAL = 10;
export const STORAGE_KEY = 'vocab-app-progress';
export const WORDS_STORAGE_KEY = 'vocab-app-words';
export const WORDS_DATA_VERSION = 'v2-part-of-speech';

export const ANIMATION_CONFIGS = {
  cardEnter: {
    duration: 0.4,
    ease: [0.34, 1.56, 0.64, 1],
  },
  cardExit: {
    duration: 0.3,
    ease: 'easeIn',
  },
  buttonHover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  buttonTap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  progressBar: {
    duration: 0.6,
    ease: 'easeOut',
  },
};

export const COLOR_SCHEME = {
  dark: {
    background: '#000000',
    foreground: '#FFFFFF',
    card: '#0A0A0A',
    cardBorder: '#1A1A1A',
    primary: '#06B6D4',
    primaryHover: '#22D3EE',
    secondary: '#6366F1',
    accent: '#EC4899',
    muted: '#525252',
    mutedForeground: '#A3A3A3',
  },
  light: {
    background: '#FFFFFF',
    foreground: '#000000',
    card: '#F5F5F5',
    cardBorder: '#E5E5E5',
    primary: '#0891B2',
    primaryHover: '#06B6D4',
    secondary: '#4F46E5',
    accent: '#DB2777',
    muted: '#D4D4D8',
    mutedForeground: '#71717A',
  },
};
