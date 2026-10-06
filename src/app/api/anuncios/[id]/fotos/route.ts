import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth/server';
import { database } from '@/lib/db';
import { bucket, storage } from '@/lib/storage';

export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request:NextRequest,{params}:Context){
  const {id}=await params;
  if(!uuid.test(id))return NextResponse.json({error:'Anuncio inválido.'},{status:400});
  const host=request.headers.get('x-forwarded-host')??request.headers.get('host');
  const protocol=request.headers.get('x-forwarded-proto')??request.nextUrl.protocol.replace(':','');
  if(!host||request.headers.get('origin')!==`${protocol}://${host}`)return NextResponse.json({error:'Origen inválido.'},{status:403});
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Inicia sesión.'},{status:401});
  const sql=database();
  const owned=await sql`SELECT id FROM cachis.listings WHERE id=${id} AND owner_id=${user.id} AND status IN ('pending','paused')`;
  if(!owned.length)return NextResponse.json({error:'Este anuncio no admite más fotos.'},{status:403});
  const length=Number(request.headers.get('content-length'));
  if(!Number.isSafeInteger(length)||length<1)return NextResponse.json({error:'Falta indicar el tamaño de la foto.'},{status:411});
  if(length>4.25*1024*1024)return NextResponse.json({error:'La foto supera 4 MB.'},{status:413});
  const form=await request.formData();
  const file=form.get('photo');
  if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size===0||file.size>4*1024*1024)return NextResponse.json({error:'Usa una foto JPG, PNG o WebP de hasta 4 MB.'},{status:400});
  let image:Buffer;
  try{
    const input=Buffer.from(await file.arrayBuffer());
    const meta=await sharp(input,{limitInputPixels:20_000_000}).metadata();
    if(!meta.width||!meta.height||!['jpeg','png','webp'].includes(meta.format||''))throw new Error('Formato inválido');
    image=await sharp(input,{limitInputPixels:20_000_000}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();
  }catch{return NextResponse.json({error:'No pudimos procesar esa foto.'},{status:400});}
  const existing=await sql`SELECT position FROM cachis.listing_photos WHERE listing_id=${id} ORDER BY position`;
  if(existing.length>=5)return NextResponse.json({error:'Máximo 5 fotos por anuncio.'},{status:409});
  const position=Array.from({length:5},(_,i)=>i).find(i=>!existing.some(x=>Number(x.position)===i));
  if(position===undefined)return NextResponse.json({error:'Máximo 5 fotos por anuncio.'},{status:409});
  const key=`listings/${id}/${randomUUID()}.webp`;
  const client=storage();
  await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:image,ContentType:'image/webp'}));
  try{
    const rows=await sql`INSERT INTO cachis.listing_photos(listing_id,object_key,position)
      SELECT ${id},${key},${position} WHERE EXISTS (SELECT 1 FROM cachis.listings WHERE id=${id} AND owner_id=${user.id} AND status IN ('pending','paused')) RETURNING id`;
    if(!rows.length)throw new Error('El anuncio cambió de estado.');
    return NextResponse.json({id:rows[0].id},{status:201});
  }catch{
    await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key})).catch(()=>{});
    return NextResponse.json({error:'No pudimos guardar la foto. Intenta de nuevo.'},{status:409});
  }
}
