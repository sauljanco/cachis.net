import { NextRequest, NextResponse } from 'next/server';
import { authentication } from '@/lib/auth/server';
import { database } from '@/lib/db';

// Neon returns from Google with a one-time verifier. Its middleware exchanges
// that verifier for our first-party session cookie before rendering the page.
// Keep ordinary visits public; private pages enforce access in their own code.
const listingId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/anuncios/')) {
    const id = request.nextUrl.pathname.split('/')[2];
    if (!listingId.test(id)) {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }
    // Resolve publication state before the App Router starts streaming HTML,
    // so retired and missing announcements carry a real HTTP 404.
    const rows = await database()`SELECT 1 FROM cachis.listings WHERE id=${id}::uuid AND status='published'`;
    if (!rows.length) {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }
  }
  if (!request.nextUrl.searchParams.has('neon_auth_session_verifier')) {
    return NextResponse.next();
  }
  return authentication().middleware({ loginUrl: '/cuenta' })(request);
}

export const config = { matcher: ['/', '/publicar', '/mis-anuncios', '/anuncios/:id'] };
