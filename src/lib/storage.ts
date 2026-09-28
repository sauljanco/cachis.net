import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

export const bucket='anuncios';
export function storage(){
  const {AWS_REGION,AWS_ENDPOINT_URL_S3,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY}=process.env;
  if(!AWS_REGION||!AWS_ENDPOINT_URL_S3||!AWS_ACCESS_KEY_ID||!AWS_SECRET_ACCESS_KEY) throw new Error('Falta configurar Neon Object Storage.');
  return new S3Client({region:AWS_REGION,endpoint:AWS_ENDPOINT_URL_S3,credentials:{accessKeyId:AWS_ACCESS_KEY_ID,secretAccessKey:AWS_SECRET_ACCESS_KEY},forcePathStyle:true,requestChecksumCalculation:'WHEN_REQUIRED'});
}
