# Yellow House CI/CD Pipeline

## Overview

The Yellow House backend uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The pipeline automates testing, building, and deploying the application to production.

## Pipeline Stages

### 1. Continuous Integration (CI)

**File:** `.github/workflows/ci.yml`

Runs on every push and pull request to ensure code quality:

- **Install Dependencies** (`pnpm install`)
- **Type Check** (TypeScript compilation)
- **Test** (Unit tests with Vitest)
- **Lint** (ESLint style checks)

**Trigger:** Any push or PR to main branch
**Duration:** ~2-3 minutes

### 2. Continuous Deployment (CD)

**File:** `.github/workflows/deploy.yml`

Deploys to production when CI passes:

#### Build Stage
- Builds Docker image using multi-stage build
- Optimizes for production (dependencies only)
- Pushes to Docker registry (Docker Hub or AWS ECR)
- Tags with commit SHA and branch

#### Test Stage
- Runs linting checks
- Runs unit tests
- Type-checks code (non-blocking)

#### Deploy Stage
- Verifies all checks pass
- Sends deployment notification
- Prepares for deployment to production environment
- Sends Slack notification on success/failure

**Trigger:** Push to main branch (after CI passes)
**Duration:** ~3-5 minutes total

## Configuration

### Environment Variables & Secrets

Configure the following in GitHub repository Settings → Secrets & variables:

#### Required for Docker Build
```
DOCKER_USERNAME        # Docker Hub username
DOCKER_PASSWORD        # Docker Hub token/password
DOCKER_REGISTRY        # Registry URL (e.g., docker.io or AWS ECR)
DOCKER_REPO           # Repository name (e.g., mountaincoders/yellow-house-api)
```

#### Required for Deployment
```
DEPLOYMENT_TOKEN      # Token for deployment service (Heroku, AWS, etc.)
SLACK_WEBHOOK         # Slack webhook URL for notifications
```

#### Backend Environment Variables
```
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET           # Secret for JWT token signing
NODE_ENV             # Set to 'production'
```

### Docker Configuration

**Backend Dockerfile:** `packages/backend/Dockerfile`

Features:
- Multi-stage build for optimized image size
- Node.js 20 Alpine base
- Health check endpoint (`GET /health`)
- Exposed port: `3001`
- Production dependencies only

## Running CI/CD Locally

### Run Tests
```bash
pnpm test
```

### Run Lint
```bash
pnpm lint
```

### Build Docker Image
```bash
docker build -f packages/backend/Dockerfile -t yellow-house-api:latest .
```

### Run Docker Container
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://localhost/yellow-house \
  -e JWT_SECRET=dev-secret \
  yellow-house-api:latest
```

## Deployment Targets

The pipeline can deploy to multiple targets. Choose one and configure:

### Option 1: Heroku
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create yellow-house-api

# Add buildpack
heroku buildpacks:add heroku/docker

# Deploy
git push heroku main
```

### Option 2: AWS (ECS)
1. Create ECR repository
2. Configure AWS credentials in GitHub Secrets
3. Update deploy.yml with ECS deployment step
4. Push to trigger automatic deployment

### Option 3: DigitalOcean
1. Create droplet with Docker
2. Set up Docker registry on DigitalOcean
3. Configure SSH key in GitHub Secrets
4. Update deploy.yml with SSH deployment step

## Health Checks

The Docker image includes a health check endpoint:

```bash
GET /health
```

Returns `200 OK` if the server is healthy.

The GitHub Actions workflow verifies this endpoint is responding before considering deployment successful.

## Rollback Procedure

### Automatic Rollback
If health check fails, the deployment is aborted and previous image remains active.

### Manual Rollback
```bash
# Revert the commit
git revert <commit-sha>
git push origin main

# Or tag previous Docker image as current
docker tag yellow-house-api:main-{previous-sha} yellow-house-api:main
docker push yellow-house-api:main
```

## Monitoring & Logs

### GitHub Actions Logs
- Go to repository → Actions
- Select the workflow run
- View logs for each step

### Docker Container Logs
```bash
docker logs <container-id>
```

### Health Check Monitoring
Set up monitoring on the `/health` endpoint:
- Response time
- Status code
- Availability

## Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify Docker registry credentials
3. Run `docker build` locally to reproduce issue

### Tests Fail
1. Check test output in CI logs
2. Run `pnpm test` locally
3. Ensure database is set up for integration tests

### Deployment Fails
1. Check health check endpoint is responding
2. Verify environment variables are set
3. Check database connectivity
4. Review application logs

## Best Practices

1. **Always push clean code**
   - Pass all local tests before pushing
   - Ensure linting passes
   - Run type-check locally

2. **Use meaningful commit messages**
   - Include issue/ticket reference
   - Describe what changed and why

3. **Monitor deployments**
   - Check Slack notifications
   - Monitor health checks
   - Watch application logs

4. **Database Migrations**
   - Test migrations on staging first
   - Ensure rollback migrations are created
   - Document migration steps

5. **Security**
   - Never commit secrets
   - Rotate DOCKER_PASSWORD regularly
   - Use minimal Docker images (Alpine)
   - Keep dependencies updated

## Next Steps

1. **Configure Docker Registry**
   - Set DOCKER_USERNAME, DOCKER_PASSWORD, DOCKER_REGISTRY in GitHub Secrets

2. **Configure Deployment Target**
   - Choose deployment platform (Heroku/AWS/DigitalOcean)
   - Set DEPLOYMENT_TOKEN in GitHub Secrets

3. **Configure Slack Notifications**
   - Create Slack webhook
   - Set SLACK_WEBHOOK in GitHub Secrets

4. **Test Pipeline**
   - Push a commit to main
   - Verify CI passes
   - Monitor deployment

5. **Set Up Monitoring**
   - Configure uptime monitoring
   - Set up log aggregation
   - Configure alerting

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
