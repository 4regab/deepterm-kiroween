import { createServerSupabaseClient } from '@/config/supabase/server'
import { NextResponse } from 'next/server'

// SECURITY: Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECT_PATTERNS = [
  /^\/dashboard$/,
  /^\/materials(\/[a-zA-Z0-9-]+)?$/,
  /^\/share\/[a-zA-Z0-9-]+$/,
  /^\/account$/,
  /^\/achievements$/,
  /^\/pomodoro$/,
  /^\/practice$/,
]

/**
 * Validates that a redirect path is safe (internal only)
 * Prevents open redirect vulnerabilities (CWE-601)
 */
function isValidRedirectPath(path: string): boolean {
  // Must start with single forward slash (not // or protocol)
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false
  }
  
  // Must not contain protocol indicators
  if (path.includes(':') || path.includes('\\')) {
    return false
  }
  
  // Must match one of our allowed patterns
  return ALLOWED_REDIRECT_PATTERNS.some(pattern => pattern.test(path))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnTo = requestUrl.searchParams.get('returnTo')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  let redirectPath = '/dashboard'
  
  if (returnTo) {
    try {
      const decoded = decodeURIComponent(returnTo)
      if (isValidRedirectPath(decoded)) {
        redirectPath = decoded
      } else {
        console.warn('Auth callback: Invalid returnTo path rejected:', returnTo)
      }
    } catch {
      // Invalid URL encoding - use default
      console.warn('Auth callback: Failed to decode returnTo:', returnTo)
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`)
}
