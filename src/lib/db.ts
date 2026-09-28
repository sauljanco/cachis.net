import 'server-only';
import { neon } from '@neondatabase/serverless';

export function database() {
  if (!process.env.DATABASE_URL) throw new Error('La base de datos no está configurada.');
  return neon(process.env.DATABASE_URL);
}
