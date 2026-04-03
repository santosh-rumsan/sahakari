import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { cn } from '@rs/ui'

export interface SidebarNavItem {
  icon: React.ReactNode
  /** TanStack Router route path – when provided, renders a <Link> with auto active state */
  to?: string
  badge?: number
  onClick?: () => void
}

export interface IconSidebarProps {
  navItems?: SidebarNavItem[]
  /** Avatar URL shown at the bottom */
  avatar?: string
  /** Footer label rendered vertically */
  footerLabel?: string
  className?: string
}

const activeClass = 'text-white bg-orange-500'
const inactiveClass = 'text-gray-400 hover:text-white'

function AppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.15" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        RC
      </text>
    </svg>
  )
}

export function IconSidebar({
  navItems = [],
  avatar,
  footerLabel,
  className,
}: IconSidebarProps) {
  return (
    <div
      className={cn(
        'w-16 bg-[#1a1a1a] flex flex-col items-center py-4 gap-2 flex-shrink-0',
        className
      )}
    >
      {/* Logo */}
      <div className="text-white mb-4 flex h-10 w-10 items-center justify-center">
        <AppLogo className="h-8 w-8 text-white" />
      </div>

      {/* Nav items */}
      {navItems.map((item, i) =>
        item.to ? (
          <Link
            key={i}
            to={item.to}
            className={cn('relative p-2.5 rounded-xl transition-colors', inactiveClass)}
            activeProps={{ className: cn('relative p-2.5 rounded-xl transition-colors', activeClass) }}
          >
            {item.icon}
            {item.badge != null && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            key={i}
            onClick={item.onClick}
            className={cn('relative p-2.5 rounded-xl transition-colors', inactiveClass)}
          >
            {item.icon}
            {item.badge != null && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
          </button>
        )
      )}

      {/* Bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button className={cn('p-2 rounded-lg transition-colors', inactiveClass)}>
          <Settings size={16} />
        </button>
        {avatar && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={avatar}
              alt="user"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}
        {footerLabel && (
          <p
            className="text-[8px] text-gray-600"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {footerLabel}
          </p>
        )}
      </div>
    </div>
  )
}
