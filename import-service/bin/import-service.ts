#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications'
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ImportServiceStack', {
  env: { region : process.env.AWS_REGION! },
});

const sharedLambdaProps = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.AWS_REGION!,
    IMPORT_BUCKET: process.env.IMPORT_BUCKET!,
    IMPORT_BUCKET_NAME: process.env.IMPORT_BUCKET_NAME!,
  },
};

const bucket = s3.Bucket.fromBucketArn(stack, 'ImportBucket', process.env.IMPORT_BUCKET!);

const importProductsFile = new NodejsFunction(stack, 'importProductsFileLambda', {
  ...sharedLambdaProps,
  functionName: 'importProductsFile',
  entry: 'source/lambda_handlers/importProductsFile.ts',
});

bucket.grantReadWrite(importProductsFile);

const api = new apiGateway.HttpApi(stack, 'ImportApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration('importProductsFileIntegration', importProductsFile),
  path: '/import/{name}',
  methods: [apiGateway.HttpMethod.GET],
});

const importFileParser = new NodejsFunction(stack, 'importFileParserLambda', {
  ...sharedLambdaProps,
  functionName: 'importFileParser',
  entry: 'source/lambda_handlers/importFileParser.ts',
});

bucket.grantReadWrite(importFileParser);

bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(importFileParser), {
    prefix: 'uploaded'
  });