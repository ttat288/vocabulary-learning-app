'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { useLanguage } from '@/contexts/language-context';
import { getLanguageLabel } from '@/lib/i18n';
import { UserProgress, DailyGoal } from '@/lib/types';
import type { Language } from '@/lib/i18n';

interface SettingsScreenProps {
  progress: UserProgress;
  onUpdateGoal: (goal: number) => void;
  onToggleTheme: () => void;
  onReset: () => void;
  onClose: () => void;
}

const DAILY_GOAL_OPTIONS: { value: number; labelKey: string }[] = [
  { value: 10, labelKey: 'onboarding.goal10' },
  { value: 20, labelKey: 'onboarding.goal20' },
  { value: 50, labelKey: 'onboarding.goal50' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
];

export function SettingsScreen({
  progress,
  onUpdateGoal,
  onToggleTheme,
  onReset,
  onClose,
}: SettingsScreenProps) {
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      onReset();
      onClose();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">{t('settings.heading')}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Daily Goal Setting */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.dailyGoalLabel')}</h3>
          <div className="space-y-2">
            {DAILY_GOAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onUpdateGoal(option.value)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium
                  ${
                    progress.dailyGoal === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:border-primary'
                  }`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.themeLabel')}</h3>
          <button
            onClick={onToggleTheme}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground
                       hover:border-primary transition-all duration-200 font-medium"
          >
            {progress.theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          </button>
        </div>

        {/* Language Selection */}
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.languageLabel')}</h3>
          <div className="space-y-2">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium
                  ${
                    language === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:border-primary'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500
                     hover:bg-red-500/20 transition-all duration-200 font-medium"
        >
          {t('settings.resetButton')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
