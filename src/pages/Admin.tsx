import { useCallback, useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import {
  EDGE_FUNCTIONS_ENABLED,
  approveFounder,
  publishWinner as publishWinnerApi,
  toggleFounderActive,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import type { Founder } from '../types/supabase'

type MessageState = {
  kind: 'success' | 'error'
  text: string
}

type PendingActionState = Record<string, boolean>

export function Admin() {
  const [pendingFounders, setPendingFounders] = useState<Founder[]>([])
  const [approvedFounders, setApprovedFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [actionState, setActionState] = useState<PendingActionState>({})
  const [publishLoading, setPublishLoading] = useState(false)
  const [selectedWinnerId, setSelectedWinnerId] = useState('')
  const [weekNumber, setWeekNumber] = useState('')

  const showClientModeBanner = !EDGE_FUNCTIONS_ENABLED

  const loadFounders = useCallback(async () => {
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage({ kind: 'error', text: error.message })
      setLoading(false)
      return
    }

    const rows = data ?? []
    setPendingFounders(rows.filter((founder) => founder.status === 'pending'))
    setApprovedFounders(rows.filter((founder) => founder.status === 'approved'))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadFounders()
  }, [loadFounders])

  const setActionPending = (id: string, pending: boolean) => {
    setActionState((prev) => ({ ...prev, [id]: pending }))
  }

  const updateStatus = async (founderId: string, status: 'approved' | 'rejected') => {
    setActionPending(founderId, true)
    setMessage(null)

    if (status === 'approved') {
      const { error } = await approveFounder(founderId)

      if (error) {
        setMessage({ kind: 'error', text: error })
        setActionPending(founderId, false)
        return
      }

      setMessage({ kind: 'success', text: 'Founder approved.' })
      setActionPending(founderId, false)
      await loadFounders()
      return
    }

    const { error } = await supabase
      .from('founders')
      .update({ status, is_active: false })
      .eq('id', founderId)

    if (error) {
      setMessage({ kind: 'error', text: error.message })
      setActionPending(founderId, false)
      return
    }

    setMessage({ kind: 'success', text: 'Founder rejected.' })
    setActionPending(founderId, false)
    await loadFounders()
  }

  const toggleActive = async (founderId: string, nextActive: boolean) => {
    setActionPending(founderId, true)
    setMessage(null)

    const { error } = await toggleFounderActive(founderId, nextActive)

    if (error) {
      setMessage({ kind: 'error', text: error })
      setActionPending(founderId, false)
      return
    }

    setMessage({ kind: 'success', text: `Founder ${nextActive ? 'activated' : 'removed from round'}.` })
    setActionPending(founderId, false)
    await loadFounders()
  }

  const activeFounders = useMemo(
    () => approvedFounders.filter((founder) => founder.is_active),
    [approvedFounders],
  )

  const handlePublishWinner = async () => {
    if (!selectedWinnerId) {
      setMessage({ kind: 'error', text: 'Select an active founder before publishing a winner.' })
      return
    }

    const parsedWeek = Number.parseInt(weekNumber, 10)
    if (Number.isNaN(parsedWeek) || parsedWeek <= 0) {
      setMessage({ kind: 'error', text: 'Provide a valid week number (1 or greater).' })
      return
    }

    setPublishLoading(true)
    setMessage(null)

    const { error } = await publishWinnerApi(selectedWinnerId, parsedWeek)

    if (error) {
      setMessage({ kind: 'error', text: error })
      setPublishLoading(false)
      return
    }

    setMessage({ kind: 'success', text: 'Winner published and round reset.' })
    setSelectedWinnerId('')
    setWeekNumber('')
    setPublishLoading(false)
    await loadFounders()
  }

  return (
    <Shell
      title="Admin control center"
      description="Approve founders, run weekly voting rounds, and publish final results. Actions write directly to Supabase."
    >
      {message ? (
        <p className={`text-sm ${message.kind === 'error' ? 'text-egPink' : 'text-emerald-300'}`}>{message.text}</p>
      ) : null}

      {showClientModeBanner ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          Admin mode is running with client keys only. Set <code className="rounded bg-amber-500/20 px-1">VITE_USE_EDGE_FUNCTIONS=true</code> once Edge Functions are deployed to move privileged actions server-side.
        </div>
      ) : null}

      {loading ? (
        <div className="flex w-full items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-20 text-white/60">
          Loading founder data…
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Pending approvals</h2>
              <span className="text-xs text-white/40">{pendingFounders.length} awaiting</span>
            </header>
            {pendingFounders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-white/40">
                No pending submissions. Founders will appear here once they apply.
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingFounders.map((founder) => (
                  <article
                    key={founder.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{founder.name}</h3>
                          {founder.handle ? <p className="text-sm text-white/60">{founder.handle}</p> : null}
                        </div>
                        <p className="text-sm leading-relaxed text-white/70">{founder.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
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
                      <div className="flex gap-3 self-end md:self-start">
                        <button
                          type="button"
                          onClick={() => updateStatus(founder.id, 'rejected')}
                          disabled={actionState[founder.id]}
                          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(founder.id, 'approved')}
                          disabled={actionState[founder.id]}
                          className="rounded-full bg-eg-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Approved roster</h2>
              <span className="text-xs text-white/40">{approvedFounders.length} total</span>
            </header>
            {approvedFounders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-white/40">
                No approved founders yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {approvedFounders.map((founder) => (
                  <article
                    key={founder.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{founder.name}</h3>
                        <p className="text-sm text-white/60">{founder.handle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleActive(founder.id, !founder.is_active)}
                        disabled={actionState[founder.id]}
                        className={[
                          'rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                          founder.is_active
                            ? 'bg-egPink text-white shadow-glow hover:opacity-90'
                            : 'border border-white/10 text-white/70 hover:text-white',
                        ].join(' ')}
                      >
                        {founder.is_active ? 'Active in round' : 'Activate for round'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Publish weekly winner</h2>
              <span className="text-xs text-white/40">{activeFounders.length} active</span>
            </header>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20">
              <div className="grid gap-4 md:grid-cols-[2fr,1fr,auto] md:items-end">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Active founder *</span>
                  <select
                    value={selectedWinnerId}
                    onChange={(event) => setSelectedWinnerId(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-egDark px-4 py-3 text-sm text-white focus:border-egPink focus:outline-none"
                  >
                    <option value="">Select founder</option>
                    {activeFounders.map((founder) => (
                      <option key={founder.id} value={founder.id}>
                        {founder.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Week number *</span>
                  <input
                    value={weekNumber}
                    onChange={(event) => setWeekNumber(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-egDark px-4 py-3 text-sm text-white focus:border-egPink focus:outline-none"
                    placeholder="42"
                    inputMode="numeric"
                    min="1"
                  />
                </label>
                <button
                  type="button"
                  onClick={handlePublishWinner}
                  disabled={publishLoading || activeFounders.length === 0}
                  className="rounded-full bg-eg-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishLoading ? 'Publishing…' : 'Publish winner'}
                </button>
              </div>
              <p className="mt-3 text-xs text-white/40">
                Publishing writes a row to winners and resets all founders to inactive. Magic Eden can mirror the results downstream.
              </p>
            </div>
          </section>
        </div>
      )}
    </Shell>
  )
}
