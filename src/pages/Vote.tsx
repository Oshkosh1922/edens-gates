import { useCallback, useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'
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

    if (!hasAlreadyVoted(founderId)) {
      setFounders((prev) =>
        prev.map((founder) =>
          founder.id === founderId ? { ...founder, vote_count: founder.vote_count + 1 } : founder,
        ),
      )
    }

    const { error } = await supabase.from('votes').insert({
      founder_id: founderId,
      wallet: null,
      ip_hash: fingerprintHash || null,
    })

    if (error) {
      if (!hasAlreadyVoted(founderId)) {
        revert()
      }
      setStatus({ state: 'error', message: error.message })
      setPendingVotes((prev) => ({ ...prev, [founderId]: false }))
      return
    }

    if (!hasAlreadyVoted(founderId)) {
      setVotedFounderIds((prev) => [...prev, founderId])
    }

    setStatus({ state: 'success', message: 'Vote recorded. Thanks for supporting a founder.' })
    setPendingVotes((prev) => ({ ...prev, [founderId]: false }))
  }

  return (
    <Shell
      title="Vote on active founders"
      description="Every vote pushes founders closer to a verified badge on Magic Eden. Review the pitch, explore links, and lend your signal."
    >
      <div className="space-y-4">
        {status.state === 'error' ? <p className="text-sm text-egPink">{status.message}</p> : null}
        {status.state === 'success' ? <p className="text-sm text-emerald-300">{status.message}</p> : null}
      </div>
      {loading ? (
        <div className="flex w-full items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-20 text-white/60">
          Loading active founders…
        </div>
      ) : sortedFounders.length === 0 ? (
        <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-white/40">
          No active founders this round.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedFounders.map((founder) => {
            const alreadyVoted = hasAlreadyVoted(founder.id)
            return (
              <article
                key={founder.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{founder.name}</h2>
                      {founder.handle ? <p className="text-sm text-white/60">{founder.handle}</p> : null}
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {founder.vote_count} votes
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">{founder.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {founder.site_link ? (
                      <a
                        href={founder.site_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/80 transition hover:text-white"
                      >
                        Site ↗
                      </a>
                    ) : null}
                    {founder.video_url ? (
                      <a
                        href={founder.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/80 transition hover:text-white"
                      >
                        Pitch video ↗
                      </a>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleVote(founder.id)}
                  disabled={pendingVotes[founder.id] || alreadyVoted}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-eg-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {alreadyVoted ? 'Vote submitted' : pendingVotes[founder.id] ? 'Submitting…' : 'Vote'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </Shell>
  )
}
