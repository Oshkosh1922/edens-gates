#!/usr/bin/env bash
set -euo pipefail

# Ensure git history is up to date before deploying
git add -A
git commit -m "deploy: admin UI + supabase functions auth verified" || true
git push origin main

# Link the current directory to the Vercel project (idempotent)
vercel link --yes

echo "Run these once per project:"
echo "vercel env add VITE_SUPABASE_URL"
echo "vercel env add VITE_SUPABASE_ANON_KEY"
echo "vercel env add VITE_SUPABASE_FUNCTION_URL"
echo "vercel env add VITE_WALLET_ENABLED"
echo "vercel env add VITE_ME_MINT"
echo "vercel env add VITE_REWARDS_WALLET"
echo "vercel env add VITE_ME_DECIMALS"
echo "vercel env add VITE_SOLANA_RPC"
echo 'vercel env add VITE_USE_EDGE_FUNCTIONS'
echo 'vercel env add VITE_UPLOADS_ENABLED'
echo 'vercel env add VITE_ADMIN_WALLETS'

echo "\nKicking off production deployment..."
vercel --prod
