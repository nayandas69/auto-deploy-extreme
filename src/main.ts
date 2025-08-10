import * as core from '@actions/core';
import { DeploymentManager } from './deployment/DeploymentManager';
import { ConfigValidator } from './utils/ConfigValidator';
import { NotificationService } from './services/NotificationService';
import { HealthChecker } from './services/HealthChecker';
import { Logger } from './utils/Logger';
import type { DeploymentConfig } from './types/DeploymentConfig';

async function run(): Promise<void> {
  const logger = new Logger();

  try {
    logger.info('🚀 Starting Auto Deploy Extreme...');

    // Parse and validate configuration
    const config: DeploymentConfig = {
      environment: core.getInput('environment', { required: true }),
      deploymentType: core.getInput('deployment_type', { required: true }) as
        | 'docker'
        | 'kubernetes'
        | 'serverless',
      applicationName: core.getInput('app_name', { required: true }),
      dockerImage: core.getInput('docker_image'),
      kubernetesManifest: core.getInput('k8s_manifest'),
      serverlessConfig: core.getInput('serverless_config'),
      healthCheckUrl: core.getInput('health_check_url'),
      healthCheckTimeout: Number.parseInt(core.getInput('health_check_timeout') || '300'),
      rollbackOnFailure: core.getBooleanInput('rollback_on_failure'),
      notificationWebhook: core.getInput('notification_webhook'),
      slackToken: core.getInput('slack_token'),
      slackChannel: core.getInput('slack_channel'),
      awsRegion: core.getInput('aws_region'),
      awsAccessKeyId: core.getInput('aws_access_key_id'),
      awsSecretAccessKey: core.getInput('aws_secret_access_key'),
      githubToken: core.getInput('github_token', { required: true })
    };

    // Validate configuration
    const validator = new ConfigValidator();
    const validationResult = validator.validate(config);

    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    logger.info(`✅ Configuration validated for ${config.environment} environment`);

    // Initialize services
    const notificationService = new NotificationService(config);
    const healthChecker = new HealthChecker(config);
    const deploymentManager = new DeploymentManager(config, logger);

    // Send deployment start notification
    await notificationService.sendDeploymentStart();

    // Execute deployment
    logger.info(`🔄 Starting ${config.deploymentType} deployment...`);
    const deploymentResult = await deploymentManager.deploy();

    if (!deploymentResult.success) {
      throw new Error(`Deployment failed: ${deploymentResult.error}`);
    }

    logger.info('✅ Deployment completed successfully');

    // Perform health check if URL provided
    if (config.healthCheckUrl) {
      logger.info('🏥 Performing health check...');
      const healthResult = await healthChecker.performHealthCheck();

      if (!healthResult.healthy) {
        if (config.rollbackOnFailure) {
          logger.warn('❌ Health check failed, initiating rollback...');
          await deploymentManager.rollback();
          throw new Error(`Health check failed and rollback completed: ${healthResult.error}`);
        } else {
          throw new Error(`Health check failed: ${healthResult.error}`);
        }
      }

      logger.info('✅ Health check passed');
    }

    // Set outputs
    core.setOutput('deployment_id', deploymentResult.deploymentId);
    core.setOutput('deployment_url', deploymentResult.deploymentUrl);
    core.setOutput('deployment_status', 'success');
    core.setOutput('deployment_time', new Date().toISOString());

    // Send success notification
    await notificationService.sendDeploymentSuccess(deploymentResult);

    logger.info('🎉 Auto Deploy Extreme completed successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`❌ Deployment failed: ${errorMessage}`);

    // Set failure outputs
    core.setOutput('deployment_status', 'failed');
    core.setOutput('error_message', errorMessage);

    // Send failure notification
    try {
      const config: DeploymentConfig = {
        environment: core.getInput('environment'),
        deploymentType: core.getInput('deployment_type') as 'docker' | 'kubernetes' | 'serverless',
        applicationName: core.getInput('app_name'),
        notificationWebhook: core.getInput('notification_webhook'),
        slackToken: core.getInput('slack_token'),
        slackChannel: core.getInput('slack_channel'),
        githubToken: core.getInput('github_token')
      } as DeploymentConfig;

      const notificationService = new NotificationService(config);
      await notificationService.sendDeploymentFailure(errorMessage);
    } catch (notificationError) {
      logger.error('Failed to send failure notification:', notificationError);
    }

    core.setFailed(errorMessage);
  }
}

// Execute the action
run();
