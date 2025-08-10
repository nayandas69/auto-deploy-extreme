export interface DeploymentConfig {
  // Required fields
  environment: string;
  deploymentType: 'docker' | 'kubernetes' | 'serverless';
  applicationName: string;
  githubToken: string;

  // Deployment specific fields
  dockerImage?: string;
  kubernetesManifest?: string;
  serverlessConfig?: string;

  // Health check configuration
  healthCheckUrl?: string;
  healthCheckTimeout?: number;

  // Rollback configuration
  rollbackOnFailure?: boolean;

  // Notification configuration
  notificationWebhook?: string;
  slackToken?: string;
  slackChannel?: string;

  // AWS configuration (for serverless)
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
}
