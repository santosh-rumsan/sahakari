import * as React from 'react'
import { cn } from '@rs/ui'

export interface AppShellProps {
  /** Left dark icon nav */
  sidebar: React.ReactNode
  /** Optional secondary panel (e.g. list, nav tree) */
  panel?: React.ReactNode
  /** Main content area */
  children: React.ReactNode
  className?: string
}

/**
 * Top-level app layout.
 *
 * Structure:
 *   [sidebar] [panel?] [main content (children)]
 */
export function AppShell({ sidebar, panel, children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        'flex h-screen bg-[#f0f0f0] font-[Inter,sans-serif] overflow-hidden',
        className
      )}
    >
      {sidebar}
      {panel}
      {/* Main content panel */}
      <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
