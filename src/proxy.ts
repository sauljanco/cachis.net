import { NextRequest, NextResponse } from 'next/server';
import { authentication } from '@/lib/auth/server';

// Neon returns from Google with a one-time verifier. Its middleware exchanges
// that verifier for our first-party session cookie before rendering the page.
// Keep ordinary visits public; private pages enforce access in their own code.
export function proxy(request: NextRequest) {
  if (!request.nextUrl.searchParams.has('neon_auth_session_verifier')) {
    return NextResponse.next();
  }
  return authentication().middleware({ loginUrl: '/cuenta' })(request);
}

export const config = { matcher: ['/', '/publicar', '/mis-anuncios'] };
