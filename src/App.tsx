import { Outlet } from 'react-router-dom'
import { Nav } from './components/Nav'

function App() {
  return (
    <div className="min-h-screen bg-egDark text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-eg-gradient opacity-20 blur-3xl" />
      <div className="pointer-events-none fixed inset-y-0 right-0 w-48 bg-eg-gradient opacity-10 blur-3xl" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
          <Outlet />
        </main>
        <footer className="border-t border-white/5 bg-egDark/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Edens Gates.</span>
            <span>Built for the Magic Eden community.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
