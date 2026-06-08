'use client';

import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

interface ActionButtonsProps {
  onRemember: () => void;
  onNotRemember: () => void;
  isLoading?: boolean;
  aiEnabled?: boolean;
}

export function ActionButtons({
  onRemember,
  onNotRemember,
  isLoading = false,
  aiEnabled = true,
}: ActionButtonsProps) {
  const t = useTranslations();

  return (
    <div
      className={`grid w-full grid-cols-1 gap-3 sm:grid-cols-2 ${
        aiEnabled ? 'mx-auto max-w-6xl' : 'mx-auto max-w-full'
      }`}
    >
      <motion.div whileTap={{ scale: 0.99 }}>
        <Button
          type='button'
          variant='outline'
          size='lg'
          onClick={onNotRemember}
          disabled={isLoading}
          className='h-11 w-full justify-center gap-2 border-border bg-card text-foreground hover:border-accent hover:text-accent'
        >
          <RotateCcw className='h-4 w-4' aria-hidden='true' />
          {t('learning.notYetButton')}
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.99 }}>
        <Button
          type='button'
          size='lg'
          onClick={onRemember}
          disabled={isLoading}
          className='h-11 w-full justify-center gap-2'
        >
          <Check className='h-4 w-4' aria-hidden='true' />
          {t('learning.rememberButton')}
        </Button>
      </motion.div>
    </div>
  );
}
