import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = new cdk.App();

const stack = new cdk.Stack(app, 'AuthServiceStack', {
  env: { region : process.env.AWS_REGION! },
});

const sharedLambdaProps = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.AWS_REGION!,
    DECEMBER_MAN: process.env.DECEMBER_MAN!,
  },
};

const basicAuthorizer = new NodejsFunction(stack, 'basicAuthorizerLambda', {
  ...sharedLambdaProps,
  functionName: 'basicAuthorizer',
  entry: 'source/lambda_handlers/basicAuthorizer.ts',
});