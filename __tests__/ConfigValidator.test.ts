import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../src/utils/ConfigValidator';
import type { DeploymentConfig } from '../src/types/DeploymentConfig';

describe('ConfigValidator', () => {
  const validator = new ConfigValidator();

  const baseConfig: DeploymentConfig = {
    environment: 'production',
    deploymentType: 'docker',
    applicationName: 'test-app',
    githubToken: 'test-token',
    dockerImage: 'test:latest'
  };

  it('should validate a correct Docker configuration', () => {
    const result = validator.validate(baseConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should require environment', () => {
    const config = { ...baseConfig, environment: '' };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Environment is required');
  });

  it('should require deployment type', () => {
    const config = { ...baseConfig, deploymentType: '' as any };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Deployment type is required');
  });

  it('should require application name', () => {
    const config = { ...baseConfig, applicationName: '' };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Application name is required');
  });

  it('should require Docker image for Docker deployment', () => {
    const config = { ...baseConfig, dockerImage: undefined };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Docker image is required for Docker deployment');
  });

  it('should require Kubernetes manifest for Kubernetes deployment', () => {
    const config: DeploymentConfig = {
      ...baseConfig,
      deploymentType: 'kubernetes',
      dockerImage: undefined
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Kubernetes manifest is required for Kubernetes deployment');
  });

  it('should validate environment name format', () => {
    const config = { ...baseConfig, environment: 'invalid env name!' };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Environment name can only contain alphanumeric characters, hyphens, and underscores'
    );
  });

  it('should validate health check URL format', () => {
    const config = { ...baseConfig, healthCheckUrl: 'invalid-url' };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Health check URL is not valid');
  });

  it('should validate health check timeout range', () => {
    const config = { ...baseConfig, healthCheckTimeout: 10 };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Health check timeout must be between 30 and 1800 seconds');
  });
});
