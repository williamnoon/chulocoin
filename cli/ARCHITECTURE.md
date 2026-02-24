# ChuloBots CLI Architecture

## Overview

The ChuloBots CLI is a Rust-based terminal application that enables users to participate in the decentralized trading signal validation network. It provides a minimal, focused UI for mining operations while handling blockchain interactions in the background.

## Technology Stack

- **Language**: Rust (Edition 2021)
- **Async Runtime**: Tokio
- **Terminal UI**: ratatui + crossterm
- **Blockchain**: ethers-rs
- **Networking**: reqwest + tokio-tungstenite
- **Serialization**: serde + serde_json
- **Logging**: tracing + tracing-subscriber

## Project Structure

```
cli/
├── Cargo.toml              # Project configuration and dependencies
├── src/
│   ├── main.rs             # Entry point, TUI event loop
│   ├── lib.rs              # Library exports
│   ├── mining/
│   │   └── mod.rs          # Mining engine implementation
│   ├── blockchain/
│   │   └── mod.rs          # Blockchain client
│   └── ui/
│       └── mod.rs          # Terminal UI rendering
├── README.md               # User documentation
├── ARCHITECTURE.md         # This file
└── .gitignore              # Git ignore rules
```

## Core Components

### 1. Main Application (`main.rs`)

The main application orchestrates the TUI event loop and state management.

**Responsibilities:**
- Initialize the terminal and async runtime
- Create and manage the `App` state
- Handle keyboard events (Q=quit, S=start/stop, R=refresh)
- Call `on_tick()` to update mining state
- Render UI on each frame

**Key Structs:**
- `App`: Main application state container
  - `mining_engine`: Mining operations
  - `blockchain_client`: Wallet and contract interactions
  - `should_quit`: Exit flag

### 2. Mining Engine (`mining/mod.rs`)

Handles all mining-related logic and state.

**Responsibilities:**
- Start/stop/toggle mining operations
- Track mining statistics (signals processed, validated, rejected)
- Calculate uptime
- Track earnings (daily and total)
- Update state on each tick

**Key Structs:**
- `MiningEngine`: Main mining coordinator
- `MiningStatus`: Active or Paused
- `MiningStats`: Statistics tracking

**Future Enhancements:**
- WebSocket connection to backend for real signals
- Signal validation algorithm
- Proof-of-validation submission
- Reward claiming

### 3. Blockchain Client (`blockchain/mod.rs`)

Manages wallet connection and smart contract interactions.

**Responsibilities:**
- Connect to Arbitrum One via RPC
- Fetch CHULO balance from ERC-20 contract
- Calculate tier based on balance
- Track wallet information

**Key Structs:**
- `BlockchainClient`: Main blockchain interface
- `WalletInfo`: Wallet address, balance, tier

**Future Enhancements:**
- ethers-rs integration for real contract calls
- Transaction signing and submission
- Gas price estimation
- Multi-chain support (Base testnet)

### 4. UI Module (`ui/mod.rs`)

Renders the terminal user interface using ratatui.

**Layout:**
```
┌─────────────────────────────────────┐
│       ChuloBots CLI v0.1.0         │
├─────────────────────────────────────┤
│          ● MINING ACTIVE            │
│        Uptime: 00:15:23             │
├─────────────────────────────────────┤
│  Address: 0x742d35Cc663...         │
│  CHULO Balance: 1500.00             │
│  Tier: Builder                      │
├─────────────────────────────────────┤
│  Signals Processed: 45              │
│  Validated: 36 | Rejected: 9        │
│  Earnings Today: 18.00 CHULO        │
│  Total Earnings: 145.50 CHULO       │
├─────────────────────────────────────┤
│   [S] Start/Stop [R] Refresh [Q] Quit │
└─────────────────────────────────────┘
```

**Components:**
- `render_header()`: App title and version
- `render_status()`: Mining status indicator
- `render_wallet_info()`: Wallet details
- `render_mining_stats()`: Performance metrics
- `render_controls()`: Keyboard shortcuts

**Color Scheme:**
- Cyan: Primary accent (headers, keys)
- Green: Positive values (active, earnings, validated)
- Yellow: Warning/neutral (paused, balance)
- Red: Negative values (rejected, quit)
- Gray: Disabled/secondary text

## Data Flow

