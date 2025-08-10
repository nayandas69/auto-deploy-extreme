import { exec } from '@actions/exec';
import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
import { BaseDeployer } from './BaseDeployer';

export class DockerDeployer extends BaseDeployer {
  constructor(config: DeploymentConfig, logger: Logger) {
    super(config, logger);
  }

  async validateDeployment(): Promise<void> {
    if (!this.config.dockerImage) {
      throw new Error('Docker image is required for Docker deployment');
    }

    // Validate Docker image exists
    try {
      await exec('docker', ['inspect', this.config.dockerImage]);
      this.logger.info(`✅ Docker image ${this.config.dockerImage} validated`);
    } catch (error) {
      throw new Error(`Docker image ${this.config.dockerImage} not found or invalid`);
    }
  }

  async deploy(): Promise<DeploymentResult> {
    const deploymentId = `${this.config.applicationName}-${Date.now()}`;
    const containerName = `${this.config.applicationName}-${this.config.environment}`;

    try {
      // Stop existing container if running
      await this.stopExistingContainer(containerName);

      // Run new container - ensure all args are strings
      const dockerArgs = [
        'run',
        '-d',
        '--name',
        containerName,
        '--restart',
        'unless-stopped',
        '-p',
        '80:8080', // Default port mapping
        this.config.dockerImage! // Add ! since we validated it exists
      ];

      await exec('docker', dockerArgs);
      this.logger.info(`✅ Container ${containerName} started successfully`);

      return {
        success: true,
        deploymentId,
        deploymentUrl: `http://localhost:80`,
        containerName
      };
    } catch (error) {
      throw new Error(`Docker deployment failed: ${error}`);
    }
  }

  async rollback(): Promise<DeploymentResult> {
    const containerName = `${this.config.applicationName}-${this.config.environment}`;
    const backupContainerName = `${containerName}-backup`;

    try {
      // Stop current container
      await this.stopExistingContainer(containerName);

      // Start backup container
      await exec('docker', ['start', backupContainerName]);
      await exec('docker', ['rename', backupContainerName, containerName]);

      this.logger.info('✅ Rollback completed successfully');

      return {
        success: true,
        deploymentId: `rollback-${Date.now()}`,
        deploymentUrl: `http://localhost:80`
      };
    } catch (error) {
      throw new Error(`Docker rollback failed: ${error}`);
    }
  }

  async postDeploymentTasks(): Promise<void> {
    // Clean up old containers
    try {
      await exec('docker', ['container', 'prune', '-f']);
      this.logger.info('✅ Cleaned up old containers');
    } catch (error) {
      this.logger.warn('Failed to clean up old containers:', error);
    }
  }

  private async stopExistingContainer(containerName: string): Promise<void> {
    try {
      // Create backup before stopping
      await exec('docker', ['rename', containerName, `${containerName}-backup`]);
      await exec('docker', ['stop', `${containerName}-backup`]);
    } catch (error) {
      // Container might not exist, which is fine
      this.logger.info(`No existing container ${containerName} to stop`);
    }
  }
}
