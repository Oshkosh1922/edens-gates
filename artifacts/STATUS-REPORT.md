0) Timestamp & Host

```bash
$ (date; uname -a; node -v; npm -v)
Wed Oct 29 13:28:17 CDT 2025
Darwin MacBookPro.lan 24.6.0 Darwin Ker
nel Version 24.6.0: Mon Jul 14 11:30:34 PDT 2025; root:xnu-11417.140.69~1/RELEASE_ARM64_T8103 arm64
v23.7.0
10.9.2
```

```bash
$ pwd
/Users/michaelharris/Documents/GitHub/edens-gates/EG
```

1) Git & CI/CD

```bash
$ git status -sb
## main...origin/main [ahead 1]
 M .env
 M src/lib/solana.ts
 M src/lib/uploads.ts
 M src/lib/wallet.ts
 M src/pages/Vote.tsx
```

```bash
$ git remote -v
origin  https://github.com/Oshkosh1922/
edens-gates.git (fetch)
origin  https://github.com/Oshkosh1922/
edens-gates.git (push)
```

```bash
$ git log --oneline -n8 --decorate --date=iso
d244699 (HEAD -> main) Create cli-latest
116797a (origin/main, origin/HEAD) Merge pull request #5 from Oshkosh1922/chore/wallet-build-fixes
27e89bc (origin/chore/wallet-build-fixes, chore/wallet-build-fixes) fix(runtime): add browser Buffer polyfill so on-chain vote works in Vite/Vercel
244af9d Merge pull request #4 from Oshkosh1922/chore/lint-zero-and-devnet-proof
9b60c41 (origin/chore/lint-zero-and-devnet-proof, chore/lint-zero-and-devnet-proof) lint: remove any/unused; devnet on-chain vote flow proven; env normalized
3d57a31 Merge pull request #3 from Oshkosh1922/chore/wallet-build-fixes
ce8474c chore(env): standardize environment configuration and confirm successful build pipeline
c55b3af Merge pull request #2 from Oshkosh1922/chore/wallet-build-fixes
```

```bash
$ ls -la .github/workflows
ls: .github/workflows: No such file or directory
```

```bash
$ ls -la vercel.json
ls: vercel.json: No such file or directory
```

2) File Tree (depth≤3, ignore node_modules/dist/.git)

```bash
$ find . -maxdepth 3 -type d -not -path './node_modules*' -not -path './.git*' -not -path './dist*' | sort
.
./artifacts
./programs
./programs/edens_gates
./programs/edens_gates/src
./public
./src
./src/assets
./src/components
./src/lib
./src/pages
./src/types
./supabase
./supabase/.temp
./supabase/functions
./supabase/functions/approve-founder
./supabase/functions/publish-winner
./supabase/functions/toggle-founder-active
```

```bash
$ ls package.json vite.config.ts tailwind.config.js eslint.config.js tsconfig*.json migration.sql .env* supabase/functions
.env
.env.example
.env.local
eslint.config.js
migration.sql
package.json
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts

supabase/functions:
approve-founder
publish-winner
toggle-founder-active
```

3) package.json Summary

```bash
$ node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const format=(obj)=>Object.entries(obj||{}).map(([k,v])=>'  '+k+': '+v).join('\n');console.log('Scripts:\n'+format(pkg.scripts));console.log('\nDependencies:\n'+format(pkg.dependencies));console.log('\nDevDependencies:\n'+format(pkg.devDependencies));"
Scripts:
  dev: vite
  build: tsc -b && vite build
  lint: eslint .
  preview: vite preview
  anchor:build: anchor build
  anchor:deploy:devnet: anchor deploy -
-provider.cluster devnet
  anchor:deploy:mainnet: anchor deploy 
--provider.cluster mainnet-beta

Dependencies:
  @coral-xyz/anchor: ^0.32.1
  @solana/spl-token: ^0.4.14
  @solana/wallet-adapter-base: ^0.9.27
  @solana/wallet-adapter-react: ^0.15.39
  @solana/wallet-adapter-react-ui: ^0.9.39
  @solana/wallet-adapter-wallets: ^0.19.37
  @solana/web3.js: ^1.98.4
  @supabase/supabase-js: ^2.75.0
  buffer: ^6.0.3
  framer-motion: ^12.23.24
  react: ^19.1.1
  react-dom: ^19.1.1
  react-router-dom: ^7.9.4

DevDependencies:
  @eslint/js: ^9.36.0
  @types/node: ^24.6.0
  @types/react: ^19.1.16
  @types/react-dom: ^19.1.9
  @vitejs/plugin-react: ^5.0.4
  autoprefixer: ^10.4.21
  eslint: ^9.36.0
  eslint-formatter-unix: ^9.0.1
  eslint-plugin-react-hooks: ^5.2.0
  eslint-plugin-react-refresh: ^0.4.22
  globals: ^16.4.0
  postcss: ^8.5.6
  tailwindcss: ^3.4.17
  typescript: ~5.9.3
  typescript-eslint: ^8.45.0
  vite: ^7.1.7
```

