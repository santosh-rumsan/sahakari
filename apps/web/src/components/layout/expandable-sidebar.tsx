import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Settings, User } from 'lucide-react'
import { cn } from '@rs/ui'

export interface SidebarNavItem {
  icon: React.ReactNode
  label: string
  /** TanStack Router route path – when provided, renders a <Link> with auto active state */
  to?: string
  badge?: number
  onClick?: () => void
}

export interface ExpandableSidebarProps {
  navItems?: Array<SidebarNavItem>
  /** User name shown at the bottom */
  userName?: string
  /** User email shown at the bottom */
  userEmail?: string
  /** Cooperative logo URL */
  logoUrl?: string | null
  /** Footer label rendered vertically */
  footerLabel?: string
  className?: string
  isExpanded?: boolean
  onToggle?: () => void
}

const activeClass = 'text-black bg-green-200'
const inactiveClass = 'text-[#d6f7ea] hover:text-white hover:bg-[#005f47]'

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

export function ExpandableSidebar({
  navItems = [],
  userName,
  userEmail,
  logoUrl,
  footerLabel,
  className,
  isExpanded = false,
  onToggle,
}: ExpandableSidebarProps) {
  return (
    <div
      className={cn(
        'bg-teal-800 flex flex-col py-4 gap-2 shrink-0 transition-all duration-300 ease-in-out relative',
        isExpanded ? 'w-64' : 'w-16',
        className,
      )}
    >
      {/* Logo and Title */}
      <div className="flex items-center px-4 mb-4 h-10">
        <div className="text-white flex h-10 w-10 items-center justify-center shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Cooperative Logo"
              className="h-10 w-10 object-contain rounded"
            />
          ) : (
            <AppLogo className="h-8 w-8 text-white" />
          )}
        </div>
        {isExpanded && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-white font-bold text-lg whitespace-nowrap">
              Sahakari Admin
            </h1>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 -right-3 bg-[#0e6c52] border border-[#2c876e] text-[#d6f7ea] hover:text-white rounded-full p-1 hover:bg-[#005f47] transition-colors z-10"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2">
        {navItems.map((item, i) =>
          item.to ? (
            <Link
              key={i}
              to={item.to}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1',
                inactiveClass,
              )}
              activeProps={{
                className: cn(
                  'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1',
                  activeClass,
                ),
              }}
            >
              <div className="shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {item.badge != null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#005f47] border border-[#0e6c52] rounded-full text-[10px] flex items-center justify-center text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ) : (
            <button
              key={i}
              onClick={item.onClick}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl transition-colors mb-1 w-full',
                inactiveClass,
              )}
            >
              <div className="shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {item.badge != null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#005f47] border border-[#0e6c52] rounded-full text-[10px] flex items-center justify-center text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ),
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 flex flex-col gap-2">
        <button
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl transition-colors w-full',
            inactiveClass,
          )}
        >
          <div className="shrink-0">
            <Settings size={18} />
          </div>
          {isExpanded && (
            <span className="font-medium whitespace-nowrap overflow-hidden">
              Settings
            </span>
          )}
        </button>

        {(userName || userEmail) && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium whitespace-nowrap">
                  {userName || 'Admin User'}
                </p>
                <p className="text-[#d6f7ea] text-xs whitespace-nowrap">
                  {userEmail || 'admin@sahakari.com'}
                </p>
              </div>
            )}
          </div>
        )}

        {footerLabel && isExpanded && (
          <p className="text-[#d6f7ea] text-xs px-3 py-2">{footerLabel}</p>
        )}
      </div>
    </div>
  )
}
