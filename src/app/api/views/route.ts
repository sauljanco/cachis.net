import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { recordListingView, recordSiteView } from '@/lib/view-counts';

const visitorCookie = 'cachis_visitor';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > 512) {
    return NextResponse.json({ error: 'Solicitud demasiado grande.' }, { status: 413 });
  }
  const input = await request.json().catch(() => null) as { kind?: unknown; id?: unknown } | null;
  if (!input || !['site', 'listing'].includes(String(input.kind))) {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }
  if (input.kind === 'listing' && (typeof input.id !== 'string' || !uuidPattern.test(input.id))) {
    return NextResponse.json({ error: 'Anuncio no válido.' }, { status: 400 });
  }

  const existing = request.cookies.get(visitorCookie)?.value;
  const visitorId = existing && uuidPattern.test(existing) ? existing : randomUUID();
  const views = input.kind === 'site'
    ? await recordSiteView(visitorId)
    : await recordListingView(visitorId, input.id as string);
  if (views === null) return NextResponse.json({ error: 'Anuncio no encontrado.' }, { status: 404 });

  const response = NextResponse.json({ views }, { headers: { 'Cache-Control': 'no-store' } });
  if (visitorId !== existing) response.cookies.set(visitorCookie, visitorId, {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax',
    path: '/', maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
