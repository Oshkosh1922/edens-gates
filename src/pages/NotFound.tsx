import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'

export function NotFound() {
  return (
    <Shell title="Page not found" description="The route you tried to open does not exist. Try one of the main flows instead.">
      <div className="card-panel space-tight text-sm text-secondary">
        <p>Use the navigation to access active submission, voting, or reporting tools.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="btn-secondary text-sm">
            Return home
          </Link>
          <Link to="/vote" className="btn-primary text-sm">
            View active founders
          </Link>
        </div>
      </div>
    </Shell>
  )
}
