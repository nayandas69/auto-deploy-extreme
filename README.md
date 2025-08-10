# Auto-Deploy-Extreme

[![CI](https://github.com/nayandas69/auto-deploy-extreme/actions/workflows/ci.yml/badge.svg)](https://github.com/nayandas69/auto-deploy-extreme/actions/workflows/ci.yml)
[![Release](https://github.com/nayandas69/auto-deploy-extreme/actions/workflows/release.yml/badge.svg)](https://github.com/nayandas69/auto-deploy-extreme/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/nayandas69/auto-deploy-extreme.svg)](https://github.com/nayandas69/auto-deploy-extreme/releases)

A **production-ready GitHub Action** for automated deployment with comprehensive support for **Docker**, **Kubernetes**, and **Serverless** platforms. Built with TypeScript, featuring health checks, smart rollbacks, and rich notifications.

## Key Features

- **Multi-Platform Support**: Docker, Kubernetes, and Serverless deployments
- **Health Checks**: Automated post-deployment health verification with retry logic
- **Smart Rollbacks**: Automatic rollback on deployment failures
- **Rich Notifications**: Slack, webhooks, and GitHub deployment status updates
- **Production Ready**: Comprehensive error handling, logging, and validation
- **Type Safe**: Built with TypeScript for maximum reliability
- **Fast & Reliable**: Optimized for CI/CD pipelines

## Quick Start

### Docker Deployment

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Application
        uses: nayandas69/auto-deploy-extreme@v1
        with:
          environment: 'production'
          deployment_type: 'docker'
          app_name: 'my-awesome-app'
          docker_image: 'my-app:latest'
          health_check_url: 'http://localhost:80/health'
          rollback_on_failure: true
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: '#deployments'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Kubernetes Deployment

```yaml
- name: Deploy to Kubernetes
  uses: nayandas69/auto-deploy-extreme@v1
  with:
    environment: 'staging'
    deployment_type: 'kubernetes'
    app_name: 'my-k8s-app'
    k8s_manifest: './k8s/deployment.yaml'
    health_check_url: 'https://my-app-staging.example.com/health'
    health_check_timeout: 600
    notification_webhook: ${{ secrets.DEPLOYMENT_WEBHOOK }}
```

### Serverless Deployment

```yaml
- name: Deploy Serverless Function
  uses: nayandas69/auto-deploy-extreme@v1
  with:
    environment: 'production'
    deployment_type: 'serverless'
    app_name: 'my-lambda-function'
    serverless_config: './serverless.yml'
    aws_region: 'us-east-1'
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Complete Input Reference

| Input | Description | Required | Default | Example |
|-------|-------------|----------|---------|---------|
| `environment` | Target environment | ✅ | - | `production`, `staging` |
| `deployment_type` | Deployment type | ✅ | - | `docker`, `kubernetes`, `serverless` |
| `app_name` | Application name | ✅ | - | `my-awesome-app` |
| `docker_image` | Docker image to deploy | ❌* | - | `my-app:v1.2.3` |
| `k8s_manifest` | Kubernetes manifest path | ❌* | - | `./k8s/deployment.yaml` |
| `serverless_config` | Serverless config path | ❌* | - | `./serverless.yml` |
| `health_check_url` | Health check endpoint | ❌ | - | `https://api.example.com/health` |
| `health_check_timeout` | Health check timeout (seconds) | ❌ | `300` | `600` |
| `rollback_on_failure` | Enable automatic rollback | ❌ | `true` | `false` |
| `notification_webhook` | Webhook for notifications | ❌ | - | `https://hooks.slack.com/...` |
| `slack_token` | Slack bot token | ❌ | - | `xoxb-...` |
| `slack_channel` | Slack channel | ❌ | - | `#deployments` |
| `aws_region` | AWS region | ❌ | - | `us-east-1` |
| `aws_access_key_id` | AWS access key | ❌ | - | - |
| `aws_secret_access_key` | AWS secret key | ❌ | - | - |
| `github_token` | GitHub token | ❌ | `${{ github.token }}` | - |

**\* Required based on deployment type*

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `deployment_id` | Unique deployment identifier | `my-app-1642678800000` |
| `deployment_url` | Application URL | `https://my-app.example.com` |
| `deployment_status` | Deployment status | `success` or `failed` |
| `deployment_time` | Completion timestamp | `2024-01-20T10:30:00Z` |
| `error_message` | Error details (if failed) | `Health check failed: HTTP 500` |

## Advanced Configuration

### Health Check with Retry Logic

```yaml
with:
  health_check_url: 'https://api.example.com/health'
  health_check_timeout: 600  # 10 minutes
  rollback_on_failure: true
```

The action performs up to **5 retry attempts** with **10-second intervals** between retries.

### Comprehensive Notification Setup

#### Slack Integration

1. Create a Slack app and generate a bot token
2. Add the bot to your deployment channel
3. Configure the action:

```yaml
with:
  slack_token: ${{ secrets.SLACK_TOKEN }}
  slack_channel: '#deployments'
```

#### Custom Webhook Notifications

```yaml
with:
  notification_webhook: 'https://your-webhook-endpoint.com/deploy'
```

**Webhook Payload Example:**
```json
{
  "status": "success",
  "application": "my-app",
  "environment": "production",
  "deploymentUrl": "https://my-app.com",
  "deploymentId": "my-app-1642678800000",
  "timestamp": "2024-01-20T10:30:00Z",
  "repository": {"owner": "nayandas69", "repo": "my-app"},
  "commit": "abc123def456",
  "actor": "nayandas69"
}
```

### Multi-Environment Workflow

```yaml
name: Multi-Environment Deployment

on:
  push:
    branches: [main, develop]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nayandas69/auto-deploy-extreme@v1
        with:
          environment: 'staging'
          deployment_type: 'docker'
          app_name: 'my-app'
          docker_image: 'my-app:staging'

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nayandas69/auto-deploy-extreme@v1
        with:
          environment: 'production'
          deployment_type: 'kubernetes'
          app_name: 'my-app'
          k8s_manifest: './k8s/production.yaml'
          health_check_url: 'https://my-app.com/health'
```

## Deployment Types

### 🐳 Docker Deployment

**Requirements:**
- Docker image available in registry
- Docker daemon running on runner

**Features:**
- Automatic container management
- Port mapping configuration
- Container cleanup and backup
- Rollback to previous container

### Kubernetes Deployment

**Requirements:**
- `kubectl` configured with cluster access
- Valid Kubernetes manifest file

**Features:**
- Rolling deployments
- Automatic rollout status checking
- Service URL detection
- Rollback to previous revision

### Serverless Deployment

**Requirements:**
- Serverless Framework installed
- AWS credentials configured
- Valid `serverless.yml` configuration

**Features:**
- Multi-stage deployments
- AWS Lambda function management
- CloudFormation stack updates
- Environment-specific configurations

## Troubleshooting

### Common Issues

**1. Health Check Failures**
```yaml
# Increase timeout and disable rollback for debugging
with:
  health_check_timeout: 900
  rollback_on_failure: false
```

**2. Docker Image Not Found**
```yaml
# Ensure image is built and pushed before deployment
- name: Build and Push Docker Image
  run: |
    docker build -t my-app:${{ github.sha }} .
    docker push my-app:${{ github.sha }}

- name: Deploy
  uses: nayandas69/auto-deploy-extreme@v1
  with:
    docker_image: 'my-app:${{ github.sha }}'
```

**3. Kubernetes Access Issues**
```yaml
# Configure kubectl before deployment
- name: Configure kubectl
  run: |
    echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config
```

### Debug Mode

Enable verbose logging by setting the `ACTIONS_STEP_DEBUG` secret to `true` in your repository.

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (for testing)

### Local Development

```bash
# Clone the repository
git clone https://github.com/nayandas69/auto-deploy-extreme.git
cd auto-deploy-extreme

# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run type-check

# Format code
npm run format

# Build
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Contributing

We welcome contributions!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Format your code: `npm run format`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Project Stats

- **Language**: TypeScript
- **Runtime**: Node.js 20+
- **Dependencies**: Minimal (only GitHub Actions core packages)
- **Test Coverage**: 95%+
- **Bundle Size**: ~1.1MB (includes all dependencies)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- GitHub Actions team for the excellent platform
- The open-source community for inspiration and tools
- All contributors who help improve this action

## Support & Community

- **Bug Reports**: [GitHub Issues](https://github.com/nayandas69/auto-deploy-extreme/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nayandas69/auto-deploy-extreme/discussions)

---

<div align="center">

**⭐ Star this repository if it helped you!**

Made with ❤️ by [nayandas69](https://github.com/nayandas69)

[Report Bug](https://github.com/nayandas69/auto-deploy-extreme/issues) • [Request Feature](https://github.com/nayandas69/auto-deploy-extreme/issues) • [View Releases](https://github.com/nayandas69/auto-deploy-extreme/releases)

</div>
