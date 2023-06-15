import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { buildResponse } from '../utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const handler = async (event: any) => {
  
    const name = event.queryStringParameters?.name;
    const bucket = process.env.IMPORT_BUCKET_NAME!;

    if (!name) return buildResponse(400, {message: "Missing parameter 'name'"});

    const client = new S3Client({});
    const command = new PutObjectCommand({Bucket: bucket, Key: name});

    console.log("echo ImportProductsFile", event);

  try {
      await client.send(command);
      const link = await getSignedUrl(client, command, { expiresIn: 3600 });
      return buildResponse(200, `${link}/${name}`);
    }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};