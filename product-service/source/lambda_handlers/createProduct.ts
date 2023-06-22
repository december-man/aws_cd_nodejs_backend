import { buildResponse } from '../utils';
import pg from './index';

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

    // const params = {title:input.title, desc:input.description, price:input.price, count:input.count};
    const products = await pg.raw('SELECT * FROM createProduct(?::TEXT, ?::TEXT, ?::INT, ?::INT)', [input.title, input.description, input.price, input.count]);

    return buildResponse(200, input);
  }
  catch (error: any) {
    return buildResponse(500, {message: error.message});
  }
};