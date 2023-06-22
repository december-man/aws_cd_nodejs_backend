import { buildResponse } from '../utils';
import pg from './index';


export const handler = async (event: any) => {
  try {
    console.log("echo getProductsList", event);

    const products = await pg.select('*').from('items');

    return buildResponse(200, products);
  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};