4) Environment (sanitized)

```bash
$ ls -la .env*
-rw-r--r--@ 1 michaelharris  staff  426 Oct 29 13:24 .env
-rw-r--r--@ 1 michaelharris  staff  934 Oct 15 20:57 .env.example
-rw-r--r--@ 1 michaelharris  staff  627 Oct 25 16:02 .env.local
```

```bash
$ node <<'NODE'
const fs = require('fs');
const vars = ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_WALLET_ENABLED','VITE_ME_MINT','VITE_REWARDS_WALLET','VITE_ME_DECIMALS','VITE_SOLANA_RPC','VITE_USE_EDGE_FUNCTIONS','VITE_UPLOADS_ENABLED'];
const sources = ['.env','.env.local'];
const data = {};
for (const src of sources) {
  if (!fs.existsSync(src)) continue;
  const text = fs.readFileSync(src, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
}
const redact = (val) => {
  if (val == null) return '(missing)';
  const str = String(val);
  if (str.length <= 10) {
    if (str.length <= 4) return str;
    const head = str.slice(0, Math.min(2, str.length));
    const tail = str.slice(-2);
    return `${head}***${tail}`;
  }
  return `${str.slice(0,6)}...${str.slice(-4)}`;
};
for (const key of vars) {
  const val = data[key];
  console.log(`${key}=${redact(val)}`);
}
NODE
VITE_SUPABASE_URL=https:...e.co
VITE_SUPABASE_ANON_KEY=eyJhbG...BVKk
VITE_WALLET_ENABLED=true
VITE_ME_MINT=BdeqKm...PscS
VITE_REWARDS_WALLET=8rjP7X...8KAE
VITE_ME_DECIMALS=6
VITE_SOLANA_RPC=https:....com
VITE_USE_EDGE_FUNCTIONS=(missing)
VITE_UPLOADS_ENABLED=(missing)
```

5) Build / Type / Lint

node_modules present (npm ci skipped).

```bash
$ npm run build

> edensgates@0.0.0 build
> tsc -b && vite build

vite v7.1.10 building for production...
[plugin vite:resolve] Module "crypto" h
as been externalized for browser compatibility, imported by "/Users/michaelharris/Documents/GitHub/edens-gates/EG/node_modules/@toruslabs/eccrypto/dist/eccrypto.esm.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin vite:resolve] Module "stream" h
as been externalized for browser compatibility, imported by "/Users/michaelharris/Documents/GitHub/edens-gates/EG/node_modules/cipher-base/index.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin vite:resolve] Module "stream" h
as been externalized for browser compatibility, imported by "/Users/michaelharris/Documents/GitHub/edens-gates/EG/node_modules/hash-base/index.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
node_modules/@walletconnect/utils/node_
modules/ox/_esm/core/internal/cursor.js (2:21): A comment
"/*#__PURE__*/"

in "node_modules/@walletconnect/utils/n
ode_modules/ox/_esm/core/internal/cursor.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
node_modules/@walletconnect/utils/node_
modules/ox/_esm/core/Address.js (6:21): A comment
"/*#__PURE__*/"

in "node_modules/@walletconnect/utils/n
ode_modules/ox/_esm/core/Address.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
node_modules/@reown/appkit/node_modules
/ox/_esm/core/Address.js (6:21): A comment
"/*#__PURE__*/"

in "node_modules/@reown/appkit/node_mod
ules/ox/_esm/core/Address.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
node_modules/@reown/appkit/node_modules
/ox/_esm/core/internal/cursor.js (2:21): A comment
"/*#__PURE__*/"

in "node_modules/@reown/appkit/node_mod
ules/ox/_esm/core/internal/cursor.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
node_modules/@reown/appkit-controllers/
node_modules/ox/_esm/core/internal/cursor.js (2:21): A comment
"/*#__PURE__*/"

in "node_modules/@reown/appkit-controll
ers/node_modules/ox/_esm/core/internal/cursor.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
node_modules/@reown/appkit-controllers/
node_modules/ox/_esm/core/Address.js (6:21): A comment
"/*#__PURE__*/"

in "node_modules/@reown/appkit-controll
ers/node_modules/ox/_esm/core/Address.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.
✓ 5669 modules transformed.
dist/index.html                   0.99 
kB │ gzip:   0.55 kB
dist/assets/index-Bw8NBpOa.css   36.06 
kB │ gzip:   6.59 kB
dist/assets/index-BQ-m0rBY.js    12.93 
kB │ gzip:   3.78 kB
dist/assets/index-UwBuzBi3.js    29.60 
kB │ gzip:   6.14 kB
dist/assets/index-BULg-jyq.js   987.52 
kB │ gzip: 298.49 kB
(!) Some chunks are larger than 500 kB 
after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manual
chunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warn
ing via build.chunkSizeWarningLimit.
✓ built in 6.93s
```

