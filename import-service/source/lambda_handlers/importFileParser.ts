import { GetObjectCommand, S3Client, CopyObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
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
    // Get the source key out of S3Event.Record
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    // Create a destination key out of the source key
    const dkey = `parsed/${key.split('/').pop()}`;
    console.log('Filename: ', key, 'Filename after parsing: ', dkey);
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    // Copy Object to /parsed folder
    const cpParams = {
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: dkey
    };
    const copyObjectCommand = new CopyObjectCommand(cpParams);
    const delParams = {
        Bucket: bucket,
        Key: key
    };
    const deleteObjectCommand = new DeleteObjectCommand(delParams);
        try {
            // GetObject as ReadableStream
            const response = await client.send(getObjectCommand);
            const readStream = response.Body as Readable;
            const results: any = [];
            // Parse freshly uploaded .csv file, move it to /parsed folder upon parsing completion
            await new Promise((resolve) => { 
                readStream.pipe(csvParser({separator : ','}))
                    .on('data', (data: any) => results.push(data))
                    .on('end',  async () => {
                        console.log(results);
                        await client.send(copyObjectCommand);
                        console.log('Parsing is finished. File is copied to /parsed folder');
                        await client.send(deleteObjectCommand);
                        console.log('Source file is removed')
                        resolve(null);
                    });
            }); 
        } catch (error: any) {
            console.error('An error occured during streaming object from S3', error.message);
        }
};