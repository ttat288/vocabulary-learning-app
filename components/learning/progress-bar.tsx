'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';

interface ProgressBarProps {
  current: number;
  goal: number | string;
}

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const t = useTranslations();
  const goalNum = typeof goal === 'string' ? 100 : goal;
  const percentage = Math.min((current / goalNum) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Progress
        </span>
        <span className="text-sm font-semibold text-primary">
          {current} {t('progressBar.of')} {goal === 'unlimited' ? '∞' : goal}
        </span>
      </div>
      <div className="relative h-2 bg-card border border-border rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
