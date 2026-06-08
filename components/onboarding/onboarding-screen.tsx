'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';

interface OnboardingScreenProps {
  onSelectGoal: (goal: number | 'unlimited') => void;
}

const GOALS = [
  { value: 10, labelKey: 'onboarding.goal10', descriptionKey: 'Quick daily boost' },
  { value: 20, labelKey: 'onboarding.goal20', descriptionKey: 'Standard practice' },
  { value: 50, labelKey: 'onboarding.goal50', descriptionKey: 'Deep dive' },
  { value: 'unlimited', labelKey: 'onboarding.goalUnlimited', descriptionKey: 'Keep learning' },
];

export function OnboardingScreen({ onSelectGoal }: OnboardingScreenProps) {
  const t = useTranslations();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center h-screen px-4 py-12 text-center overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
          {t('onboarding.heading')}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          {t('onboarding.tagline')}
        </p>
      </motion.div>

      {/* Goal Selection */}
      <motion.div variants={itemVariants} className="w-full max-w-4xl mb-12">
        <p className="text-lg text-muted-foreground mb-8">
          {t('onboarding.question')}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOALS.map((goal) => (
            <motion.button
              key={String(goal.value)}
              onClick={() => onSelectGoal(goal.value)}
              whileHover={{ scale: 1.05, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
              <div className="relative bg-card border border-border rounded-xl p-6 transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <div className="text-3xl font-bold text-primary mb-2">
                  {t(goal.labelKey)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {goal.descriptionKey}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants} className="text-sm text-muted-foreground">
        <p>{t('onboarding.footer')}</p>
      </motion.div>
    </motion.div>
  );
}
