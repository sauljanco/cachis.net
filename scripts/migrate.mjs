import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';

nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw new Error('Falta DATABASE_URL en .env.local');
const sql=neon(process.env.DATABASE_URL);
await sql.query('CREATE SCHEMA IF NOT EXISTS cachis');
await sql.query('CREATE TABLE IF NOT EXISTS cachis.schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');

const directory=new URL('../db/migrations/',import.meta.url);
const files=(await readdir(directory)).filter(name=>/^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
for(const file of files){
  const migration=await readFile(new URL(file,directory),'utf8');
  const checksum=createHash('sha256').update(migration).digest('hex');
  const rows=await sql`SELECT checksum FROM cachis.schema_migrations WHERE version=${file}`;
  if(rows.length){
    if(rows[0].checksum!==checksum)throw new Error(`La migración ${file} cambió después de aplicarse.`);
    console.log('Ya aplicada:',file);continue;
  }
  // Los archivos de este proyecto contienen sentencias simples, sin ; dentro de cadenas.
  const statements=migration.replace(/^BEGIN;\s*/i,'').replace(/\s*COMMIT;\s*$/i,'').split(';').map(s=>s.trim()).filter(Boolean);
  await sql.transaction([...statements.map(statement=>sql.query(statement)),sql`INSERT INTO cachis.schema_migrations(version,checksum) VALUES (${file},${checksum})`]);
  console.log('Aplicada:',file);
}
const result=await sql`SELECT count(*)::int AS locations FROM cachis.locations`;
console.log('Ubicaciones verificadas:',result[0].locations);
