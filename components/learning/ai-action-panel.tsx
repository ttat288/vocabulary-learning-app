'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  GitCompareArrows,
  ListChecks,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useTranslations } from '@/hooks/use-translations';
import {
  buildExplainRequestBody,
  type AiExplanation,
  type CompareSuggestionsExplanation,
  type ExplainAction,
  type ExplainActionInput,
} from '@/lib/explain-actions';
import { type Word } from '@/lib/types';
import { cn } from '@/lib/utils';

type AiActionConfig = {
  id: ExplainAction;
  labelKey: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  requiresInput?: boolean;
  inputLabelKey?: string;
  inputPlaceholderKey?: string;
  inputType?: 'textarea' | 'input';
};

const AI_ACTIONS: AiActionConfig[] = [
  {
    id: 'simple',
    labelKey: 'learning.aiActions.simple',
    icon: Sparkles,
  },
  {
    id: 'examples',
    labelKey: 'learning.aiActions.examples',
    icon: ListChecks,
  },
  {
    id: 'natural_usage',
    labelKey: 'learning.aiActions.naturalUsage',
    icon: MessageSquareText,
  },
  {
    id: 'quiz',
    labelKey: 'learning.aiActions.quiz',
    icon: ClipboardList,
  },
  {
    id: 'check_sentence',
    labelKey: 'learning.aiActions.checkSentence',
    icon: CheckCircle2,
    requiresInput: true,
    inputLabelKey: 'learning.aiInputs.sentenceLabel',
    inputPlaceholderKey: 'learning.aiInputs.sentencePlaceholder',
    inputType: 'textarea',
  },
  {
    id: 'compare',
    labelKey: 'learning.aiActions.compare',
    icon: GitCompareArrows,
    requiresInput: true,
    inputLabelKey: 'learning.aiInputs.compareLabel',
    inputPlaceholderKey: 'learning.aiInputs.comparePlaceholder',
    inputType: 'input',
  },
];

interface AiActionPanelProps {
  activeAction: ExplainAction;
  getWord: () => Word | null;
  isLoading: boolean;
  onSubmit: (action: ExplainAction, input?: ExplainActionInput) => void;
}

export function AiActionPanel({
  activeAction,
  getWord,
  isLoading,
  onSubmit,
}: AiActionPanelProps) {
  const { language } = useLanguage();
  const t = useTranslations();
  const [selectedAction, setSelectedAction] = useState<ExplainAction | null>(
    null,
  );
  const [userSentence, setUserSentence] = useState('');
  const [compareWord, setCompareWord] = useState('');
  const [compareSuggestions, setCompareSuggestions] = useState<
    CompareSuggestionsExplanation['suggestions']
  >([]);
  const [isLoadingCompareSuggestions, setIsLoadingCompareSuggestions] =
    useState(false);

  useEffect(() => {
    if (isLoading) setSelectedAction(activeAction);
  }, [activeAction, isLoading]);

  const selectedConfig =
    selectedAction === null
      ? null
      : (AI_ACTIONS.find((action) => action.id === selectedAction) ?? null);
  const inputValue =
    selectedAction === 'check_sentence' ? userSentence : compareWord;
  const canSubmitInput =
    !!selectedConfig &&
    (!selectedConfig.requiresInput || inputValue.trim().length > 0);

  const submitSelectedAction = () => {
    if (!selectedAction || !canSubmitInput) return;

    onSubmit(selectedAction, {
      userSentence,
      compareWord,
    });
  };

  const handleActionClick = (action: ExplainAction) => {
    setSelectedAction(action);

    const config = AI_ACTIONS.find((item) => item.id === action);
    if (config?.requiresInput) return;

    onSubmit(action);
  };

  useEffect(() => {
    if (selectedAction !== 'compare' || compareSuggestions.length > 0) return;

    const controller = new AbortController();

    async function loadCompareSuggestions() {
      const word = getWord();
      if (!word) return;

      setIsLoadingCompareSuggestions(true);

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            buildExplainRequestBody(word, language, {
              action: 'compare_suggestions',
            }),
          ),
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          explanation?: AiExplanation;
        };

        if (data.explanation?.type === 'compare_suggestions') {
          setCompareSuggestions(data.explanation.suggestions.slice(0, 4));
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('[v0] Error requesting compare suggestions:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCompareSuggestions(false);
        }
      }
    }

    void loadCompareSuggestions();

    return () => controller.abort();
  }, [compareSuggestions.length, getWord, language, selectedAction]);

  return (
    <div className='space-y-3 border-b border-border/80 pb-4'>
      <div className='grid grid-cols-2 gap-2'>
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon;
          const active = activeAction === action.id;
          const selected = selectedAction === action.id;

          return (
            <Button
              key={action.id}
              type='button'
              variant='ai'
              size='sm'
              onClick={() => handleActionClick(action.id)}
              disabled={isLoading && active}
              className={cn(
                'h-9 justify-start gap-2 px-2 text-xs',
                selected && 'ring-2 ring-pink-500/30 ring-offset-1',
              )}
              title={t(action.labelKey)}
            >
              <Icon className='h-3.5 w-3.5 shrink-0' aria-hidden />
              <span className='truncate'>{t(action.labelKey)}</span>
            </Button>
          );
        })}
      </div>

      {selectedConfig?.requiresInput && (
        <div className='space-y-2'>
          <label
            htmlFor={`ai-action-${selectedConfig.id}`}
            className='text-xs font-medium text-muted-foreground'
          >
            {selectedConfig.inputLabelKey
              ? t(selectedConfig.inputLabelKey)
              : ''}
          </label>
          {selectedConfig.inputType === 'textarea' ? (
            <textarea
              id={`ai-action-${selectedConfig.id}`}
              value={userSentence}
              onChange={(event) => setUserSentence(event.target.value)}
              placeholder={
                selectedConfig.inputPlaceholderKey
                  ? t(selectedConfig.inputPlaceholderKey)
                  : ''
              }
              rows={3}
              className='w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
            />
          ) : (
            <input
              id={`ai-action-${selectedConfig.id}`}
              value={compareWord}
              onChange={(event) => setCompareWord(event.target.value)}
              placeholder={
                selectedConfig.inputPlaceholderKey
                  ? t(selectedConfig.inputPlaceholderKey)
                  : ''
              }
              className='h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
            />
          )}
          <Button
            type='button'
            variant='ai'
            size='sm'
            onClick={submitSelectedAction}
            disabled={isLoading || !canSubmitInput}
            className='w-full gap-2'
          >
            <Send className='h-3.5 w-3.5' aria-hidden />
            {t('learning.askAi')}
          </Button>
          {selectedAction === 'compare' && (
            <div className='space-y-2 pt-1'>
              <div className='text-xs font-medium text-muted-foreground'>
                {t('learning.aiSuggestions')}
              </div>
              {isLoadingCompareSuggestions ? (
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden />
                  {t('learning.findingSimilarWords')}
                </div>
              ) : compareSuggestions.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {compareSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion.word}
                      type='button'
                      variant='ai'
                      size='sm'
                      onClick={() => {
                        setCompareWord(suggestion.word);
                        onSubmit('compare', { compareWord: suggestion.word });
                      }}
                      className='h-auto px-2 py-1 text-xs'
                      title={suggestion.reason}
                    >
                      {suggestion.word}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
