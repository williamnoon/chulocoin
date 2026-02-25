# ChuloBots CLI - Validator/Miner
FROM rust:1.75-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/chulobots-cli /usr/local/bin/chulobots

# Copy config template
COPY config.example.toml /app/config.example.toml

# Create directory for config
RUN mkdir -p /app/config

# Set executable permissions
RUN chmod +x /usr/local/bin/chulobots

# Run as non-root user
RUN useradd -m -u 1000 chulobots && \
    chown -R chulobots:chulobots /app
USER chulobots

# Set config path
ENV CONFIG_PATH=/app/config/config.toml

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD chulobots --version || exit 1

ENTRYPOINT ["chulobots"]
CMD ["mine"]
