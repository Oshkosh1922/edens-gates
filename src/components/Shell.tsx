// Visual Pass — Typography & Theme Unification (Logic Preserved)
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type ShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function Shell({ title, description, actions, children }: ShellProps) {
  return (
    <motion.section 
      className="vertical-rhythm relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-radial from-egPurple/6 via-egPink/3 to-transparent blur-3xl opacity-50" />
      </div>

      <motion.header 
        className="space-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-tight flex-1 max-w-4xl">
            <motion.h1 
              className="text-3xl font-bold text-primary tracking-tight leading-tight md:text-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            {description ? (
              <motion.p 
                className="text-lg text-secondary leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {description}
              </motion.p>
            ) : null}
          </div>
          {actions ? (
            <motion.div 
              className="flex shrink-0 items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {actions}
            </motion.div>
          ) : null}
        </div>
      </motion.header>
      
      <motion.div
        className="space-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.section>
  )
}
