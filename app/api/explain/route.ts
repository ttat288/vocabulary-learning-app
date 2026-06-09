import { NextRequest, NextResponse } from 'next/server';
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
};

type CachedExplanation = {
  explanation: string;
  createdAt: number;
};

const completedExplanations = new Map<string, CachedExplanation>();
const inFlightExplanations = new Map<string, Promise<string>>();

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

function getExplanationRequestKey(
  ip: string,
  {
    word,
    partOfSpeech,
    meaning,
    example,
    exampleMeaning,
    language = 'en',
  }: ExplainRequestBody,
) {
  return JSON.stringify([
    ip,
    safeTrim(language).toLowerCase() || 'en',
    safeTrim(word).toLowerCase(),
    safeTrim(partOfSpeech).toLowerCase(),
    safeTrim(meaning),
    safeTrim(example),
    safeTrim(exampleMeaning),
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

async function callOpenRouter(prompt: string) {
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
            max_tokens: 200,
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

        /**
         * Những lỗi này thường có thể do từng key:
         * - 401/403: key sai hoặc bị chặn
         * - 402: thiếu credit
         * - 429: rate limit
         *
         * 404 thường là model không tồn tại / unavailable,
         * thử key khác cũng không giải quyết được.
         */
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

      /**
       * Nếu là lỗi model 404/unavailable thì không cần thử key khác.
       */
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

    const {
      word,
      partOfSpeech,
      meaning,
      example,
      exampleMeaning,
      language = 'en',
    } = body;

    const safeWord = safeTrim(word);
    const safeLanguage = safeTrim(language).toLowerCase() || 'en';

    if (!safeWord) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const requestKey = getExplanationRequestKey(ip, {
      word,
      partOfSpeech,
      meaning,
      example,
      exampleMeaning,
      language: safeLanguage,
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

    const safePartOfSpeech = safeTrim(partOfSpeech) || 'unknown';
    const safeMeaning = safeTrim(meaning) || 'no definition provided';
    const safeExample = safeTrim(example) || 'no example provided';

    const isVietnamese = safeLanguage === 'vi';

    //     const prompt = isVietnamese
    //       ? `Giải thích từ "${safeWord}" cho học viên Tiếng Anh ở mức trung cấp. Sử dụng Tiếng Việt để giải thích rõ ràng.

    // Từ vựng: ${safeWord}
    // Từ loại: ${safePartOfSpeech}
    // Định nghĩa gốc: ${safeMeaning}
    // Ví dụ: "${safeExample}"

    // Hãy cung cấp một giải thích dễ hiểu trong 2-3 câu giúp người học hiểu:
    // 1. Ý nghĩa chính của từ này
    // 2. Cách sử dụng từ trong đời sống thực tế
    // 3. Một ví dụ khác, khác với ví dụ gốc

    // Không dùng thuật ngữ phức tạp. Trả lời bằng Tiếng Việt.`
    //       : `Explain the word "${safeWord}" to intermediate English learners in a simple and clear way.

    // Word: ${safeWord}
    // Part of speech: ${safePartOfSpeech}
    // Definition: ${safeMeaning}
    // Example: "${safeExample}"

    // Provide a clear explanation in 2-3 sentences that helps learners understand:
    // 1. What this word means
    // 2. How to use it in real situations
    // 3. Give another example different from the original example

    // Keep the language simple and accessible. Do not use complex terminology.`;
    const prompt = isVietnamese
      ? `Bạn là giáo viên Tiếng Anh cho học viên trình độ trung cấp.

Giải thích từ "${safeWord}" bằng Tiếng Việt.

Thông tin:
- Từ: ${safeWord}
- Từ loại: ${safePartOfSpeech}
- Định nghĩa gốc: ${safeMeaning}
- Ví dụ gốc: "${safeExample}"

Hãy trả lời đúng format sau:

Ý nghĩa: [giải thích ngắn gọn, tự nhiên]
Cách dùng: [nói từ này thường dùng trong tình huống nào]
Ví dụ mới: [một câu ví dụ tiếng Anh mới]
Nghĩa ví dụ: [dịch ví dụ mới sang Tiếng Việt]

Yêu cầu:
- Không dùng thuật ngữ phức tạp.
- Không lặp lại nguyên văn định nghĩa gốc.
- Ví dụ mới phải tự nhiên như người bản xứ dùng.`
      : `You are an English teacher for intermediate learners.

Explain the word "${safeWord}" in simple English.

Information:
- Word: ${safeWord}
- Part of speech: ${safePartOfSpeech}
- Original definition: ${safeMeaning}
- Original example: "${safeExample}"

Use exactly this format:

Meaning: [short and natural explanation]
Usage: [how people usually use this word in real life]
New example: [one new natural English example]
Example meaning: [explain the example in simple English]

Requirements:
- Do not use complex terminology.
- Do not simply repeat the original definition.
- The new example must sound natural.`;

    const explanationPromise = callOpenRouter(prompt)
      .then((explanation) => {
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
