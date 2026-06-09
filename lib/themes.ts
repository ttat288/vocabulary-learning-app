export const THEME_PRESETS = ['vega', 'sapphire', 'rose', 'emerald'] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];
export type ThemeMode = 'dark' | 'light';

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
  vega: 'Vega',
  sapphire: 'Sapphire',
  rose: 'Rose',
  emerald: 'Emerald',
};

export const THEME_PRESET_SWATCHES: Record<ThemePreset, string> = {
  vega: 'oklch(0.205 0 0)',
  sapphire: 'oklch(0.488 0.243 264.376)',
  rose: 'oklch(0.525 0.223 3.958)',
  emerald: 'oklch(0.508 0.118 165.612)',
};

export const DEFAULT_THEME_PRESET: ThemePreset = 'vega';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export function isThemePreset(value: unknown): value is ThemePreset {
  return (
    typeof value === 'string' &&
    THEME_PRESETS.includes(value as ThemePreset)
  );
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light';
}
