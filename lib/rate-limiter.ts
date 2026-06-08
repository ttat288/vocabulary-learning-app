import { NextRequest, NextResponse } from 'next/server';

// Store for rate limiting: IP -> array of timestamps
const requestMap = new Map<string, number[]>();

// Rate limit: 5 requests per minute per IP
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

// Minimum time between duplicate requests (anti-spam)
const DUPLICATE_REQUEST_TIMEOUT = 10 * 1000; // 10 seconds
const duplicateRequestCache = new Map<string, { word: string; timestamp: number }>();

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const requests = requestMap.get(ip) || [];

  // Remove requests older than the window
  const recentRequests = requests.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    const oldestRequest = recentRequests[0];
    const resetIn = WINDOW_MS - (now - oldestRequest);

    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(resetIn / 1000), // Return seconds
    };
  }

  // Store the current request
  recentRequests.push(now);
  requestMap.set(ip, recentRequests);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - recentRequests.length,
    resetIn: 0,
  };
}

export function checkDuplicateRequest(ip: string, word: string): { isDuplicate: boolean; waitTime: number } {
  const now = Date.now();
  const cacheKey = `${ip}-${word.toLowerCase()}`;
  const cached = duplicateRequestCache.get(cacheKey);

  if (cached && now - cached.timestamp < DUPLICATE_REQUEST_TIMEOUT) {
    const waitTime = DUPLICATE_REQUEST_TIMEOUT - (now - cached.timestamp);
    return {
      isDuplicate: true,
      waitTime: Math.ceil(waitTime / 1000),
    };
  }

  // Update cache
  duplicateRequestCache.set(cacheKey, { word, timestamp: now });

  return {
    isDuplicate: false,
    waitTime: 0,
  };
}

export function rateLimitResponse(ip: string, message: string = 'Too many requests'): NextResponse {
  const limit = checkRateLimit(ip);
  return NextResponse.json(
    {
      error: message,
      retryAfter: limit.resetIn,
    },
    { status: 429, headers: { 'Retry-After': limit.resetIn.toString() } }
  );
}
