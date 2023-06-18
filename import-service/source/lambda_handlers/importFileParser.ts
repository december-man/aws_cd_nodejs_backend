import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import csvParser from 'csv-parser';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Readable } from 'stream';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const client = new S3Client({});

export const handler = async (event: S3Event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const bucket = process.env.IMPORT_BUCKET_NAME!;
    // Get the key out of S3Event.Record
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('Filename: ', key);
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
        try {
            // GetObject as ReadableStream
            const response = await client.send(getObjectCommand);
            const readStream = response.Body as Readable;
            const results: any = [];
            // Parse freshly uploaded .csv file
            readStream.pipe(csvParser({separator : ','}))
                .on('data', (data: any) => results.push(data))
                .on('end',  () => {console.log(results)});       
        } catch (error: any) {
            console.error('Error occured during streaming object from S3', error.message);
        }
};