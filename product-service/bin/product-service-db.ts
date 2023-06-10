import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from "dotenv";

dotenv.config({ path: '/.env' });

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: { region : 'eu-central-1' },
//  synthesizer: new cdk.DefaultStackSynthesizer({
//    fileAssetsBucketName: 'awscdrsschooltask3lambda',
//    bucketPrefix: '',
//  })
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    PG_HOST: process.env.PG_HOST,
    PG_PORT: process.env.PG_PORT,
    PG_DATABASE: process.env.PG_DATABASE,
    PG_USERNAME: process.env.PG_USERNAME,
    PG_PASSWORD: process.env.PG_PASSWORD, 
  }
};

const getProductsList = new NodejsFunction(stack, 'GetProductsListLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsList',
  entry: 'source/lambda_handlers/getProductsList.ts',
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
