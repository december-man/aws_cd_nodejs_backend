import { buildResponse } from '../utils';
import pg from './index';

export const handler = async (event: any) => {
  try {
    
    console.log("echo getProductsById", event);

    const { productId } = event.pathParameters;
    const product = await pg('items').where('id', productId).select('*');

    if (product && product.length > 0) {
      return buildResponse(200, product);
    } else {
      return buildResponse(404, {message: "PRODUCT NOT FOUND"});
    }

  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};