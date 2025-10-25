import type { ReactNode } from 'react'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import {
  BaseWalletAdapter,
  WalletAdapterNetwork,
  WalletNotReadyError,
  WalletReadyState,
  type SendTransactionOptions,
  type WalletAdapter,
  type WalletName,
} from '@solana/wallet-adapter-base'
import type { Connection } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { WALLET_ON, SOLANA_RPC } from './flags'

interface WalletSafe {
  connected: boolean
  publicKeyBase58?: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>
  signAndSend: (transaction: Transaction) => Promise<string>
}

const disabledWallet: WalletSafe = {
  connected: false,
  publicKeyBase58: undefined,
  async connect() {
    throw new Error('Wallet support is disabled. Enable VITE_WALLET_ENABLED to connect.')
  },
  async disconnect() {
    return
  },
  async signTransaction() {
    throw new Error('Wallet support is disabled. Enable VITE_WALLET_ENABLED to sign transactions.')
  },
  async signAndSend() {
    throw new Error('Wallet support is disabled. Enable VITE_WALLET_ENABLED to sign transactions.')
  },
}

const WalletContext = createContext<WalletSafe>(disabledWallet)

export const useWalletSafe = (): WalletSafe => useContext(WalletContext)

const MAGIC_EDEN_NAME = 'Magic Eden (Injected)' as WalletName<'Magic Eden (Injected)'>
const BACKPACK_NAME = 'Backpack (Injected)' as WalletName<'Backpack (Injected)'>
const FALLBACK_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2Y1NTZmZiIvPjwvc3ZnPg=='

type ProviderPublicKey = PublicKey | { toString(): string } | string

type WalletAdapterCtor = new (...args: never[]) => WalletAdapter

