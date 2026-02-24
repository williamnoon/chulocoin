# ChuloBots Web App

React + TypeScript web application for ChuloBots trading platform.

## Features

- **Dashboard**: Overview of trading activity and performance
- **Signal Feed**: Real-time validated trading signals
- **Positions**: Monitor active and closed positions
- **Bot Settings**: Configure automatic trading preferences
- **Wallet Integration**: Connect MetaMask or WalletConnect

## Tech Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Zustand**: State management
- **TanStack Query**: Data fetching

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run on http://localhost:3002

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (routes)
├── hooks/          # Custom React hooks
├── store/          # Zustand state stores
├── services/       # API services
├── types/          # TypeScript type definitions
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/routes.tsx`
3. Add navigation link in `src/components/Sidebar.tsx`

### State Management

We use Zustand for global state:

```typescript
// Create store
export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      // state and actions
    }),
    { name: 'my-storage' }
  )
);

// Use in component
const { value, setValue } = useMyStore();
```

### API Integration

API calls go through services:

```typescript
// services/api.ts
export const getSignals = async () => {
  const response = await axios.get('/api/signals/feed');
  return response.data;
};

// In component with React Query
const { data, isLoading } = useQuery({
  queryKey: ['signals'],
  queryFn: getSignals,
});
```

## Wallet Integration

Currently supports MetaMask out of the box. For production:

1. Install wagmi + viem for robust Web3 interactions
2. Add WalletConnect for mobile wallet support
3. Consider RainbowKit or ConnectKit for better UI

```bash
npm install wagmi viem @wagmi/core
npm install @rainbow-me/rainbowkit
```

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:3001
VITE_CHAIN_ID=42161  # Arbitrum One
```

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Self-hosted

```bash
npm run build
# Serve the dist/ directory
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## Notes

- This app connects to the backend API at `localhost:3001`
- Wallet connection requires MetaMask browser extension
- For production, add proper error boundaries and loading states
