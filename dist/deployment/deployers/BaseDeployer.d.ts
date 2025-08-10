import type { DeploymentConfig } from '../../types/DeploymentConfig';
import type { Logger } from '../../utils/Logger';
import type { DeploymentResult } from '../../types/DeploymentResult';
export declare abstract class BaseDeployer {
    protected config: DeploymentConfig;
    protected logger: Logger;
    constructor(config: DeploymentConfig, logger: Logger);
    abstract validateDeployment(): Promise<void>;
    abstract deploy(): Promise<DeploymentResult>;
    abstract rollback(): Promise<DeploymentResult>;
    abstract postDeploymentTasks(): Promise<void>;
}
//# sourceMappingURL=BaseDeployer.d.ts.map