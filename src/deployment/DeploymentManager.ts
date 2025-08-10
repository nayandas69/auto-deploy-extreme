import type { DeploymentConfig } from '../types/DeploymentConfig';
import type { Logger } from '../utils/Logger';
import { DockerDeployer } from './deployers/DockerDeployer';
import { KubernetesDeployer } from './deployers/KubernetesDeployer';
import { ServerlessDeployer } from './deployers/ServerlessDeployer';
import type { DeploymentResult } from '../types/DeploymentResult';

export class DeploymentManager {
  private config: DeploymentConfig;
  private logger: Logger;
  private deployer!: DockerDeployer | KubernetesDeployer | ServerlessDeployer; // Add ! to indicate it will be assigned

  constructor(config: DeploymentConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.initializeDeployer();
  }

  private initializeDeployer(): void {
    switch (this.config.deploymentType) {
      case 'docker':
        this.deployer = new DockerDeployer(this.config, this.logger);
        break;
      case 'kubernetes':
        this.deployer = new KubernetesDeployer(this.config, this.logger);
        break;
      case 'serverless':
        this.deployer = new ServerlessDeployer(this.config, this.logger);
        break;
      default:
        throw new Error(`Unsupported deployment type: ${this.config.deploymentType}`);
    }
  }

  async deploy(): Promise<DeploymentResult> {
    try {
      this.logger.info(`Deploying ${this.config.applicationName} to ${this.config.environment}`);

      // Pre-deployment validation
      await this.deployer.validateDeployment();

      // Execute deployment
      const result = await this.deployer.deploy();

      // Post-deployment tasks
      await this.deployer.postDeploymentTasks();

      return result;
    } catch (error) {
      this.logger.error('Deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error',
        deploymentId: '',
        deploymentUrl: ''
      };
    }
  }

  async rollback(): Promise<DeploymentResult> {
    try {
      this.logger.info('Initiating rollback...');
      return await this.deployer.rollback();
    } catch (error) {
      this.logger.error('Rollback failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown rollback error',
        deploymentId: '',
        deploymentUrl: ''
      };
    }
  }
}
