import type { DeploymentConfig } from '../types/DeploymentConfig';
export interface HealthCheckResult {
    healthy: boolean;
    error?: string;
    responseTime?: number;
    statusCode?: number;
}
export declare class HealthChecker {
    private config;
    constructor(config: DeploymentConfig);
    performHealthCheck(): Promise<HealthCheckResult>;
}
//# sourceMappingURL=HealthChecker.d.ts.map