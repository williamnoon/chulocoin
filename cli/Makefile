# ChuloBots CLI Makefile
# Common development tasks

.PHONY: help build run test clean fmt lint check install dev watch release

# Default target
help:
	@echo "ChuloBots CLI - Available Commands:"
	@echo ""
	@echo "  make build       - Build debug binary"
	@echo "  make release     - Build optimized release binary"
	@echo "  make run         - Run in debug mode"
	@echo "  make test        - Run all tests"
	@echo "  make check       - Quick compile check"
	@echo "  make fmt         - Format code"
	@echo "  make lint        - Run clippy linter"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make dev         - Run with auto-reload (requires cargo-watch)"
	@echo "  make install     - Install binary to system"
	@echo ""

# Build debug binary
build:
	cargo build

# Build release binary
release:
	@echo "Building optimized release binary..."
	cargo build --release
	@echo "✓ Build complete: target/release/chulobots"

# Run in debug mode
run:
	cargo run

# Run tests
test:
	cargo test

# Run tests with output
test-verbose:
	cargo test -- --nocapture

# Quick compile check
check:
	cargo check

# Format code
fmt:
	cargo fmt

# Check formatting
fmt-check:
	cargo fmt --check

# Run clippy linter
lint:
	cargo clippy -- -D warnings

# Clean build artifacts
clean:
	cargo clean

# Install binary to system
install:
	cargo install --path .

# Development mode with auto-reload
dev:
	cargo watch -x run

# Watch and run tests
watch:
	cargo watch -x test

# Run with debug logging
debug:
	RUST_LOG=debug cargo run

# Run with trace logging
trace:
	RUST_LOG=trace cargo run

# Security audit
audit:
	cargo audit

# Update dependencies
update:
	cargo update

# Cross-platform builds
build-linux:
	cargo build --release --target x86_64-unknown-linux-gnu

build-macos:
	cargo build --release --target x86_64-apple-darwin

build-macos-arm:
	cargo build --release --target aarch64-apple-darwin

build-windows:
	cargo build --release --target x86_64-pc-windows-gnu

# All cross-platform builds
build-all: build-linux build-macos build-macos-arm build-windows
	@echo "✓ All platform builds complete"

# Pre-commit checks
pre-commit: fmt lint test
	@echo "✓ All pre-commit checks passed"

# Full CI pipeline
ci: fmt-check lint test build
	@echo "✓ CI pipeline complete"
