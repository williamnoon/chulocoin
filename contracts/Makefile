# ChuloBots Contracts Makefile
# Provides convenient shortcuts for Foundry + Hardhat commands

.PHONY: help install build test clean deploy

# Default target
help:
	@echo "ChuloBots Contracts - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install dependencies (npm + forge)"
	@echo "  make setup            Complete setup with forge-std"
	@echo ""
	@echo "Build:"
	@echo "  make build            Build with both Hardhat and Foundry"
	@echo "  make build-hardhat    Build with Hardhat only"
	@echo "  make build-forge      Build with Foundry only"
	@echo ""
	@echo "Test:"
	@echo "  make test             Run Hardhat tests"
	@echo "  make test-forge       Run Foundry tests"
	@echo "  make test-all         Run both test suites"
	@echo "  make test-forge-v     Run Foundry tests with verbose output"
	@echo "  make test-gas         Run Foundry tests with gas report"
	@echo "  make coverage         Run Hardhat coverage"
	@echo "  make coverage-forge   Run Foundry coverage"
	@echo ""
	@echo "Deploy:"
	@echo "  make deploy-testnet   Deploy with Hardhat to testnet"
	@echo "  make deploy-sepolia   Deploy with Foundry to Arbitrum Sepolia"
	@echo "  make deploy-mainnet   Deploy with Foundry to Arbitrum One"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            Clean build artifacts"
	@echo "  make snapshot         Create Foundry gas snapshot"
	@echo "  make snapshot-diff    Compare against gas snapshot"
	@echo "  make lint             Run Solhint linter"
	@echo ""

# Setup
install:
	npm install

setup: install
	@if [ ! -d "lib/forge-std" ]; then \
		echo "Installing forge-std..."; \
		forge install foundry-rs/forge-std --no-commit; \
	else \
		echo "forge-std already installed"; \
	fi
	@echo "Setup complete!"

# Build
build:
	npm run build

build-hardhat:
	npx hardhat compile

build-forge:
	forge build

# Test
test:
	npm test

test-forge:
	forge test

test-all:
	npm run test:all

test-forge-v:
	forge test -vvv

test-gas:
	forge test --gas-report

coverage:
	npm run test:coverage

coverage-forge:
	forge coverage

# Deploy
deploy-testnet:
	npm run deploy:testnet

deploy-sepolia:
	npm run deploy:forge:sepolia

deploy-mainnet:
	npm run deploy:forge:mainnet

# Utilities
clean:
	npm run clean

snapshot:
	forge snapshot

snapshot-diff:
	forge snapshot --diff

lint:
	npm run lint

# Format
fmt:
	forge fmt

fmt-check:
	forge fmt --check
