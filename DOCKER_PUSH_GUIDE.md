# Docker Hub Push Guide

Quick guide for building and pushing ChuloBots images to Docker Hub.

## Prerequisites

1. **Docker Hub Account**: Sign up at https://hub.docker.com
2. **Login to Docker**:
   ```bash
   docker login
   # Enter username: willnoon
   # Enter password: <your-docker-hub-token>
   ```

## Quick Start

### Option 1: Use the Build Script (Recommended)

```bash
# Build and push staging images with version v1.0.0
./docker-build-push.sh staging v1.0.0

# Build and push production images
./docker-build-push.sh production v1.0.0

# Build with latest tag
./docker-build-push.sh staging latest
```

### Option 2: Manual Build and Push

```bash
# Set variables
DOCKER_USERNAME=willnoon
ENVIRONMENT=staging
VERSION=v1.0.0

# Build backend
docker build -t ${DOCKER_USERNAME}/chulobots-backend:${ENVIRONMENT}-${VERSION} ./backend
docker push ${DOCKER_USERNAME}/chulobots-backend:${ENVIRONMENT}-${VERSION}

# Build webapp
docker build -t ${DOCKER_USERNAME}/chulobots-webapp:${ENVIRONMENT}-${VERSION} ./frontend/webapp
docker push ${DOCKER_USERNAME}/chulobots-webapp:${ENVIRONMENT}-${VERSION}

# Build landing
docker build -t ${DOCKER_USERNAME}/chulobots-landing:${ENVIRONMENT}-${VERSION} ./frontend/landing
docker push ${DOCKER_USERNAME}/chulobots-landing:${ENVIRONMENT}-${VERSION}
```

## Image Tags

The build script creates two tags for each image:

1. **Versioned tag**: `willnoon/chulobots-backend:staging-v1.0.0`
2. **Latest tag**: `willnoon/chulobots-backend:staging-latest`

### Tag Structure

```
<username>/<service>:<environment>-<version>

Examples:
- willnoon/chulobots-backend:staging-v1.0.0
- willnoon/chulobots-backend:staging-latest
- willnoon/chulobots-webapp:production-v2.1.5
- willnoon/chulobots-landing:production-latest
```

## Deploy from Docker Hub

### 1. Configure Environment

```bash
# Copy and edit environment file
cp .env.staging.example .env.staging
nano .env.staging
```

Edit these key values:
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `ARBISCAN_API_KEY`
- Contract addresses (after deployment)
- Frontend URLs

### 2. Pull and Deploy

```bash
# Load environment variables
export $(cat .env.staging | grep -v '^#' | xargs)

# Pull latest images
docker-compose -f docker-compose.deploy.yml pull

# Start services
docker-compose -f docker-compose.deploy.yml up -d

# Check status
docker-compose -f docker-compose.deploy.yml ps

# View logs
docker-compose -f docker-compose.deploy.yml logs -f
```

### 3. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Check webapp
curl http://localhost:80

# Check database
docker-compose -f docker-compose.deploy.yml exec postgres pg_isready
```

## Update Deployment

When you push new images:

```bash
# Pull new images
docker-compose -f docker-compose.deploy.yml pull

# Restart with new images (zero downtime)
docker-compose -f docker-compose.deploy.yml up -d

# Or force recreate
docker-compose -f docker-compose.deploy.yml up -d --force-recreate
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build and push images
        run: |
          export DOCKER_USERNAME=${{ secrets.DOCKER_USERNAME }}
          ./docker-build-push.sh staging ${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/chulobots
            docker-compose -f docker-compose.deploy.yml pull
            docker-compose -f docker-compose.deploy.yml up -d
```

## Docker Hub Repository Setup

### Create Repositories

1. Go to https://hub.docker.com
2. Click "Create Repository"
3. Create these repositories:
   - `willnoon/chulobots-backend`
   - `willnoon/chulobots-webapp`
   - `willnoon/chulobots-landing`
4. Set visibility (Public or Private)
5. Add description

### Generate Access Token

1. Go to Account Settings → Security
2. Click "New Access Token"
3. Name: "GitHub Actions Deploy"
4. Permissions: Read, Write, Delete
5. Copy token (save securely!)

Add to GitHub Secrets:
- `DOCKER_USERNAME`: willnoon
- `DOCKER_TOKEN`: <your-access-token>

## Troubleshooting

### Authentication Failed

```bash
# Logout and login again
docker logout
docker login

# Or use token
echo $DOCKER_TOKEN | docker login -u willnoon --password-stdin
```

### Image Not Found

```bash
# Check if image exists on Docker Hub
docker search willnoon/chulobots-backend

# Or visit: https://hub.docker.com/r/willnoon/chulobots-backend
```

### Pull Rate Limit

Docker Hub has rate limits. If you hit them:

```bash
# Login to increase limit
docker login

# Or wait (anonymous: 100 pulls/6h, authenticated: 200 pulls/6h)
```

### Image Size Too Large

```bash
# Check image size
docker images | grep chulobots

# Optimize Dockerfile:
# - Use multi-stage builds (already done)
# - Minimize layers
# - Use .dockerignore (already done)
# - Use alpine base images (already done)
```

## Best Practices

1. **Version Everything**: Use semantic versioning (v1.0.0, v1.0.1, etc.)
2. **Tag Latest**: Always maintain a `-latest` tag for each environment
3. **Separate Environments**: Use different tags for staging vs production
4. **Automate**: Use CI/CD to build and push on every merge
5. **Scan Images**: Use `docker scan` or Docker Hub scanning
6. **Keep Images Small**: Current sizes should be:
   - Backend: ~200MB
   - Webapp: ~50MB (nginx)
   - Landing: ~150MB

## Manual Tag Management

```bash
# Tag existing image
docker tag willnoon/chulobots-backend:staging-v1.0.0 willnoon/chulobots-backend:staging-latest

# Push specific tag
docker push willnoon/chulobots-backend:staging-latest

# Delete tag (from local)
docker rmi willnoon/chulobots-backend:staging-v1.0.0

# Delete from Docker Hub (requires API or web UI)
```

## Cost Considerations

- **Docker Hub Free**: 1 private repo, unlimited public repos
- **Pro ($5/month)**: Unlimited private repos, more bandwidth
- **Team ($7/user/month)**: Team management features

For staging, public repos are fine. For production, consider private repos.

---

**Related Documentation:**
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete Docker setup guide
- [docker-compose.deploy.yml](./docker-compose.deploy.yml) - Deployment configuration
- [.env.staging.example](./.env.staging.example) - Environment configuration template