type InjectedProvider = {
  publicKey?: ProviderPublicKey
  connect?: () => Promise<{ publicKey?: ProviderPublicKey } | void>
  disconnect?: () => Promise<void>
  signTransaction?: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>
  sendTransaction?: (
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<string>
  signAndSendTransaction?: (
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<{ signature?: string } | string>
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isInjectedProvider = (value: unknown): value is InjectedProvider => {
  if (!isRecord(value)) {
    return false
  }
  const descriptor = value as Record<string, unknown>
  return (
    'publicKey' in descriptor ||
    'connect' in descriptor ||
    'signTransaction' in descriptor ||
    'sendTransaction' in descriptor
  )
}

const coercePublicKey = (key: ProviderPublicKey | undefined): PublicKey | null => {
  if (!key) {
    return null
  }
  if (key instanceof PublicKey) {
    return key
  }
  const asString = typeof key === 'string' ? key : key.toString()
  try {
    return new PublicKey(asString)
  } catch {
    return null
  }
}

const extractWalletAdapterCtor = (module: unknown, ...exportKeys: string[]): WalletAdapterCtor | null => {
  if (!isRecord(module)) {
    return null
  }
  for (const exportKey of exportKeys) {
    const candidate = module[exportKey]
    if (typeof candidate === 'function') {
      return candidate as WalletAdapterCtor
    }
  }
  return null
}

abstract class BaseInjectedAdapter extends BaseWalletAdapter {
  abstract readonly adapterName: WalletName<string>
  abstract readonly adapterUrl: string
  abstract readonly adapterIcon: string

  protected provider: InjectedProvider | null
  protected cachedKey: PublicKey | null = null
  protected connectingState = false
  readonly supportedTransactionVersions = null

  constructor(provider: InjectedProvider | null) {
    super()
    this.provider = provider
  }

  get name(): WalletName<string> {
    return this.adapterName
  }

  get url(): string {
    return this.adapterUrl
  }

  get icon(): string {
    return this.adapterIcon
  }

  get publicKey(): PublicKey | null {
    if (this.provider?.publicKey) {
      const resolved = coercePublicKey(this.provider.publicKey)
      if (resolved) {
        return resolved
      }
    }
    return this.cachedKey
  }

  get readyState(): WalletReadyState {
    return this.provider ? WalletReadyState.Installed : WalletReadyState.NotDetected
  }

  get connecting(): boolean {
    return this.connectingState
  }

  async connect(): Promise<void> {
    if (!this.provider) {
      throw new WalletNotReadyError(`${this.adapterName} wallet not detected`)
    }

    if (this.connectingState) {
      return
    }

    this.connectingState = true

    try {
      const result = await this.provider.connect?.()
      const keyCandidate = this.provider.publicKey ?? result?.publicKey
      const resolvedKey = coercePublicKey(keyCandidate)
      this.cachedKey = resolvedKey ?? this.cachedKey
      const publicKey = this.publicKey
      if (!publicKey) {
        throw new WalletNotReadyError(`${this.adapterName} wallet did not provide a public key`)
      }
      this.emit('connect', publicKey)
    } finally {
      this.connectingState = false
    }
  }

  async disconnect(): Promise<void> {
    await this.provider?.disconnect?.()
    this.cachedKey = null
    this.emit('disconnect')
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.provider?.signTransaction) {
      throw new WalletNotReadyError(`${this.adapterName} wallet cannot sign transactions`)
    }
    return this.provider.signTransaction(transaction)
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (this.provider?.signAllTransactions) {
      return this.provider.signAllTransactions(transactions)
    }
    const signed: Transaction[] = []
    for (const transaction of transactions) {
      signed.push(await this.signTransaction(transaction))
    }
    return signed
  }

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<string> {
    if (this.provider?.sendTransaction) {
      return this.provider.sendTransaction(transaction, connection, options)
    }
    if (this.provider?.signAndSendTransaction) {
      const result = await this.provider.signAndSendTransaction(transaction, connection, options)
      const signature = typeof result === 'string' ? result : result?.signature
      if (!signature) {
        throw new WalletNotReadyError(`${this.adapterName} wallet did not return a transaction signature`)
      }
      return signature
    }
    const signed = await this.signTransaction(transaction)
    return connection.sendRawTransaction(signed.serialize(), options)
  }
}

class InjectedMagicEdenAdapter extends BaseInjectedAdapter {
  readonly adapterName = MAGIC_EDEN_NAME
  readonly adapterUrl = 'https://magiceden.io'
  readonly adapterIcon = FALLBACK_ICON
}

class InjectedBackpackAdapter extends BaseInjectedAdapter {
  readonly adapterName = BACKPACK_NAME
  readonly adapterUrl = 'https://www.backpack.app'
  readonly adapterIcon = FALLBACK_ICON
}

type OptionalAdapters = Partial<Record<'magicEden' | 'backpack', WalletAdapter>>

type DynamicImporter = <T>(specifier: string) => Promise<T>

const dynamicImport: DynamicImporter = ((specifier: string) => {
  const importer = new Function('s', 'return import(s)') as DynamicImporter
  return importer(specifier)
})

const getWindowProvider = (keys: string[]): InjectedProvider | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const scopedWindow = window as typeof window & Record<string, unknown>
  for (const key of keys) {
    const candidate = scopedWindow[key]
    if (candidate && isInjectedProvider(candidate)) {
      return candidate
    }
  }
  return null
}

const loadMagicEdenAdapter = async (): Promise<WalletAdapter | null> => {
  try {
    const module = await dynamicImport<unknown>('@magiceden-oss/wallet-adapter')
    const ctor = extractWalletAdapterCtor(module, 'MagicEdenWalletAdapter', 'default')
    if (ctor) {
      return new ctor()
    }
  } catch {
    // ignored — fall back to injected provider below
  }

  const provider = getWindowProvider(['magicEden', 'magiceden'])
  return provider ? new InjectedMagicEdenAdapter(provider) : null
}

const loadBackpackAdapter = async (): Promise<WalletAdapter | null> => {
  const candidateModules = [
    '@coral-xyz/wallet-adapter-backpack',
    '@solana/wallet-adapter-backpack',
  ]

  for (const specifier of candidateModules) {
    try {
      const module = await dynamicImport<unknown>(specifier)
      const ctor = extractWalletAdapterCtor(module, 'BackpackWalletAdapter', 'default')
      if (ctor) {
        return new ctor()
      }
    } catch {
      // try the next specifier
    }
  }

  const provider = getWindowProvider(['backpack', 'Backpack'])
  return provider ? new InjectedBackpackAdapter(provider) : null
}

const WalletBridge = ({ children }: { children: ReactNode }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const safeWallet = useMemo<WalletSafe>(() => {
    if (!WALLET_ON) {
      return disabledWallet
    }

    return {
      connected: wallet.connected,
      publicKeyBase58: wallet.publicKey?.toBase58(),
      connect: async () => {
        await wallet.connect()
      },
      disconnect: async () => {
        await wallet.disconnect()
      },
      signTransaction: async (tx: Transaction) => {
        if (!wallet.signTransaction) {
          throw new Error('Wallet does not support signTransaction')
        }
        return wallet.signTransaction(tx)
      },
      signAllTransactions: wallet.signAllTransactions
        ? async (txs: Transaction[]) => wallet.signAllTransactions!(txs)
        : undefined,
      signAndSend: async (transaction: Transaction) => {
        if (!wallet.publicKey) {
          throw new Error('Connect a wallet before sending transactions')
        }
        if (!wallet.sendTransaction) {
          throw new Error('Wallet does not support sending transactions')
        }

        const latestBlockhash = await connection.getLatestBlockhash('confirmed')
        transaction.feePayer = wallet.publicKey
        transaction.recentBlockhash = latestBlockhash.blockhash

        const signature = await wallet.sendTransaction(transaction, connection, {
          preflightCommitment: 'confirmed',
        })

        await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature,
          },
          'confirmed',
        )

        return signature
      },
    }
  }, [wallet, connection])

  return createElement(WalletContext.Provider, { value: safeWallet, children })
}

const EnabledWalletProvider = ({ children }: { children: ReactNode }) => {
  const [optionalAdapters, setOptionalAdapters] = useState<OptionalAdapters>({})

  useEffect(() => {
    let disposed = false

    ;(async () => {
      const [magicEden, backpack] = await Promise.all([
        loadMagicEdenAdapter().catch(() => null),
        loadBackpackAdapter().catch(() => null),
      ])

      if (disposed) {
        return
      }

      setOptionalAdapters((current) => ({
        ...current,
        ...(magicEden ? { magicEden } : {}),
        ...(backpack ? { backpack } : {}),
      }))
    })()

    return () => {
      disposed = true
    }
  }, [])

  const wallets = useMemo(() => {
    const adapters: WalletAdapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
    ]

    if (optionalAdapters.backpack) {
      adapters.push(optionalAdapters.backpack)
    }
    if (optionalAdapters.magicEden) {
      adapters.push(optionalAdapters.magicEden)
    }

    return adapters
  }, [optionalAdapters])

  return createElement(ConnectionProvider, {
    endpoint: SOLANA_RPC,
    children: createElement(WalletProvider, {
      wallets,
      autoConnect: true,
      children: createElement(WalletModalProvider, {
        children: createElement(WalletBridge, { children }),
      }),
    }),
  })
}

export const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  if (!WALLET_ON) {
    return createElement(WalletContext.Provider, { value: disabledWallet, children })
  }
  return createElement(EnabledWalletProvider, { children })
}
