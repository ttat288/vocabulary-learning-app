import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { Word } from '@/lib/types';
import { ExplanationBox } from './explanation-box';

interface AiCardProps {
  explanation: string | null;
  error: string | null;
  isLoading: boolean;
  onExplain: (word: Word) => Promise<void>;
  onRetry: (word: Word) => Promise<void>;
  word: Word;
}

export function AiCard({
  explanation,
  error,
  isLoading,
  onExplain,
  onRetry,
  word,
}: AiCardProps) {
  const t = useTranslations();
  const showSkeleton = !explanation && !error;

  return (
    <AnimatePresence mode='wait'>
      <motion.aside
        layout
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.25 }}
        className='min-h-0'
      >
        <Card className='flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20'>
          <CardHeader className='shrink-0 border-b border-pink-200 dark:border-purple-800 bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <span className='flex h-5 w-5 items-center justify-center rounded bg-gradient-to-r from-pink-500 to-purple-500 text-white'>
                <Bot className='h-3 w-3' />
              </span>
              <span className='bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent'>
                {t('learning.aiExplanation')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='min-h-0 flex-1 overflow-auto p-4'>
            {showSkeleton ? (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {t('learning.explaining')}
                </div>
                <div className='space-y-3'>
                  <div className='h-3 rounded bg-muted' />
                  <div className='h-3 rounded bg-muted' />
                  <div className='h-3 w-4/5 rounded bg-muted' />
                  <div className='h-16 rounded bg-muted/70' />
                </div>
              </div>
            ) : (
              <ExplanationBox
                explanation={explanation}
                error={error}
                isLoading={isLoading}
                onRetry={() => onRetry(word)}
              />
            )}
          </CardContent>
        </Card>
      </motion.aside>
    </AnimatePresence>
  );
}
