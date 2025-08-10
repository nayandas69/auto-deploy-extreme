import type { DeploymentConfig } from '../types/DeploymentConfig';
import type { DeploymentResult } from '../types/DeploymentResult';
import * as github from '@actions/github';

export class NotificationService {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async sendDeploymentStart(): Promise<void> {
    const message = `🚀 Deployment started for ${this.config.applicationName} to ${this.config.environment}`;

    await Promise.all([
      this.sendSlackNotification(message, 'warning'),
      this.sendWebhookNotification({
        status: 'started',
        application: this.config.applicationName,
        environment: this.config.environment,
        message
      }),
      this.createGitHubDeployment('pending')
    ]);
  }

  async sendDeploymentSuccess(result: DeploymentResult): Promise<void> {
    const message = `✅ Deployment successful for ${this.config.applicationName} to ${this.config.environment}\nURL: ${result.deploymentUrl}`;

    await Promise.all([
      this.sendSlackNotification(message, 'good'),
      this.sendWebhookNotification({
        status: 'success',
        application: this.config.applicationName,
        environment: this.config.environment,
        deploymentUrl: result.deploymentUrl,
        deploymentId: result.deploymentId,
        message
      }),
      this.createGitHubDeployment('success', result.deploymentUrl)
    ]);
  }

  async sendDeploymentFailure(error: string): Promise<void> {
    const message = `❌ Deployment failed for ${this.config.applicationName} to ${this.config.environment}\nError: ${error}`;

    await Promise.all([
      this.sendSlackNotification(message, 'danger'),
      this.sendWebhookNotification({
        status: 'failed',
        application: this.config.applicationName,
        environment: this.config.environment,
        error,
        message
      }),
      this.createGitHubDeployment('failure')
    ]);
  }

  private async sendSlackNotification(message: string, color: string): Promise<void> {
    if (!this.config.slackToken || !this.config.slackChannel) {
      return;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: this.config.slackChannel,
          attachments: [
            {
              color,
              text: message,
              footer: 'Auto Deploy Extreme',
              ts: Math.floor(Date.now() / 1000)
            }
          ]
        })
      });

      if (!response.ok) {
        console.warn('Failed to send Slack notification:', await response.text());
      }
    } catch (error) {
      console.warn('Error sending Slack notification:', error);
    }
  }

  private async sendWebhookNotification(payload: any): Promise<void> {
    if (!this.config.notificationWebhook) {
      return;
    }

    try {
      const response = await fetch(this.config.notificationWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          repository: github.context.repo,
          commit: github.context.sha,
          actor: github.context.actor
        })
      });

      if (!response.ok) {
        console.warn('Failed to send webhook notification:', await response.text());
      }
    } catch (error) {
      console.warn('Error sending webhook notification:', error);
    }
  }

  private async createGitHubDeployment(state: string, deploymentUrl?: string): Promise<void> {
    if (!this.config.githubToken) {
      return;
    }

    try {
      const octokit = github.getOctokit(this.config.githubToken);

      // Create deployment status
      await octokit.rest.repos.createDeploymentStatus({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        deployment_id: Number.parseInt(process.env.GITHUB_DEPLOYMENT_ID || '0'),
        state: state as any,
        environment_url: deploymentUrl,
        description: `Deployment ${state} for ${this.config.applicationName}`
      });
    } catch (error) {
      console.warn('Error creating GitHub deployment status:', error);
    }
  }
}
