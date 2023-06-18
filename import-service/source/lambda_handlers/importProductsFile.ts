import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { buildResponse } from '../utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const handler = async (event: any) => {
  
  console.log('Received event:', JSON.stringify(event, null, 2));
  const name = event.queryStringParameters?.name;
  const bucket = process.env.IMPORT_BUCKET_NAME!;

  if (!name) return buildResponse(400, {message: "Missing parameter 'name'"});
  if (name.slice(-4) !== '.csv') return buildResponse(400, {message: "Please upload only csv files!"});

  const client = new S3Client({});
  const command = new PutObjectCommand({Bucket: bucket, Key: `uploaded/${name}`});

  try {
      const link = await getSignedUrl(client, command, { expiresIn: 3600 });
      //await client.send(command);
      return buildResponse(200, `${link}`);
    }
  catch (error: any) {
    console.log(error.message);
    return buildResponse(500, {message: error.message});
  }
};