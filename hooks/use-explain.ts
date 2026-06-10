import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/language-context';
import {
  DEFAULT_EXPLAIN_ACTION,
  type AiExplanation,
  type ExplainAction,
  type ExplainRequestOptions,
} from '@/lib/explain-actions';
import { Word } from '@/lib/types';
import { ExplainStatus, explainCache } from '@/lib/explain-cache';

export interface ExplainResponse {
  explanation: AiExplanation;
  word: string;
  remaining: number;
}

export function useExplain() {
  const [explanation, setExplanation] = useState<AiExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ExplainStatus>('idle');
  const [action, setAction] = useState<ExplainAction>(DEFAULT_EXPLAIN_ACTION);
  const activeKeyRef = useRef<string | null>(null);
  const { language } = useLanguage();

  const explain = useCallback(
    async (word: Word, options: ExplainRequestOptions = {}) => {
      const requestOptions = {
        ...options,
        action: options.action ?? DEFAULT_EXPLAIN_ACTION,
      };
      const requestKey = explainCache.getKey(word.id, language, requestOptions);
      activeKeyRef.current = requestKey;
      setAction(requestOptions.action);
      setIsLoading(true);
      setStatus('loading');
      setError(null);
      setExplanation(null);

      const cached = explainCache.get(word.id, language, requestOptions);
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
          requestOptions,
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
    if (activeKeyRef.current) {
      explainCache.cancelKey(activeKeyRef.current);
    }
    activeKeyRef.current = null;
    setExplanation(null);
    setError(null);
    setIsLoading(false);
    setStatus('idle');
    setAction(DEFAULT_EXPLAIN_ACTION);
  }, []);

  const retry = useCallback(
    async (word: Word, options: ExplainRequestOptions = {}) => {
      const requestOptions = {
        ...options,
        action: options.action ?? action,
      };
      // Clear cache to force regeneration
      explainCache.clearEntry(word.id, language, requestOptions);
      // Now fetch fresh explanation
      await explain(word, requestOptions);
    },
    [action, language, explain],
  );

  useEffect(() => {
    return () => {
      const activeKey = activeKeyRef.current;
      if (!activeKey) return;

      explainCache.cancelKey(activeKey);
      activeKeyRef.current = null;
    };
  }, []);

  return {
    explanation,
    isLoading,
    error,
    status,
    action,
    explain,
    retry,
    clear,
  };
}
