'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Layers, LibraryBig, Zap } from 'lucide-react';

import { AdSlot } from '@/components/ads/ad-slot';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { DailyGoal } from '@/lib/types';

interface OnboardingScreenProps {
  onSelectGoal: (goal: DailyGoal) => void;
  maxGoal: number;
}

export function OnboardingScreen({
  onSelectGoal,
  maxGoal,
}: OnboardingScreenProps) {
  const t = useTranslations();
  const goals = [
    { value: 10, label: t('onboarding.goal10'), icon: Zap },
    { value: 20, label: t('onboarding.goal20'), icon: Gauge },
    { value: 50, label: t('onboarding.goal50'), icon: Layers },
    {
      value: maxGoal,
      label: t('onboarding.goalMax').replace('{count}', String(maxGoal)),
      icon: LibraryBig,
    },
  ].filter(
    (goal, index, allGoals) =>
      allGoals.findIndex((candidate) => candidate.value === goal.value) ===
      index,
  );

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
            <span className='inline-flex items-center gap-2'>
              <img
                src='/languageflow-logo.png'
                alt=''
                className='h-4 w-4 object-contain'
              />
              {t('common.appName')}
            </span>
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
              {goals.map((goal) => {
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
                      {goal.label}
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

        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_ONBOARDING_SLOT}
          className='mt-6 overflow-hidden rounded-lg'
        />

        <nav
          className='mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground'
          aria-label='Public links'
        >
          <a className='hover:text-primary' href='/about'>
            About
          </a>
          <a className='hover:text-primary' href='/english-tips'>
            English tips
          </a>
          <a className='hover:text-primary' href='/privacy'>
            Privacy
          </a>
          <a className='hover:text-primary' href='/terms'>
            Terms
          </a>
          <a className='hover:text-primary' href='/contact'>
            Contact
          </a>
        </nav>
      </motion.div>
    </main>
  );
}
