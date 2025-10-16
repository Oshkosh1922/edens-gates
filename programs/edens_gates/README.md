# Edens Gates Solana Program

Minimal Anchor program that charges exactly 0.5 $ME per vote, burns 50% and routes 50% to a rewards wallet.

## Program Overview

- **Program Name**: `edens_gates`
- **Program ID**: `EGatesVote111111111111111111111111111111111`
- **Instruction**: `vote_with_fee(founder_uuid: [u8;16])`

### What it does:
1. Verifies the $ME mint against a hardcoded constant
2. Computes fee using mint decimals: `0.5 * 10^decimals`
3. Burns exactly 50% of the fee from payer's $ME token account
4. Transfers 50% of the fee to the rewards wallet
5. Emits a `VoteCharged` event with all details

## Build and Deploy

### Prerequisites
```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### Build
```bash
anchor build
```

### Deploy to Devnet
```bash
# Set up devnet
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/devnet.json
solana config set --keypair ~/.config/solana/devnet.json
solana airdrop 2

# Deploy
anchor deploy
```

### Deploy to Mainnet
```bash
solana config set --url mainnet-beta
solana config set --keypair ~/.config/solana/mainnet.json
anchor deploy
```

## Configuration

### Update Constants for Production

Before mainnet deployment, update these constants in `src/lib.rs`:

```rust
// Replace ME_MINT_PLACEHOLDER with actual Magic Eden $ME mint
pub const ME_MINT: Pubkey = pubkey!("ACTUAL_ME_MINT_ADDRESS");

// Replace REWARDS_OWNER_PLACEHOLDER with actual rewards wallet
pub const REWARDS_OWNER: Pubkey = pubkey!("ACTUAL_REWARDS_WALLET_PUBKEY");
```

### Production Configuration:
- `ME_MINT`: `MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u` (Magic Eden $ME token)  
- `REWARDS_OWNER`: `8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE` (Edens Gates rewards wallet)

## Testing

```bash
# Run tests (if any)
anchor test

# Test program deployment
anchor deploy --provider.cluster devnet
```

## Security Features

✅ **Hardcoded constants** - No client-side tampering of mint/rewards addresses  
✅ **Exact fee calculation** - Uses mint decimals for precise 0.5 $ME charge  
✅ **No custody** - Program doesn't hold funds, only enforces burns/transfers  
✅ **Event emission** - Full audit trail via on-chain events  
✅ **Error handling** - Clear error codes for all failure modes  

## Integration

Use the TypeScript client helper in `src/lib/solana.ts` to integrate with your frontend:

```typescript
const { txSig } = await voteWithFee({
  connection,
  wallet,
  programId,
  founderUuid,
  meMint,
  rewardsOwner
});
```