import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
import { BaseDeployer } from './BaseDeployer';
export declare class DockerDeployer extends BaseDeployer {
    constructor(config: DeploymentConfig, logger: Logger);
    validateDeployment(): Promise<void>;
    deploy(): Promise<DeploymentResult>;
    rollback(): Promise<DeploymentResult>;
    postDeploymentTasks(): Promise<void>;
    private stopExistingContainer;
}
//# sourceMappingURL=DockerDeployer.d.ts.map