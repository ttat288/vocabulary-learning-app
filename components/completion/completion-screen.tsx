'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='flex h-full min-h-0 items-center justify-center py-6'
    >
      <Card className='w-full max-w-3xl'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Trophy className='h-6 w-6' />
          </div>
          <Badge variant='outline' className='mx-auto mb-2'>
            {t('completion.subtitle')}
          </Badge>
          <CardTitle className='text-3xl sm:text-4xl'>
            {t('completion.heading')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <StatCard
              icon={<CheckCircle2 className='h-5 w-5' />}
              label={t('completion.wordsLearned')}
              value={wordsLearned}
            />
            <StatCard
              icon={<Clock3 className='h-5 w-5' />}
              label={t('completion.reviewQueueLabel')}
              value={reviewQueueSize}
            />
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Button type='button' variant='outline' size='lg' onClick={onFinish}>
              {t('completion.finishButton')}
            </Button>
            <Button
              type='button'
              size='lg'
              onClick={onContinue}
              className='gap-2'
            >
              {t('completion.continueButton')}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className='rounded-xl border border-border bg-background/60 p-4'>
      <div className='mb-3 flex items-center gap-2 text-sm text-muted-foreground'>
        <span className='text-primary'>{icon}</span>
        {label}
      </div>
      <p className='text-3xl font-semibold text-foreground'>{value}</p>
    </div>
  );
}
