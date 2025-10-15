import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/submit', label: 'Submit' },
  { to: '/vote', label: 'Vote' },
  { to: '/winners', label: 'Winners' },
  { to: '/admin', label: 'Admin' },
]

export function Nav() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-egDark/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="h-8 w-8 rounded-full bg-eg-gradient" aria-hidden />
          <span>Edens Gates</span>
        </NavLink>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white',
                  location.pathname.startsWith(link.to) && link.to !== '/'
                    ? 'text-white'
                    : null,
                ]
                  .filter(Boolean)
                  .join(' ')
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
