import { Word } from './types';
import {
  buildExplainRequestBody,
  DEFAULT_EXPLAIN_ACTION,
  getExplainCacheKey,
  normalizeExplainAction,
  parseExplainCacheKey,
  type AiExplanation,
  type ExplainRequestOptions,
} from './explain-actions';

export type ExplainStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'aborted';
type RequestPriority = 'foreground' | 'background';

export type CacheEntry = {
  status: ExplainStatus;
  explanation: AiExplanation | null;
  error: string | null;
  loading: boolean;
  retryAfter: number | null;
  updatedAt: number;
  priority?: RequestPriority;
  controller?: AbortController | null;
  promise?: Promise<AiExplanation> | null;
};

type PrefetchItem = {
  word: Word;
  language: string;
};

type ExplainError = Error & {
  retryAfter?: number;
};

const cache = new Map<string, CacheEntry>();
const prefetchQueue = new Map<string, PrefetchItem>();
let prefetchTimer: ReturnType<typeof setTimeout> | null = null;
let prefetchRunning = false;
let backgroundPausedUntil = 0;

// Server limit is 5/minute. Keep background work slower so current-word requests stay responsive.
const PREFETCH_INTERVAL_MS = 15_000;

function getLanguageFromKey(key: string) {
  return parseExplainCacheKey(key).language;
}

function getWordIdFromKey(key: string) {
  return parseExplainCacheKey(key).wordId;
}

async function fetchExplainForWord(
  word: Word,
  signal?: AbortSignal,
  language: string = 'en',
  options: ExplainRequestOptions = {},
) {
  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildExplainRequestBody(word, language, options)),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed' }));
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter =
      typeof err.retryAfter === 'number'
        ? err.retryAfter
        : retryAfterHeader
          ? Number(retryAfterHeader)
          : null;
    const error = new Error(
      err.error || 'Failed to generate explanation',
    ) as ExplainError;

    if (response.status === 429 && retryAfter && Number.isFinite(retryAfter)) {
      error.retryAfter = retryAfter;
    }

    throw error;
  }

  const data = await response.json();
  return data.explanation as AiExplanation;
}

function makeIdleEntry(): CacheEntry {
  return {
    status: 'idle',
    explanation: null,
    error: null,
    loading: false,
    retryAfter: null,
    updatedAt: Date.now(),
    controller: null,
    promise: null,
  };
}

function pauseBackgroundQueue(retryAfterSeconds: number) {
  const delay = Math.max(retryAfterSeconds * 1000, PREFETCH_INTERVAL_MS);
  backgroundPausedUntil = Math.max(backgroundPausedUntil, Date.now() + delay);
}

function cancelBackgroundRequests() {
  for (const [key, entry] of cache.entries()) {
    if (entry.priority === 'background' && entry.loading && entry.controller) {
      entry.controller.abort();
      cache.set(key, {
        ...entry,
        status: 'aborted',
        loading: false,
        controller: null,
        promise: null,
        updatedAt: Date.now(),
      });
    }
  }
}

