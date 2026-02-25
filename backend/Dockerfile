# Backend Dockerfile for ChuloBots API
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# Copy root package files for monorepo (including lock file!)
COPY package*.json package-lock.json /app/
COPY backend/package*.json /app/backend/

# Install ALL dependencies (including dev deps for building)
WORKDIR /app/backend
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY package*.json ./

# Generate Prisma Client
WORKDIR /app/backend
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Reinstall production-only dependencies
FROM base AS prod-deps
COPY package*.json package-lock.json /app/
COPY backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy necessary files from backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=prod-deps /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/prisma ./prisma

# Set ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
