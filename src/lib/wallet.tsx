// Robust wallet integration with Solana wallet adapters
import React, { createContext, useContext, useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WALLET_ON } from './flags'

// Safe wallet hook interface
export interface WalletSafe {
  connected: boolean
  publicKeyBase58?: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction?: (transaction: any) => Promise<any>
}

// Mock wallet for when feature is disabled
const mockWallet: WalletSafe = {
  connected: false,
  connect: async () => {
    console.log('Wallet feature is disabled - set VITE_WALLET_ENABLED=true to enable')
  },
  disconnect: async () => {
    console.log('Mock wallet disconnect')
  },
  signTransaction: async () => {
    throw new Error('Mock wallet cannot sign transactions')
  }
}

// Create wallet context
const WalletContext = createContext<WalletSafe>(mockWallet)

// Safe wallet hook
export const useWalletSafe = (): WalletSafe => {
  return useContext(WalletContext)
}

// Bridge component to convert Solana wallet to our safe interface
const WalletBridge = ({ children }: { children: React.ReactNode }) => {
  const wallet = useWallet()
  
  const safeWallet: WalletSafe = useMemo(() => ({
    connected: wallet.connected,
    publicKeyBase58: wallet.publicKey?.toString(),
    connect: async () => {
      try {
        if (wallet.connect) {
          await wallet.connect()
        }
      } catch (error) {
        console.error('Wallet connection failed:', error)
        throw error
      }
    },
    disconnect: wallet.disconnect || mockWallet.disconnect,
    signTransaction: wallet.signTransaction || mockWallet.signTransaction,
  }), [wallet.connected, wallet.publicKey, wallet.connect, wallet.disconnect, wallet.signTransaction])

  return (
    <WalletContext.Provider value={safeWallet}>
      {children}
    </WalletContext.Provider>
  )
}

// Wallet context provider with real Solana integration
export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
  // If wallet disabled, provide mock implementation
  if (!WALLET_ON) {
    return (
      <WalletContext.Provider value={mockWallet}>
        {children}
      </WalletContext.Provider>
    )
  }

  // Configure wallet adapters
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  // Solana RPC endpoint (you can customize this)
  const endpoint = 'https://api.mainnet-beta.solana.com'

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletBridge>
            {children}
          </WalletBridge>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}