```bash
$ npx tsc --noEmit
```
(No output; exit code 0.)

```bash
$ npx eslint . -f stylish

/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/lib/solana.ts          31:13  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/lib/uploads.ts         42:51  error  '_founderId' is defined but never used  @typescript-eslint/no-unused-vars
                                         80:46  error  '_founderId' is defined but never used  @typescript-eslint/no-unused-vars
/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/lib/wallet.ts           72:23  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                          77:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         194:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         198:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         210:29  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         210:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         231:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         231:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/main.tsx               2:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         3:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         5:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         6:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/pages/Vote.tsx         154:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
                                         204:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
/Users/michaelharris/Documents/GitHub/e
dens-gates/EG/src/vite-env.d.ts          8:2  warning  Unused eslint-disable directive (no problems were reported from 'no-var')
✖ 18 problems (17 errors, 1 warning)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

6) Supabase Connectivity

```bash
$ bash <<'EOF'
set -e
set -a
[ -f .env ] && source .env
[ -f .env.local ] && source .env.local
set +a
node - <<'NODE'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}
const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
(async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('id, founder_id, wallet, tx_sig, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) {
    console.error('Query error:', error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log('No votes found.');
    return;
  }
  const headers = ['id', 'founder_id', 'wallet', 'tx_sig', 'created_at'];
  const rows = data.map((row) => headers.map((h) => row[h] ?? ''));
  const widths = headers.map((h, idx) => Math.max(h.length, ...rows.map(r => String(r[idx]).length)));
  const formatRow = (vals) => vals.map((v, idx) => String(v).padEnd(widths[idx])).join('  ');
  console.log(formatRow(headers));
  console.log(widths.map(w => '-'.repeat(w)).join('  '));
  rows.forEach(row => console.log(formatRow(row)));
})();
NODE
EOF
id  founder_id                          wallet                                        tx_sig                                                                                    created_at
--  ----------------------------------- -------------------------------------------- ---------------------------------------------------------------------------------------- --------------------------------
29  be2d4b58-c7c2-4712-85d4-a1c5e9f70686 2ZJY51xqmd15bUhEeF58DzzsjycmcHga4cCiCMvuVHvz 21eU2E4YuwEb457kE2QgbnJRSF3PGVHcEUoWjc3pMoa8AsS7pNKqVGCw4AgxBeyAKELvepMZWpT8WpAghJzE1gpv 2025-10-25T23:40:40.365854+00:00
28  652f897b-862c-4586-b6f5-9636ce70d11f 2ZJY51xqmd15bUhEeF58DzzsjycmcHga4cCiCMvuVHvz BWyye9CUHiPh2F1bW5L5DDpnRHG6eQBVHe2kbQvYWMHotzNW3Dsr7kpWLZRfKu5vJQE8ZpwbUz1irigdWxKc2Me 2025-10-25T23:30:39.038571+00:00
27  be2d4b58-c7c2-4712-85d4-a1c5e9f70686 2ZJY51xqmd15bUhEeF58DzzsjycmcHga4cCiCMvuVHvz 2C6oVtpUdBmLVACYUtvT1GHEPk8HW2jYMXXr933f73GkbfFhW1DfA5eLAeT4acAkvB4goWGVjcoj6ooFmX2oCMC4 2025-10-25T23:16:17.896871+00:00
```

7) Solana Devnet State

```bash
$ solana config get
Config File: /Users/michaelharris/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/michaelharris/.config/solana/id.json
Commitment: confirmed
```

```bash
$ solana address
AyViV2WjJLfPY4GJmexzcHCY6TFsUxLP7fRAGcGD8zgi
```

```bash
$ solana balance
0.24443484 SOL
```

```bash
$ spl-token accounts --owner 2ZJY51xqmd15bUhEeF58DzzsjycmcHga4cCiCMvuVHvz
Token                                  
       Balance                         
