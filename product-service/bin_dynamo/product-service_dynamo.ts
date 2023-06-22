import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from "dotenv";

dotenv.config({ path: '/.env' });

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStackDynamoDB', {
  env: { region : 'eu-central-1' },
});

// Creating Dynamo DB tables
const products = new dynamodb.Table(stack, 'products', { 
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING}, 
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, 
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  sortKey: {name: 'title', type: dynamodb.AttributeType.STRING},
  pointInTimeRecovery: false,
  tableClass: dynamodb.TableClass.STANDARD,
});

const stocks = new dynamodb.Table(stack, 'stocks', { 
  partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING}, 
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, 
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  pointInTimeRecovery: false,
  tableClass: dynamodb.TableClass.STANDARD,
});

// Data fill script is provided in /dynamo_db folder

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME!,
    PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME!,
  }
};

const getProductsList = new NodejsFunction(stack, 'GetProductsListLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsList',
  entry: 'source/lambda_handlers/dynamo_db/getProductsList.ts',
});

const getProductsById = new NodejsFunction(stack, 'GetProductsByIdLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsById',
  entry: 'source/lambda_handlers/dynamo_db/getProductsById.ts',
});

const createProduct = new NodejsFunction(stack, 'createProductLambda', {
  ...sharedLambdaProps,
  functionName: 'createProduct',
  entry: 'source/lambda_handlers/dynamo_db/createProduct.ts',
});

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
  integration: new HttpLambdaIntegration('createProductIntegration', getProductsList),
  path: '/products',
  methods: [apiGateway.HttpMethod.POST],
});

api.addRoutes({
  integration: new HttpLambdaIntegration('GetProductsByIdIntegration', getProductsById),
  path: '/products/{productId}',
  methods: [apiGateway.HttpMethod.GET],
});