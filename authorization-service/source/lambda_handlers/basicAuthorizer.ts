// Lambda HTTP Authorizer, IAM type

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const handler = async (event: any) => {

  console.log('Received event:', JSON.stringify(event, null, 2));

  // generate policy on password comparison function
  const generatePolicy = (principalid:string, resource: string, effect: 'Allow' | 'Deny') => {
    return {
      principalId: principalid,
      policyDocument : {
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

  // Authorization header check
  if (!event.headers.authorization) {
    return generatePolicy('client', event.methodArn, 'Deny');
  };
  
  // Input Credentials
  const authToken = event.headers.authorization;
  console.log(authToken); // debugging

  // Remove `Basic` prefix
  const encodedCreds = authToken.split(' ')[1];

  // Decode
  const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8').split(':');

  // Split into username-password variables
  const username = decodedCreds[0];
  const password = decodedCreds[1];
  
  console.log(`username: ${username}, password: ${password}`); // debugging

  try {

    // Stored Credentials (password)
    const storedCreds = process.env.USER_PASSWORD!;

    // Authentication

    if (storedCreds == password) {
      return generatePolicy(encodedCreds, event.methodArn, 'Allow');
    } else {
      return generatePolicy(encodedCreds, event.methodArn, 'Deny');
    };
  }
  catch (error: any) {
    console.log(error.message);
    return generatePolicy(encodedCreds, event.methodArn, 'Deny');
  }
};