export const explainCache = {
  getKey: getExplainCacheKey,

  get(
    wordId: string,
    language: string = 'en',
    options: ExplainRequestOptions = {},
  ) {
    return cache.get(getExplainCacheKey(wordId, language, options)) ?? null;
  },

  async fetch(
    word: Word,
    language: string = 'en',
    priority: RequestPriority = 'foreground',
    options: ExplainRequestOptions = {},
  ) {
    const action = normalizeExplainAction(options.action);
    const key = getExplainCacheKey(word.id, language, {
      ...options,
      action,
    });
    const existing = cache.get(key);

    if (existing?.explanation) return existing.explanation;
    if (existing?.loading && existing.promise) return existing.promise;

    if (priority === 'foreground') {
      cancelBackgroundRequests();
      if (prefetchTimer) {
        clearTimeout(prefetchTimer);
        prefetchTimer = null;
      }
    }

    const controller = new AbortController();
    const promise = fetchExplainForWord(word, controller.signal, language, {
      ...options,
      action,
    });

    cache.set(key, {
      status: 'loading',
      explanation: null,
      error: null,
      loading: true,
      retryAfter: null,
      updatedAt: Date.now(),
      priority,
      controller,
      promise,
    });

    try {
      const explanation = await promise;
      const entry = cache.get(key) || makeIdleEntry();
      cache.set(key, {
        ...entry,
        status: 'success',
        explanation,
        error: null,
        loading: false,
        retryAfter: null,
        priority,
        controller: null,
        promise: null,
        updatedAt: Date.now(),
      });
      return explanation;
    } catch (err: any) {
      const entry = cache.get(key) || makeIdleEntry();
      const isAbort = err?.name === 'AbortError';
      const retryAfter =
        typeof err?.retryAfter === 'number' && Number.isFinite(err.retryAfter)
          ? err.retryAfter
          : null;

      if (retryAfter) pauseBackgroundQueue(retryAfter);

      cache.set(key, {
        ...entry,
        status: isAbort ? 'aborted' : 'error',
        explanation: null,
        error: isAbort
          ? null
          : err?.message || 'Failed to generate explanation',
        loading: false,
        retryAfter,
        priority,
        controller: null,
        promise: null,
        updatedAt: Date.now(),
      });
      throw err;
    } finally {
      if (priority === 'foreground') {
        schedulePrefetch(PREFETCH_INTERVAL_MS);
      }
    }
  },

  prefetch(words: Word[], language: string = 'en') {
    for (const word of words) {
      const key = getExplainCacheKey(word.id, language, {
        action: DEFAULT_EXPLAIN_ACTION,
      });
      const entry = cache.get(key);
      if (!entry || entry.status === 'idle' || entry.status === 'aborted') {
        prefetchQueue.set(key, { word, language });
      }
    }
    schedulePrefetch();
  },

  cancel(
    wordId: string,
    language: string = 'en',
    options: ExplainRequestOptions = {},
  ) {
    const key = getExplainCacheKey(wordId, language, options);
    const entry = cache.get(key);
    if (!entry?.controller) return;

    entry.controller.abort();
    cache.set(key, {
      ...entry,
      status: 'aborted',
      loading: false,
      controller: null,
      promise: null,
      updatedAt: Date.now(),
    });
  },

  cancelKey(key: string) {
    const entry = cache.get(key);
    if (!entry?.controller) return;

    entry.controller.abort();
    cache.set(key, {
      ...entry,
      status: 'aborted',
      loading: false,
      controller: null,
      promise: null,
      updatedAt: Date.now(),
    });
  },

  clearEntry(
    wordId: string,
    language: string = 'en',
    options: ExplainRequestOptions = {},
  ) {
    const key = getExplainCacheKey(wordId, language, options);
    const entry = cache.get(key);
    if (entry?.controller) {
      entry.controller.abort();
    }
    cache.delete(key);
  },

  cancelExcept(allowedWordIds: Set<string>, language?: string) {
    for (const [key, entry] of cache.entries()) {
      const wordId = getWordIdFromKey(key);
      const entryLanguage = getLanguageFromKey(key);
      const allowed =
        allowedWordIds.has(wordId) && (!language || entryLanguage === language);

      if (!allowed && entry.controller) {
        entry.controller.abort();
        cache.set(key, {
          ...entry,
          status: 'aborted',
          loading: false,
          controller: null,
          promise: null,
          updatedAt: Date.now(),
        });
      }
    }

    for (const [key, item] of prefetchQueue.entries()) {
      const allowed =
        allowedWordIds.has(item.word.id) &&
        (!language || item.language === language);
      if (!allowed) prefetchQueue.delete(key);
    }
  },

  clear() {
    for (const entry of cache.values()) {
      entry.controller?.abort();
    }
    cache.clear();
    prefetchQueue.clear();
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
      prefetchTimer = null;
    }
    prefetchRunning = false;
    backgroundPausedUntil = 0;
  },
};

function schedulePrefetch(delay = 0) {
  if (prefetchTimer || prefetchRunning || prefetchQueue.size === 0) return;

  const cooldownDelay = Math.max(0, backgroundPausedUntil - Date.now());
  const nextDelay = Math.max(delay, cooldownDelay);

  prefetchTimer = setTimeout(() => {
    prefetchTimer = null;
    void runNextPrefetch();
  }, nextDelay);
}

async function runNextPrefetch() {
  const next = prefetchQueue.entries().next();
  if (next.done) return;

  const [key, item] = next.value;
  prefetchQueue.delete(key);

  const entry = cache.get(key);
  if (entry?.explanation || entry?.loading || entry?.status === 'error') {
    schedulePrefetch(PREFETCH_INTERVAL_MS);
    return;
  }

  prefetchRunning = true;
  try {
    await explainCache.fetch(item.word, item.language, 'background');
  } catch {
    // Background failures are cached and should not interrupt study flow.
  } finally {
    prefetchRunning = false;
    schedulePrefetch(PREFETCH_INTERVAL_MS);
  }
}
