# Multi-stage build for ChuloBots Validator Node
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    && pip3 install --no-cache-dir \
        numpy \
        pandas \
        ta-lib

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create data and logs directories
RUN mkdir -p /app/data /app/logs \
    && chown -R node:node /app

# Run as non-root user
USER node

# Expose ports
EXPOSE 3001 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start validator
CMD ["node", "dist/index.js"]
