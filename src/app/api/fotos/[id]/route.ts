import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';
import { bucket, storage } from '@/lib/storage';
import { listingImageWidths } from '@/lib/listing-image';

export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request:NextRequest,{params}:Context){
  const {id}=await params;
  if(!uuid.test(id))return new NextResponse(null,{status:404});
  const rows=await database()`SELECT p.object_key,l.status,l.owner_id FROM cachis.listing_photos p JOIN cachis.listings l ON l.id=p.listing_id WHERE p.id=${id}`;
  if(!rows.length)return new NextResponse(null,{status:404});
  if(rows[0].status!=='published'){
    const user=await currentUser();
    if(!user||(user.id!==rows[0].owner_id&&!isAdmin(user.id)))return new NextResponse(null,{status:404});
  }
  const widthParam=request.nextUrl.searchParams.get('w');
  const width=widthParam !== null && /^\d{1,4}$/.test(widthParam) ? Number(widthParam) : null;
  if(widthParam !== null && (width === null || !listingImageWidths.some(size => size===width)))
    return new NextResponse(null,{status:400});
  const published=rows[0].status==='published';
  const etag=published ? `"${id}-${width ?? 'original'}"` : null;
  const headers={
    'Content-Type':'image/webp',
    // Cache only published photos at the CDN; private photos stay uncached.
    'Cache-Control':published ? 'public, max-age=0, s-maxage=600' : 'private, no-store',
    'X-Content-Type-Options':'nosniff',
    ...(etag ? {'ETag':etag} : {}),
  };
  if(etag && request.headers.get('if-none-match')===etag)
    return new NextResponse(null,{status:304,headers});
  try{
    const response=await storage().send(new GetObjectCommand({Bucket:bucket,Key:String(rows[0].object_key)}));
    if(!response.Body)return new NextResponse(null,{status:404});
    const bytes=Buffer.from(await response.Body.transformToByteArray());
    const image=width ? await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality:74}).toBuffer() : bytes;
    return new NextResponse(new Uint8Array(image),{headers});
  }catch{return new NextResponse(null,{status:503});}
}
