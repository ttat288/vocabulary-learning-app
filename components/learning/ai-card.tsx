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
  prefetchLoading?: boolean;
  onExplain: (word: Word) => Promise<void>;
  word: Word;
}

export function AiCard({
  explanation,
  error,
  isLoading,
  prefetchLoading = false,
  onExplain,
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
        <Card className='flex h-full min-h-0 flex-col overflow-hidden'>
          <CardHeader className='shrink-0 border-b border-border p-4'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Bot className='h-4 w-4 text-accent' />
              {t('learning.aiExplanation')}
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
                onRetry={() => onExplain(word)}
              />
            )}
          </CardContent>
        </Card>
      </motion.aside>
    </AnimatePresence>
  );
}
