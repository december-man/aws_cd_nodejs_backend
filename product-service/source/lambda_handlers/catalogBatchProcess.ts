import { SQSEvent } from 'aws-lambda';
import pg from './index';
import * as dotenv from "dotenv";
import { error } from 'console';
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

dotenv.config()

const sns = new SNSClient({});

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
            // Depict item in a cloudwatch log
            console.log(`echo catalogBatchProcess: ${JSON.stringify(input)}`);
            // Publish notification to subscribers
            await sns.send(
                new PublishCommand({
                    Subject: 'New product from CSV import is inserted',
                    Message: JSON.stringify(input),
                    TopicArn: process.env.SNS_TOPIC!,
                    MessageAttributes: {
                        price: {
                          DataType: 'Number',
                          StringValue: input.price,
                        },
                    },
                })
            );
        }
    } catch (error: any) {
        console.error (`Error processing the batch: ${error}`);
    }
};