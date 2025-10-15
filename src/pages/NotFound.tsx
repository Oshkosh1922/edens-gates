import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'

export function NotFound() {
  return (
    <Shell title="Page not found" description="The route you tried to open does not exist. Try one of the main flows instead.">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-8 text-sm text-white/70">
        <p>Use the navigation to access active submission, voting, or reporting tools.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:text-white"
          >
            Return home
          </Link>
          <Link
            to="/vote"
            className="inline-flex items-center justify-center rounded-full bg-eg-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            View active founders
          </Link>
        </div>
      </div>
    </Shell>
  )
}
