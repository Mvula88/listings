import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// CORS configuration
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || []

  // Get the app URL for same-origin requests
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Check if origin is allowed (same-origin or in allowed list)
  const isAllowed = !origin ||
    origin === appUrl ||
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes('*')

  if (!isAllowed) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin || appUrl,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

// Handle preflight requests
function handlePreflight(request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request)

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight requests for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    return handlePreflight(request)
  }

  // Get the session response from Supabase
  const response = await updateSession(request)

  // Add CORS headers to API responses
  if (pathname.startsWith('/api')) {
    const corsHeaders = getCorsHeaders(request)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
