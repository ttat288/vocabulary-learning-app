import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { type AiExplanation, type QuizExplanation } from '@/lib/explain-actions';

interface ExplanationBoxProps {
  explanation: AiExplanation | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

function parseExplanation(text: string): string[] {
  // Try to split by numbered items (1. 2. 3.)
  const numberedRegex = /^\d+\.\s+/m;
  if (numberedRegex.test(text)) {
    return text
      .split(/\n\d+\.\s+/)
      .filter(Boolean)
      .map((item) => item.trim());
  }

  // Otherwise split by double newlines or single newlines
  if (text.includes('\n\n')) {
    return text
      .split('\n\n')
      .filter(Boolean)
      .map((item) => item.trim());
  }

  if (text.includes('\n')) {
    return text
      .split('\n')
      .filter(Boolean)
      .map((item) => item.trim());
  }

  return [text];
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function TextBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  if (!children) return null;

  return (
    <section className='rounded-md border border-border bg-background/60 p-3'>
      <h4 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {label}
      </h4>
      <div className='text-sm leading-6 text-card-foreground'>{children}</div>
    </section>
  );
}

function ListBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className='space-y-2'>
      {items.map((item, index) => (
        <li key={index} className='flex gap-2 text-sm leading-6'>
          <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function asArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function RawExplanationView({ text }: { text: string }) {
  return (
    <div className='space-y-3'>
      {parseExplanation(text).map((item, index) => (
        <p key={index} className='text-sm leading-6 text-card-foreground'>
          {renderInlineMarkdown(item)}
        </p>
      ))}
    </div>
  );
}

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function QuizView({ explanation }: { explanation: QuizExplanation }) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});

  return (
    <div className='space-y-3'>
      {asArray(explanation.questions).map((question, index) => {
        const selectedAnswer = selectedAnswers[index];
        const options = asArray(question.options);
        const answered = typeof selectedAnswer === 'string';
        const isCorrect =
          answered &&
          normalizeAnswer(selectedAnswer) === normalizeAnswer(question.answer);

        return (
          <section
            key={index}
            className='rounded-md border border-border bg-background/60 p-3'
          >
            <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Câu {index + 1} · {question.kind.replace('_', ' ')}
            </div>
            <p className='text-sm leading-6 text-card-foreground'>
              {question.question}
            </p>
            {options.length > 0 ? (
              <div className='mt-3 space-y-1.5'>
                {options.map((option, optionIndex) => {
                  const isSelected = selectedAnswer === option;
                  const isAnswer =
                    normalizeAnswer(option) === normalizeAnswer(question.answer);

                  return (
                    <Button
                      key={optionIndex}
                      type='button'
                      variant={
                        answered
                          ? isAnswer
                            ? 'default'
                            : isSelected
                              ? 'destructive'
                              : 'outline'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [index]: option,
                        }))
                      }
                      disabled={answered}
                      className='h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-sm leading-5'
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setSelectedAnswers((current) => ({
                    ...current,
                    [index]: question.answer,
                  }))
                }
                disabled={answered}
                className='mt-3'
              >
                Xem đáp án
              </Button>
            )}
            {answered && (
              <div className='mt-3 space-y-2'>
                <div
                  className={
                    isCorrect
                      ? 'rounded bg-primary/10 px-3 py-2 text-sm leading-6 text-primary'
                      : 'rounded bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive'
                  }
                >
                  {isCorrect ? 'Đúng.' : 'Sai.'}
                </div>
                {!isCorrect && (
                  <div className='rounded bg-primary/10 px-3 py-2 text-sm leading-6'>
                    <strong>Đáp án đúng:</strong> {question.answer}
                  </div>
                )}
                <p className='text-sm leading-6 text-muted-foreground'>
                  {question.explanation}
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StructuredExplanationView({
  explanation,
}: {
  explanation: AiExplanation;
}) {
  if (explanation.type === 'raw') {
    return <RawExplanationView text={explanation.text} />;
  }

  if (explanation.type === 'simple') {
    return (
      <div className='space-y-3'>
        <TextBlock label='Ý nghĩa'>{explanation.mainMeaning}</TextBlock>
        <TextBlock label='Cách dùng'>{explanation.usage}</TextBlock>
        <TextBlock label='Ví dụ mới'>
          <p>{explanation.example}</p>
          <p className='mt-2 text-muted-foreground'>
            {explanation.exampleMeaning}
          </p>
        </TextBlock>
        {explanation.shortMeaning && (
          <TextBlock label='Nghĩa ngắn gọn'>
            {explanation.shortMeaning}
          </TextBlock>
        )}
      </div>
    );
  }

  if (explanation.type === 'examples') {
    return (
      <div className='space-y-3'>
        {asArray(explanation.examples).map((example, index) => (
          <TextBlock key={index} label={`Ví dụ ${index + 1}`}>
            <p>{example.sentence}</p>
            <p className='mt-2 text-muted-foreground'>{example.meaning}</p>
          </TextBlock>
        ))}
      </div>
    );
  }

  if (explanation.type === 'natural_usage') {
    return (
      <div className='space-y-3'>
        <TextBlock label='Collocations'>
          <ListBlock items={asArray(explanation.collocations)} />
        </TextBlock>
        <TextBlock label='Mẫu câu'>
          <ListBlock items={asArray(explanation.patterns)} />
        </TextBlock>
        <TextBlock label='Tình huống dùng'>
          <ListBlock items={asArray(explanation.situations)} />
        </TextBlock>
        <TextBlock label='Lỗi thường gặp'>{explanation.commonMistake}</TextBlock>
      </div>
    );
  }

  if (explanation.type === 'quiz') {
    return <QuizView explanation={explanation} />;
  }

  if (explanation.type === 'check_sentence') {
    return (
      <div className='space-y-3'>
        <TextBlock label='Kết quả'>
          {explanation.isCorrect ? 'Correct.' : 'Incorrect.'}
        </TextBlock>
        {explanation.correctedSentence && (
          <TextBlock label='Câu sửa'>{explanation.correctedSentence}</TextBlock>
        )}
        <TextBlock label='Giải thích'>{explanation.explanation}</TextBlock>
        {explanation.naturalVersion && (
          <TextBlock label='Cách nói tự nhiên'>
            {explanation.naturalVersion}
          </TextBlock>
        )}
      </div>
    );
  }

  if (explanation.type === 'compare_suggestions') {
    return (
      <div className='space-y-3'>
        {asArray(explanation.suggestions).map((suggestion, index) => (
          <TextBlock key={index} label={suggestion.word}>
            {suggestion.reason}
          </TextBlock>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <TextBlock label='Khác biệt nghĩa'>
        {explanation.meaningDifference}
      </TextBlock>
      <TextBlock label='Khác biệt cách dùng'>
        {explanation.usageDifference}
      </TextBlock>
      {asArray(explanation.examples).map((example, index) => (
        <TextBlock key={index} label={example.word}>
          <p>{example.sentence}</p>
          <p className='mt-2 text-muted-foreground'>{example.meaning}</p>
        </TextBlock>
      ))}
      <TextBlock label='Quy tắc nhớ'>{explanation.rule}</TextBlock>
    </div>
  );
}

export function ExplanationBox({
  explanation,
  error,
  isLoading,
  onRetry,
}: ExplanationBoxProps) {
  const t = useTranslations();

  return (
    <AnimatePresence mode='wait'>
      {explanation && (
        <motion.div
          key='explanation'
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className='space-y-4'
        >
          <StructuredExplanationView explanation={explanation} />
          <Button
            type='button'
            variant='ai'
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            {t('learning.retryExplanation')}
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div
          key='error'
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className='rounded-lg border border-destructive/30 bg-destructive/10 p-4'
        >
          <div className='mb-3 flex items-start gap-2 text-sm text-destructive'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>{error}</p>
          </div>
          <Button
            type='button'
            variant='ai'
            size='sm'
            onClick={onRetry}
            disabled={isLoading}
            className='gap-2'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            {t('learning.tryAgain')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
