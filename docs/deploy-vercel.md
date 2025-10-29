# Vercel Deployment Guide

## Build Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** default

## Required Environment Variables
| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://dhecyrkdyhjnjvbcbbbe.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN5cmtkeWhqbmp2YmNiYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzE5NDIsImV4cCI6MjA3NjEwNzk0Mn0.i3MFsuIJVxlzjFBIZSiMCIU_Zsy15kRtji2numwBVKk` |
| `VITE_SUPABASE_FUNCTION_URL` | `https://dhecyrkdyhjnjvbcbbbe.functions.supabase.co` |
| `VITE_WALLET_ENABLED` | `true` |
| `VITE_ME_MINT` | `BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS` |
| `VITE_REWARDS_WALLET` | `8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE` |
| `VITE_ME_DECIMALS` | `6` |
| `VITE_SOLANA_RPC` | `https://api.devnet.solana.com` |
| `VITE_USE_EDGE_FUNCTIONS` | `true` |
| `VITE_UPLOADS_ENABLED` | `true` |
| `VITE_ADMIN_WALLETS` | `AyViV2WjJLfPY4GJmexzcHCY6TFsUxLP7fRAGcGD8zgi` |

> ℹ️ ESLint reports `no-explicit-any` / unused warnings; these are known and non-blocking for this release.

## Post-Deploy Checklist
1. Open the deployed Vercel URL and navigate to `/admin`.
2. With DevTools → Network open, trigger each action:
   - **Approve Founder:** Confirm `POST https://dhecyrkdyhjnjvbcbbbe.functions.supabase.co/approve-founder` returns `200` with `{ "success": true }` and includes the `Authorization: Bearer <anon>` header.
   - **Toggle Founder Active:** Confirm `POST …/toggle-founder-active` returns `200` with `{ "success": true }` and includes the auth header.
   - **Publish Weekly Winner:** Confirm `POST …/publish-winner` returns `200` with `{ "success": true }` and includes the auth header.
3. Ensure the UI shows the success toasts (✅, 🟡, 🎉) for each action.
4. If any request returns `401`, double-check Vercel environment variables and redeploy.
