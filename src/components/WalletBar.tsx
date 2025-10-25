import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { WALLET_ON } from '../lib/flags'

export const WalletBar = () => {
  // Call hooks unconditionally (Rule of Hooks)
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  
  // Don't render if wallet disabled
  if (!WALLET_ON) return null
  
  const handleConnect = () => {
    setVisible(true)
  }
  
  return (
    <div className="flex items-center gap-3">
      {connected ? (
        <div className="flex items-center gap-2">
          {/* Connected wallet display */}
          <div className="px-3 py-1.5 bg-egPurple/20 border border-egPurple/30 rounded-lg">
            <span className="text-xs text-egPurple font-mono">
              {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </span>
          </div>
          
          {/* Disconnect button */}
          <button
            onClick={disconnect}
            className="px-3 py-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-gradient-to-r from-egPurple to-egPink text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-egPurple/25 transition-all duration-200"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}