import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../src/services/NotificationService';
import type { DeploymentConfig } from '../src/types/DeploymentConfig';
import type { DeploymentResult } from '../src/types/DeploymentResult';

// Mock fetch
global.fetch = vi.fn();

// Mock @actions/github
vi.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
    sha: 'abc123',
    actor: 'test-user'
  },
  getOctokit: vi.fn(() => ({
    rest: {
      repos: {
        createDeploymentStatus: vi.fn()
      }
    }
  }))
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let config: DeploymentConfig;

  beforeEach(() => {
    config = {
      environment: 'test',
      deploymentType: 'docker',
      applicationName: 'test-app',
      githubToken: 'test-token',
      slackToken: 'test-slack-token',
      slackChannel: '#test-channel',
      notificationWebhook: 'https://webhook.example.com'
    };
    notificationService = new NotificationService(config);
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should send deployment start notification', async () => {
    const mockResponse = { ok: true, text: vi.fn().mockResolvedValue('OK') };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await notificationService.sendDeploymentStart();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://slack.com/api/chat.postMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-slack-token'
        })
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://webhook.example.com',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should send deployment success notification', async () => {
    const mockResponse = { ok: true, text: vi.fn().mockResolvedValue('OK') };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result: DeploymentResult = {
      success: true,
      deploymentId: 'test-deployment-123',
      deploymentUrl: 'https://test-app.example.com'
    };

    await notificationService.sendDeploymentSuccess(result);

    expect(global.fetch).toHaveBeenCalledTimes(2); // Slack + Webhook
  });

  it('should send deployment failure notification', async () => {
    const mockResponse = { ok: true, text: vi.fn().mockResolvedValue('OK') };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await notificationService.sendDeploymentFailure('Test error message');

    expect(global.fetch).toHaveBeenCalledTimes(2); // Slack + Webhook
  });

  it('should handle notification failures gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    // Should not throw
    await expect(notificationService.sendDeploymentStart()).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('should skip notifications when tokens are not provided', async () => {
    config.slackToken = undefined;
    config.notificationWebhook = undefined;
    notificationService = new NotificationService(config);

    await notificationService.sendDeploymentStart();

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
