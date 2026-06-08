'use client';

import { useState, useEffect } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { useTranslations } from '@/hooks/use-translations';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { LearningScreen } from '@/components/learning/learning-screen';
import { CompletionScreen } from '@/components/completion/completion-screen';
import { SettingsScreen } from '@/components/settings/settings-screen';
import { motion } from 'framer-motion';

type AppScreen = 'onboarding' | 'learning' | 'completion' | 'settings';

export default function Page() {
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = useTranslations();
  const {
    progress,
    isLoading,
    resetProgress,
    updateDailyGoal,
    toggleTheme,
  } = useVocabulary();

  // Check if user has completed onboarding
  useEffect(() => {
    if (!isLoading && progress) {
      setMounted(true);
      // If user has completed words, they've already done onboarding
      if (progress.completedWords.length > 0 || progress.learnedToday > 0 || progress.reviewQueue.length > 0) {
        setScreen('learning');
      }
      // Otherwise, show onboarding
    }
  }, [progress, isLoading]);

  const handleSelectGoal = (goal: number | 'unlimited') => {
    updateDailyGoal(typeof goal === 'string' ? 'unlimited' : goal);
    setScreen('learning');
  };

  const handleCompletionContinue = () => {
    setScreen('learning');
  };

  const handleCompletionFinish = () => {
    setScreen('learning');
  };

  const handleSettingsReset = () => {
    resetProgress();
    setScreen('onboarding');
  };

  if (!mounted || isLoading) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-primary rounded-full"
        />
      </main>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Onboarding Screen - Full height */}
      {screen === 'onboarding' && (
        <OnboardingScreen onSelectGoal={handleSelectGoal} />
      )}

      {/* Learning/Completion Screens */}
      {screen !== 'onboarding' && (
        <>
          {/* Header with Settings */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 border-b border-border bg-background/95 backdrop-blur"
          >
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">VocabFlow</h1>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-card transition-colors duration-200"
                aria-label={t('common.settings')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </motion.header>

          {/* Content - Scrollable if needed */}
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col overflow-y-auto">
            {screen === 'learning' && progress && (
              <LearningScreen onComplete={() => setScreen('completion')} />
            )}

            {screen === 'completion' && progress && (
              <CompletionScreen
                wordsLearned={progress.learnedToday}
                reviewQueueSize={progress.reviewQueue.length}
                onContinue={handleCompletionContinue}
                onFinish={handleCompletionFinish}
              />
            )}
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && progress && (
        <SettingsScreen
          progress={progress}
          onUpdateGoal={updateDailyGoal}
          onToggleTheme={toggleTheme}
          onReset={handleSettingsReset}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
