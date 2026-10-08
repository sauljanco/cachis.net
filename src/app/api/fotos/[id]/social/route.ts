import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { database } from '@/lib/db';
import { bucket, storage } from '@/lib/storage';

export const runtime = 'nodejs';
type Context = {params:Promise<{id:string}>};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request:Request,{params}:Context) {
  const {id}=await params;
  if (!uuid.test(id)) return new NextResponse(null,{status:404});

  const rows=await database()`SELECT p.object_key FROM cachis.listing_photos p
    JOIN cachis.listings l ON l.id=p.listing_id
    WHERE p.id=${id} AND l.status='published'`;
  if (!rows.length) return new NextResponse(null,{status:404});

  try {
    const response=await storage().send(new GetObjectCommand({Bucket:bucket,Key:String(rows[0].object_key)}));
    if (!response.Body) return new NextResponse(null,{status:404});
    const source=Buffer.from(await response.Body.transformToByteArray());
    const image=await sharp(source).resize(1200,630,{fit:'contain',background:'#f7f8f5'}).jpeg({quality:82}).toBuffer();
    return new NextResponse(new Uint8Array(image),{headers:{
      'Content-Type':'image/jpeg',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
    }});
  } catch {
    return new NextResponse(null,{status:503});
  }
}
