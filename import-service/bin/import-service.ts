import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
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
    QUEUE_URL: process.env.QUEUE_URL!,
  },
};

// Reference existing bucket
const bucket = s3.Bucket.fromBucketArn(stack, 'ImportBucket', process.env.IMPORT_BUCKET!);

// Create `importPrudctsFile` lambda

const importProductsFile = new NodejsFunction(stack, 'importProductsFileLambda', {
  ...sharedLambdaProps,
  functionName: 'importProductsFile',
  entry: 'source/lambda_handlers/importProductsFile.ts',
});

// Grant permissions
bucket.grantReadWrite(importProductsFile);

// API config
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

// Create `importFileParser` lambda
const importFileParser = new NodejsFunction(stack, 'importFileParserLambda', {
  ...sharedLambdaProps,
  functionName: 'importFileParser',
  entry: 'source/lambda_handlers/importFileParser.ts',
});

// Grant permissions
bucket.grantReadWrite(importFileParser);

// Add event notification
bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(importFileParser), {
    prefix: 'uploaded'
  });

// Reference existing SQS from Product-Service stack
const queue = sqs.Queue.fromQueueArn(stack, 'CatalogItemsQueue', process.env.SQSARN!);

// Create a policy for `importFileParser` to allow pushing messages to SQS
const importFileParserSQSperms = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['sqs:SendMessage'],
  resources: [queue.queueArn],
});
importFileParser.addToRolePolicy(importFileParserSQSperms);
