# ChuloBots Bot Executor - Trading Automation Service
FROM node:20-alpine as builder

# Copy root package files for monorepo (including lock file!)
COPY package*.json package-lock.json /app/
COPY bot-executor/package*.json /app/bot-executor/

# Install ALL dependencies (including dev deps for building)
WORKDIR /app/bot-executor
RUN npm ci

# Copy source code
COPY bot-executor/src ./src
COPY bot-executor/tsconfig.json ./tsconfig.json

# Build TypeScript
RUN npm run build

# Install production dependencies only (for runtime)
FROM node:20-alpine as prod-deps
COPY package*.json package-lock.json /app/
COPY bot-executor/package*.json /app/bot-executor/
WORKDIR /app/bot-executor
RUN npm ci --only=production

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built app from builder
COPY --from=builder /app/bot-executor/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/bot-executor/package*.json ./

# Create non-root user
RUN addgroup -g 1000 chulobots && \
    adduser -D -u 1000 -G chulobots chulobots && \
    chown -R chulobots:chulobots /app

USER chulobots

# Environment variables
ENV NODE_ENV=production \
    PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the bot executor
CMD ["node", "dist/index.js"]
