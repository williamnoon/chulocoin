# ChuloBots Backend API

Node.js + TypeScript REST API server for ChuloBots network.

## Features

- Express.js web framework
- TypeScript for type safety
- Security middleware (Helmet, CORS)
- Request logging with Morgan
- Error handling middleware
- Health check endpoints

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp ../.env.example ../.env
# Edit .env with your configuration

# Run development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

## API Endpoints

### Health & Status

- `GET /api/health` - Health check
- `GET /api/status` - System status

### Signals (Coming Soon)

- `POST /api/signals/submit` - Submit new signal
- `GET /api/signals/feed` - Get validated signals
- `GET /api/signals/:id` - Get signal details

### Users (Coming Soon)

- `POST /api/users/connect` - Connect wallet
- `GET /api/users/positions` - Get active positions
- `POST /api/users/settings` - Update bot preferences

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models (Prisma)
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Entry point
├── package.json
└── tsconfig.json
```

## Environment Variables

See `.env.example` in the project root for required environment variables.

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```
