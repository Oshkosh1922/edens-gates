# Edens Gates Status Report (2025-10-25)

## 0) Timestamp & Host
- Timestamp: `2025-10-25 16:45:58 CDT`
- Host: `Darwin MacBookPro.lan 24.6.0 Darwin Kernel Version 24.6.0: Mon Jul 14 11:30:34 PDT 2025; root:xnu-11417.140.69~1/RELEASE_ARM64_T8103 arm64`
- Node/NPM: `v23.7.0 / 10.9.2`
- Repository Root: `/Users/michaelharris/Documents/GitHub/edens-gates/EG`

## 1) Git & CI/CD
- `git status -sb`
  ```
  ## chore/wallet-build-fixes...origin/chore/wallet-build-fixes
   M .env
   M src/lib/solana.ts
   M src/pages/Vote.tsx
  ```
- `git remote -v`
  ```
  origin  https://github.com/Oshkosh1922/edens-gates.git (fetch)
  origin  https://github.com/Oshkosh1922/edens-gates.git (push)
  ```
- Recent commits (`git log -n5`)
  ```
  ce8474c | 2025-10-25 14:31:37 -0500 | Michael Harris | chore(env): standardize environment configuration and confirm successful build pipeline
  2302d47 | 2025-10-25 14:17:45 -0500 | Michael Harris | Create 04-build-type-lint.txt
  67852f6 | 2025-10-25 13:56:51 -0500 | Michael Harris | fix(build): wallet import + flags export + WalletSafe typing; lint hooks; env decimals
  a1e32b0 | 2025-10-20 21:12:55 -0500 | Michael Harris | Wallet
  9e7bbc3 | 2025-10-15 21:12:40 -0500 | Michael Harris | Wallet dnet, supabase tables, vercel%
  ```
- `vercel.json`: NOT FOUND
- GitHub Actions workflows: `.github/workflows NOT FOUND`

## 2) File Tree (≤ depth 3)
<details><summary>find output</summary>

```
.
./artifacts
./artifacts/05-sanity-checks.txt
./artifacts/04-build-type-lint.txt
./tsconfig.node.json
./index.html
./tailwind.config.js
./.env.local
./tsconfig.app.json
./migration.sql
./supabase
./supabase/functions
./supabase/functions/approve-founder
./supabase/functions/publish-winner
./supabase/functions/toggle-founder-active
./README.md
./anchor.toml
./programs
./programs/edens_gates
./programs/edens_gates/Cargo.toml
./programs/edens_gates/README.md
./programs/edens_gates/src
./public
./public/vite.svg
./.gitignore
./package-lock.json
./package.json
./.env
./tsconfig.json
./FEATURES.md
./eslint.config.js
./.env.example
./vite.config.ts
./postcss.config.js
./src
./src/App.tsx
./src/main.tsx
./src/types
./src/types/supabase.ts
./src/index.css
./src/components
./src/components/Nav.tsx
./src/components/Shell.tsx
./src/components/WalletBar.tsx
./src/vite-env.d.ts
./src/lib
./src/lib/wallet.ts
./src/lib/uploads.ts
./src/lib/api.ts
./src/lib/solana.ts
./src/lib/flags.ts
./src/lib/supabase.ts
./src/assets
./src/assets/react.svg
./src/pages
./src/pages/Vote.tsx
./src/pages/Home.tsx
./src/pages/Submit.tsx
./src/pages/Winners.tsx
./src/pages/NotFound.tsx
./src/pages/Admin.tsx
```

</details>

**Root artifacts:**
- Present: `README.md`, `.env`, `.env.local`, `.env.example`, `migration.sql`, `supabase/`, `src/`, `public/`, `package.json`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`, `eslint.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
- Not present: `.env.production` (NOT FOUND), `.env.development` (NOT FOUND).

## 3) package.json Summary
- Name: `edensgates`
- Version: `0.0.0`
- Private: `true`

