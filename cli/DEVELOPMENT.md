# ChuloBots CLI Development Guide

## Development Roadmap

### Phase 1: Foundation ✅ COMPLETE

- [x] Project structure with Cargo.toml
- [x] Basic main.rs with TUI loop
- [x] Mining module with state management
- [x] Blockchain module with stubs
- [x] UI module with ratatui rendering
- [x] Unit tests for core logic
- [x] Documentation (README, ARCHITECTURE, QUICKSTART)
- [x] Build scripts for cross-platform

### Phase 2: Blockchain Integration (Next)

- [ ] **ethers-rs Setup**
  - [ ] Add wallet management with private key
  - [ ] Connect to Arbitrum One RPC
  - [ ] Setup provider and signer
  - [ ] Handle connection errors and retries

- [ ] **CHULO Token Integration**
  - [ ] Load contract ABI from artifacts
  - [ ] Connect to deployed CHULO contract
  - [ ] Implement `balanceOf()` call
  - [ ] Implement `transfer()` for claiming rewards
  - [ ] Add gas estimation

- [ ] **Wallet Management**
  - [ ] Secure private key storage (keyring-rs)
  - [ ] Multiple wallet support
  - [ ] Wallet creation/import flow
  - [ ] Address validation

### Phase 3: Backend Connection

- [ ] **WebSocket Client**
  - [ ] Connect to backend WS endpoint
  - [ ] Handle authentication
  - [ ] Subscribe to signal feed
  - [ ] Implement reconnection logic
  - [ ] Handle connection state in UI

- [ ] **Signal Processing**
  - [ ] Receive signals from backend
  - [ ] Validate signal format
  - [ ] Queue signals for processing
  - [ ] Rate limiting based on tier

- [ ] **HTTP API Client**
  - [ ] Implement authentication
  - [ ] Submit validation results
  - [ ] Fetch user statistics
  - [ ] Claim rewards endpoint

### Phase 4: Mining Logic

- [ ] **Validation Algorithm**
  - [ ] Implement signal validation logic
  - [ ] Price verification with oracles
  - [ ] Risk assessment
  - [ ] Confidence scoring

- [ ] **Proof Generation**
  - [ ] Generate validation proof
  - [ ] Sign proof with wallet
  - [ ] Submit to backend
  - [ ] Handle proof rejection

- [ ] **Reward Claiming**
  - [ ] Track unclaimed rewards
  - [ ] Batch claim transactions
  - [ ] Gas optimization
  - [ ] Auto-claim option

### Phase 5: Enhanced UX

- [ ] **Configuration System**
  - [ ] Load from config file
  - [ ] Environment variable override
  - [ ] Interactive setup wizard
  - [ ] Config validation

- [ ] **Advanced UI**
  - [ ] Multiple screens (dashboard, stats, settings)
  - [ ] Signal details view
  - [ ] Performance graphs (ASCII charts)
  - [ ] Alert notifications

- [ ] **Background Mode**
  - [ ] Daemon process
  - [ ] System tray integration
  - [ ] Desktop notifications
  - [ ] Auto-start on boot

### Phase 6: Production Ready

- [ ] **Testing**
  - [ ] Comprehensive integration tests
  - [ ] Testnet testing suite
  - [ ] Load testing
  - [ ] Security audit

- [ ] **Monitoring**
  - [ ] Error tracking
  - [ ] Performance metrics
  - [ ] Health checks
  - [ ] Crash reports

- [ ] **Distribution**
  - [ ] Cross-platform builds (CI/CD)
  - [ ] Code signing
  - [ ] Auto-update mechanism
  - [ ] Package managers (Homebrew, Chocolatey, Snap)

## Code Style Guide

### Rust Conventions

```rust
// Use descriptive names
let mining_engine = MiningEngine::new();

// Prefer explicit error handling
match result {
    Ok(value) => handle_success(value),
    Err(e) => handle_error(e),
}

// Use builder pattern for complex structs
let client = BlockchainClient::builder()
    .rpc_url(rpc)
    .private_key(key)
    .build()?;

// Document public APIs
/// Starts the mining engine
///
/// # Returns
/// * `Ok(())` if mining started successfully
/// * `Err(MiningError)` if engine is already running
pub fn start(&mut self) -> Result<(), MiningError> {
    // ...
}
```

### Error Handling

Use `anyhow` for application errors, custom errors for library code:

```rust
use anyhow::{Result, Context, bail};

fn connect_wallet() -> Result<()> {
    let key = load_private_key()
        .context("Failed to load private key")?;

    if key.is_empty() {
        bail!("Private key is empty");
    }

    Ok(())
}
```

### Async/Await

Use Tokio for all async operations:

