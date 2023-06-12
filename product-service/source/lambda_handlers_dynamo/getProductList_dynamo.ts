import * as AWS from 'aws-sdk';
import { buildResponse } from '../utils';

const dynamo = new AWS.DynamoDB.DocumentClient();

const scan = async (table: any) => {
    const scanResults = await dynamo.scan({
        TableName: table!
    }).promise();
    return scanResults.Items;
}

export const handler = async (event: any) => {
    try {

      console.log("echo getProductsList", event);
    
      const products = await scan(process.env.PRODUCTS_TABLE_NAME!);
      const stocks = await scan(process.env.STOCKS_TABLE_NAME!);

      const items = products!.map((prod) => ({
        ...prod,
        count: stocks!.find((stock) => stock.product_id === prod.id)?.count,
      }));
  
      return buildResponse(200, items);
    }
    catch (error: any) {
      return buildResponse(500, {message: error.message});
    }
  };