**Scripts**
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "anchor:build": "anchor build",
  "anchor:deploy:devnet": "anchor deploy --provider.cluster devnet",
  "anchor:deploy:mainnet": "anchor deploy --provider.cluster mainnet-beta"
}
```

**Dependencies**
```json
{
  "@coral-xyz/anchor": "^0.32.1",
  "@solana/spl-token": "^0.4.14",
  "@solana/wallet-adapter-base": "^0.9.27",
  "@solana/wallet-adapter-react": "^0.15.39",
  "@solana/wallet-adapter-react-ui": "^0.9.39",
  "@solana/wallet-adapter-wallets": "^0.19.37",
  "@solana/web3.js": "^1.98.4",
  "@supabase/supabase-js": "^2.75.0",
  "framer-motion": "^12.23.24",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.4"
}
```

**DevDependencies**
```json
{
  "@eslint/js": "^9.36.0",
  "@types/node": "^24.6.0",
  "@types/react": "^19.1.16",
  "@types/react-dom": "^19.1.9",
  "@vitejs/plugin-react": "^5.0.4",
  "autoprefixer": "^10.4.21",
  "eslint": "^9.36.0",
  "eslint-formatter-unix": "^9.0.1",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.22",
  "globals": "^16.4.0",
  "postcss": "^8.5.6",
  "tailwindcss": "^3.4.17",
  "typescript": "~5.9.3",
  "typescript-eslint": "^8.45.0",
  "vite": "^7.1.7"
}
```

## 4) Environment (sanitized)
- Env files: `.env`, `.env.example`, `.env.local`

**.env**
```
VITE_WALLET_ENABLED=true
VITE_ME_MINT=BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS (Bdeq…PscS)
VITE_REWARDS_VAULT=8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE (8rjP…t8KAE)
VITE_REWARDS_WALLET=8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE (8rjP…t8KAE)
VITE_ME_DECIMALS=6
VITE_CLUSTER=devnet
VITE_SOLANA_RPC=https://api.devnet.solana.com (http…com)
```

**.env.local**
```
VITE_SUPABASE_URL=https://dhecyrkdyhjnjvbcbbbe.supabase.co (http…co)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN5cmtkeWhqbmp2YmNiYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzE5NDIsImV4cCI6MjA3NjEwNzk0Mn0.i3MFsuIJVxlzjFBIZSiMCIU_Zsy15kRtji2numwBVKk (eyJh…BVKk)
VITE_WALLET_ENABLED=true
VITE_ME_MINT=BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS (Bdeq…PscS)
VITE_REWARDS_WALLET=8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE (8rjP…t8KAE)
VITE_ME_DECIMALS=6
VITE_SOLANA_RPC=https://api.devnet.solana.com (http…com)
```

**Feature flags**
- `WALLET_ON`: `true`
- `EDGE_FUNCTIONS_ON`: `false`
- `UPLOADS_ON`: `false`

**Solana vars**
- `VITE_SOLANA_RPC`: `https://api.devnet.solana.com (http…com)`
- `VITE_ME_MINT`: `BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS (Bdeq…PscS)`
- `VITE_ME_DECIMALS`: `6`
- `VITE_REWARDS_WALLET`: `8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE (8rjP…t8KAE)`

**Supabase vars**
- `VITE_SUPABASE_URL`: `https://dhecyrkdyhjnjvbcbbbe.supabase.co (http…co)`
- `VITE_SUPABASE_ANON_KEY`: `eyJhb…BVKk`

## 5) Build / Type / Lint
- `npm run build` (tail 30)
  <details><summary>output</summary>

  ```
  in "node_modules/@reown/appkit/node_modules/ox/_esm/core/internal/cursor.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues. node_modules/@reown/appkit/node_modules/ox/_esm/core/Address.js (6:21): A comment
  
  "/*#__PURE__*/"
  
  in "node_modules/@reown/appkit/node_modules/ox/_esm/core/Address.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.         node_modules/@reown/appkit-controllers/node_modules/ox/_esm/core/internal/cursor.js (2:21): A comment
  
  "/*#__PURE__*/"
  
  in "node_modules/@reown/appkit-controllers/node_modules/ox/_esm/core/internal/cursor.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.                                                                                              node_modules/@reown/appkit-controllers/node_modules/ox/_esm/core/Address.js (6:21): A comment
  
  "/*#__PURE__*/"
  
  in "node_modules/@reown/appkit-controllers/node_modules/ox/_esm/core/Address.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.                                                                                                      ✓ 5669 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.99 kB │ gzip:   0.55 kB
  dist/assets/index-Bw8NBpOa.css   36.06 kB │ gzip:   6.59 kB
  dist/assets/index-CeWg0QcR.js    12.93 kB │ gzip:   3.78 kB
  dist/assets/index-CWeM9JPk.js    29.60 kB │ gzip:   6.14 kB
  dist/assets/index-DLtg4tkb.js   989.51 kB │ gzip: 299.16 kB
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ✓ built in 5.45s
  ```

  </details>
- `npx tsc --noEmit`: _no output (pass)_
- `npx eslint . -f stylish`
  <details><summary>errors</summary>

  ```
  /Users/michaelharris/Documents/GitHub/edens-gates/EG/src/lib/solana.ts
    31:13  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  
  /Users/michaelharris/Documents/GitHub/edens-gates/EG/src/lib/uploads.ts
    42:51  error  '_founderId' is defined but never used  @typescript-eslint/no-unused-vars
    80:46  error  '_founderId' is defined but never used  @typescript-eslint/no-unused-vars
  
  /Users/michaelharris/Documents/GitHub/edens-gates/EG/src/lib/wallet.ts
     72:23  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
     77:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    194:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    198:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    210:29  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    210:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    231:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    231:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  
  /Users/michaelharris/Documents/GitHub/edens-gates/EG/src/pages/Vote.tsx
    151:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    201:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  
  ✖ 13 problems (13 errors, 0 warnings)
  ```

  </details>

