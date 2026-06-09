import { STORAGE_KEY } from './constants';
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PRESET,
  THEME_PRESETS,
} from './themes';

export function getInitialThemeScript() {
  const validPresets = JSON.stringify(THEME_PRESETS);

  return `
try {
  var stored = window.localStorage.getItem('${STORAGE_KEY}');
  var progress = stored ? JSON.parse(stored) : {};
  var mode = progress.theme === 'light' ? 'light' : '${DEFAULT_THEME_MODE}';
  var presets = ${validPresets};
  var preset = presets.indexOf(progress.themePreset) >= 0 ? progress.themePreset : '${DEFAULT_THEME_PRESET}';
  var root = document.documentElement;
  root.dataset.theme = preset;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
} catch (_) {
  document.documentElement.dataset.theme = '${DEFAULT_THEME_PRESET}';
  document.documentElement.classList.add('${DEFAULT_THEME_MODE}');
  document.documentElement.style.colorScheme = '${DEFAULT_THEME_MODE}';
}
`;
}
