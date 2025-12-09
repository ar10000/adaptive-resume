import { NextRequest } from "next/server";

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Simple rate limiting middleware
 * @param request - Next.js request object
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // Get client identifier (IP address or user ID)
  const identifier =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries
  if (record && record.resetTime < now) {
    rateLimitMap.delete(identifier);
  }

  const currentRecord = rateLimitMap.get(identifier);

  if (!currentRecord) {
    // First request
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (currentRecord.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  // Increment count
  currentRecord.count++;
  rateLimitMap.set(identifier, currentRecord);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

/**
 * Middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const rateLimit = checkRateLimit(request);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to response
    response.headers.set(
      "X-RateLimit-Limit",
      RATE_LIMIT_MAX_REQUESTS.toString()
    );
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimit.remaining.toString()
    );
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString());

    return response;
  };
}

