'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Quote, Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useExplain } from '@/hooks/use-explain';
import { useTranslations } from '@/hooks/use-translations';
import { explainCache } from '@/lib/explain-cache';
import { Word } from '@/lib/types';
import { AiCard } from './ai-card';

interface WordCardProps {
  word: Word;
  aiEnabled: boolean;
}

export function WordCard({ word, aiEnabled }: WordCardProps) {
  const t = useTranslations();
  const { explanation, isLoading, error, explain, clear } = useExplain();

  const requestExplain = useCallback(async () => {
    if (!aiEnabled) return;
    await explain(word);
  }, [aiEnabled, explain, word]);

  const cached = explainCache.get(word.id);
  const prefetchLoading = aiEnabled && !!cached && cached.loading;
  const prefilledExplanation = aiEnabled ? cached?.explanation ?? null : null;

  useEffect(() => {
    if (!aiEnabled) {
      clear();
      return;
    }

    requestExplain();
  }, [aiEnabled, clear, requestExplain, word.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className='h-full min-h-0 w-full'
    >
      <div
        className={
          aiEnabled
            ? 'grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_23rem]'
            : 'grid h-full min-h-0'
        }
      >
        <Card className='flex h-full min-h-0 flex-col overflow-hidden'>
          <CardHeader className='shrink-0 border-b border-border p-4 sm:p-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 space-y-2'>
                <Badge variant='outline'>{t('learning.definition')}</Badge>
                <CardTitle className='break-words text-3xl leading-tight sm:text-4xl md:text-5xl'>
                  {word.word}
                </CardTitle>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Volume2 className='h-4 w-4' aria-hidden='true' />
                  <span className='break-words font-mono'>{word.phonetic}</span>
                </div>
              </div>

            </div>
          </CardHeader>

          <CardContent className='min-h-0 flex-1 overflow-auto p-4 sm:p-5'>
            <div className='grid gap-4 xl:grid-cols-2'>
              <section className='rounded-lg border border-border bg-background/60 p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-primary'>
                  <BookOpen className='h-4 w-4' aria-hidden='true' />
                  {t('learning.definition')}
                </div>
                <p className='break-words text-sm leading-6 text-foreground sm:text-base'>
                  {word.meaning}
                </p>
              </section>

              <section className='rounded-lg border border-border bg-background/60 p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-primary'>
                  <Quote className='h-4 w-4' aria-hidden='true' />
                  {t('learning.example')}
                </div>
                <blockquote className='break-words text-sm leading-6 text-foreground sm:text-base'>
                  "{word.example}"
                </blockquote>
                <p className='mt-3 break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground'>
                  {word.exampleMeaning}
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {aiEnabled && (
            <AiCard
              explanation={explanation ?? prefilledExplanation}
              error={error}
              isLoading={isLoading}
              prefetchLoading={prefetchLoading}
              onExplain={requestExplain}
              word={word}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
