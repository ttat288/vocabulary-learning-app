'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';

interface ActionButtonsProps {
  onRemember: () => void;
  onNotRemember: () => void;
  isLoading?: boolean;
}

export function ActionButtons({ onRemember, onNotRemember, isLoading = false }: ActionButtonsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
      <motion.button
        onClick={onNotRemember}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200 
                   bg-card border-2 border-border text-foreground hover:border-accent hover:text-accent
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('learning.notYetButton')}
      </motion.button>
      
      <motion.button
        onClick={onRemember}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200
                   bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('learning.rememberButton')}
      </motion.button>
    </div>
  );
}
