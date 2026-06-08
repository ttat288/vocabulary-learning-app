'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { WordCard } from './word-card';
import { ProgressBar } from './progress-bar';
import { ActionButtons } from './action-buttons';
import { motion } from 'framer-motion';

interface LearningScreenProps {
  onComplete: () => void;
}

export function LearningScreen({ onComplete }: LearningScreenProps) {
  const {
    currentWord,
    progress,
    isLoading,
    markAsRemembered,
    markAsNotRemembered,
    isGoalReached,
  } = useVocabulary();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-primary rounded-full"
        />
      </div>
    );
  }

  if (!currentWord || !progress) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">No words available</p>
      </div>
    );
  }

  const handleRemember = () => {
    markAsRemembered();
    
    if (isGoalReached()) {
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <ProgressBar current={progress.learnedToday} goal={progress.dailyGoal} />
      
      <div className="flex-1 flex items-center justify-center">
        <WordCard word={currentWord} key={currentWord.id} />
      </div>

      <ActionButtons
        onRemember={handleRemember}
        onNotRemember={markAsNotRemembered}
      />
    </div>
  );
}
