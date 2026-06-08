import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

interface ExplanationBoxProps {
  explanation: string | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

export function ExplanationBox({
  explanation,
  error,
  isLoading,
  onRetry,
}: ExplanationBoxProps) {
  const t = useTranslations();

  return (
    <AnimatePresence mode='wait'>
      {explanation && (
        <motion.div
          key='explanation'
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className='space-y-4'
        >
          <p className='text-sm leading-6 text-card-foreground'>
            {explanation}
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            {t('learning.retryExplanation')}
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div
          key='error'
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className='rounded-lg border border-destructive/30 bg-destructive/10 p-4'
        >
          <div className='mb-3 flex items-start gap-2 text-sm text-destructive'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>{error}</p>
          </div>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            {t('learning.tryAgain')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
