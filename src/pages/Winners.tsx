// Visual Pass — Logic Preserved
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'
import type { WinnerWithFounder } from '../types/supabase'

export function Winners() {
  const [winners, setWinners] = useState<WinnerWithFounder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('winners')
        .select<'id, founder_id, week_number, created_at, founders(*)', WinnerWithFounder>(
          'id, founder_id, week_number, created_at, founders(*)',
        )
        .order('created_at', { ascending: false })

      if (queryError) {
        setError(queryError.message)
        setLoading(false)
        return
      }

      setWinners(data ?? [])
      setLoading(false)
    }

    load()
  }, [])

  const formatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  )

  return (
    <Shell
      title="Hall of winners"
      description="Every published round gets locked in here. Browse the founders who cleared the gates and earned community signal."
    >
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass-panel border-red-500/20 bg-red-500/10"
        >
          <p className="text-sm font-medium text-red-300">{error}</p>
        </motion.div>
      ) : null}

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
            <span className="font-medium">Loading winners…</span>
          </div>
        </motion.div>
      ) : winners.length === 0 ? (
        <motion.div 
          className="card-panel flex w-full items-center justify-center border-dashed py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center space-content">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-egPurple/20 to-egPink/20 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-secondary">No winners yet</h3>
            <p className="text-base text-tertiary max-w-md mx-auto">
              Winners will appear after the first round is published.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {winners.map((winner, index) => (
            <motion.article
              key={winner.id}
              className="group card-panel space-content hover:border-white/[0.15] hover:bg-white/[0.08] hover:scale-[1.02]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-tight">
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-egPurple/20 to-egPink/20 border border-accent/30 px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-eg-gradient animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">
                      Week {winner.week_number}
                    </span>
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-bold text-primary leading-tight"
                    layoutId={`winner-title-${winner.id}`}
                  >
                    {winner.founders.name}
                  </motion.h2>
                  {winner.founders.handle ? (
                    <p className="text-base text-tertiary font-medium">{winner.founders.handle}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <time className="text-sm text-tertiary font-medium">
                    {formatter.format(new Date(winner.created_at))}
                  </time>
                </div>
              </div>

              <p className="text-base leading-relaxed text-secondary line-clamp-3">
                {winner.founders.description}
              </p>

              {(winner.founders.site_link || winner.founders.video_url) && (
                <div className="flex flex-wrap gap-3">
                  {winner.founders.site_link ? (
                    <motion.a
                      href={winner.founders.site_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Website</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </motion.a>
                  ) : null}
                  {winner.founders.video_url ? (
                    <motion.a
                      href={winner.founders.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Pitch Video</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                      </svg>
                    </motion.a>
                  ) : null}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      )}
    </Shell>
  )
}
