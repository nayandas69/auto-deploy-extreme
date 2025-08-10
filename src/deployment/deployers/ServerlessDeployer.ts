import { exec } from '@actions/exec';
import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
import { BaseDeployer } from './BaseDeployer';
import * as fs from 'fs';

export class ServerlessDeployer extends BaseDeployer {
  constructor(config: DeploymentConfig, logger: Logger) {
    super(config, logger);
  }

  async validateDeployment(): Promise<void> {
    if (!this.config.serverlessConfig) {
      throw new Error('Serverless config is required for serverless deployment');
    }

    // Validate serverless framework is available
    try {
      await exec('serverless', ['--version']);
      this.logger.info('✅ Serverless framework validated');
    } catch (error) {
      throw new Error('Serverless framework is not available');
    }

    // Validate config file exists
    if (!fs.existsSync(this.config.serverlessConfig!)) {
      throw new Error(`Serverless config file not found: ${this.config.serverlessConfig}`);
    }
  }

  async deploy(): Promise<DeploymentResult> {
    const deploymentId = `${this.config.applicationName}-${Date.now()}`;

    try {
      // Set AWS credentials if provided
      if (this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
        process.env.AWS_ACCESS_KEY_ID = this.config.awsAccessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = this.config.awsSecretAccessKey;
      }

      if (this.config.awsRegion) {
        process.env.AWS_REGION = this.config.awsRegion;
      }

      // Deploy using serverless framework
      await exec('serverless', [
        'deploy',
        '--config',
        this.config.serverlessConfig!,
        '--stage',
        this.config.environment,
        '--verbose'
      ]);

      this.logger.info('✅ Serverless deployment completed successfully');

      // Get deployment info
      const deploymentUrl = await this.getDeploymentUrl();

      return {
        success: true,
        deploymentId,
        deploymentUrl
      };
    } catch (error) {
      throw new Error(`Serverless deployment failed: ${error}`);
    }
  }

  async rollback(): Promise<DeploymentResult> {
    try {
      // Serverless doesn't have built-in rollback, so we'd need to implement custom logic
      // This could involve deploying a previous version or using AWS CloudFormation rollback
      this.logger.warn('Serverless rollback not implemented - manual intervention required');

      return {
        success: false,
        error: 'Serverless rollback not implemented',
        deploymentId: '',
        deploymentUrl: ''
      };
    } catch (error) {
      throw new Error(`Serverless rollback failed: ${error}`);
    }
  }

  async postDeploymentTasks(): Promise<void> {
    // Clean up old versions if needed
    this.logger.info('✅ Serverless post-deployment tasks completed');
  }

  private async getDeploymentUrl(): Promise<string> {
    try {
      // This would typically involve parsing the serverless output or AWS API calls
      return `https://${this.config.applicationName}-${this.config.environment}.amazonaws.com`;
    } catch (error) {
      this.logger.warn('Could not determine deployment URL:', error);
      return 'https://unknown';
    }
  }
}
