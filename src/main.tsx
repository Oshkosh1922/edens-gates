import { Buffer } from 'buffer'
if (!(window as any).Buffer) {
  ;(window as any).Buffer = Buffer
}
if (!(globalThis as any).Buffer) {
  ;(globalThis as any).Buffer = Buffer
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import './index.css'
import App from './App'
import { Admin } from './pages/Admin'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Submit } from './pages/Submit'
import { Vote } from './pages/Vote'
import { Winners } from './pages/Winners'
import { WalletContextProvider } from './lib/wallet'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'submit', element: <Submit /> },
      { path: 'vote', element: <Vote /> },
      { path: 'winners', element: <Winners /> },
      { path: 'admin', element: <Admin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletContextProvider>
      <RouterProvider router={router} />
    </WalletContextProvider>
  </StrictMode>,
)
