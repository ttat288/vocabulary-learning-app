import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Word } from '@/lib/types';
import { explainCache } from '@/lib/explain-cache';

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

      // If cached, use it
      const cached = explainCache.get(word.id);
      if (cached && cached.explanation) {
        setExplanation(cached.explanation);
        setIsLoading(false);
        return;
      }

      try {
        const explanationText = await explainCache.fetch(word, language);
        if (explanationText) {
          setExplanation(explanationText);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('aborted');
        } else {
          console.error('[v0] Error requesting explanation:', err);
          setError(
            err?.message || 'Failed to generate explanation. Please try again.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [language],
  );

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
    // Note: do not clear cache here; cache persists for prefetch.
  }, []);

  // Abort any in-flight fetch started by this hook when unmounting
  useEffect(() => {
    return () => {
      // Nothing specific to abort here — explainCache controllers are global and should be cancelled by caller logic when needed.
    };
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
