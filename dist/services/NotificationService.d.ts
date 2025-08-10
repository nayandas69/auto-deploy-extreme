import type { DeploymentConfig } from '../types/DeploymentConfig';
import type { DeploymentResult } from '../types/DeploymentResult';
export declare class NotificationService {
    private config;
    constructor(config: DeploymentConfig);
    sendDeploymentStart(): Promise<void>;
    sendDeploymentSuccess(result: DeploymentResult): Promise<void>;
    sendDeploymentFailure(error: string): Promise<void>;
    private sendSlackNotification;
    private sendWebhookNotification;
    private createGitHubDeployment;
}
//# sourceMappingURL=NotificationService.d.ts.map