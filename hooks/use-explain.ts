import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Word } from '@/lib/types';
import { ExplainStatus, explainCache } from '@/lib/explain-cache';

export interface ExplainResponse {
  explanation: string;
  word: string;
  remaining: number;
}

export function useExplain() {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ExplainStatus>('idle');
  const activeKeyRef = useRef<string | null>(null);
  const { language } = useLanguage();

  const explain = useCallback(
    async (word: Word) => {
      const requestKey = explainCache.getKey(word.id, language);
      activeKeyRef.current = requestKey;
      setIsLoading(true);
      setStatus('loading');
      setError(null);
      setExplanation(null);

      const cached = explainCache.get(word.id, language);
      if (cached?.explanation) {
        setExplanation(cached.explanation);
        setIsLoading(false);
        setStatus('success');
        return;
      }

      try {
        const explanationText = await explainCache.fetch(
          word,
          language,
          'foreground',
        );

        if (activeKeyRef.current !== requestKey) return;

        setExplanation(explanationText);
        setStatus('success');
      } catch (err: any) {
        if (activeKeyRef.current !== requestKey) return;
        if (err.name === 'AbortError') return;

        console.error('[v0] Error requesting explanation:', err);
        setError(
          err?.message || 'Failed to generate explanation. Please try again.',
        );
        setStatus('error');
      } finally {
        if (activeKeyRef.current === requestKey) {
          setIsLoading(false);
        }
      }
    },
    [language],
  );

  const clear = useCallback(() => {
    activeKeyRef.current = null;
    setExplanation(null);
    setError(null);
    setIsLoading(false);
    setStatus('idle');
  }, []);

  const retry = useCallback(
    async (word: Word) => {
      // Clear cache to force regeneration
      explainCache.clearEntry(word.id, language);
      // Now fetch fresh explanation
      await explain(word);
    },
    [language, explain],
  );

  useEffect(() => {
    return () => {
      const activeKey = activeKeyRef.current;
      if (!activeKey) return;

      const separatorIndex = activeKey.indexOf(':');
      if (separatorIndex < 0) return;

      explainCache.cancel(
        activeKey.slice(separatorIndex + 1),
        activeKey.slice(0, separatorIndex),
      );
      activeKeyRef.current = null;
    };
  }, []);

  return {
    explanation,
    isLoading,
    error,
    status,
    explain,
    retry,
    clear,
  };
}
