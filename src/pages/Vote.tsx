// Visual Pass — Logic Preserved + Wallet Integration + On-chain Voting
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'
import { useWalletSafe } from '../lib/wallet'
import { WALLET_ON, ME_MINT, ME_DECIMALS, REWARDS_WALLET, SOLANA_RPC } from '../lib/flags'
import type { FounderWithVotes } from '../types/supabase'

type VoteStatus =
  | { state: 'idle' }
  | { state: 'error'; message: string }
  | { state: 'success'; message: string }

const STORAGE_KEY = 'edens-gates:voted-founder-ids'

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')

async function fingerprint(): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return `fallback-${Date.now()}`
  }
  const payload = `${navigator.userAgent}::${Intl.DateTimeFormat().resolvedOptions().timeZone}`
  const encoded = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return toHex(digest)
}

export function Vote() {
  const [founders, setFounders] = useState<FounderWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<VoteStatus>({ state: 'idle' })
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({})
  const [fingerprintHash, setFingerprintHash] = useState<string>('')
  
  // Wallet integration
  const wallet = useWalletSafe()
  const connectedWallet = wallet.publicKeyBase58
  const [votedFounderIds, setVotedFounderIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return []
      }
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    fingerprint().then(setFingerprintHash).catch(() => setFingerprintHash(`fallback-${Date.now()}`))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(votedFounderIds))
  }, [votedFounderIds])

  const loadFounders = useCallback(async () => {
    setLoading(true)
    setStatus({ state: 'idle' })

    const { data, error } = await supabase.rpc('get_active_founders_with_votes')

    if (error) {
      setStatus({ state: 'error', message: error.message })
      setLoading(false)
      return
    }

    setFounders((data ?? []) as FounderWithVotes[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadFounders()
  }, [loadFounders])

  const sortedFounders = useMemo(
    () => [...founders].sort((a, b) => b.vote_count - a.vote_count),
    [founders],
  )

  const hasAlreadyVoted = (founderId: string) => votedFounderIds.includes(founderId)

  const handleVote = async (founderId: string) => {
    if (pendingVotes[founderId]) {
      return
    }
    setPendingVotes((prev) => ({ ...prev, [founderId]: true }))
    setStatus({ state: 'idle' })

    const revert = () =>
      setFounders((prev) =>
        prev.map((founder) =>
          founder.id === founderId ? { ...founder, vote_count: Math.max(founder.vote_count - 1, 0) } : founder,
        ),
      )

    // Optimistically update vote count
    if (!hasAlreadyVoted(founderId)) {
      setFounders((prev) =>
        prev.map((founder) =>
          founder.id === founderId ? { ...founder, vote_count: founder.vote_count + 1 } : founder,
        ),
      )
    }

    try {
      let txSignature: string | null = null

      if (WALLET_ON && wallet.connected && wallet.publicKeyBase58) {
        try {
          if (!ME_MINT || !REWARDS_WALLET) {
            throw new Error('Wallet voting requires VITE_ME_MINT and VITE_REWARDS_WALLET.')
          }

          const decimals = Number.isFinite(ME_DECIMALS) ? Math.max(0, Math.floor(ME_DECIMALS)) : 6
          const mint = new PublicKey(ME_MINT)
          const rewardsOwner = new PublicKey(REWARDS_WALLET)
          const voter = new PublicKey(wallet.publicKeyBase58)
          const connection = new Connection(SOLANA_RPC, 'confirmed')

          const amountBaseUnits = BigInt(Math.round(0.5 * Math.pow(10, decimals)))
          if (amountBaseUnits <= 0n) {
            throw new Error('Unable to derive a token amount for 0.5 $ME with current ME_DECIMALS value.')
          }

          const voterAta = await getAssociatedTokenAddress(mint, voter)
          const rewardsAta = await getAssociatedTokenAddress(mint, rewardsOwner)

          const instructions = []

          const voterAccount = await connection.getAccountInfo(voterAta)
          if (!voterAccount) {
            instructions.push(createAssociatedTokenAccountInstruction(voter, voterAta, voter, mint))
          }

          const rewardsAccount = await connection.getAccountInfo(rewardsAta)
          if (!rewardsAccount) {
            instructions.push(createAssociatedTokenAccountInstruction(voter, rewardsAta, rewardsOwner, mint))
          }

          instructions.push(
            createTransferCheckedInstruction(
              voterAta,
              mint,
              rewardsAta,
              voter,
              amountBaseUnits,
              decimals,
            ),
          )

          const transaction = new Transaction()
          transaction.add(...instructions)

          txSignature = await wallet.signAndSend(transaction)
          setStatus({
            state: 'success',
            message: `Vote sent on-chain. Tx: ${txSignature.slice(0, 8)}…${txSignature.slice(-8)}`,
          })
        } catch (onChainError: any) {
          console.error('Token transfer failed:', onChainError)
          if (!hasAlreadyVoted(founderId)) {
            revert()
          }
          setStatus({
            state: 'error',
            message: onChainError instanceof Error ? onChainError.message : 'Unable to send token transfer.',
          })
          setPendingVotes((prev) => ({ ...prev, [founderId]: false }))
          return
        }
      }

      const { error } = await supabase.from('votes').insert({
        founder_id: founderId,
        wallet: WALLET_ON ? connectedWallet : null,
        ip_hash: fingerprintHash || null,
        tx_sig: txSignature,
      })

      if (error) {
        if (!hasAlreadyVoted(founderId)) {
          revert()
        }
        setStatus({ state: 'error', message: `Database error: ${error.message}` })
        setPendingVotes((prev) => ({ ...prev, [founderId]: false }))
        return
      }

      if (!hasAlreadyVoted(founderId)) {
        setVotedFounderIds((prev) => [...prev, founderId])
      }

      // Success message differs based on whether on-chain vote was used
      if (!txSignature) {
        setStatus({ state: 'success', message: 'Vote recorded. Thanks for supporting a founder.' })
      }
      // On-chain success message already set above
    } catch (error: any) {
      console.error('Vote failed:', error)
      if (!hasAlreadyVoted(founderId)) {
        revert()
      }
      setStatus({ state: 'error', message: error.message || 'Vote failed. Please try again.' })
    } finally {
      setPendingVotes((prev) => ({ ...prev, [founderId]: false }))
    }
  }

  return (
    <Shell
      title="Vote on active founders"
      description="Every vote pushes founders closer to a verified badge on Magic Eden. Review the pitch, explore links, and lend your signal."
    >
      {/* $ME Banner - only show when wallet enabled */}
      {WALLET_ON && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass-panel border-egPurple/30 bg-gradient-to-r from-egPurple/10 to-egPink/10"
        >
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-egPurple to-egPink flex items-center justify-center">
              <span className="text-white text-sm font-bold">ME</span>
            </div>
            <span className="text-primary text-sm font-semibold sm:text-base">
              Voting costs 0.5 $ME (devnet). On-chain deduction &amp; burn finalization are coming.
            </span>
          </div>
        </motion.div>
      )}

      {/* Wallet gating - only show when wallet enabled but not connected */}
      {WALLET_ON && !wallet.connected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 card-panel border-amber-500/30 bg-amber-500/5 text-center py-12"
        >
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-egPurple to-egPink flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-primary font-semibold text-lg">Connect Your Wallet to Vote</h3>
              <p className="text-secondary max-w-md mx-auto">
                Connect your Magic Eden or Solana wallet to cast votes and help founders earn verification on Magic Eden.
              </p>
            </div>
            <button
              onClick={wallet.connect}
              className="btn-primary mt-4"
            >
              Connect Wallet
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {(status.state === 'error' || status.state === 'success') && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-8"
          >
            {status.state === 'error' ? (
              <div className="glass-panel border-red-500/20 bg-red-500/10">
                <p className="text-sm font-medium text-red-300">{status.message}</p>
              </div>
            ) : null}
            {status.state === 'success' ? (
              <div className="glass-panel border-emerald-500/20 bg-emerald-500/10">
                <p className="text-sm font-medium text-emerald-300">{status.message}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div 
          className="glass-panel flex w-full items-center justify-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3 text-secondary">
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/30 border-t-accent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="font-medium">Loading active founders…</span>
          </div>
        </motion.div>
      ) : sortedFounders.length === 0 ? (
        <motion.div 
          className="card-panel flex w-full items-center justify-center border-dashed py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center space-tight">
            <p className="text-secondary font-medium">No active founders this round.</p>
            <p className="text-sm text-tertiary">Check back soon for new submissions.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="grid gap-8 lg:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sortedFounders.map((founder, index) => {
            const alreadyVoted = hasAlreadyVoted(founder.id)
            const isPending = pendingVotes[founder.id]
            const walletRequired = WALLET_ON && !wallet.connected
            
            return (
              <motion.article
                key={founder.id}
                className="group card-panel space-content flex h-full flex-col justify-between hover:border-white/[0.15] hover:bg-white/[0.08]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                whileHover={{ y: -2, scale: 1.01 }}
              >
                <div className="space-content">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <motion.h2 
                        className="text-2xl font-bold text-primary mb-2 leading-tight"
                        layoutId={`title-${founder.id}`}
                      >
                        {founder.name}
                      </motion.h2>
                      {founder.handle ? (
                        <p className="text-base text-tertiary font-medium">{founder.handle}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.05] px-4 py-2 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                      <div className="h-2 w-2 rounded-full bg-eg-gradient" />
                      <span className="text-sm font-semibold text-primary">
                        {founder.vote_count} {founder.vote_count === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-base leading-relaxed text-secondary line-clamp-4">
                    {founder.description}
                  </p>
                  
                  {(founder.site_link || founder.video_url) && (
                    <div className="flex flex-wrap gap-3">
                      {founder.site_link ? (
                        <a
                          href={founder.site_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary text-sm"
                        >
                          <span>Website</span>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : null}
                      {founder.video_url ? (
                        <a
                          href={founder.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary text-sm"
                        >
                          <span>Pitch Video</span>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2 2V9a2 2 0 012-2z" />
                          </svg>
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <motion.button
                  type="button"
                  onClick={() => handleVote(founder.id)}
                  disabled={isPending || alreadyVoted || walletRequired}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300 ${
                    alreadyVoted
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-default'
                      : isPending
                      ? 'bg-white/10 border border-white/20 text-white/60 cursor-wait'
                      : walletRequired
                      ? 'bg-white/5 border border-white/15 text-white/60 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                  whileHover={!alreadyVoted && !isPending ? { scale: 1.01 } : {}}
                  whileTap={!alreadyVoted && !isPending ? { scale: 0.99 } : {}}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {alreadyVoted ? (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Vote submitted
                    </>
                  ) : isPending ? (
                    <>
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Submitting…
                    </>
                  ) : walletRequired ? (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.656 0 3-1.567 3-3.5S13.656 4 12 4 9 5.567 9 7.5 10.344 11 12 11zm0 2c-2.761 0-5 2.015-5 4.5V19a1 1 0 001 1h8a1 1 0 001-1v-1.5c0-2.485-2.239-4.5-5-4.5z" />
                      </svg>
                      Connect wallet to vote
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Vote for {founder.name}
                    </>
                  )}
                </motion.button>
              </motion.article>
            )
          })}
        </motion.div>
      )}
    </Shell>
  )
}
