import { buildResponse } from '../utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const handler = async (event: any) => {

  console.log('Received event:', JSON.stringify(event, null, 2));

  // generate policy on password comparison
  const generatePolicy = (principalid:string, resource: string, effect: 'Allow' | 'Deny') => {
    return {
      principalId: principalid,
      PolicyDocument : {
        Version: '2012-10-17',
        Statement:  [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource
          }
        ]
      }
    }
  };

  try {

    // Input Credentials
    const authToken = event.headers.authorization;
    const encodedCreds = authToken.split(' ')[1];
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8').split(':');
    const username = decodedCreds[0];
    const password = decodedCreds[1];
    
    console.log(`username: ${username}, password: ${password}`); // debugging

    // Stored Credentials
    const storedCreds = process.env.USER_PASSWORD!;

    // Policy Regulations
    const effect = !storedCreds || storedCreds != password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    // Authentication

    if (!event.headers || !event.headers.authorization) {
      return buildResponse(401, {message: 'Unauthorized'})
    }

    if (storedCreds == password) {
      return buildResponse (200, {message: `Authentication successful: ${policy}`});
    } else {
      return buildResponse(403, {message: `Forbidden: ${policy}`});
    }
  }
  catch (error: any) {
    console.log(error.message);
    return buildResponse(401, {message: `Unauthorized: ${error.message}`});
  }
};