export interface DeploymentConfig {
    environment: string;
    deploymentType: 'docker' | 'kubernetes' | 'serverless';
    applicationName: string;
    githubToken: string;
    dockerImage?: string;
    kubernetesManifest?: string;
    serverlessConfig?: string;
    healthCheckUrl?: string;
    healthCheckTimeout?: number;
    rollbackOnFailure?: boolean;
    notificationWebhook?: string;
    slackToken?: string;
    slackChannel?: string;
    awsRegion?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
}
//# sourceMappingURL=DeploymentConfig.d.ts.map