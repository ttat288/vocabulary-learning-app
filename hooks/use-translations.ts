import { useLanguage } from '@/contexts/language-context';
import { getTranslation } from '@/lib/i18n';

export function useTranslations() {
  const { language } = useLanguage();

  return (key: string): string => {
    return getTranslation(language, key);
  };
}
