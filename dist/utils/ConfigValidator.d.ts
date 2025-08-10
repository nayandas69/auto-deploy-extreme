import type { DeploymentConfig } from '../types/DeploymentConfig';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare class ConfigValidator {
    validate(config: DeploymentConfig): ValidationResult;
    private isValidUrl;
}
//# sourceMappingURL=ConfigValidator.d.ts.map