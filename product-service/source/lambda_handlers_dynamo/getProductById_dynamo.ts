import * as AWS from 'aws-sdk';
import { buildResponse } from '../utils';

const dynamo = new AWS.DynamoDB.DocumentClient();

const query_products = async (table: string, id: string) => {
    const queryResults = await dynamo.query({
        TableName: table,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {':id': id}
    }).promise();
    return queryResults.Items;
}

const query_stocks = async (table: string, id: string) => {
    const queryResults = await dynamo.query({
        TableName: table,
        KeyConditionExpression: 'product_id = :id', // bloody id column name
        ExpressionAttributeValues: {':id': id}
    }).promise();
    return queryResults.Items;
}


export const handler = async (event: any) => {
    try {

      console.log("echo getProductsList", event);

      const { productId } = event.pathParameters;

      const product = await query_products(process.env.PRODUCTS_TABLE_NAME!, productId);
      const product_count = await query_stocks(process.env.STOCKS_TABLE_NAME!, productId);

      if (product![0] && product_count![0]) {
        return buildResponse(200, {
            ...product![0],
            ...product_count![0]
        });
      } else {
        return buildResponse(404, {message: "PRODUCT NOT FOUND"});
      }
    }
    catch (error: any) {
      return buildResponse(500, {message: error.message});
    }
  };