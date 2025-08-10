import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HealthChecker } from '../src/services/HealthChecker';
import type { DeploymentConfig } from '../src/types/DeploymentConfig';

// Mock fetch
global.fetch = vi.fn();

// Mock setTimeout to avoid actual delays
vi.mock('timers', () => ({
  setTimeout: vi.fn((callback) => {
    // Execute callback immediately in tests
    callback();
    return 1;
  })
}));

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;
  let config: DeploymentConfig;
  let mockDateNow: any;

  beforeEach(() => {
    config = {
      environment: 'test',
      deploymentType: 'docker',
      applicationName: 'test-app',
      githubToken: 'test-token',
      healthCheckUrl: 'http://localhost:8080/health',
      healthCheckTimeout: 30
    };
    healthChecker = new HealthChecker(config);
    vi.clearAllMocks();

    // Mock console.log to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock Date.now to return predictable values
    let callCount = 0;
    mockDateNow = vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 1000 : 1100; // 100ms difference
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return healthy when no health check URL is provided', async () => {
    config.healthCheckUrl = undefined;
    healthChecker = new HealthChecker(config);

    const result = await healthChecker.performHealthCheck();
    expect(result.healthy).toBe(true);
  });

  it('should return healthy when health check passes', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK'
    };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await healthChecker.performHealthCheck();
    expect(result.healthy).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.responseTime).toBe(100); // Should be 100ms based on our mock
  });

  it('should return unhealthy when health check fails after all retries', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };
    // Mock all retry attempts to fail
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await healthChecker.performHealthCheck();
    expect(result.healthy).toBe(false);
    expect(result.error).toContain('HTTP 500');
    expect(result.statusCode).toBe(500);
  }, 10000); // 10 second timeout for this test

  it('should handle network errors after all retries', async () => {
    // Mock all retry attempts to fail with network error
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const result = await healthChecker.performHealthCheck();
    expect(result.healthy).toBe(false);
    expect(result.error).toContain('Network error');
  }, 10000); // 10 second timeout for this test
});
