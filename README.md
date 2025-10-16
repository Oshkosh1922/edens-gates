# Edens Gates

> Community trust layer for Magic Eden—collect founder submissions, run weekly voting, publish transparent winners, and manage rounds from a lightweight admin flow.

## Stack

- React 19 + Vite + TypeScript
- TailwindCSS for dark-mode UI (`egDark`, `egPurple`, `egPink` theme)
- Supabase (PostgreSQL, RLS, RPC) as the backend
- React Router for routing, component state for local data

## One-time setup (macOS)

```bash
# 1. Bootstrap the Vite + React + TS project
npm create vite@latest . -- --template react-ts

# 2. Install runtime dependencies
npm install react-router-dom @supabase/supabase-js

# 3. Install TailwindCSS toolchain
npm install -D tailwindcss postcss autoprefixer

# 4. (If the Tailwind CLI init step fails) create configs manually — already done in repo
```

After cloning the repository you only need:

```bash
npm install
```

## Environment variables

Create `.env.local` (copy from `.env.example` and configure):

```bash
# Required - Supabase Configuration
VITE_SUPABASE_URL="https://YOUR-PROJECT-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"

# Optional - Feature Flags (Default: false)
VITE_WALLET_ENABLED=true           # Enable Solana wallet connection for votes
VITE_USE_EDGE_FUNCTIONS=false      # Use secure Edge Functions for admin operations
VITE_UPLOADS_ENABLED=false         # Enable image and PDF uploads via Supabase Storage

# Required for On-chain Voting (when VITE_WALLET_ENABLED=true)
VITE_ME_MINT="ME_TOKEN_MINT_ADDRESS"           # $ME token mint address
VITE_REWARDS_VAULT="REWARDS_VAULT_AUTHORITY"   # Authority pubkey for rewards vault
VITE_CLUSTER="devnet"                          # Solana cluster: devnet, mainnet-beta
```

## Develop locally

```bash
# Start the dev server
npm run dev

# Type check and build
npm run build

# Lint the project
npm run lint
```

The app exposes routes:

- `/` – landing page and CTAs
- `/submit` – founder submission form (Supabase insert)
- `/vote` – active founder voting (RPC + optimistic UI)
- `/winners` – historical winners grid
- `/admin` – approvals, activation, and winner publishing

## Deploying to Vercel

1. Push the repository to GitHub (or another Git provider Vercel can import).
2. In Vercel, create a new project and select the repo. Framework preset: **Vite**.
3. Build settings
  - Install command: `npm install`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Under *Routing*, enable **Single Page Application Fallback** so React Router routes resolve to `index.html`.
4. Environment variables (Project Settings → Environment Variables)
  - `VITE_SUPABASE_URL` → copy from Supabase *Project Settings → API*.
  - `VITE_SUPABASE_ANON_KEY` → same page.
5. Deploy.

After the first deploy, run these smoke tests:

- `/submit` — submit a test founder; verify a new pending row appears in Supabase.
- `/vote` — ensure the RPC-backed list renders and that voting increments counts.
- `/winners` — confirm the historical winners grid loads without errors.

### Common gotchas

- If deep links 404, re-check that the SPA fallback is enabled (Vercel Settings → General → Build & Output).
- Vercel pulls env vars per environment; populate Production **and** Preview if you deploy PRs.
- Supabase RLS must allow the actions you test; ensure the SQL policies above are applied before deploying.
- Clear the browser cache or use an incognito window after redeploys to avoid stale assets while iterating quickly.

## On-Chain Voting with Solana

Edens Gates supports on-chain voting where users pay 0.5 $ME tokens per vote:
- **0.25 $ME** is burned (deflationary)  
- **0.25 $ME** goes to a rewards vault
- Vote is recorded on-chain with founder ID and voter pubkey
- Transaction signature is stored in the database

### Prerequisites for On-Chain Voting

1. **Install Anchor CLI** (if not already installed):
```bash
# Install Rust (required for Anchor)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor (latest version)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

2. **Set up Solana wallet** for development:
```bash
# Generate a new keypair for devnet testing
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set Solana to use devnet
solana config set --url devnet
solana config set --keypair ~/.config/solana/devnet.json

# Fund your devnet wallet with SOL for transactions
solana airdrop 2
```

### Deploy to Devnet

1. **Build the Anchor program**:
```bash
npm run anchor:build
```

2. **Deploy to devnet**:
```bash
npm run anchor:deploy:devnet
```

3. **Set up $ME token for testing** (Mock tokens for devnet):
```bash
# Create a mock $ME token mint for testing
spl-token create-token --decimals 6
# Note: Save the mint address for VITE_ME_MINT

