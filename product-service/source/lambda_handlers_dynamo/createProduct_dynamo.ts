import { buildResponse } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();


interface IPOST {
    title: string;
    description: string;
    price: number;
    count: number;
  };

export const handler = async (event: any) => {
  try {

    console.log("echo createProduct", event);

    let input: IPOST = JSON.parse(event.body);

    if (!input.title || !input.description || !input.count || !input.price || typeof input.count !== 'number' ||typeof input.price !== 'number' || isNaN(Number(input.price)) || isNaN(Number(input.count))) {
        return buildResponse(400, { message: 'WRONG PARAMETER TYPE/VALUE' })
    };

    const uuid = uuidv4();

    const product = {
        id: uuid,
        title: input.title,
        description: input.description,
        price: input.price,
      };
  
    const product_count = {
        product_id: uuid,
        count: input.count,
      };

    await dynamodb.transactWrite({
        TransactItems: [
            {
                Put: {
                    TableName: 'products',
                    Item: product,
                },
            },
            {
                Put: {
                    TableName: 'stocks',
                    Item: product_count,
                },
            },
        ],
    }).promise();

    return buildResponse(200, input);
  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};