import type { DeploymentConfig } from '../types/DeploymentConfig';
import type { Logger } from '../utils/Logger';
import type { DeploymentResult } from '../types/DeploymentResult';
export declare class DeploymentManager {
    private config;
    private logger;
    private deployer;
    constructor(config: DeploymentConfig, logger: Logger);
    private initializeDeployer;
    deploy(): Promise<DeploymentResult>;
    rollback(): Promise<DeploymentResult>;
}
//# sourceMappingURL=DeploymentManager.d.ts.map