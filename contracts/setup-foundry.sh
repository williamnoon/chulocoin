#!/bin/bash

# ChuloBots Foundry Setup Script
# This script initializes Foundry dependencies for the hybrid Hardhat + Foundry setup

set -e

echo "==================================="
echo "ChuloBots Foundry Setup"
echo "==================================="
echo ""

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "Error: Foundry is not installed."
    echo "Please install Foundry first:"
    echo "  curl -L https://foundry.paradigm.xyz | bash"
    echo "  foundryup"
    exit 1
fi

echo "✓ Foundry detected: $(forge --version | head -n 1)"
echo ""

# Install forge-std
echo "Installing forge-std library..."
if [ -d "lib/forge-std" ]; then
    echo "✓ forge-std already installed"
else
    forge install foundry-rs/forge-std --no-commit
    echo "✓ forge-std installed"
fi
echo ""

# Install node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
    echo "✓ npm dependencies installed"
else
    echo "✓ npm dependencies already installed"
fi
echo ""

# Build contracts with both tools
echo "Building contracts..."
echo "  - Hardhat compile..."
npx hardhat compile > /dev/null 2>&1 && echo "    ✓ Hardhat build complete"

echo "  - Foundry build..."
forge build > /dev/null 2>&1 && echo "    ✓ Foundry build complete"
echo ""

# Run a quick test
echo "Running quick test..."
echo "  - Foundry test..."
forge test --summary > /dev/null 2>&1 && echo "    ✓ Tests passed"
echo ""

echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Quick Commands:"
echo "  npm run build           - Build with both Hardhat & Foundry"
echo "  npm test               - Run Hardhat tests"
echo "  npm run test:forge     - Run Foundry tests"
echo "  npm run test:all       - Run all tests"
echo ""
echo "See FOUNDRY.md for complete documentation."
echo ""