--------------------------------------
BdeqKmNQbjwuTZ6VgFhgYyetu5q84m1P8RsWFwSuPscS  7.5
```

```bash
$ spl-token accounts --owner 8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE
Error: Error { request: Some(GetTokenAccountsByOwner), kind: Reqwest(reqwest::Error { kind: Request, url: Url { scheme: "https", cannot_be_a_base: false, username: "", password: None, host: Some(Domain("api.devnet.solana.com")), port: None, path: "/", query: None, fragment: None }, source: TimedOut }) }
```

8) App Routes & Flags

```bash
$ ls src/pages
Admin.tsx
Home.tsx
NotFound.tsx
Submit.tsx
Vote.tsx
Winners.tsx
```

```bash
$ grep -n "index:" src/main.tsx
30:      { index: true, element: <Home /> },
```

```bash
$ grep -n "path:" src/main.tsx
27:    path: '/',
31:      { path: 'submit', element: <Submit /> },
32:      { path: 'vote', element: <Vote /> },
33:      { path: 'winners', element: <Winners /> },
34:      { path: 'admin', element: <Admin /> },
35:      { path: '*', element: <NotFound /> },
```

```bash
$ sed -n '1,120p' src/lib/flags.ts
// Feature flags for Edens Gates
// Supports both VITE_WALLET_ENABLED an
d VITE_ENABLE_WALLET for robustness
export const WALLET_ON =
  import.meta.env.VITE_WALLET_ENABLED =
== 'true' ||
  import.meta.env.VITE_ENABLE_WALLET ==
= 'true'

// RPC endpoint (default devnet)
export const SOLANA_RPC =
  import.meta.env.VITE_SOLANA_RPC || 'h
ttps://api.devnet.solana.com'

export const ME_MINT = import.meta.env.
VITE_ME_MINT ?? ''
export const ME_DECIMALS = Number(impor
t.meta.env.VITE_ME_DECIMALS ?? 6)
// Backward compatibility: support lega
cy VITE_REWARDS_VAULT
export const REWARDS_WALLET =
  import.meta.env.VITE_REWARDS_WALLET ?
?
  import.meta.env.VITE_REWARDS_VAULT ??
  ''

