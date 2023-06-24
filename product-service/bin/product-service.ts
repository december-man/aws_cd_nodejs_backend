import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as iam from "aws-cdk-lib/aws-iam";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from "dotenv";
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: { region : 'eu-central-1' },
//  synthesizer: new cdk.DefaultStackSynthesizer({
//    fileAssetsBucketName: 'awscdrsschooltask3lambda',
//    bucketPrefix: '',
//  })
});

// Common .env variables among lambdas & lambdas bundling
const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    PG_HOST: process.env.PG_HOST!,
    PG_PORT: process.env.PG_PORT!,
    PG_DATABASE: process.env.PG_DATABASE!,
    PG_USERNAME: process.env.PG_USERNAME!,
    PG_PASSWORD: process.env.PG_PASSWORD!,
    SNS_TOPIC: process.env.SNS_TOPIC!,
  },
  bundling: {
    externalModules: [
      'pg-native',
      'sqlite3',
      'pg-query-stream',
      'oracledb',
      'better-sqlite3',
      'tedious',
      'mysql',
      'mysql2',
    ],
  },
};

// Create `getProductsList` lambda
const getProductsList = new NodejsFunction(stack, 'GetProductsListLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsList',
  entry: 'source/lambda_handlers/getProductsList.ts',
});

// Create `getProductsById` lambda
const getProductsById = new NodejsFunction(stack, 'GetProductsByIdLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsById',
  entry: 'source/lambda_handlers/getProductsById.ts',
});

// Create `createProduct` lambda
const createProduct = new NodejsFunction(stack, 'CreateProductLambda', {
  ...sharedLambdaProps,
  functionName: 'createProduct',
  entry: 'source/lambda_handlers/createProduct.ts',
});

// API config
const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductsList),
  path: '/products',
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration('GetProductsByIdIntegration', getProductsById),
  path: '/products/{productId}',
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration('CreateProductIntegration', createProduct),
  path: '/products',
  methods: [apiGateway.HttpMethod.POST],
});

// Create SQS `catalogItemsQueue` queue
// NB: its a Standard queue, not FIFO (goes by default)
const queue = new sqs.Queue(stack, 'CatalogItemsQueue', {
  queueName: 'catalogItemsQueue',
  retentionPeriod: cdk.Duration.hours(1),
  receiveMessageWaitTime: cdk.Duration.seconds(20), // Long Polling
  visibilityTimeout: cdk.Duration.seconds(30),
});

// Create SNS `createProductTopic` topic
const topic = new sns.Topic(stack, 'CreateProductTopic', {
  topicName: 'createProductTopic',
});

// Create Filter Policy: basically a placeholder.
const filterPolicy = {
  title: sns.SubscriptionFilter.stringFilter({
    allowlist: ['SQS batch processing finished successfully'],
  }),
};

// Add a subscriber (-filter)
topic.addSubscription(new subs.EmailSubscription(process.env.SNSEMAIL!));

// Add a subscriber (+ filter)
topic.addSubscription(new subs.EmailSubscription(process.env.SNSEMAILPRIORITY!, {
  filterPolicy,
}));

// Create `catalogBatchProcess` lambda function
const catalogBatchProcess = new NodejsFunction(stack, 'CatalogBatchProcessLambda', {
  ...sharedLambdaProps,
  functionName: 'catalogBatchProcess',
  entry: 'source/lambda_handlers/catalogBatchProcess.ts',
});

// Set event source for `catalogBatchProcess` lambda function
// NB: batchSize parameter is set to 5
const SQSBatchReady = new lambdaEventSources.SqsEventSource(queue, {
  batchSize: 5,
  reportBatchItemFailures: false,
});
catalogBatchProcess.addEventSource(SQSBatchReady);

// Set permissions for `catalogBatchProcess` lambda function:
// Receive messages from SQS, Publish topics in SNS
const catalogBatchProcessPerms = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'sqs:ReceiveMessage',
    'sqs:DeleteMessage',
    'sqs:GetQueueAttributes',
    'sns:Publish',
  ],
  resources: [queue.queueArn, topic.topicArn],
});
catalogBatchProcess.role?.addToPrincipalPolicy(catalogBatchProcessPerms);