import { NextRequest, NextResponse } from 'next/server';

// Store for rate limiting: IP -> array of timestamps
const requestMap = new Map<string, number[]>();

// Default rate limit: 5 requests per minute per IP
const DEFAULT_MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export function checkRateLimit(
  ip: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const requests = requestMap.get(ip) || [];
  const requestLimit = Math.max(1, Math.floor(maxRequests));

  // Remove requests older than the window
  const recentRequests = requests.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentRequests.length >= requestLimit) {
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
    remaining: requestLimit - recentRequests.length,
    resetIn: 0,
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
