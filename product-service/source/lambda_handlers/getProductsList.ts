import { buildResponse } from '../utils';
import { MockStoreData } from '../mock_store_data'

export const handler = async (event: any) => {
  try {

    console.log("echo getProductsList", event)

    return buildResponse(200, MockStoreData);
  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};