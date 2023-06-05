import { buildResponse } from '../utils';
import { MockStoreData } from '../mock_store_data'

export const handler = async (event: any) => {
  try {
    
    console.log("echo getProductsById", event);

    const { productId } = event.pathParameters;
    
    const item = MockStoreData.filter(
      (item: { id: any }) => item.id === productId
    );

    if (item && item.length > 0) {
      return buildResponse(200, {item: item[0],});
    } else {
      return buildResponse(404, {message: "PRODUCT NOT FOUND",});
    }

  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};