# ChuloBots CLI

The official ChuloBots mining tool for signal validation. Run this CLI to validate trading signals, earn CHULO tokens, and contribute to the decentralized network.

## Features

- **Minimal Terminal UI**: Clean, focused interface showing mining stats
- **Real-time Stats**: Track signals processed, validation rate, and earnings
- **Background Mining**: Auto-run mining operations
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Blockchain Integration**: Connect to Arbitrum One via ethers-rs
- **Tier-based Access**: Automatic tier detection based on CHULO balance

## Requirements

- Rust 1.70+
- An Ethereum wallet with CHULO tokens (optional for Free tier)
- Internet connection

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/chulobots/chulobots.git
cd chulobots/cli

# Build release binary
cargo build --release

# Run
./target/release/chulobots
```

### Pre-built Binaries

Download the latest release for your platform:

- [Windows (x64)](https://github.com/chulobots/chulobots/releases)
- [macOS (Intel)](https://github.com/chulobots/chulobots/releases)
- [macOS (Apple Silicon)](https://github.com/chulobots/chulobots/releases)
- [Linux (x64)](https://github.com/chulobots/chulobots/releases)

## Usage

### Basic Usage

```bash
# Run the CLI
chulobots

# The UI will launch and show:
# - Mining status (Active/Paused)
# - Your wallet address and CHULO balance
# - Current tier
# - Mining statistics
# - Earnings
```

### Controls

- **S** - Start/Stop mining
- **R** - Refresh wallet balance
- **Q** - Quit application

### Wallet Setup

On first run, you'll be prompted to connect your wallet:

```bash
# Set your private key (stored securely in keyring)
export CHULOBOTS_PRIVATE_KEY="your-private-key"

# Or use a configuration file
echo "private_key = \"your-private-key\"" > ~/.chulobots/config.toml
```

## Tiers

Your tier is automatically detected based on CHULO balance:

| Tier    | CHULO Required | Signals/Day |
| ------- | -------------- | ----------- |
| Free    | 0              | 10          |
| Starter | 100            | 50          |
| Builder | 1,000          | 200         |
| Pro     | 10,000         | 1,000       |
| Whale   | 50,000         | Unlimited   |

## Architecture

```
cli/
├── src/
│   ├── main.rs          # Entry point, TUI loop
│   ├── lib.rs           # Library exports
│   ├── mining/          # Mining engine
│   │   └── mod.rs       # State, stats, validation logic
│   ├── blockchain/      # Blockchain interaction
│   │   └── mod.rs       # Wallet, contracts, balance
│   └── ui/              # Terminal UI
│       └── mod.rs       # Rendering logic
├── Cargo.toml           # Dependencies
└── README.md
```

## Development

### Building

```bash
# Debug build
cargo build

# Release build (optimized)
cargo build --release
```

### Testing

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_mining_engine_toggle
```

### Running in Development

```bash
# Run with cargo
cargo run

# Run with logging
RUST_LOG=debug cargo run
```

## Configuration

Configuration is stored in:

- **Linux/macOS**: `~/.config/chulobots/config.toml`
- **Windows**: `%APPDATA%\chulobots\config.toml`

Example config:

```toml
[wallet]
private_key = "your-private-key"

[network]
rpc_url = "https://arb1.arbitrum.io/rpc"
chulo_contract = "0x..."

[mining]
auto_start = true
validation_threshold = 0.8
```

## Troubleshooting

### "Wallet not connected"

Ensure you've set your private key via environment variable or config file.

### "RPC connection failed"

Check your internet connection and verify the RPC endpoint is accessible.

### Low mining rewards

Upgrade your tier by holding more CHULO tokens to access more signals per day.

## Security

- Private keys are stored securely using the system keyring
- Never share your private key or config file
- The CLI never sends your private key over the network
- All blockchain interactions are signed locally

## License

Proprietary - All rights reserved

## Support

- Documentation: https://docs.chulobots.com
- Discord: https://discord.gg/chulobots
- Email: support@chulobots.com
