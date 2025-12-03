// Rate Limiting using Upstash Redis
// Protects API routes from abuse

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash Redis is properly configured (URL must start with https://)
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://') &&
  process.env.UPSTASH_REDIS_REST_TOKEN

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// ==========================
// RATE LIMIT CONFIGURATIONS
// ==========================

/**
 * API Rate Limit: General API endpoints
 * 100 requests per minute per IP
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null

/**
 * Authentication Rate Limit: Login/register endpoints
 * 5 attempts per 15 minutes per IP (prevent brute force)
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null

/**
 * Upload Rate Limit: Image upload endpoint
 * 20 uploads per hour per user (prevent abuse)
 */
export const uploadRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  : null

/**
 * Email Rate Limit: Email sending
 * 50 emails per day per user (prevent spam)
 */
export const emailRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '24 h'),
      analytics: true,
      prefix: 'ratelimit:email',
    })
  : null

/**
 * Inquiry Rate Limit: Property inquiries
 * 10 inquiries per hour per user (prevent spam)
 */
export const inquiryRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:inquiry',
    })
  : null

// ==========================
// HELPER FUNCTIONS
// ==========================

/**
 * Gets IP address from request
 * @param request - Next.js request object
 * @returns IP address
 */
export function getIP(request: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Gets user ID from request (if authenticated)
 * @param request - Next.js request object
 * @returns User ID or IP address
 */
export async function getIdentifier(request: Request): Promise<string> {
  // Try to get user ID from auth (implement based on your auth system)
  // For now, use IP as fallback
  return getIP(request)
}

/**
 * Checks rate limit and returns result
 * @param ratelimit - Ratelimit instance
 * @param identifier - User identifier (IP or user ID)
 * @returns Rate limit result
 */
export async function checkRateLimit(
  ratelimit: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
}> {
  if (!ratelimit) {
    // Rate limiting not configured, allow request
    console.warn('Rate limiting not configured. Set UPSTASH_REDIS_REST_URL to enable.')
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: 0,
      pending: Promise.resolve(),
    }
  }

  const { success, limit, remaining, reset, pending } =
    await ratelimit.limit(identifier)

  return { success, limit, remaining, reset, pending }
}

/**
 * Creates rate limit headers for response
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Middleware helper to check rate limit
 * @param request - Next.js request
 * @param ratelimit - Ratelimit instance
 * @param useUserId - Whether to use user ID instead of IP
 * @returns Response if rate limited, null if allowed
 */
export async function withRateLimit(
  request: Request,
  ratelimit: Ratelimit | null,
  useUserId: boolean = false
): Promise<Response | null> {
  const identifier = useUserId
    ? await getIdentifier(request)
    : getIP(request)

  const result = await checkRateLimit(ratelimit, identifier)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(result),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // Request is allowed, continue
  return null
}

/**
 * Example usage in API route:
 *
 * ```typescript
 * import { withRateLimit, apiRateLimit } from '@/lib/security/rate-limit'
 *
 * export async function POST(request: Request) {
 *   // Check rate limit
 *   const rateLimitResponse = await withRateLimit(request, apiRateLimit)
 *   if (rateLimitResponse) return rateLimitResponse
 *
 *   // Continue with your API logic...
 * }
 * ```
 */
