'use client';

import { useEffect } from 'react';
import { STORAGE_KEY } from '@/lib/constants';
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PRESET,
  isThemeMode,
  isThemePreset,
  ThemeMode,
  ThemePreset,
} from '@/lib/themes';

type StoredThemeProgress = {
  theme?: unknown;
  themePreset?: unknown;
};

function readStoredTheme(): {
  mode: ThemeMode;
  preset: ThemePreset;
} {
  if (typeof window === 'undefined') {
    return { mode: DEFAULT_THEME_MODE, preset: DEFAULT_THEME_PRESET };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored
      ? (JSON.parse(stored) as StoredThemeProgress)
      : null;

    return {
      mode: isThemeMode(parsed?.theme) ? parsed.theme : DEFAULT_THEME_MODE,
      preset: isThemePreset(parsed?.themePreset)
        ? parsed.themePreset
        : DEFAULT_THEME_PRESET,
    };
  } catch {
    return { mode: DEFAULT_THEME_MODE, preset: DEFAULT_THEME_PRESET };
  }
}

function applyTheme(mode: ThemeMode, preset: ThemePreset) {
  const root = document.documentElement;
  root.dataset.theme = preset;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
}

export function ThemeRuntime() {
  useEffect(() => {
    const syncTheme = () => {
      const { mode, preset } = readStoredTheme();
      applyTheme(mode, preset);
    };

    syncTheme();

    window.addEventListener('themeChanged', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('themeChanged', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  return null;
}
