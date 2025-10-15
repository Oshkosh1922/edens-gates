import { useEffect, useMemo, useState } from 'react'
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
      {error ? <p className="text-sm text-egPink">{error}</p> : null}
      {loading ? (
        <div className="flex w-full items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-20 text-white/60">
          Loading winners…
        </div>
      ) : winners.length === 0 ? (
        <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-white/40">
          Winners will appear after the first round is published.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {winners.map((winner) => (
            <article
              key={winner.id}
              className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-egPink/80">
                    Week {winner.week_number}
                  </p>
                  <h2 className="text-xl font-semibold text-white">{winner.founders.name}</h2>
                  {winner.founders.handle ? (
                    <p className="text-sm text-white/60">{winner.founders.handle}</p>
                  ) : null}
                </div>
                <span className="text-xs text-white/40">{formatter.format(new Date(winner.created_at))}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {winner.founders.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {winner.founders.site_link ? (
                  <a
                    href={winner.founders.site_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/80 transition hover:text-white"
                  >
                    Site ↗
                  </a>
                ) : null}
                {winner.founders.video_url ? (
                  <a
                    href={winner.founders.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/80 transition hover:text-white"
                  >
                    Pitch video ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  )
}
