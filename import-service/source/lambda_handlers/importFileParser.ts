import * as dotenv from 'dotenv';
import { GetObjectCommand, S3Client, CopyObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

dotenv.config();

export const handler = async (event: S3Event) => {

    const client = new S3Client({});
    // Task 6: send each .csv record into SQS
    const sqs = new SQSClient({});
    
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = process.env.IMPORT_BUCKET_NAME!;
    const queueUrl = process.env.QUEUE_URL!;

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
        // Parse freshly uploaded .csv file, move it to /parsed folder upon parsing completion
        await new Promise((resolve) => { 
            readStream.pipe(csvParser({separator : ','}))
            // on data - stringify .csv file entry row (item) into a message and send it to SQS, +callback
                .on('data', (data: any) => {
                    const item = JSON.stringify({
                        ...data,
                        price: Number(data.price),
                        count: Number(data.count),
                      });
                    sqs.send(
                        new SendMessageCommand({
                            QueueUrl: queueUrl,
                            MessageBody: item,
                        })
                    );
                })
                .on('end',  async () => {
                    await client.send(copyObjectCommand);
                    console.log('Parsing is finished. File is copied to /parsed folder');
                    await client.send(deleteObjectCommand);
                    console.log('Source file is removed');
                    resolve(null);
                });
        }); 
    } catch (error: any) {
        console.error('An error occured during streaming object from S3', error.message);
    }
};