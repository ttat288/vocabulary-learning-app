import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bot, Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import {
  type AiExplanation,
  type ExplainAction,
  type ExplainActionInput,
} from '@/lib/explain-actions';
import { type ExplainStatus } from '@/lib/explain-cache';
import { type Word } from '@/lib/types';
import { AiActionPanel } from './ai-action-panel';
import { ExplanationBox } from './explanation-box';

const ENGLISH_FACTS = [
  'Chờ AI phản hồi...',
  'Tiếng Anh mượn từ từ hơn 350 ngôn ngữ khác nhau.',
  'Từ "set" có hàng trăm nghĩa trong nhiều từ điển tiếng Anh.',
  'Pangram là câu dùng đủ 26 chữ cái trong bảng chữ cái.',
  '"Goodbye" bắt nguồn từ cụm "God be with ye."',
  'Chính tả tiếng Anh khó vì cách phát âm thay đổi nhanh hơn cách viết.',
  'Phrasal verbs có thể đổi nghĩa hoàn toàn chỉ vì một giới từ ngắn.',
  '"I am" là một trong những câu hoàn chỉnh ngắn nhất trong tiếng Anh.',
  'Chữ cái xuất hiện nhiều nhất trong văn bản tiếng Anh là "e."',
  'Tiếng Anh dùng trọng âm để phân biệt một số danh từ và động từ.',
  'Từ mới vẫn được thêm vào các từ điển tiếng Anh lớn mỗi năm.',
  'The word "bookkeeper" has three pairs of double letters in a row.',
  'English has no official language academy that controls all correct usage.',
  'The sentence "The quick brown fox jumps over the lazy dog" uses every letter.',
  'Many English words changed meaning over centuries, not just spelling.',
  '"Awful" once meant worthy of awe, not necessarily bad.',
  'Old English sounded much closer to German than modern English does.',
  'English adjectives usually follow a hidden order: opinion, size, age, shape, color.',
  'The word "nice" once meant foolish or ignorant before it became positive.',
  'Some English nouns become verbs without changing form, like "email" or "text."',
  'Silent letters often remain because spelling preserves older pronunciations.',
];

interface AiCardProps {
  activeAction: ExplainAction;
  explanation: AiExplanation | null;
  error: string | null;
  isLoading: boolean;
  onExplain: (action: ExplainAction, input?: ExplainActionInput) => Promise<void>;
  onReset: () => void;
  onRetry: () => Promise<void>;
  status: ExplainStatus;
  word: Word;
}

export function AiCard({
  activeAction,
  explanation,
  error,
  isLoading,
  onExplain,
  onReset,
  onRetry,
  status,
  word,
}: AiCardProps) {
  const t = useTranslations();
  const [factIndex, setFactIndex] = useState(0);
  const showChoices = status === 'idle';
  const showLoading = isLoading && !explanation && !error;

  useEffect(() => {
    if (!showLoading) return;

    setFactIndex(0);

    const timer = setInterval(() => {
      setFactIndex((current) => {
        if (ENGLISH_FACTS.length < 2) return current;

        let next = 1 + Math.floor(Math.random() * (ENGLISH_FACTS.length - 1));
        if (next === current) next = (next + 1) % ENGLISH_FACTS.length;
        if (next === 0) next = 1;
        return next;
      });
    }, 4_000);

    return () => clearInterval(timer);
  }, [showLoading]);

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
                isLoading={isLoading}
                onSubmit={onExplain}
                word={word}
              />
            )}

            {showLoading && (
              <div className='space-y-4 pt-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {ENGLISH_FACTS[factIndex]}
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
                  variant='outline'
                  size='sm'
                  onClick={onReset}
                  className='mb-4 gap-2'
                >
                  <RotateCcw className='h-3.5 w-3.5' aria-hidden />
                  Choose another
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
}
