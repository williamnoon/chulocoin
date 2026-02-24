import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChuloBots - Decentralized Trading Signal Network',
  description:
    'Decentralized signal validation network powered by Chainlink oracles. Mine signals, validate quality, execute automatically.',
  keywords: ['crypto', 'trading', 'signals', 'DeFi', 'blockchain', 'Arbitrum'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