export const UPLOADS_ENABLED = import.m
eta.env.VITE_UPLOADS_ENABLED === 'true'
export const EDGE_FUNCTIONS_ENABLED = i
mport.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true'
```

9) Known Regressions / TODOs

- ESLint currently fails with 17 `no-explicit-any` errors across `src/lib/wallet.ts`, `src/main.tsx`, `src/pages/Vote.tsx`, and `src/lib/solana.ts`, plus two unused `_founderId` parameters in `src/lib/uploads.ts` and one unused disable in `src/vite-env.d.ts`.
- Production build succeeds but Vite warns about externalized Node core shims and a ~988 kB chunk (`dist/assets/index-BULg-jyq.js`), which may impact Vercel cold starts; consider code-splitting or tuning rollup manual chunks.
- Supabase CLI has not been linked/authenticated; earlier attempts failed due to missing access token (login still pending before function deploys/secrets can be managed).
- Solana `spl-token accounts --owner 8rjP7XV…` timed out against devnet RPC; re-run once RPC is responsive or consider alternative endpoint if balances are required.
- `.env`, `src/lib/solana.ts`, `src/lib/uploads.ts`, `src/lib/wallet.ts`, and `src/pages/Vote.tsx` have uncommitted edits on `main`; verify intent before release to avoid drift.

10) Checksums

```bash
$ shasum -a 256 src/lib/flags.ts src/lib/wallet.ts src/pages/Vote.tsx src/lib/solana.ts migration.sql vite.config.ts tailwind.config.js | awk '{printf "%s  %s\n", substr($1,1,12), $2}'
49a30e461f94  src/lib/flags.ts
fe38bf6e814f  src/lib/wallet.ts
6d93259b15ae  src/pages/Vote.tsx
1283700e12e2  src/lib/solana.ts
e864ce5cb5c1  migration.sql
5be155146998  vite.config.ts
5c65ab74d18e  tailwind.config.js
```

11) Executive Summary

- Build passes (`npm run build`) after Buffer polyfill, but bundle size warnings persist; no type errors reported.
- TypeScript check is clean (`npx tsc --noEmit`), yet ESLint blocks deployment until `any` usages and unused params are resolved.
- Wallet feature flag is active (`VITE_WALLET_ENABLED=true`), ME mint (`BdeqKm…PscS`) and rewards wallet (`8rjP7X…8KAE`) configured, uploads/edge flags remain disabled.
- Supabase query (anon key) returns three recent votes from Oct 25 2025, confirming database connectivity with current credentials.
- Solana CLI targets devnet with funded operator wallet (0.2444 SOL) and voter token account holds 7.5 ME; rewards account query needs retry due to RPC timeout.
- Git tree is dirty on `main` with sensitive files modified (.env & wallet/solana modules); branch is one commit ahead of origin but unpublished changes require review.
- GitHub Actions workflows and Vercel project file are absent; pipeline automation and deployment config need to be created or restored.
- Supabase Edge functions are undeployed locally because CLI login/link has not been completed; service-role secret still pending.

12) Cleanup Audit

Duplicate / Temporary Files Found

| Path | Reason |
| --- | --- |
| supabase/.temp/cli-latest | Supabase CLI cache marker from Oct 25; safe to regenerate after next `supabase start`. |
| artifacts/04-build-type-lint.txt | Legacy build/lint transcript from Oct 25; superseded by newer sanity logs. |
| artifacts/05-sanity-checks.txt | Prior automated sanity run output; redundant with fresh status data. |
| artifacts/EG-status.md | Previous status narrative retained for history; overlaps with this report. |
| dist/ | Generated Vite production build artifacts; should be cleaned before committing. |

Recommendations

- Archive or delete stale artifacts under `artifacts/` once this STATUS-REPORT is accepted to reduce clutter.
- Remove `supabase/.temp/cli-latest` after confirming no Supabase local dev sessions rely on it; CLI recreates the file automatically.
- Add `dist/` to `.gitignore` (if not already) and purge before releases to avoid accidental check-ins.
- Consolidate documentation by keeping a single canonical status file (this report) and migrating any actionable notes from `EG-status.md` before removal.

Structure Consolidation Plan

1. Resolve outstanding ESLint issues in `src/lib/wallet.ts`, `src/lib/solana.ts`, `src/lib/uploads.ts`, `src/main.tsx`, and `src/pages/Vote.tsx`, then rerun lint to ensure a clean baseline.
2. Finish Supabase CLI authentication (`supabase login`, `supabase link`) and deploy edge functions; store service role secret via `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` for consistency with function code.
3. Introduce a CI workflow under `.github/workflows/` covering build, type-check, lint, and Supabase function smoke tests to prevent regressions.
4. Document wallet configuration (.env expectations, devnet funding) in README and ensure `.env.local` stays developer-specific to limit churn in committed `.env`.

Safe-to-Purge After Review

- `dist/` (build artifacts) — regenerate via `npm run build` when needed.
- `supabase/.temp/cli-latest` — CLI will recreate; delete to keep repository clean.
- `artifacts/04-build-type-lint.txt`, `artifacts/05-sanity-checks.txt`, `artifacts/EG-status.md` — retain only the newest STATUS-REPORT or migrate contents elsewhere before deletion.
