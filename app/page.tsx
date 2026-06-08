'use client';

import { useState, useEffect } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { useTranslations } from '@/hooks/use-translations';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import {
  LearningScreen,
  LearningScreenPrefetchWrapper,
} from '@/components/learning/learning-screen';
import { CompletionScreen } from '@/components/completion/completion-screen';
import { SettingsScreen } from '@/components/settings/settings-screen';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      if (
        progress.completedWords.length > 0 ||
        progress.learnedToday > 0 ||
        progress.reviewQueue.length > 0
      ) {
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
      <main className='w-full h-screen flex items-center justify-center bg-background'>
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
          className='w-12 h-12 bg-primary rounded-full'
        />
      </main>
    );
  }

  return (
    <main className='flex h-screen w-full flex-col overflow-hidden bg-background text-foreground'>
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
            className='shrink-0 border-b border-border bg-card/80 backdrop-blur'
          >
            <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>
              <div>
                <h1 className='text-xl font-semibold text-foreground'>
                  VocabFlow
                </h1>
                <p className='text-xs text-muted-foreground'>
                  {t('common.subtitle')}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setShowSettings(true)}
                aria-label={t('common.settings')}
              >
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </motion.header>

          {/* Content */}
          <div className='flex-1 min-h-0 max-w-6xl mx-auto w-full px-3 sm:px-4 pb-4 sm:pb-6 flex flex-col'>
            {screen === 'learning' && progress && (
              <LearningScreenPrefetchWrapper
                onComplete={() => setScreen('completion')}
              />
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
