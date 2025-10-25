// Minimal, production-ready Solana client for Edens Gates vote fees
import {
  Connection,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from '@solana/web3.js'
import type { TransactionInstruction } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

const VOTE_FEE_ME = 0.5

// Types
export type VoteParams = {
  connection: Connection
  wallet: { 
    publicKey: PublicKey
    signTransaction: (tx: Transaction) => Promise<Transaction> 
  }
  meMint: PublicKey             // $ME mint address
  rewardsOwner: PublicKey       // rewards wallet owner
}

type VoteInsertPayload = {
  founder_id: string
  wallet: string | null
  tx_sig: string
  ip_hash: string | null
}

type SupabaseInsertResult = {
  data: unknown
  error: { message: string } | null
}

type SupabaseVotesClient = {
  insert: (payload: VoteInsertPayload) => PromiseLike<SupabaseInsertResult>
}

type SupabaseClientLike = {
  from: (table: 'votes') => SupabaseVotesClient
}

export type RecordVoteParams = {
  supabase: SupabaseClientLike
  founderId: string
  wallet?: string
  txSig: string
}

export async function getAtaOrCreate(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  payer: PublicKey = owner
): Promise<{ ata: PublicKey; instruction?: TransactionInstruction }> {
  const ata = await getAssociatedTokenAddress(mint, owner)
  
  try {
    await connection.getTokenAccountBalance(ata)
    return { ata }
  } catch {
    // ATA doesn't exist, create instruction
    const instruction = createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    return { ata, instruction }
  }
}

// Main vote function
export async function voteWithFee(params: VoteParams): Promise<{ txSig: string }> {
  const { connection, wallet, meMint, rewardsOwner } = params
  
  // Build transaction
  const tx = new Transaction()
  
  // Add compute budget
  tx.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 })
  )
  
  // Get/create payer's ME ATA
  const { ata: payerMeAta, instruction: payerAtaIx } = await getAtaOrCreate(
    connection,
    wallet.publicKey,
    meMint
  )
  if (payerAtaIx) tx.add(payerAtaIx)
  
  // Get/create rewards ATA
  const { ata: rewardsAta, instruction: rewardsAtaIx } = await getAtaOrCreate(
    connection,
    rewardsOwner,
    meMint,
    wallet.publicKey // payer creates if needed
  )
  if (rewardsAtaIx) tx.add(rewardsAtaIx)
  
  const decimals = getMeDecimals()
  const feeAmount = toTokenAmount(VOTE_FEE_ME, decimals)

  tx.add(
    createTransferInstruction(
      payerMeAta,
      rewardsAta,
      wallet.publicKey,
      feeAmount,
      [],
      TOKEN_PROGRAM_ID,
    ),
  )
  
  // Set recent blockhash and fee payer
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = wallet.publicKey
  
  // Sign and send
  const signedTx = await wallet.signTransaction(tx)
  const txSig = await connection.sendRawTransaction(signedTx.serialize())
  
  // Confirm
  await connection.confirmTransaction(txSig, 'confirmed')
  
  return { txSig }
}

const toTokenAmount = (amount: number, decimals: number): bigint => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid token amount configuration')
  }
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error('Invalid token decimals configuration')
  }
  const scale = 10 ** decimals
  return BigInt(Math.round(amount * scale))
}

// Helper to record vote in Supabase
export async function recordVoteTx(params: RecordVoteParams): Promise<void> {
  const { supabase, founderId, wallet, txSig } = params
  
  const { error } = await supabase
    .from('votes')
    .insert({
      founder_id: founderId,
      wallet: wallet ?? null,
      tx_sig: txSig,
      ip_hash: null, // Can be set by caller if needed
    })
  
  if (error) {
    throw new Error(`Failed to record vote: ${error.message}`)
  }
}

// Example usage (commented, not executed):
/*
const { txSig } = await voteWithFee({ 
  connection, 
  wallet, 
  programId, 
  founderUuid, 
  meMint, 
  rewardsOwner 
});

await recordVoteTx({ 
  supabase, 
  founderId, 
  wallet: wallet.publicKey.toBase58(), 
  txSig 
});
*/

// Backward compatibility exports
export const getSolanaCluster = (): string => {
  return import.meta.env.VITE_CLUSTER || 'devnet'
}

export const getMeMintAddress = (): PublicKey => {
  const mintStr = import.meta.env.VITE_ME_MINT
  if (!mintStr) {
    throw new Error('VITE_ME_MINT environment variable not set')
  }
  return new PublicKey(mintStr)
}

export const getMeDecimals = (): number => {
  const raw = import.meta.env.VITE_ME_DECIMALS
  if (raw === undefined) {
    throw new Error('VITE_ME_DECIMALS environment variable not set')
  }
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error('VITE_ME_DECIMALS must be a non-negative integer')
  }
  return parsed
}

export const getRewardsVaultAuthority = (): PublicKey => {
  const walletStr =
    import.meta.env.VITE_REWARDS_WALLET ?? import.meta.env.VITE_REWARDS_VAULT
  if (!walletStr) {
    throw new Error('VITE_REWARDS_WALLET environment variable not set')
  }
  return new PublicKey(walletStr)
}

export const getConnection = (): Connection => {
  const rpcOverride = import.meta.env.VITE_SOLANA_RPC
  if (rpcOverride) {
    return new Connection(rpcOverride, 'confirmed')
  }

  const cluster = getSolanaCluster()
  const rpcUrl = cluster === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com'

  return new Connection(rpcUrl, 'confirmed')
}
