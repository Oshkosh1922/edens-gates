import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-egPurple/20 via-egDark to-egPink/20 p-10 shadow-glow">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-eg-gradient opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-eg-gradient opacity-30 blur-3xl" />
      <div className="relative z-10 max-w-3xl space-y-6">
        <p className="text-xs uppercase tracking-[0.35em] text-egPink/80">Edens Gates</p>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Community-powered signal for the Magic Eden ecosystem
        </h1>
        <p className="text-lg text-white/70">
          Edens Gates is where founders earn trust through transparent weekly reviews from the community. Submit your project, rally support, and build a verified track record in the open.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/submit"
            className="inline-flex items-center justify-center rounded-full bg-eg-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            Submit a Founder Profile
          </Link>
          <Link
            to="/vote"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur transition hover:text-white"
          >
            Review Active Founders
          </Link>
        </div>
        <dl className="grid gap-6 pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-white/50">Weekly Cadence</dt>
            <dd className="text-white">New voting rounds every Monday</dd>
          </div>
          <div>
            <dt className="text-white/50">Transparent Results</dt>
            <dd className="text-white">On-chain ready Supabase audit trail</dd>
          </div>
          <div>
            <dt className="text-white/50">Community First</dt>
            <dd className="text-white">Signal driven by collectors and builders</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