```
User Input (Keyboard)
    ↓
Event Handler (main.rs)
    ↓
App State Update
    ↓
├─→ Mining Engine
│   ├─→ Update uptime
│   ├─→ Process signals (future)
│   └─→ Update stats
│
└─→ Blockchain Client
    ├─→ Fetch balance (on refresh)
    └─→ Update tier
    ↓
UI Rendering (ui/mod.rs)
    ↓
Terminal Display
```

## Performance Considerations

### Optimization Targets

1. **Binary Size**: Stripped release builds with LTO
   - Target: < 5MB
   - Current: TBD (needs measurement)

2. **Startup Time**: Fast initialization
   - Target: < 500ms
   - No blocking network calls on startup

3. **CPU Usage**: Minimal idle consumption
   - Event polling with 100ms timeout
   - No busy loops

4. **Memory Usage**: Lean footprint
   - Target: < 20MB RAM
   - No unbounded collections

### Build Configuration

```toml
[profile.release]
strip = true          # Remove debug symbols
opt-level = "z"       # Optimize for size
lto = true           # Link-time optimization
codegen-units = 1    # Single codegen unit for max optimization
```

## Security Considerations

### Private Key Management

**Current (Stub):**
- Environment variable: `CHULOBOTS_PRIVATE_KEY`
- Config file: `~/.chulobots/config.toml`

**Future (Production):**
- System keyring integration (keyring-rs)
- Hardware wallet support (Ledger, Trezor)
- Encrypted local storage
- Memory protection (zeroize crate)

### Network Security

- TLS/SSL for all HTTP connections
- WebSocket secure (wss://)
- RPC endpoint validation
- Rate limiting on client side

### Input Validation

- All user input sanitized
- Private key format validation
- Network responses verified
- Contract address checksums

## Testing Strategy

### Unit Tests

Each module has comprehensive unit tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mining_engine_toggle() {
        let mut engine = MiningEngine::new();
        assert_eq!(engine.status(), MiningStatus::Paused);
        engine.toggle();
        assert_eq!(engine.status(), MiningStatus::Active);
    }
}
```

**Coverage Targets:**
- Core logic: 90%+
- UI rendering: 70%+
- Error handling: 100%

### Integration Tests

Future additions:

- End-to-end mining flow
- Blockchain interaction tests (testnet)
- WebSocket connection tests
- Configuration loading tests

### Manual Testing

Platform-specific testing:

- Windows 10/11
- macOS (Intel + Apple Silicon)
- Linux (Ubuntu, Fedora, Arch)

## Deployment

### Build Process

```bash
# Cross-compilation targets
cargo build --release --target x86_64-unknown-linux-gnu
cargo build --release --target x86_64-pc-windows-gnu
cargo build --release --target x86_64-apple-darwin
cargo build --release --target aarch64-apple-darwin
```

### Distribution

- GitHub Releases with binaries
- Homebrew tap (macOS)
- Chocolatey package (Windows)
- Snap/Flatpak (Linux)

### Auto-updates

Future feature:

- Self-update mechanism
- Version checking on startup
- Optional automatic downloads
- Rollback capability

## Monitoring & Telemetry

### Logging

Structured logging with tracing:

```rust
use tracing::{info, warn, error, debug};

info!("Mining started");
warn!("Low balance: {}", balance);
error!("RPC connection failed: {}", err);
debug!("Processing signal: {:?}", signal);
```

### Metrics (Future)

Optional telemetry:

- Uptime
- Signals processed
- Validation rate
- Error rate
- Performance metrics

**Privacy:**
- Opt-in only
- Anonymous by default
- No PII collected

## Future Enhancements

### Phase 1 (Current)
- [x] Basic TUI structure
- [x] Mining state management
- [x] Stub blockchain client
- [x] UI rendering

### Phase 2 (Next)
- [ ] Real blockchain integration (ethers-rs)
- [ ] WebSocket connection to backend
- [ ] Signal validation logic
- [ ] Reward claiming

### Phase 3
- [ ] Background daemon mode
- [ ] System tray integration
- [ ] Notifications
- [ ] Configuration UI

### Phase 4
- [ ] Advanced statistics
- [ ] Strategy selection
- [ ] Performance analytics
- [ ] Multi-wallet support

## References

- [Ratatui Documentation](https://ratatui.rs)
- [ethers-rs Documentation](https://docs.rs/ethers)
- [Tokio Documentation](https://tokio.rs)
- [Rust Async Book](https://rust-lang.github.io/async-book/)
