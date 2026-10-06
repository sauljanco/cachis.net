import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

export const bucket='anuncios';
export function storage(){
  const {NEON_STORAGE_REGION,NEON_STORAGE_ENDPOINT,NEON_STORAGE_ACCESS_KEY_ID,NEON_STORAGE_SECRET_ACCESS_KEY}=process.env;
  if(!NEON_STORAGE_REGION||!NEON_STORAGE_ENDPOINT||!NEON_STORAGE_ACCESS_KEY_ID||!NEON_STORAGE_SECRET_ACCESS_KEY) throw new Error('Falta configurar Neon Object Storage.');
  return new S3Client({region:NEON_STORAGE_REGION,endpoint:NEON_STORAGE_ENDPOINT,credentials:{accessKeyId:NEON_STORAGE_ACCESS_KEY_ID,secretAccessKey:NEON_STORAGE_SECRET_ACCESS_KEY},forcePathStyle:true,requestChecksumCalculation:'WHEN_REQUIRED'});
}
