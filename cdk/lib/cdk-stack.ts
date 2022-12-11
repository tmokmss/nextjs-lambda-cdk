import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

export class CdkStack extends cdk.Stack {
  readonly endpoint: string;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id);

    // Next.js standaloneを動かすLambdaの定義
    const handler = new DockerImageFunction(this, 'Handler', {
      code: DockerImageCode.fromImageAsset('../', {
        platform: Platform.LINUX_AMD64,
        exclude: ['cdk'],
      }),
      memorySize: 256,
      timeout: Duration.seconds(30),
    });

    // Amazon API Gateway HTTP APIの定義
    const api = new HttpApi(this, 'Api', {
      apiName: 'Frontend',
      defaultIntegration: new HttpLambdaIntegration('Integration', handler),
    });

    new CfnOutput(this, 'ApiEndpoint', { value: api.apiEndpoint });
  }
}
