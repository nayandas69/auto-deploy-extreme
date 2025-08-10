import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
import { BaseDeployer } from './BaseDeployer';
export declare class ServerlessDeployer extends BaseDeployer {
    constructor(config: DeploymentConfig, logger: Logger);
    validateDeployment(): Promise<void>;
    deploy(): Promise<DeploymentResult>;
    rollback(): Promise<DeploymentResult>;
    postDeploymentTasks(): Promise<void>;
    private getDeploymentUrl;
}
//# sourceMappingURL=ServerlessDeployer.d.ts.map