import { SQSEvent } from 'aws-lambda';
import pg from './index';
import * as dotenv from "dotenv";
import { error } from 'console';
import { SNS } from 'aws-sdk';

dotenv.config()

const sns = new SNS();

export const handler = async (event: SQSEvent) => {
    try {
        for (const r of event.Records) {
            let input = JSON.parse(r.body);
            
            if (!input.title || !input.description || !input.count || !input.price) {
                console.error(`Missing input values`);
                throw error;
            };
            // Push new records into postgreSQL db using knex & PL/pgSQL function `createProduct`
            await pg.raw('SELECT * FROM createProduct(?::TEXT, ?::TEXT, ?::INT, ?::INT)', [input.title, input.description, input.price, input.count]);
            // Publish notification to subscribers
            console.log(`echo catalogBatchProcess: ${JSON.stringify(input)}`);
        }
        await sns.publish({
            Message: 'SQS batch processing finished successfully',
            TopicArn: process.env.SNS_TOPIC!
        }).promise();
    } catch (error: any) {
        console.error (`Error processing the batch: ${error}`);
    }
};