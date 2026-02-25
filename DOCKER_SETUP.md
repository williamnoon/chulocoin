# Docker Setup Guide for ChuloBots

This guide explains how to build, test, and deploy ChuloBots using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- 4GB RAM minimum
- 10GB disk space

## Quick Start - Local Development

### 1. Build and Start All Services

```bash
# Build all images and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 2. Access Services

- **WebApp**: http://localhost
- **Landing Page**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

## Production Deployment

### 1. Configure Environment

Create `.env.prod` file:

```bash
# Database
POSTGRES_USER=chulobots
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=chulobots_prod
DATABASE_URL=postgresql://chulobots:<password>@postgres:5432/chulobots_prod

# Redis
REDIS_PASSWORD=<secure-password>
REDIS_URL=redis://:<password>@redis:6379

# Backend
JWT_SECRET=<secure-jwt-secret>
ENCRYPTION_KEY=<32-byte-key>
PORT=3001

# Blockchain
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBISCAN_API_KEY=<your-arbiscan-key>

# Contract Addresses (deploy contracts first)
CHULO_TOKEN_ADDRESS=0x...
SIGNAL_REGISTRY_ADDRESS=0x...
TIER_NFT_ADDRESS=0x...
VALIDATOR_STAKING_ADDRESS=0x...

# Frontend URLs
API_URL=https://api.chulobots.com
APP_URL=https://app.chulobots.com
```

### 2. Deploy with Docker Compose

```bash
# Load environment variables
export $(cat .env.prod | xargs)

# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Run Database Migrations

```bash
# Backend container automatically runs migrations on startup
# To manually run migrations:
docker exec chulobots-backend-prod npx prisma migrate deploy
```

## Testing with Docker

### Run Backend Tests

```bash
# Start test database
docker-compose up postgres redis -d

# Run backend tests
docker-compose run --rm backend npm test

# Run with coverage
docker-compose run --rm backend npm run test:coverage
```

### Run Frontend Tests

```bash
# Build and test webapp
docker-compose run --rm webapp npm test

# Build and test landing page
docker-compose run --rm landing npm test
```

### Run Contract Tests (Foundry)

```bash
# Run Foundry tests
cd contracts
docker run --rm -v $(pwd):/app -w /app ghcr.io/foundry-rs/foundry:latest forge test

# Run with gas reporting
docker run --rm -v $(pwd):/app -w /app ghcr.io/foundry-rs/foundry:latest forge test --gas-report

# Run specific test
docker run --rm -v $(pwd):/app -w /app ghcr.io/foundry-rs/foundry:latest forge test --match-test testUnlockBronzeTier
```

## Docker Image Management

### Build Individual Services

```bash
# Backend
docker build -t chulobots-backend:latest ./backend

# WebApp
docker build -t chulobots-webapp:latest ./frontend/webapp

# Landing
docker build -t chulobots-landing:latest ./frontend/landing
```

### Push to Registry

```bash
# Tag images
docker tag chulobots-backend:latest your-registry/chulobots-backend:v1.0.0
docker tag chulobots-webapp:latest your-registry/chulobots-webapp:v1.0.0
docker tag chulobots-landing:latest your-registry/chulobots-landing:v1.0.0

# Push to registry
docker push your-registry/chulobots-backend:v1.0.0
docker push your-registry/chulobots-webapp:v1.0.0
docker push your-registry/chulobots-landing:v1.0.0
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker ps -a

# Restart specific service
docker-compose restart <service-name>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready

# Access database
docker-compose exec postgres psql -U postgres -d chulobots

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3001

# Change ports in docker-compose.yml
# Example: "3002:3001" instead of "3001:3001"
```

### Out of Disk Space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

## Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:3001/health

# Check webapp
curl http://localhost/

# Check database
docker-compose exec postgres pg_isready
```

## Performance Tuning

### Optimize Build Times

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Cache dependencies
docker-compose build --parallel
```

### Resource Limits

Edit `docker-compose.prod.yml` to adjust resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## Security Best Practices

1. **Never commit `.env.prod` files**
2. **Use Docker secrets for sensitive data**
3. **Run containers as non-root users** (already configured)
4. **Keep images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Scan images for vulnerabilities**:
   ```bash
   docker scout cves chulobots-backend:latest
   ```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/docker-build.yml`:

```yaml
- name: Build Docker images
  run: docker-compose build

- name: Run tests in containers
  run: |
    docker-compose up -d postgres redis
    docker-compose run backend npm test
```

### Automated Deployment

```bash
# Build, tag, and push in CI
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage

```bash
# Container stats
docker stats

# Detailed info
docker-compose top
```

## Backup and Restore

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres chulobots > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres chulobots < backup.sql
```

### Volume Backup

```bash
# Backup volume
docker run --rm -v chulobots_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v chulobots_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

**For production deployment on cloud platforms, see:**

- [Railway Deployment](./RAILWAY_DEPLOYMENT.md)
- [AWS Deployment](./AWS_DEPLOYMENT.md)
- [DigitalOcean Deployment](./DO_DEPLOYMENT.md)
