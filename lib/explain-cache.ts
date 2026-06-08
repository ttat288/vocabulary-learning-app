import { Word } from './types';

type CacheEntry = {
  explanation: string | null;
  error: string | null;
  loading: boolean;
  controller?: AbortController | null;
  promise?: Promise<string> | null;
};

const cache = new Map<string, CacheEntry>();
const prefetchQueue = new Map<string, { word: Word; language: string }>();
let prefetchTimer: ReturnType<typeof setTimeout> | null = null;
let prefetchRunning = false;

// Server limit is 5/minute. Keep background prefetch slower so manual clicks still have room.
const PREFETCH_INTERVAL_MS = 15_000;

async function fetchExplainForWord(
  word: Word,
  signal?: AbortSignal,
  language: string = 'en',
) {
  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word: word.word,
      meaning: word.meaning,
      example: word.example,
      exampleMeaning: word.exampleMeaning,
      language,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed' }));
    throw new Error(err.error || 'Failed to generate explanation');
  }

  const data = await response.json();
  return data.explanation as string;
}

export const explainCache = {
  get(wordId: string) {
    return cache.get(wordId) ?? null;
  },

  async fetch(word: Word, language: string = 'en') {
    const existing = cache.get(word.id);
    if (existing) {
      if (existing.explanation) return existing.explanation;
      if (existing.loading && existing.promise) return existing.promise;
    }

    const controller = new AbortController();
    const promise = fetchExplainForWord(word, controller.signal, language);

    cache.set(word.id, {
      explanation: null,
      error: null,
      loading: true,
      controller,
      promise,
    });

    try {
      const explanation = await promise;
      const entry = cache.get(word.id) || {
        explanation: null,
        error: null,
        loading: false,
      };
      entry.explanation = explanation;
      entry.loading = false;
      entry.error = null;
      entry.controller = null;
      entry.promise = null;
      cache.set(word.id, entry);
      return explanation;
    } catch (err: any) {
      const entry = cache.get(word.id) || {
        explanation: null,
        error: null,
        loading: false,
      };
      if (err.name === 'AbortError') {
        entry.error = 'aborted';
      } else {
        entry.error = err?.message || 'Failed to generate explanation';
      }
      entry.loading = false;
      entry.controller = null;
      entry.promise = null;
      cache.set(word.id, entry);
      throw err;
    }
  },

  prefetch(words: Word[], language: string = 'en') {
    for (const w of words) {
      const e = cache.get(w.id);
      if (!e) {
        prefetchQueue.set(w.id, { word: w, language });
      }
    }
    schedulePrefetch();
  },

  cancel(wordId: string) {
    const e = cache.get(wordId);
    if (e && e.controller) {
      e.controller.abort();
      e.controller = null;
      cache.set(wordId, e);
    }
  },

  cancelExcept(allowed: Set<string>) {
    for (const [id, e] of cache.entries()) {
      if (!allowed.has(id) && e.controller) {
        e.controller.abort();
        e.controller = null;
        cache.set(id, e);
      }
    }

    for (const id of prefetchQueue.keys()) {
      if (!allowed.has(id)) {
        prefetchQueue.delete(id);
      }
    }
  },

  clear() {
    for (const e of cache.values()) {
      e.controller?.abort();
    }
    cache.clear();
    prefetchQueue.clear();
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
      prefetchTimer = null;
    }
    prefetchRunning = false;
  },
};

function schedulePrefetch(delay = 0) {
  if (prefetchTimer || prefetchRunning || prefetchQueue.size === 0) return;

  prefetchTimer = setTimeout(() => {
    prefetchTimer = null;
    void runNextPrefetch();
  }, delay);
}

async function runNextPrefetch() {
  const next = prefetchQueue.entries().next();
  if (next.done) return;

  const [wordId, item] = next.value;
  prefetchQueue.delete(wordId);

  const existing = cache.get(wordId);
  if (existing?.explanation || existing?.loading) {
    schedulePrefetch(PREFETCH_INTERVAL_MS);
    return;
  }

  prefetchRunning = true;
  try {
    await explainCache.fetch(item.word, item.language);
  } catch {
    // Prefetch errors are stored in cache and should not interrupt study flow.
  } finally {
    prefetchRunning = false;
    schedulePrefetch(PREFETCH_INTERVAL_MS);
  }
}