```rust
#[tokio::main]
async fn main() -> Result<()> {
    let balance = fetch_balance().await?;
    println!("Balance: {}", balance);
    Ok(())
}

async fn fetch_balance() -> Result<f64> {
    let client = create_client().await?;
    client.get_balance().await
}
```

### Testing

Write tests for all public functions:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mining_starts_paused() {
        let engine = MiningEngine::new();
        assert_eq!(engine.status(), MiningStatus::Paused);
    }

    #[tokio::test]
    async fn test_fetch_balance() {
        let mut client = BlockchainClient::new();
        client.connect("test_key").await.unwrap();
        let balance = client.fetch_balance().await.unwrap();
        assert!(balance >= 0.0);
    }
}
```

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone repository
git clone https://github.com/chulobots/chulobots.git
cd chulobots/cli

# Install Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install development tools
cargo install cargo-watch  # Auto-reload
cargo install cargo-edit   # Manage dependencies
cargo install cargo-audit  # Security audit

# Setup git hooks
echo "cargo fmt && cargo clippy" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 2. Daily Development

```bash
# Start with a clean check
cargo check

# Run tests
cargo test

# Format code
cargo fmt

# Lint code
cargo clippy

# Run in watch mode
cargo watch -x run

# Run with logging
RUST_LOG=debug cargo run
```

### 3. Before Committing

```bash
# Format code
cargo fmt

# Run linter
cargo clippy -- -D warnings

# Run tests
cargo test

# Check for security issues
cargo audit

# Build release (smoke test)
cargo build --release
```

### 4. Creating a PR

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push and create PR
4. Ensure CI passes
5. Request review

## Debugging

### Logging

Use `tracing` for structured logging:

```rust
use tracing::{info, warn, error, debug, trace};

// Different log levels
trace!("Very detailed information");
debug!("Debug information: {}", value);
info!("General information");
warn!("Warning: {}", message);
error!("Error occurred: {:?}", err);

// Structured fields
info!(
    balance = %balance,
    tier = %tier,
    "Wallet connected successfully"
);
```

Set log level with environment variable:

```bash
RUST_LOG=debug cargo run
RUST_LOG=chulobots_cli=trace cargo run
```

### Debugging UI

```rust
// In ui/mod.rs, add debug info
let debug_info = Paragraph::new(format!(
    "Debug: signals={} rate={:.2}",
    stats.signals_processed,
    validation_rate
));
```

### Debugging Tests

```bash
# Run single test with output
cargo test test_name -- --nocapture

# Run tests with logging
RUST_LOG=debug cargo test -- --nocapture

# Run test in debugger (with rust-gdb or lldb)
rust-gdb target/debug/deps/chulobots_cli-*
```

## Performance Optimization

### Profiling

```bash
# Install flamegraph
cargo install flamegraph

# Generate flamegraph
cargo flamegraph

# Profile with perf (Linux)
perf record -g cargo run --release
perf report
```

### Benchmarking

Add benchmarks in `benches/`:

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark_validation(c: &mut Criterion) {
    c.bench_function("validate_signal", |b| {
        b.iter(|| validate_signal(black_box(&signal)));
    });
}

criterion_group!(benches, benchmark_validation);
criterion_main!(benches);
```

Run benchmarks:

```bash
cargo bench
```

## Security Considerations

### Private Key Handling

```rust
// ❌ BAD: Logging private keys
error!("Failed with key: {}", private_key);

// ✅ GOOD: No private key in logs
error!("Failed to connect wallet");

// ✅ GOOD: Use zeroize for sensitive data
use zeroize::Zeroize;

struct Wallet {
    #[zeroize(drop)]
    private_key: String,
}
```

### Input Validation

```rust
// Validate all user input
fn validate_private_key(key: &str) -> Result<()> {
    if key.len() != 64 {
        bail!("Invalid key length");
    }
    if !key.chars().all(|c| c.is_ascii_hexdigit()) {
        bail!("Invalid hex characters");
    }
    Ok(())
}
```

### Dependency Audit

```bash
# Regular security audits
cargo audit

# Check for outdated dependencies
cargo outdated
```

## Resources

### Rust Learning
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Rustlings](https://github.com/rust-lang/rustlings)

### Libraries
- [Ratatui Docs](https://ratatui.rs/)
- [ethers-rs Book](https://gakonst.com/ethers-rs/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [Serde Guide](https://serde.rs/)

### Tools
- [Rust Analyzer](https://rust-analyzer.github.io/) - IDE support
- [Clippy](https://github.com/rust-lang/rust-clippy) - Linter
- [cargo-watch](https://github.com/watchexec/cargo-watch) - Auto-reload
- [cargo-edit](https://github.com/killercup/cargo-edit) - Dependency management

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord**: Real-time chat with the team
- **Documentation**: Check docs.chulobots.com
- **Code Review**: Request review on PRs

## License

All code is proprietary. By contributing, you agree that your contributions will be licensed under the same terms.
