import { NextRequest, NextResponse } from 'next/server';
import {
  buildExplainPrompt,
  getExplainActionInput,
  getExplainMaxTokens,
  normalizeExplainAction,
  type AiExplanation,
  type ExplainAction,
} from '@/lib/explain-actions';
import { getClientIp, checkRateLimit } from '@/lib/rate-limiter';

const OPENROUTER_KEY_NAMES = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_API_KEY_2',
  'OPENROUTER_API_KEY_3',
  'OPENROUTER_API_KEY_4',
  'OPENROUTER_API_KEY_5',
] as const;

let nextOpenRouterKeyIndex = 0;

const EXPLANATION_CACHE_TTL_MS = 2 * 60 * 1000;
const REQUESTS_PER_KEY_PER_MINUTE = 5;
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

type ExplainRequestBody = {
  word?: string | null;
  partOfSpeech?: string | null;
  meaning?: string | null;
  example?: string | null;
  exampleMeaning?: string | null;
  language?: string | null;
  action?: string | null;
  userSentence?: string | null;
  compareWord?: string | null;
};

type CachedExplanation = {
  explanation: AiExplanation;
  createdAt: number;
};

const completedExplanations = new Map<string, CachedExplanation>();
const inFlightExplanations = new Map<string, Promise<AiExplanation>>();

