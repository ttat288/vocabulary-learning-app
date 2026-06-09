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

function parseExplanation(text: string): string[] {
  // Try to split by numbered items (1. 2. 3.)
  const numberedRegex = /^\d+\.\s+/m;
  if (numberedRegex.test(text)) {
    return text
      .split(/\n\d+\.\s+/)
      .filter(Boolean)
      .map((item) => item.trim());
  }

  // Otherwise split by double newlines or single newlines
  if (text.includes('\n\n')) {
    return text
      .split('\n\n')
      .filter(Boolean)
      .map((item) => item.trim());
  }

  if (text.includes('\n')) {
    return text
      .split('\n')
      .filter(Boolean)
      .map((item) => item.trim());
  }

  return [text];
}

export function ExplanationBox({
  explanation,
  error,
  isLoading,
  onRetry,
}: ExplanationBoxProps) {
  const t = useTranslations();
  const explanationItems = explanation ? parseExplanation(explanation) : [];

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
          <div className='space-y-3'>
            {explanationItems.map((item, index) => (
              <p key={index} className='text-sm leading-6 text-card-foreground'>
                {item}
              </p>
            ))}
          </div>
          <Button
            type='button'
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0'
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
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            {t('learning.tryAgain')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
