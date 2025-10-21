// Visual Pass — Typography & Theme Unification + Wallet Integration (Logic Preserved)
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WalletBar } from './WalletBar'
import { WALLET_ON } from '../lib/flags'

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
    <motion.header 
      className="sticky top-0 z-50 border-b border-white/10 bg-egDark/80 backdrop-blur-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle gradient divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-egPink/40 to-transparent" />
      
      <div className="container-main flex h-16 items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <NavLink to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <motion.span 
              className="h-8 w-8 rounded-full bg-gradient-to-br from-egPurple to-egPink shadow-lg shadow-egPink/25 will-change-transform" 
              aria-hidden
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            <span className="text-primary">
              Edens Gates
            </span>
          </NavLink>
        </motion.div>
        
        <div className="hidden sm:flex items-center gap-6">
          <nav className="flex items-center gap-1">
            {links.map((link, index) => {
              const isActive = location.pathname === link.to || 
                (location.pathname.startsWith(link.to) && link.to !== '/')
              
              return (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <NavLink
                  to={link.to}
                  className="group relative"
                  end={link.to === '/'}
                >
                  <span className={`block px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-white/10 border border-white/15'
                      : 'text-secondary hover:text-primary hover:bg-white/5'
                  }`}>
                    {link.label}
                  </span>
                  
                  {/* Active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-egPurple to-egPink rounded-full"
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    />
                  )}
                </NavLink>
              </motion.div>
            )
            })}
          </nav>
          
          {WALLET_ON ? <WalletBar /> : null}
        </div>

        {/* Mobile menu - simplified for now */}
        <div className="sm:hidden">
          <button className="p-2 text-secondary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
