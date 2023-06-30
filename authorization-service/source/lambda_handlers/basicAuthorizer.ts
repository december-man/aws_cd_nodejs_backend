import { buildResponse } from '../utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const handler = async (event: any) => {
  
  console.log('Received event:', JSON.stringify(event, null, 2));
  const name = event.queryStringParameters?.name;



  try {
      return buildResponse(200, 'sus');
    }
  catch (error: any) {
    console.log(error.message);
    return buildResponse(500, {message: error.message});
  }
};