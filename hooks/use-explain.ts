import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Word } from '@/lib/types';

export interface ExplainResponse {
  explanation: string;
  word: string;
  remaining: number;
}

export function useExplain() {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(5);
  const { language } = useLanguage();

  const explain = useCallback(
    async (word: Word) => {
      setIsLoading(true);
      setError(null);
      setExplanation(null);

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            word: word.word,
            meaning: word.meaning,
            example: word.example,
            exampleMeaning: word.exampleMeaning,
            language,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 429) {
            setError(
              errorData.error || 'Too many requests. Please try again later.'
            );
          } else {
            setError(errorData.error || 'Failed to generate explanation');
          }
          return;
        }

        const data: ExplainResponse = await response.json();
        setExplanation(data.explanation);
        setRemaining(data.remaining);
      } catch (err) {
        console.error('[v0] Error requesting explanation:', err);
        setError('Failed to generate explanation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [language]
  );

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return {
    explanation,
    isLoading,
    error,
    remaining,
    explain,
    clear,
  };
}