## 6) Routing & Styling
- Key files exist: `index.html`, `src/main.tsx`, `src/App.tsx`.
- Routes (`createBrowserRouter` in `src/main.tsx`):
  - `/` → `App` (with child routes)
    - index → `Home`
    - `/submit` → `Submit`
    - `/vote` → `Vote`
    - `/winners` → `Winners`
    - `/admin` → `Admin`
    - `*` → `NotFound`
- Tailwind configuration extends colors (`egDark`, `egPurple`, `egPink`), gradients, box shadows, typography, animations; no plugins registered.
- `src/index.css` imports `@solana/wallet-adapter-react-ui/styles.css` at the top and defines custom utility layers including `.me-banner` styling.

## 7) Supabase Integration
- `src/lib/supabase.ts`
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable')
  }
  
  if (!supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
  }
  
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
  ```
- Table usage (`supabase.from`): founders (CRUD), winners, votes.
- RPC usage: `get_active_founders_with_votes` invoked in `Vote.tsx`.
- `migration.sql` includes:
  - `votes.tx_sig` column + index `votes_tx_sig_idx` and composite index on `(founder_id, wallet)`.
  - RLS policies for `founders`, `votes`, and storage bucket `founder-media`.
  - Bucket policies allowing anon insert/select/delete for founder media.
- Code writes to `votes.tx_sig` via `recordVoteTx` in `src/lib/solana.ts` and fallback insert in `Vote.tsx` (with `tx_sig` column set).

## 8) Wallet Integration
- `src/lib/flags.ts` exposes `WALLET_ON`, `SOLANA_RPC`, `ME_MINT`, `ME_DECIMALS`, `REWARDS_WALLET`, `UPLOADS_ENABLED`, `EDGE_FUNCTIONS_ENABLED`.
- `src/lib/wallet.ts` configures adapters: Phantom, Solflare (Devnet), optional Backpack and Magic Eden via dynamic import or window providers; wraps everything with `WalletContextProvider` exposing safe methods (`connect`, `signAndSend`).
- `WalletBar` renders connect/disconnect UI when `WALLET_ON`.
- `Nav.tsx` includes `<WalletBar />` within desktop nav region, so wallet controls display when flag enabled.

## 9) Vote Flow (On-chain)
<details><summary>`src/pages/Vote.tsx`</summary>

```tsx
// Visual Pass — Logic Preserved + Wallet Integration + On-chain Voting
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'
import { useWalletSafe } from '../lib/wallet'
import { WALLET_ON } from '../lib/flags'
import { 
  voteWithFee, 
  recordVoteTx,
  getConnection,
  getMeMintAddress,
  getRewardsVaultAuthority
} from '../lib/solana'
import { PublicKey } from '@solana/web3.js'
import type { FounderWithVotes } from '../types/supabase'

