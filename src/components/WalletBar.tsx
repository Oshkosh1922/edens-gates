import { useEffect, useMemo, useRef, useState } from 'react'
import { WALLET_ON } from '../lib/flags'
import { useWalletSafe } from '../lib/wallet'

const truncateKey = (value: string) => `${value.slice(0, 4)}…${value.slice(-4)}`

export const WalletBar = () => {
  if (!WALLET_ON) {
    return null
  }

  const wallet = useWalletSafe()
  const [menuOpen, setMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [menuOpen])

  const label = useMemo(() => {
    if (!wallet.publicKeyBase58) {
      return ''
    }
    return truncateKey(wallet.publicKeyBase58)
  }, [wallet.publicKeyBase58])

  const handleCopy = async () => {
    if (!wallet.publicKeyBase58) {
      return
    }
    try {
      await navigator.clipboard?.writeText(wallet.publicKeyBase58)
    } catch (error) {
      console.warn('Clipboard copy failed', error)
    }
    setMenuOpen(false)
  }

  const handleDisconnect = async () => {
    setBusy(true)
    try {
      await wallet.disconnect()
    } finally {
      setBusy(false)
      setMenuOpen(false)
    }
  }

  const handleConnect = async () => {
    setBusy(true)
    try {
      await wallet.connect()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex items-center">
      {!wallet.connected ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-egPurple to-egPink text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-egPurple/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Connecting…' : 'Connect Wallet'}
        </button>
      ) : (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            <span className="font-mono text-xs">{label}</span>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-egDark/90 p-2 shadow-xl backdrop-blur-xl">
              <button
                type="button"
                onClick={handleCopy}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-secondary transition-colors hover:bg-white/10 hover:text-white"
              >
                Copy address
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={busy}
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}