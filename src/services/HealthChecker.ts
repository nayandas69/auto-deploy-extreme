import type { DeploymentConfig } from '../types/DeploymentConfig';

export interface HealthCheckResult {
  healthy: boolean;
  error?: string;
  responseTime?: number;
  statusCode?: number;
}

export class HealthChecker {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    if (!this.config.healthCheckUrl) {
      return { healthy: true };
    }

    const startTime = Date.now();
    const timeout = (this.config.healthCheckTimeout || 300) * 1000; // Convert to milliseconds with default
    const maxRetries = 5;
    const retryDelay = process.env.NODE_ENV === 'test' ? 0 : 10000; // No delay in tests

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(this.config.healthCheckUrl!, {
          // Use ! since we checked above
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Auto-Deploy-Extreme-HealthChecker/1.0'
          }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          return {
            healthy: true,
            responseTime,
            statusCode: response.status
          };
        } else {
          if (attempt === maxRetries) {
            return {
              healthy: false,
              error: `HTTP ${response.status}: ${response.statusText}`,
              responseTime,
              statusCode: response.status
            };
          }
        }
      } catch (error) {
        if (attempt === maxRetries) {
          return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error during health check',
            responseTime: Date.now() - startTime
          };
        }
      }

      // Wait before retry (skip in tests)
      if (attempt < maxRetries && retryDelay > 0) {
        console.log(
          `Health check attempt ${attempt} failed, retrying in ${retryDelay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    return {
      healthy: false,
      error: 'Max retries exceeded'
    };
  }
}