... (full file continues — see repository)
```

</details>

- Banner: Conditional on `WALLET_ON`, displays "Each vote helps creators earn 0.5 $ME" block.
- Button behavior: `disabled` when pending or already voted; prompts connect panel when wallet disconnected.
- On click (wallet connected):
  - Uses `getConnection()` and `voteWithFee()` to build an SPL Token transfer for `0.5 $ME` from voter ATA to rewards ATA.
  - Captures returned `txSig` and sets success status.
  - Calls `recordVoteTx` to insert `founder_id`, masked wallet, and `tx_sig` into `votes`.
  - Fallback path records off-chain vote with `tx_sig: null` if on-chain transfer fails.
- Token transfer primitives imported from `@solana/web3.js` (Connection, PublicKey, Transaction) and `@solana/spl-token` (`createAssociatedTokenAccountInstruction`, `createTransferInstruction`, `TOKEN_PROGRAM_ID`, `ASSOCIATED_TOKEN_PROGRAM_ID`).

## 10) Solana Devnet State (CLI)
- `solana config get`
  ```
  Config File: /Users/michaelharris/.config/solana/cli/config.yml
  RPC URL: https://api.devnet.solana.com 
  WebSocket URL: wss://api.devnet.solana.com/ (computed)
  Keypair Path: /Users/michaelharris/.config/solana/id.json 
  Commitment: confirmed 
  ```
- Fee-payer address: `AyViV2WjJLfPY4GJmexzcHCY6TFsUxLP7fRAGcGD8zgi (AyVi…zgi)`
- Fee-payer balance: `0.24443484 SOL`
- `VOTER_WALLET`: `2ZJY51xqmd15bUhEeF58DzzsjycmcHga4cCiCMvuVHvz (2ZJY…VHvz)`
- `REWARDS_WALLET`: `8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE (8rjP…t8KAE)`
- `ME_MINT`: `BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS (Bdeq…PscS)`
- Token accounts & balances:
  - `spl-token accounts --owner 2ZJY…VHvz`
    ```
    Token                                         Balance
    -----------------------------------------------------
    BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS  9.5
    ```
  - `spl-token balance … --owner 2ZJY…VHvz`: `9.5`
  - `spl-token accounts --owner 8rjP…t8KAE`
    ```
    Token                                         Balance
    -----------------------------------------------------
    BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS  0.5
    ```
  - `spl-token balance … --owner 8rjP…t8KAE`: `0.5`

## 11) Latest Vote Rows (Supabase)
```
id  founder_id                            wallet     tx_sig     created_at                      
--  ------------------------------------  ---------  ---------  --------------------------------
23  be2d4b58-c7c2-4712-85d4-a1c5e9f70686  2ZJY…VHvz  3anH…jL5Q  2025-10-25T21:30:55.988624+00:00
20  652f897b-862c-4586-b6f5-9636ce70d11f                        2025-10-21T00:35:07.13082+00:00 
7   be2d4b58-c7c2-4712-85d4-a1c5e9f70686                        2025-10-16T00:42:49.636993+00:00
6   652f897b-862c-4586-b6f5-9636ce70d11f                        2025-10-16T00:42:41.947091+00:00
2   be2d4b58-c7c2-4712-85d4-a1c5e9f70686                        2025-10-15T22:15:51.653924+00:00
```

## 12) Pages & Components Inventory
- Pages (`src/pages`): `Home`, `Submit`, `Vote`, `Winners`, `Admin`, `NotFound`.
- Shared components: `Nav`, `Shell`, `WalletBar`.
- Feature flags observed:
  - `WALLET_ON` gates wallet UI and voting flow.
  - `UPLOADS_ENABLED` referenced via `flags.ts`; `src/lib/uploads.ts` contains upload helpers but lint indicates unused params.
  - `EDGE_FUNCTIONS_ENABLED` toggles use of Supabase edge functions (see `supabase/functions/*`).

## 13) Risks / TODOs (facts only)
- ESLint fails with 13 errors (mostly `any` usage in wallet/solana/vote modules and unused parameters in `uploads.ts`).
- Working tree has unstaged modifications to `.env`, `src/lib/solana.ts`, and `src/pages/Vote.tsx` that are not yet committed.
- Build output warns about large bundle chunk (`index-DLtg4tkb.js` ~989 kB gzipped 299 kB) and Rollup PURE comment stripping notices.
- No GitHub Actions workflows detected; CI coverage unknown.
- `vercel.json` missing (deployment target unspecified).

## 14) Checksums (SHA256 first 12 chars)
```
49a30e461f94 src/lib/flags.ts
fe38bf6e814f src/lib/wallet.ts
ea817673de18 src/components/WalletBar.tsx
d3338d6667b6 src/components/Nav.tsx
9a42f48fb355 src/pages/Vote.tsx
a78d352150cf src/lib/api.ts
c569c1d8cced src/lib/supabase.ts
e864ce5cb5c1 migration.sql
5c65ab74d18e tailwind.config.js
4d36db3522a7 vite.config.ts
```

## 15) Executive Summary
- Dev environment on macOS ARM64 with Node 23.7.0/NPM 10.9.2; repo rooted at `/Users/michaelharris/Documents/GitHub/edens-gates/EG`.
- Branch `chore/wallet-build-fixes` diverges locally with uncommitted edits to wallet envs and vote/solana logic.
- Wallet feature flag enabled; ME mint `Bdeq…PscS` and rewards wallet `8rjP…t8KAE` configured for devnet, with Supabase credentials supplied via `.env.local`.
- Build succeeds (`vite build`) though linting fails due to `any` usage and unused parameters across wallet, vote, and uploads modules.
- React Router routes span Home, Submit, Vote, Winners, Admin; Tailwind theme extends egDark/egPurple/egPink colors and wallet styles.
- `voteWithFee` now executes a 0.5 $ME SPL transfer; latest devnet balances show voter at 9.5 $ME and rewards wallet at 0.5 $ME.
- Supabase `votes` table records most recent on-chain vote with masked wallet/signature; migration file defines `tx_sig` column, indexes, and throttling policies.
- Supabase edge functions and uploads remain feature-flagged off; `.github/workflows` absent so CI automation is undefined.
- Build artifact chunk `index-DLtg4tkb.js` exceeds Rollup’s 500 kB limit warning, indicating potential need for code splitting.
- Next milestone: resolve lint blockers, stage pending wallet/vote changes, and formalize deployment/CI configuration.
