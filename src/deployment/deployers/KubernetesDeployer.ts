import { exec } from '@actions/exec';
import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
import { BaseDeployer } from './BaseDeployer';
import * as fs from 'fs';

export class KubernetesDeployer extends BaseDeployer {
  constructor(config: DeploymentConfig, logger: Logger) {
    super(config, logger);
  }

  async validateDeployment(): Promise<void> {
    if (!this.config.kubernetesManifest) {
      throw new Error('Kubernetes manifest is required for Kubernetes deployment');
    }

    // Validate kubectl is available
    try {
      await exec('kubectl', ['version', '--client']);
      this.logger.info('✅ kubectl validated');
    } catch (error) {
      throw new Error('kubectl is not available or not configured');
    }

    // Validate manifest file exists
    if (!fs.existsSync(this.config.kubernetesManifest!)) {
      throw new Error(`Kubernetes manifest file not found: ${this.config.kubernetesManifest}`);
    }
  }

  async deploy(): Promise<DeploymentResult> {
    const deploymentId = `${this.config.applicationName}-${Date.now()}`;

    try {
      // Apply Kubernetes manifest
      await exec('kubectl', ['apply', '-f', this.config.kubernetesManifest!]);
      this.logger.info('✅ Kubernetes manifest applied successfully');

      // Wait for deployment to be ready
      await exec('kubectl', [
        'rollout',
        'status',
        `deployment/${this.config.applicationName}`,
        '--timeout=300s'
      ]);

      // Get service URL
      const serviceUrl = await this.getServiceUrl();

      return {
        success: true,
        deploymentId,
        deploymentUrl: serviceUrl
      };
    } catch (error) {
      throw new Error(`Kubernetes deployment failed: ${error}`);
    }
  }

  async rollback(): Promise<DeploymentResult> {
    try {
      // Rollback to previous revision
      await exec('kubectl', ['rollout', 'undo', `deployment/${this.config.applicationName}`]);

      // Wait for rollback to complete
      await exec('kubectl', [
        'rollout',
        'status',
        `deployment/${this.config.applicationName}`,
        '--timeout=300s'
      ]);

      this.logger.info('✅ Kubernetes rollback completed successfully');

      const serviceUrl = await this.getServiceUrl();

      return {
        success: true,
        deploymentId: `rollback-${Date.now()}`,
        deploymentUrl: serviceUrl
      };
    } catch (error) {
      throw new Error(`Kubernetes rollback failed: ${error}`);
    }
  }

  async postDeploymentTasks(): Promise<void> {
    // Clean up old replica sets
    try {
      await exec('kubectl', ['delete', 'rs', '--all', '--cascade=false']);
      this.logger.info('✅ Cleaned up old replica sets');
    } catch (error) {
      this.logger.warn('Failed to clean up old replica sets:', error);
    }
  }

  private async getServiceUrl(): Promise<string> {
    try {
      // This is a simplified example - in reality, you'd need to handle different service types
      return `http://${this.config.applicationName}.${this.config.environment}.svc.cluster.local`;
    } catch (error) {
      this.logger.warn('Could not determine service URL:', error);
      return 'http://unknown';
    }
  }
}
