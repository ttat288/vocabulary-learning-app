import { useLanguage } from '@/contexts/language-context';
import { getTranslation, getTranslationList } from '@/lib/i18n';

export function useTranslations() {
  const { language } = useLanguage();

  return (key: string): string => {
    return getTranslation(language, key);
  };
}

export function useTranslationList(key: string): string[] {
  const { language } = useLanguage();

  return getTranslationList(language, key);
}
