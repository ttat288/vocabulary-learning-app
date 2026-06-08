import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, checkDuplicateRequest } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitCheck.resetIn,
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.resetIn.toString() }
        }
      );
    }

    const body = await request.json();
    const { word, meaning, example, exampleMeaning, language = 'en' } = body;

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Check for duplicate requests (anti-spam within 10 seconds)
    const duplicateCheck = checkDuplicateRequest(ip, word);
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          error: 'Please wait before requesting another explanation for this word.',
          waitTime: duplicateCheck.waitTime,
        },
        { status: 429 }
      );
    }

    // Build the prompt based on language
    const isVietnamese = language === 'vi';
    const prompt = isVietnamese
      ? `Giải thích từ "${word}" cho học viên Tiếng Anh ở mức trung cấp, sử dụng Tiếng Việt để dễ hiểu hơn.

Từ vựng: ${word}
Định nghĩa: ${meaning}
Ví dụ: ${example}
Giải thích ví dụ: ${exampleMeaning}

Hãy cung cấp một giải thích chi tiết hơn bằng Tiếng Việt (2-3 câu), giúp họ hiểu rõ từ này và cách dùng của nó trong thực tế. Tránh sử dụng các thuật ngữ quá phức tạp.`
      : `Explain the word "${word}" to intermediate English learners in a simple and clear way.

Word: ${word}
Definition: ${meaning}
Example: ${example}
Example explanation: ${exampleMeaning}

Provide a more detailed explanation (2-3 sentences) that helps them understand this word better and how to use it in real life. Keep the language simple and accessible.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[v0] OPENROUTER_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI explanation service is not available' },
        { status: 500 }
      );
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        'X-Title': 'VocabFlow - AI Explanation',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[v0] OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate explanation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content.trim();

    return NextResponse.json({
      explanation,
      word,
      remaining: rateLimitCheck.remaining,
    });
  } catch (error) {
    console.error('[v0] Error in explain API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
