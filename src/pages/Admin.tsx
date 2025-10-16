// Visual Pass — Logic Preserved
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-8"
          >
            <div className={`rounded-2xl border px-6 py-4 ${
              message.kind === 'error' 
                ? 'border-red-500/20 bg-red-500/10' 
                : 'border-emerald-500/20 bg-emerald-500/10'
            }`}>
              <p className={`text-sm font-medium ${
                message.kind === 'error' ? 'text-red-300' : 'text-emerald-300'
              }`}>
                {message.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showClientModeBanner ? (
        <motion.div 
          className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-sm text-amber-200 leading-relaxed">
            <span className="font-semibold">Development Mode:</span> Admin actions are running with client keys only. 
            Set <code className="rounded bg-amber-500/20 px-2 py-1 font-mono text-xs">VITE_USE_EDGE_FUNCTIONS=true</code> once Edge Functions are deployed to move privileged actions server-side.
          </p>
        </motion.div>
      ) : null}

      {loading ? (
        <motion.div 
          className="glass-panel flex w-full items-center justify-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3 text-white/70">
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/30 border-t-egPink"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="font-medium">Loading founder data…</span>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.section 
            className="glass-panel p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.header 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
              </div>
              <motion.div
                className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-semibold text-amber-300">
                  {pendingFounders.length} awaiting
                </span>
              </motion.div>
            </motion.header>
            {pendingFounders.length === 0 ? (
              <motion.div 
                className="rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02] p-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                  <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-base font-medium text-white/50">No pending submissions</p>
                <p className="text-sm text-white/30 mt-1">Founders will appear here once they apply.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {pendingFounders.map((founder, index) => (
                  <motion.article
                    key={founder.id}
                    className="glass-panel p-6 hover:border-white/[0.15] transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{founder.name}</h3>
                          {founder.handle ? <p className="text-sm text-white/60 font-medium">{founder.handle}</p> : null}
                        </div>
                        <p className="text-base leading-relaxed text-white/80">{founder.description}</p>
                        <div className="flex flex-wrap gap-3">
                          {founder.site_link ? (
                            <a
                              href={founder.site_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white hover:scale-105 active:scale-95"
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
                              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white hover:scale-105 active:scale-95"
                            >
                              <span>Pitch Video</span>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                              </svg>
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-3 lg:flex-col lg:w-32">
                        <button
                          type="button"
                          onClick={() => updateStatus(founder.id, 'rejected')}
                          disabled={actionState[founder.id]}
                          className="flex-1 lg:flex-none rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(founder.id, 'approved')}
                          disabled={actionState[founder.id]}
                          className="flex-1 lg:flex-none btn-primary disabled:cursor-not-allowed disabled:opacity-60 hover:scale-105 active:scale-95 disabled:hover:scale-100 transition-transform duration-200"
                        >
                          {actionState[founder.id] ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section 
            className="glass-panel p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.header 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <h2 className="text-2xl font-bold text-white">Approved Roster</h2>
              </div>
              <motion.div
                className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-semibold text-emerald-300">
                  {approvedFounders.length} total
                </span>
              </motion.div>
            </motion.header>
            
            {approvedFounders.length === 0 ? (
              <motion.div 
                className="rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02] p-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                  <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-white/50">No approved founders yet</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {approvedFounders.map((founder, index) => (
                  <motion.article
                    key={founder.id}
                    className="glass-panel p-6 hover:border-white/[0.15] transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{founder.name}</h3>
                        <p className="text-base text-white/60 font-medium">{founder.handle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleActive(founder.id, !founder.is_active)}
                        disabled={actionState[founder.id]}
                        className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-[180px] hover:scale-105 active:scale-95 disabled:hover:scale-100 ${
                          founder.is_active
                            ? 'bg-gradient-to-r from-egPink to-egPurple text-white shadow-lg shadow-egPink/25 hover:shadow-egPink/35'
                            : 'border border-white/[0.12] bg-white/[0.03] text-white/70 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {actionState[founder.id] 
                          ? 'Processing...' 
                          : founder.is_active 
                          ? 'Active in round' 
                          : 'Activate for round'
                        }
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section 
            className="glass-panel p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.header 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-egPurple to-egPink animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Publish Weekly Winner</h2>
              </div>
              <motion.div
                className="flex items-center gap-2 rounded-full border border-egPink/30 bg-egPink/10 px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-semibold text-egPink">
                  {activeFounders.length} active
                </span>
              </motion.div>
            </motion.header>
            
            <motion.div 
              className="glass-panel p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="grid gap-6 lg:grid-cols-[2fr,1fr,auto] lg:items-end">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">
                    Active founder *
                  </label>
                  <select
                    value={selectedWinnerId}
                    onChange={(event) => setSelectedWinnerId(event.target.value)}
                    className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.03] px-6 py-4 text-white backdrop-blur-xl transition-colors duration-200 focus:border-egPink/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-egPink/20"
                  >
                    <option value="" className="bg-egDark text-white">Select founder</option>
                    {activeFounders.map((founder) => (
                      <option key={founder.id} value={founder.id} className="bg-egDark text-white">
                        {founder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">
                    Week number *
                  </label>
                  <input
                    value={weekNumber}
                    onChange={(event) => setWeekNumber(event.target.value)}
                    className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.03] px-6 py-4 text-white backdrop-blur-xl transition-colors duration-200 focus:border-egPink/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-egPink/20"
                    placeholder="42"
                    inputMode="numeric"
                    min="1"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handlePublishWinner}
                  disabled={publishLoading || activeFounders.length === 0}
                  className="btn-primary lg:min-w-[160px] disabled:cursor-not-allowed disabled:opacity-60 hover:scale-105 active:scale-95 disabled:hover:scale-100 transition-transform duration-200"
                >
                  {publishLoading ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Publishing…
                    </div>
                  ) : (
                    'Publish winner'
                  )}
                </button>
              </div>
              
              <motion.p 
                className="mt-6 text-sm text-white/50 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="font-semibold">Note:</span> Publishing writes a row to winners and resets all founders to inactive. 
                Magic Eden can mirror the results downstream.
              </motion.p>
            </motion.div>
          </motion.section>
        </motion.div>
      )}
    </Shell>
  )
}
