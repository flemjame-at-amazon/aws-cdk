import { Lazy, Stack, Token } from '@aws-cdk/core';
import { RegionInfo } from '@aws-cdk/region-info';
import { CLOUDWATCH_LAMBDA_INSIGHTS_ARNS } from '@aws-cdk/region-info/build-tools/fact-tables';

// To add new versions, update fact-tables.ts `CLOUDWATCH_LAMBDA_INSIGHTS_ARNS` and create a new `public static readonly VERSION_A_B_C_D`

/**
 * Version of CloudWatch Lambda Insights
 */
export class LambdaInsightsVersion {

  /**
   * Version 1.0.54.0
   */
  public static readonly VERSION_1_0_54_0 = LambdaInsightsVersion.fromInsightsVersion('1.0.54.0');

  /**
   * Version 1.0.86.0
   */
  public static readonly VERSION_1_0_86_0 = LambdaInsightsVersion.fromInsightsVersion('1.0.86.0');

  /**
   * Version 1.0.89.0
   */
  public static readonly VERSION_1_0_89_0 = LambdaInsightsVersion.fromInsightsVersion('1.0.89.0');

  /**
   * Version 1.0.98.0
   */
  public static readonly VERSION_1_0_98_0 = LambdaInsightsVersion.fromInsightsVersion('1.0.98.0');

  /**
   * Use the insights extension associated with the provided ARN. Make sure the ARN is associated
   * with same region as your function
   *
   * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versions.html
   */
  public static fromInsightVersionArn(arn: string): LambdaInsightsVersion {
    return new LambdaInsightsVersion(undefined, arn);
  }

  // Use the verison to build the object. Not meant to be called by the user -- user should use e.g. VERSION_1_0_54_0
  private static fromInsightsVersion(insightsVersion: string) {
    return new LambdaInsightsVersion(insightsVersion, undefined);
  }

  /**
   * The arn of the Lambda Insights extension
   */
  public readonly layerVersionArn: string;

  private constructor(insightsVersion?: string, arn?: string) {
    if (arn !== undefined) {
      // Use arn if explicitly provided
      this.layerVersionArn = arn;
    } else if (insightsVersion !== undefined) {
      // Look up the arn (runs at synthesis time)
      this.layerVersionArn = Lazy.uncachedString({
        produce: (context) => this.getVersionArn(context, insightsVersion),
      });
    } else {
      throw new Error('Cannot use Lambda Insights without providing a version or an ARN');
    }
  }

  /**
   * Meant to run at synthesis. It will look up the region in RegionInfo
   */
  private getVersionArn(context: any, insightsVersion: string): string {
    const region = Stack.of(context.scope).region;

    // Check if insights version is valid. This should only happen if one of the public static readonly versions are set incorrectly
    if (!(insightsVersion in CLOUDWATCH_LAMBDA_INSIGHTS_ARNS)) {
      throw new Error(`Insights version ${insightsVersion} does not exist. Available versions are ${CLOUDWATCH_LAMBDA_INSIGHTS_ARNS.keys()}`);
    }

    // Region is defined, look up the arn, or throw an error if the version isn't supported by a region
    if (region !== undefined && !Token.isUnresolved(region)) {
      const arn = RegionInfo.get(region).cloudwatchLambdaInsightsArn(insightsVersion);
      if (arn === undefined) {
        throw new Error(`Insights version ${insightsVersion} is not supported in region ${region}`);
      }
      return arn;
    }
    // Otherwise, need to add a mapping to be looked up at deployment time
    return '';
  }
}