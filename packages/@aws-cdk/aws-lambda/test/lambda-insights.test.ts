import '@aws-cdk/assert-internal/jest';
import { ResourcePart } from '@aws-cdk/assert-internal';
import * as cdk from '@aws-cdk/core';
import * as lambda from '../lib';

describe('lambda-insights', () => {
  test('can enable insights on function', () => {
    const stack = new cdk.Stack();
    const layerArn = 'arn:aws:lambda:us-east-1:580247275435:layer:LambdaInsightsExtension:14';
    new lambda.Function(stack, 'MyLambda', {
      code: new lambda.InlineCode('foo'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      insightsVersion: lambda.LambdaInsightsVersion.fromInsightVersionArn(layerArn),
    });

    expect(stack).toHaveResource('AWS::IAM::Role', {
      ManagedPolicyArns:
        [
          { 'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']] },
          { 'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy']] },
        ],
    });

    expect(stack).toHaveResource('AWS::Lambda::Function', {
      Properties:
      {
        Code: { ZipFile: 'foo' },
        Handler: 'index.handler',
        Role: { 'Fn::GetAtt': ['MyLambdaServiceRole4539ECB6', 'Arn'] },
        Runtime: 'nodejs10.x',
        Layers: [layerArn],
      },
      DependsOn: ['MyLambdaServiceRole4539ECB6'],
    }, ResourcePart.CompleteDefinition);
  });
});
