# ChuloBots CLI - Quick Start Guide

Get the CLI running in under 5 minutes.

## Prerequisites

You need Rust installed. If you don't have it:

```bash
# Install Rust (all platforms)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# On Windows, download from: https://rustup.rs/
```

Verify installation:

```bash
rustc --version  # Should show: rustc 1.70+ (or higher)
cargo --version  # Should show: cargo 1.70+ (or higher)
```

## Build and Run

### Option 1: Quick Build (Development)

```bash
cd cli/
cargo run
```

This builds in debug mode (faster compilation, slower runtime).

### Option 2: Optimized Build (Production)

```bash
cd cli/
cargo build --release
./target/release/chulobots
```

This builds in release mode (slower compilation, faster runtime).

### Option 3: Use Build Scripts

**macOS/Linux:**
```bash
cd cli/
chmod +x build.sh
./build.sh
./target/release/chulobots
```

**Windows:**
```bash
cd cli
build.bat
target\release\chulobots.exe
```

## First Run

When you run the CLI, you'll see a terminal UI like this:

```
┌──────────────────────────────────────────────┐
│         ChuloBots CLI v0.1.0                 │
├──────────────────────────────────────────────┤
│              ○ PAUSED                        │
│           Uptime: 00:00:00                   │
├──────────────────────────────────────────────┤
│  Address: Not Connected                      │
│  CHULO Balance: 0.00                         │
│  Tier: Free                                  │
├──────────────────────────────────────────────┤
│  Signals Processed: 0                        │
│  Validated: 0 | Rejected: 0 | Rate: 0.0%    │
│  Earnings Today: 0.00 CHULO                  │
│  Total Earnings: 0.00 CHULO                  │
├──────────────────────────────────────────────┤
│  [S] Start/Stop [R] Refresh [Q] Quit        │
└──────────────────────────────────────────────┘
```

## Controls

- **S** - Toggle mining (Start/Stop)
- **R** - Refresh wallet balance
- **Q** - Quit application

## Testing

Run the test suite:

```bash
cargo test
```

Run tests with output:

```bash
cargo test -- --nocapture
```

Run a specific test:

```bash
cargo test test_mining_engine_toggle
```

## Development Commands

```bash
# Check code without building
cargo check

# Format code
cargo fmt

# Lint code
cargo clippy

# Watch and auto-reload (requires cargo-watch)
cargo install cargo-watch
cargo watch -x run
```

## Project Structure

```
cli/
├── Cargo.toml           # Dependencies and project config
├── src/
│   ├── main.rs          # Entry point and TUI loop
│   ├── lib.rs           # Library exports
│   ├── mining/
│   │   └── mod.rs       # Mining engine
│   ├── blockchain/
│   │   └── mod.rs       # Blockchain client
│   └── ui/
│       └── mod.rs       # Terminal UI
├── README.md            # User documentation
├── ARCHITECTURE.md      # Technical architecture
└── QUICKSTART.md        # This file
```

## Current Status

This is **Phase 1** - the foundation:

✅ **Working:**
- Terminal UI with live updates
- Mining state management (start/stop/toggle)
- Statistics tracking (signals, earnings, uptime)
- Wallet info display
- Tier calculation logic
- Keyboard controls

🚧 **Stubbed (for later):**
- Blockchain integration (ethers-rs)
- WebSocket connection to backend
- Real signal processing
- Reward claiming

## Next Steps

### For Users

Wait for Phase 2 release when blockchain integration is complete.

### For Developers

1. **Review the code** - Start with `src/main.rs`
2. **Run tests** - `cargo test`
3. **Read ARCHITECTURE.md** - Understand the design
4. **Pick a task** - Check Phase 2 enhancements

### Phase 2 Tasks (Coming Soon)

- [ ] Integrate ethers-rs for Arbitrum One
- [ ] Connect to CHULO ERC-20 contract
- [ ] Fetch real wallet balance
- [ ] WebSocket client for backend
- [ ] Signal validation algorithm
- [ ] Proof-of-validation submission

## Troubleshooting

### Build Errors

**"error: linker `cc` not found"**
- Install build tools:
  - macOS: `xcode-select --install`
  - Ubuntu: `sudo apt install build-essential`
  - Fedora: `sudo dnf install gcc`

**"error: failed to run custom build command"**
- Update Rust: `rustup update`

### Runtime Issues

**Terminal rendering issues**
- Ensure terminal supports colors (most do)
- Try a different terminal emulator

**"permission denied" on build.sh**
- Make it executable: `chmod +x build.sh`

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Ratatui Tutorial](https://ratatui.rs/tutorial/)
- [ethers-rs Docs](https://docs.rs/ethers)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)

## Support

- GitHub Issues: https://github.com/chulobots/chulobots/issues
- Discord: https://discord.gg/chulobots
- Docs: https://docs.chulobots.com

## License

Proprietary - All rights reserved