# Create a rewards vault token account
spl-token create-account <ME_MINT_ADDRESS>
# Note: Save this address for VITE_REWARDS_VAULT

# Mint some test $ME tokens to your wallet for testing
spl-token mint <ME_MINT_ADDRESS> 100 <YOUR_WALLET_ADDRESS>
```

4. **Update environment variables**:
```bash
# Add to your .env.local
VITE_WALLET_ENABLED=true
VITE_ME_MINT="MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u"
VITE_REWARDS_VAULT="8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE" 
VITE_CLUSTER="devnet"
```

5. **Test the integration**:
- Start the dev server: `npm run dev`
- Connect a Solana wallet (Phantom, Solflare, etc.)
- Ensure your wallet has devnet SOL and test $ME tokens
- Try voting on a founder to test the on-chain transaction

### Production Deployment

For mainnet deployment:

1. Set `VITE_CLUSTER="mainnet-beta"` 
2. Use the real Magic Eden $ME token mint address
3. Deploy to mainnet: `npm run anchor:deploy:mainnet`
4. Set up proper rewards vault with multi-sig security
5. Ensure sufficient SOL for transaction fees

**Security Note**: The program uses hardcoded 0.5 $ME fee amounts to prevent client-side tampering. Only the specified $ME mint is accepted.

## Supabase schema

Run the SQL block provided at the end of this document inside the Supabase SQL editor (or via `psql`) to provision tables, policies, RPCs, and sample data.

## Testing checklist

- Submit page inserts a new pending founder and surfaces inline success/error.
- Vote page uses the `get_active_founders_with_votes` RPC and writes a vote row while optimistically incrementing counts.
- Admin page approves/rejects pending founders, toggles round activity, and publishes winners (resets active founders).
- Winners page renders published history ordered newest first.
- `npm run build` succeeds locally (Vercel-compatible).

## Project structure

```
src/
  components/      # navigation + layout shell
  lib/             # Supabase client
  pages/           # route components
  types/           # Supabase row typings
```

## Feature Flags

### Wallet Integration (`VITE_WALLET_ENABLED=true`)

**Requirements:**
1. Install Solana wallet adapter packages:
   ```bash
   npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom @solana/wallet-adapter-backpack @solana/web3.js
   ```

2. Update `src/lib/wallet.ts` to use real Solana wallet adapters instead of mock implementation

**Features enabled:**
- Wallet connect/disconnect UI in navigation
- Wallet address stored with votes when connected
- Non-destructive: app works normally when disabled

### Edge Functions (`VITE_USE_EDGE_FUNCTIONS=true`)

**Requirements:**
1. Deploy Supabase Edge Functions:
   ```bash
   supabase functions deploy approve-founder
   supabase functions deploy toggle-founder-active  
   supabase functions deploy publish-winner
   ```

2. Set environment variables in Supabase dashboard:
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

**Features enabled:**
- Secure server-side admin operations
- Service role access for founder status updates
- Rate limiting and audit trails

### File Uploads (`VITE_UPLOADS_ENABLED=true`)

**Requirements:**
1. Run the storage migration SQL (see below)
2. Configure Supabase Storage bucket policies

**Features enabled:**
- Project thumbnail uploads (JPEG/PNG/WebP, 5MB max)
- Pitch deck uploads (PDF, 10MB max)
- Public URLs stored in founder records

## How to Enable Features

### 1. Enable Wallet Integration
```bash
# Install packages (commented out in current implementation)
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui

# Set environment variable
echo "VITE_WALLET_ENABLED=true" >> .env.local

# Update wallet.ts with real Solana adapters (implementation needed)
```

### 2. Enable Edge Functions
```bash
# Deploy functions (requires Supabase CLI)
supabase functions deploy approve-founder
supabase functions deploy toggle-founder-active
supabase functions deploy publish-winner

# Set environment variable
echo "VITE_USE_EDGE_FUNCTIONS=true" >> .env.local
```

### 3. Enable File Uploads
```bash
# Run storage migration SQL (see below)
# Set environment variable
echo "VITE_UPLOADS_ENABLED=true" >> .env.local
```

## Next steps

- Complete Solana wallet adapter integration when packages are installed
- Deploy and test Edge Functions in Supabase environment
- Add enhanced RLS policies for rate limiting and validation
