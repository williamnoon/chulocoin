#!/bin/bash
# Build script for ChuloBots CLI

set -e

echo "Building ChuloBots CLI..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust is not installed."
    echo "Please install Rust from https://rustup.rs/"
    exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
cargo clean

# Build in release mode
echo "Building release binary..."
cargo build --release

# Get binary size
if [ -f "target/release/chulobots" ]; then
    SIZE=$(du -h target/release/chulobots | cut -f1)
    echo "Build successful! Binary size: $SIZE"
    echo "Binary location: target/release/chulobots"
    echo ""
    echo "Run with: ./target/release/chulobots"
elif [ -f "target/release/chulobots.exe" ]; then
    SIZE=$(du -h target/release/chulobots.exe | cut -f1)
    echo "Build successful! Binary size: $SIZE"
    echo "Binary location: target/release/chulobots.exe"
    echo ""
    echo "Run with: .\\target\\release\\chulobots.exe"
else
    echo "Error: Build completed but binary not found"
    exit 1
fi
