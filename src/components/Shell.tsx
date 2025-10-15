import type { ReactNode } from 'react'

type ShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function Shell({ title, description, actions, children }: ShellProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm text-white/70">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
