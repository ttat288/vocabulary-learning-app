'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/use-translations';

interface ProgressBarProps {
  current: number;
  goal: number | string;
}

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const t = useTranslations();
  const goalNum = typeof goal === 'string' ? Math.max(current, 1) : goal;
  const percentage =
    goal === 'unlimited' ? 100 : Math.min((current / goalNum) * 100, 100);

  return (
    <div className='shrink-0 rounded-xl border border-border bg-card px-4 py-3 shadow-sm'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium text-foreground'>
            {t('progressBar.label')}
          </p>
          <p className='text-xs text-muted-foreground'>
            {current} {t('progressBar.of')} {goal === 'unlimited' ? '∞' : goal}
          </p>
        </div>
        <Badge variant='outline'>{Math.round(percentage)}%</Badge>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