function safeTrim(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getConfiguredOpenRouterKeys() {
  return OPENROUTER_KEY_NAMES.flatMap((name) => {
    const value = process.env[name]?.trim();
    return value ? [{ name, value }] : [];
  });
}

function getNextOpenRouterKey() {
  const keys = getConfiguredOpenRouterKeys();
  if (keys.length === 0) return null;

  const key = keys[nextOpenRouterKeyIndex % keys.length];
  nextOpenRouterKeyIndex = (nextOpenRouterKeyIndex + 1) % keys.length;

  return key;
}

async function readJsonBody(request: NextRequest) {
  const rawBody = await request.text();
  if (!rawBody.trim()) return null;

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function getExplanationRequestKey(ip: string, body: ExplainRequestBody) {
  const action = normalizeExplainAction(body.action);
  const actionInput = getExplainActionInput(action, body);

  return JSON.stringify([
    ip,
    safeTrim(body.language).toLowerCase() || 'en',
    action,
    safeTrim(body.word).toLowerCase(),
    safeTrim(body.partOfSpeech).toLowerCase(),
    safeTrim(body.meaning),
    safeTrim(body.example),
    safeTrim(body.exampleMeaning),
    actionInput.userSentence,
    actionInput.compareWord.toLowerCase(),
  ]);
}

function getCachedExplanation(key: string) {
  const cached = completedExplanations.get(key);
  if (!cached) return null;

  if (Date.now() - cached.createdAt > EXPLANATION_CACHE_TTL_MS) {
    completedExplanations.delete(key);
    return null;
  }

  return cached.explanation;
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start < 0 || end <= start) return null;

  return candidate.slice(start, end + 1);
}

function parseAiExplanation(
  content: string,
  action: ExplainAction,
): AiExplanation {
  const jsonText = extractJsonObject(content);

  if (!jsonText) {
    return { type: 'raw', text: content };
  }

  try {
    const parsed = JSON.parse(jsonText);

    if (parsed && typeof parsed === 'object' && parsed.type === action) {
      return parsed as AiExplanation;
    }
  } catch {
    // Fall through to raw fallback.
  }

  return { type: 'raw', text: content };
}

async function callOpenRouter(prompt: string, action: ExplainAction) {
  const allKeys = getConfiguredOpenRouterKeys();

  if (allKeys.length === 0) {
    console.error('[v0] No OPENROUTER_API_KEY values are configured');
    throw new Error('AI explanation service is not available');
  }

  let lastError: any = null;

  for (let attempt = 0; attempt < allKeys.length; attempt++) {
    const apiKey = getNextOpenRouterKey();
    if (!apiKey) continue;

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.value}`,
            'HTTP-Referer': process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : 'http://localhost:3000',
            'X-Title': 'VocabFlow - AI Explanation',
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: getExplainMaxTokens(action),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.error?.message || `API Error ${response.status}`;

        lastError = {
          keyName: apiKey.name,
          status: response.status,
          message: errorMessage,
        };

        console.warn(
          '[v0] OpenRouter API error with key',
          apiKey.name,
          ':',
          lastError,
        );

        if ([401, 402, 403, 429].includes(response.status)) {
          continue;
        }

        throw new Error(errorMessage);
      }

      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== 'string' || !content.trim()) {
        lastError = {
          keyName: apiKey.name,
          status: response.status,
          message: 'OpenRouter returned empty explanation content',
          data,
        };

        console.warn(
          '[v0] OpenRouter returned empty content with key',
          apiKey.name,
          ':',
          lastError,
        );

        continue;
      }

      return content.trim();
    } catch (err: any) {
      lastError = err;

      console.error('[v0] OpenRouter error with key', apiKey.name, ':', err);

      const errorMessage = err?.message?.toLowerCase?.() || '';

      if (
        errorMessage.includes('model') &&
        (errorMessage.includes('unavailable') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('does not exist'))
      ) {
        break;
      }

      continue;
    }
  }

  const finalMessage =
    lastError?.message ||
    'Failed to generate explanation after trying all API keys';

  console.error('[v0] All OpenRouter API keys failed:', lastError);

  throw new Error(finalMessage);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = (await readJsonBody(request)) as ExplainRequestBody | null;

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 },
      );
    }

    const safeWord = safeTrim(body.word);
    const safeLanguage = safeTrim(body.language).toLowerCase() || 'en';
    const safeAction = normalizeExplainAction(body.action);
    const actionInput = getExplainActionInput(safeAction, body);

    if (!safeWord) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    if (safeAction === 'check_sentence' && !actionInput.userSentence) {
      return NextResponse.json(
        { error: 'Sentence is required for this AI action' },
        { status: 400 },
      );
    }

    if (safeAction === 'compare' && !actionInput.compareWord) {
      return NextResponse.json(
        { error: 'Comparison word is required for this AI action' },
        { status: 400 },
      );
    }

    const requestKey = getExplanationRequestKey(ip, {
      ...body,
      language: safeLanguage,
      action: safeAction,
      ...actionInput,
    });

    const cachedExplanation = getCachedExplanation(requestKey);

    if (cachedExplanation) {
      return NextResponse.json({
        explanation: cachedExplanation,
        word: safeWord,
        remaining: null,
        cached: true,
      });
    }

    const inFlightExplanation = inFlightExplanations.get(requestKey);

    if (inFlightExplanation) {
      const explanation = await inFlightExplanation;

      return NextResponse.json({
        explanation,
        word: safeWord,
        remaining: null,
        cached: true,
      });
    }

    const configuredKeys = getConfiguredOpenRouterKeys();

    const maxRequestsPerMinute = Math.max(
      1,
      configuredKeys.length * REQUESTS_PER_KEY_PER_MINUTE,
    );

    const rateLimitCheck = checkRateLimit(ip, maxRequestsPerMinute);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitCheck.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.resetIn.toString(),
          },
        },
      );
    }

    const prompt = buildExplainPrompt({
      action: safeAction,
      word: safeWord,
      partOfSpeech: safeTrim(body.partOfSpeech) || 'unknown',
      meaning: safeTrim(body.meaning) || 'no definition provided',
      example: safeTrim(body.example) || 'no example provided',
      language: safeLanguage,
      ...actionInput,
    });

    const explanationPromise = callOpenRouter(prompt, safeAction)
      .then((content) => {
        const explanation = parseAiExplanation(content, safeAction);
        completedExplanations.set(requestKey, {
          explanation,
          createdAt: Date.now(),
        });

        return explanation;
      })
      .finally(() => {
        inFlightExplanations.delete(requestKey);
      });

    inFlightExplanations.set(requestKey, explanationPromise);

    const explanation = await explanationPromise;

    return NextResponse.json({
      explanation,
      word: safeWord,
      remaining: rateLimitCheck.remaining,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[v0] Error in explain API:', error.message);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error('[v0] Error in explain API:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
