// Visual Pass — Typography & Theme Unification (Logic Preserved)
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Nav } from './components/Nav'

function App() {
  return (
    <div className="min-h-screen bg-egDark text-white font-sans">
      {/* Single ambient gradient layer - non-distracting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-br from-egPurple/20 via-egPink/10 to-transparent opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-egPink/15 to-transparent opacity-30 blur-3xl" />
      </div>
      
      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />
        <motion.main 
          className="container-main flex-1 py-12 md:py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Outlet />
        </motion.main>
        
        <motion.footer 
          className="border-t border-white/10 bg-egDark/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="container-main py-8">
            <div className="flex flex-col gap-3 text-sm text-tertiary sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Edens Gates.</span>
              <span>Built for the Magic Eden community.</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}

export default App
