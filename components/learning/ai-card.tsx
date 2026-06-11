import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { Bot, Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslationList, useTranslations } from '@/hooks/use-translations';
import {
  type AiExplanation,
  type ExplainAction,
  type ExplainActionInput,
} from '@/lib/explain-actions';
import { type ExplainStatus } from '@/lib/explain-cache';
import { type Word } from '@/lib/types';
import { AiActionPanel } from './ai-action-panel';
import { ExplanationBox } from './explanation-box';

interface AiCardProps {
  activeAction: ExplainAction;
  explanation: AiExplanation | null;
  error: string | null;
  getWord: () => Word | null;
  isLoading: boolean;
  onExplain: (
    action: ExplainAction,
    input?: ExplainActionInput,
  ) => Promise<void>;
  onReset: () => void;
  onRetry: () => Promise<void>;
  status: ExplainStatus;
}

export const AiCard = memo(function AiCard({
  activeAction,
  explanation,
  error,
  getWord,
  isLoading,
  onExplain,
  onReset,
  onRetry,
  status,
}: AiCardProps) {
  const t = useTranslations();
  const loadingFacts = useTranslationList('learning.aiLoadingFacts');
  const [factIndex, setFactIndex] = useState(0);
  const showChoices = status === 'idle';
  const showLoading = isLoading && !explanation && !error;

  useEffect(() => {
    if (!showLoading) return;

    setFactIndex(0);

    let timer: ReturnType<typeof setInterval> | undefined;

    const changeFact = () => {
      setFactIndex((current) => {
        if (loadingFacts.length < 2) return current;

        let next = 1 + Math.floor(Math.random() * (loadingFacts.length - 1));
        if (next === current) next = (next + 1) % loadingFacts.length;
        if (next === 0) next = 1;
        return next;
      });
    };

    const firstTimer = setTimeout(() => {
      changeFact();
      timer = setInterval(changeFact, 10_000);
    }, 3_000);

    return () => {
      clearTimeout(firstTimer);
      if (timer) clearInterval(timer);
    };
  }, [loadingFacts.length, showLoading]);

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
            {showChoices && (
              <AiActionPanel
                activeAction={activeAction}
                getWord={getWord}
                isLoading={isLoading}
                onSubmit={onExplain}
              />
            )}

            {showLoading && (
              <div className='space-y-4 pt-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {loadingFacts[factIndex] ?? t('learning.explaining')}
                </div>
                <div className='space-y-3'>
                  <div className='h-3 rounded bg-muted' />
                  <div className='h-3 rounded bg-muted' />
                  <div className='h-3 w-4/5 rounded bg-muted' />
                  <div className='h-16 rounded bg-muted/70' />
                </div>
              </div>
            )}

            {!showChoices && !showLoading && (
              <div className='pt-4'>
                <Button
                  type='button'
                  variant='ai'
                  size='sm'
                  onClick={onReset}
                  className='mb-4 gap-2'
                >
                  <RotateCcw className='h-3.5 w-3.5' aria-hidden />
                  {t('learning.chooseAnother')}
                </Button>
                <ExplanationBox
                  explanation={explanation}
                  error={error}
                  isLoading={isLoading}
                  onRetry={onRetry}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.aside>
    </AnimatePresence>
  );
});
