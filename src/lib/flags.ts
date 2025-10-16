// Feature flags for Edens Gates
// Supports both VITE_WALLET_ENABLED and VITE_ENABLE_WALLET for robustness

export const WALLET_ON =
  import.meta.env.VITE_WALLET_ENABLED === 'true' ||
  import.meta.env.VITE_ENABLE_WALLET === 'true'

export const UPLOADS_ENABLED = import.meta.env.VITE_UPLOADS_ENABLED === 'true'
export const EDGE_FUNCTIONS_ENABLED = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true'