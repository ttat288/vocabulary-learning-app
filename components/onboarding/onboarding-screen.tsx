'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Infinity, Layers, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

interface OnboardingScreenProps {
  onSelectGoal: (goal: number | 'unlimited') => void;
}

const GOALS = [
  { value: 10, labelKey: 'onboarding.goal10', icon: Zap },
  { value: 20, labelKey: 'onboarding.goal20', icon: Gauge },
  { value: 50, labelKey: 'onboarding.goal50', icon: Layers },
  { value: 'unlimited', labelKey: 'onboarding.goalUnlimited', icon: Infinity },
] as const;

export function OnboardingScreen({ onSelectGoal }: OnboardingScreenProps) {
  const t = useTranslations();

  return (
    <main className='flex min-h-screen items-center justify-center px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-5xl'
      >
        <div className='mb-8 max-w-2xl'>
          <Badge variant='outline' className='mb-4'>
            VocabFlow
          </Badge>
          <h1 className='text-4xl font-semibold tracking-normal text-foreground sm:text-5xl'>
            {t('onboarding.heading')}
          </h1>
          <p className='mt-3 text-base leading-7 text-muted-foreground sm:text-lg'>
            {t('onboarding.tagline')}
          </p>
        </div>

        <Card>
          <CardContent className='p-4 sm:p-5'>
            <div className='mb-4 flex items-center justify-between gap-4'>
              <p className='text-sm font-medium text-foreground'>
                {t('onboarding.question')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                return (
                  <button
                    key={String(goal.value)}
                    type='button'
                    onClick={() => onSelectGoal(goal.value)}
                    className='group rounded-xl border border-border bg-background/70 p-4 text-left transition-colors hover:border-primary hover:bg-muted/60'
                  >
                    <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <p className='font-semibold text-foreground'>
                      {t(goal.labelKey)}
                    </p>
                    <div className='mt-4'>
                      <span className='inline-flex items-center gap-2 text-sm font-medium text-primary'>
                        {t('onboarding.startButton')}
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className='mt-5 text-sm text-muted-foreground'>
          {t('onboarding.footer')}
        </p>
      </motion.div>
    </main>
  );
}
