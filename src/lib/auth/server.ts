import 'server-only';
import { createNeonAuth } from '@neondatabase/auth/next/server';

export function authentication() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) throw new Error('Falta configurar el acceso de usuarios.');
  return createNeonAuth({ baseUrl, cookies: { secret } });
}

export async function currentUser() {
  try {
    const { data, error } = await authentication().getSession();
    if (error) return null;
    return data?.user ?? null;
  } catch {
    // A temporary auth outage must not take public listings offline. Private pages
    // still require a verified session and therefore remain inaccessible.
    return null;
  }
}

export function isAdmin(id: string) {
  return (process.env.ADMIN_USER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean).includes(id);
}
