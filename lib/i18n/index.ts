import en from './en.json';
import vi from './vi.json';

export type Language = 'en' | 'vi';

const translations: Record<Language, typeof en> = {
  en,
  vi,
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      return value;
    }
  }

  return value || key;
}

export function getTranslationList(lang: Language, key: string): string[] {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return [];
        }
      }
      return Array.isArray(value) ? value : [];
    }
  }

  return Array.isArray(value) ? value : [];
}

export function getLanguageLabel(lang: Language): string {
  return lang === 'en' ? 'English' : 'Tiếng Việt';
}
