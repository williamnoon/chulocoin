# Docker Deployment Guide

Complete guide for deploying ChuloBots using Docker Compose.

## Quick Start

```bash
# 1. Copy environment template
cp .env.production.example .env.production

# 2. Edit configuration
nano .env.production

# 3. Pull latest images
docker-compose -f docker-compose.production.yml pull

# 4. Start all services
docker-compose -f docker-compose.production.yml up -d

# 5. Check status
docker-compose -f docker-compose.production.yml ps
```

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **Backend** | 3000 | API server & WebSocket |
| **Bot Executor** | 3001 | Trading automation |
| **Webapp** | 3002 | Trading dashboard (React) |
| **Landing** | 3003 | Marketing site (Next.js) |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Cache & job queue |
| **CLI** | - | Validator/miner (optional) |

## Prerequisites

1. **Docker & Docker Compose**
   ```bash
   docker --version  # Should be 20.10+
   docker-compose --version  # Should be 2.0+
   ```

2. **Domain Names** (for production)
   - `api.yourdomain.com` → Backend (port 3000)
   - `app.yourdomain.com` → Webapp (port 3002)
   - `yourdomain.com` → Landing (port 3003)

3. **SSL Certificates** (use Let's Encrypt + Nginx/Traefik)

## Configuration

### 1. Environment Variables

Copy and edit the environment file:
```bash
cp .env.production.example .env.production
```

**Required variables:**
- `POSTGRES_PASSWORD` - Database password (generate secure password)
- `REDIS_PASSWORD` - Redis password (generate secure password)
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `ARBITRUM_RPC_URL` - Arbitrum RPC endpoint
- `CHULO_TOKEN_ADDRESS` - Deployed CHULO token address
- `SIGNAL_REGISTRY_ADDRESS` - Deployed SignalRegistry address
- `VALIDATOR_STAKING_ADDRESS` - Deployed ValidatorStaking address

**Trading (Bot Executor):**
- `HYPERLIQUID_PRIVATE_KEY` - Trading wallet private key
- `HYPERLIQUID_VAULT_ADDRESS` - Hyperliquid vault address
- `MAX_POSITION_SIZE` - Maximum position size in USD
- `DAILY_LOSS_LIMIT` - Daily loss limit in USD

**Frontend:**
- `API_URL` - Backend API URL (https://api.yourdomain.com)
- `APP_URL` - Frontend URL (https://app.yourdomain.com)
- `CHAIN_ID` - 42161 for Arbitrum mainnet

### 2. Generate Secrets

```bash
# Generate secure passwords
openssl rand -base64 32  # For POSTGRES_PASSWORD
openssl rand -base64 32  # For REDIS_PASSWORD
openssl rand -base64 48  # For JWT_SECRET
```

## Deployment Steps

### Option 1: Production Deployment (Recommended)

```bash
# 1. Pull latest images
docker-compose -f docker-compose.production.yml pull

# 2. Start services
docker-compose -f docker-compose.production.yml up -d

# 3. Run database migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate

# 4. Check logs
docker-compose -f docker-compose.production.yml logs -f

# 5. Verify all services are healthy
docker-compose -f docker-compose.production.yml ps
```

### Option 2: Staging Deployment

```bash
# Use staging images
docker-compose -f docker-compose.production.yml up -d \
  -e IMAGE_TAG=staging-latest
```

## Running a Validator Node

To run a validator/miner, uncomment the `cli` service in `docker-compose.production.yml` and add:

```yaml
cli:
  image: willnoon/chulobots-cli:production-latest
  container_name: chulobots-cli
  restart: unless-stopped
  environment:
    RPC_URL: ${ARBITRUM_RPC_URL}
    WALLET_PRIVATE_KEY: ${VALIDATOR_PRIVATE_KEY}
    API_URL: http://backend:3000
  volumes:
    - ./cli-config:/app/config
  command: ["mine", "--auto"]
```

Then add to `.env.production`:
```bash
VALIDATOR_PRIVATE_KEY=0x...  # Validator wallet private key
```

## Management Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### Update to Latest Version
```bash
# Pull new images
docker-compose -f docker-compose.production.yml pull

# Recreate containers
docker-compose -f docker-compose.production.yml up -d
```

### Stop Services
```bash
# Stop all
docker-compose -f docker-compose.production.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.production.yml down -v
```

### Database Backup
```bash
# Backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U chulobots chulobots > backup.sql

# Restore
cat backup.sql | docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U chulobots chulobots
```

## Health Checks

All services include health checks. Check status:

```bash
docker-compose -f docker-compose.production.yml ps
```

Healthy services show `healthy` in the status column.

### Manual Health Check
```bash
# Backend
curl http://localhost:3000/health

# Bot Executor
curl http://localhost:3001/health

# Webapp
curl http://localhost:3002

# Landing
curl http://localhost:3003
```

## Monitoring

### Resource Usage
```bash
# View resource usage
docker stats

# View logs with timestamps
docker-compose -f docker-compose.production.yml logs -f --timestamps
```

### Troubleshooting

**Container won't start:**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs service-name

# Check if port is already in use
sudo lsof -i :3000
```

**Database connection failed:**
```bash
# Check if PostgreSQL is healthy
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Connect to database
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U chulobots -d chulobots
```

**Redis connection failed:**
```bash
# Check if Redis is running
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

## Nginx Reverse Proxy (Optional)

Example Nginx configuration:

```nginx
# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Web App
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Landing Page
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Best Practices

1. **Use strong passwords** for PostgreSQL, Redis, and JWT secret
2. **Restrict PostgreSQL and Redis ports** - don't expose to public internet
3. **Use SSL/TLS** for all public-facing services
4. **Keep secrets in `.env.production`** - never commit to git
5. **Run behind a reverse proxy** (Nginx, Traefik, Caddy)
6. **Regular backups** of PostgreSQL database
7. **Monitor logs** for suspicious activity
8. **Keep images updated** - pull latest versions regularly

## Performance Tuning

### PostgreSQL
```yaml
environment:
  # Add to postgres service
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
  POSTGRES_MAX_CONNECTIONS: 100
```

### Redis
```yaml
command: >
  redis-server
  --requirepass ${REDIS_PASSWORD}
  --maxmemory 512mb
  --maxmemory-policy allkeys-lru
```

### Backend (Node.js)
```yaml
environment:
  # Add to backend service
  NODE_OPTIONS: "--max-old-space-size=2048"
  WEB_CONCURRENCY: 2
```

## Support

- **Issues**: https://github.com/williamnoon/chulocoin/issues
- **Documentation**: https://docs.chulobots.com
- **Discord**: https://discord.gg/chulobots
