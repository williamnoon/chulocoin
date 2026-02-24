# ChuloBots Network

Decentralized trading signal validation network powered by Chainlink oracles and blockchain consensus.

## Project Structure

```
chulobots/
├── contracts/          # Solidity smart contracts (Arbitrum)
├── backend/           # Node.js + TypeScript API server
├── frontend/
│   ├── landing/       # Next.js landing page
│   └── webapp/        # React web application
├── cli/              # Rust CLI mining tool
└── packages/
    ├── shared/       # Shared utilities
    └── types/        # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- Rust (for CLI development)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development servers
npm run dev
```

## Development

### Available Commands

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

### Workspaces

This is a monorepo managed by Turborepo. Each package has its own:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint rules

## Architecture

See [claude.md](./claude.md) for detailed development guide and architecture documentation.

## Tech Stack

- **Smart Contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma
- **Frontend:** React 18, Next.js 14, TypeScript, Tailwind CSS
- **CLI:** Rust, ratatui
- **Blockchain:** Arbitrum One, Chainlink Oracles
- **Execution:** Hyperliquid, Binance, Coinbase

## License

Proprietary - All rights reserved

## Team

Built with ❤️ by the ChuloBots team
