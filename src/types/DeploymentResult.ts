export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  deploymentUrl: string;
  error?: string;
  containerName?: string;
}
