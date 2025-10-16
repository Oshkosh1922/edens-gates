import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="card-panel space-content overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-48 w-48 rounded-full bg-eg-gradient opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-eg-gradient opacity-15 blur-3xl" />
      <div className="relative z-10 max-w-4xl space-content">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Edens Gates</p>
        <h1 className="text-4xl font-bold text-primary tracking-tight leading-tight md:text-5xl">
          Community-powered signal for the Magic Eden ecosystem
        </h1>
        <p className="text-lg text-secondary leading-relaxed">
          Edens Gates is where founders earn trust through transparent weekly reviews from the community. Submit your project, rally support, and build a verified track record in the open.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/submit" className="btn-primary">
            Submit a Founder Profile
          </Link>
          <Link to="/vote" className="btn-secondary">
            Review Active Founders
          </Link>
        </div>
        <dl className="grid gap-6 pt-6 text-base sm:grid-cols-3">
          <div>
            <dt className="text-tertiary text-sm font-medium">Weekly Cadence</dt>
            <dd className="text-secondary">New voting rounds every Monday</dd>
          </div>
          <div>
            <dt className="text-tertiary text-sm font-medium">Transparent Results</dt>
            <dd className="text-secondary">On-chain ready Supabase audit trail</dd>
          </div>
          <div>
            <dt className="text-tertiary text-sm font-medium">Community First</dt>
            <dd className="text-secondary">Signal driven by collectors and builders</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
