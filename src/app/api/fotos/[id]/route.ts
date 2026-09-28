import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';
import { bucket, storage } from '@/lib/storage';

export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(_request:NextRequest,{params}:Context){
  const {id}=await params;
  if(!uuid.test(id))return new NextResponse(null,{status:404});
  const rows=await database()`SELECT p.object_key,l.status,l.owner_id FROM cachis.listing_photos p JOIN cachis.listings l ON l.id=p.listing_id WHERE p.id=${id}`;
  if(!rows.length)return new NextResponse(null,{status:404});
  if(rows[0].status!=='published'){
    const user=await currentUser();
    if(!user||(user.id!==rows[0].owner_id&&!isAdmin(user.id)))return new NextResponse(null,{status:404});
  }
  try{
    const response=await storage().send(new GetObjectCommand({Bucket:bucket,Key:String(rows[0].object_key)}));
    if(!response.Body)return new NextResponse(null,{status:404});
    const bytes=await response.Body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes),{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return new NextResponse(null,{status:503});}
}
