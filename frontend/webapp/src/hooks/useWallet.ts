import { useWalletStore } from '@/store/walletStore';

/**
 * Hook for wallet connection and management
 *
 * This is a simplified implementation. In production, integrate with:
 * - wagmi + viem for Ethereum interactions
 * - WalletConnect for mobile wallet support
 * - RainbowKit or ConnectKit for UI
 */
export function useWallet() {
  const { address, isConnected, setAddress, setIsConnected, disconnect: storeDisconnect } = useWalletStore();

  const connect = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to connect your wallet');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);

        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            storeDisconnect();
          } else {
            setAddress(newAccounts[0]);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnect = () => {
    storeDisconnect();
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
  };
}

// Extend Window interface for TypeScript
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
