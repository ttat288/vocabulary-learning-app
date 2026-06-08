'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';

interface CompletionScreenProps {
  wordsLearned: number;
  reviewQueueSize: number;
  onContinue: () => void;
  onFinish: () => void;
}

export function CompletionScreen({
  wordsLearned,
  reviewQueueSize,
  onContinue,
  onFinish,
}: CompletionScreenProps) {
  const t = useTranslations();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
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
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center h-full px-4 py-12 text-center"
    >
      {/* Celebration emoji */}
      <motion.div
        variants={itemVariants}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="text-8xl mb-8"
      >
        🎉
      </motion.div>

      {/* Congratulations */}
      <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-foreground mb-4">
        {t('completion.heading')}
      </motion.h1>

      <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl">
        {t('completion.subtitle')}
      </motion.p>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 w-full max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground text-sm mb-2">{t('completion.wordsLearned')}</p>
          <p className="text-4xl font-bold text-primary">{wordsLearned}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground text-sm mb-2">{t('completion.reviewQueueLabel')}</p>
          <p className="text-4xl font-bold text-accent">{reviewQueueSize}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <motion.button
          onClick={onFinish}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200
                     bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary"
        >
          {t('completion.finishButton')}
        </motion.button>
        
        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200
                     bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
        >
          {t('completion.continueButton')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
