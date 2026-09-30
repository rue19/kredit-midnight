'use client';

import { network } from '@/config/network';
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

function getCompatibleWallets(): InitialAPI[] {
  if (!window.midnight) return [];
  return Object.values(window.midnight).filter(
    (wallet): wallet is InitialAPI =>
      !!wallet && typeof wallet === 'object' && 'apiVersion' in wallet,
  );
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  connectedApi: ConnectedAPI | null;
  config: Configuration | null;
  error: string | null;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

type WalletStateData = Omit<WalletState, 'connect' | 'disconnect'>;

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletStateData>({
    isConnected: false,
    isConnecting: false,
    address: null,
    connectedApi: null,
    config: null,
    error: null,
    walletName: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const wallets = getCompatibleWallets();
      if (wallets.length === 0) {
        throw new Error(
          'No Midnight wallet detected. Please install the Lace wallet extension ' +
          'and make sure developer mode is enabled in wallet settings.'
        );
      }

      console.log('[Wallet] Detected wallets:', wallets.map((w) => `${w.name} (api ${w.apiVersion})`));
      const wallet = wallets[0];
      let connectedApi: ConnectedAPI;
      try {
        console.log(`[Wallet] Attempting to connect to ${network.id}...`);
        connectedApi = await wallet.connect(network.id);
        console.log('[Wallet] Connected successfully');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Handled below and shown in the UI; warn rather than error so the
        // Next.js dev overlay doesn't treat a refused connection as a crash.
        console.warn('[Wallet] Connection error:', msg);
        if (msg.includes('denied') || msg.includes('rejected')) {
          // Lace also answers "denied" when it is set to a different network.
          throw new Error(
            `Lace refused the connection. Make sure Lace is unlocked and set to ${network.label} ` +
            '(Settings > Network), with Developer Mode on, then approve the request. If you ' +
            'rejected this site before, remove it under Settings > Authorized DApps and connect again.'
          );
        }
        if (msg.includes('mismatch') || msg.includes('network')) {
          throw new Error(
            `Network mismatch: the wallet is on a different network than "${network.id}". ` +
            `Open Lace wallet, go to Settings > Network, and switch to the ${network.label} network. ` +
            `Original error: ${msg}`
          );
        }
        if (msg.includes('was shutdown') || msg.includes('no longer be used')) {
          throw new Error(
            'The wallet extension\'s connection went stale (its background service worker was ' +
            'suspended by the browser). Reload this page and try connecting again — no other fix ' +
            'is needed.'
          );
        }
        throw new Error(`Wallet connection failed: ${msg}`);
      }

      const status = await connectedApi.getConnectionStatus();
      if (status.status !== 'connected') {
        throw new Error(`Wallet status: ${status.status}. Make sure you are connected to the ${network.label} network.`);
      }

      const config = await connectedApi.getConfiguration();
      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

      setState({
        isConnected: true,
        isConnecting: false,
        address: unshieldedAddress,
        connectedApi,
        error: null,
        config,
        walletName: wallet.name,
      });
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Connection failed',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      connectedApi: null,
      error: null,
      config: null,
      walletName: null,
    });
  }, []);

  const value = useMemo<WalletState>(
    () => ({ ...state, connect, disconnect }),
    [state, connect, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}