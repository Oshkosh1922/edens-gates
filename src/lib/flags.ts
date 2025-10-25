// Feature flags for Edens Gates
// Supports both VITE_WALLET_ENABLED and VITE_ENABLE_WALLET for robustness

export const WALLET_ON =
  import.meta.env.VITE_WALLET_ENABLED === 'true' ||
  import.meta.env.VITE_ENABLE_WALLET === 'true'

// RPC endpoint (default devnet)
export const SOLANA_RPC =
  import.meta.env.VITE_SOLANA_RPC || 'https://api.devnet.solana.com'

export const ME_MINT = import.meta.env.VITE_ME_MINT ?? ''
export const ME_DECIMALS = Number(import.meta.env.VITE_ME_DECIMALS ?? 6)
// Backward compatibility: support legacy VITE_REWARDS_VAULT
export const REWARDS_WALLET =
  import.meta.env.VITE_REWARDS_WALLET ??
  import.meta.env.VITE_REWARDS_VAULT ??
  ''

export const UPLOADS_ENABLED = import.meta.env.VITE_UPLOADS_ENABLED === 'true'
export const EDGE_FUNCTIONS_ENABLED = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true'