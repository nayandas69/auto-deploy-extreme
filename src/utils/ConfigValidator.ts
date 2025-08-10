import type { DeploymentConfig } from '../types/DeploymentConfig';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ConfigValidator {
  validate(config: DeploymentConfig): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!config.environment) {
      errors.push('Environment is required');
    }

    if (!config.deploymentType) {
      errors.push('Deployment type is required');
    }

    if (!config.applicationName) {
      errors.push('Application name is required');
    }

    if (!config.githubToken) {
      errors.push('GitHub token is required');
    }

    // Deployment type specific validation
    switch (config.deploymentType) {
      case 'docker':
        if (!config.dockerImage) {
          errors.push('Docker image is required for Docker deployment');
        }
        break;
      case 'kubernetes':
        if (!config.kubernetesManifest) {
          errors.push('Kubernetes manifest is required for Kubernetes deployment');
        }
        break;
      case 'serverless':
        if (!config.serverlessConfig) {
          errors.push('Serverless config is required for serverless deployment');
        }
        break;
      default:
        errors.push(`Unsupported deployment type: ${config.deploymentType}`);
    }

    // Validate environment name format
    if (config.environment && !/^[a-zA-Z0-9-_]+$/.test(config.environment)) {
      errors.push(
        'Environment name can only contain alphanumeric characters, hyphens, and underscores'
      );
    }

    // Validate application name format
    if (config.applicationName && !/^[a-zA-Z0-9-_]+$/.test(config.applicationName)) {
      errors.push(
        'Application name can only contain alphanumeric characters, hyphens, and underscores'
      );
    }

    // Validate health check timeout
    if (
      config.healthCheckTimeout &&
      (config.healthCheckTimeout < 30 || config.healthCheckTimeout > 1800)
    ) {
      errors.push('Health check timeout must be between 30 and 1800 seconds');
    }

    // Validate URLs
    if (config.healthCheckUrl && !this.isValidUrl(config.healthCheckUrl)) {
      errors.push('Health check URL is not valid');
    }

    if (config.notificationWebhook && !this.isValidUrl(config.notificationWebhook)) {
      errors.push('Notification webhook URL is not valid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
