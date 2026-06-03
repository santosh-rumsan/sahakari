import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import {
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell, ExpandableSidebar } from '../components/layout'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }

    // Check if cooperative is set up
    try {
      const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
      const res = await fetch(`${apiUrl}/v1/cooperative/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      // If not set up, redirect to setup page
      if (!data.isSetup) {
        throw redirect({ to: '/setup-cooperative' })
      }
    } catch (error: any) {
      // If it's a redirect error, rethrow it
      if (error.to === '/setup-cooperative') {
        throw error
      }
      // Otherwise, log and continue (network errors, etc.)
      console.error('Error checking cooperative setup:', error)
    }
  },
  component: AppLayout,
})

const NAV_ITEMS = [
  {
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    icon: <FileText size={18} />,
    label: 'KYC Applications',
    to: '/kyc',
  },
  {
    icon: <CreditCard size={18} />,
    label: 'Loan Applications',
    to: '/loans',
  },
  {
    icon: <Users size={18} />,
    label: 'Members',
    to: '/customers',
  },
  {
    icon: <Building2 size={18} />,
    label: 'Cooperative',
    to: '/cooperative',
  },
]

function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    // Remember sidebar state in localStorage
    const saved = localStorage.getItem('sidebar-expanded')
    return saved ? JSON.parse(saved) : false
  })

  const [adminUser, setAdminUser] = useState<{
    name?: string
    email?: string
  } | null>(null)

  const [cooperativeLogo, setCooperativeLogo] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

        if (!token) return

        const res = await fetch(`${apiUrl}/v1/auth/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setAdminUser({
            name: data.name || data.email,
            email: data.email,
          })
        }
      } catch (error) {
        console.error('Error fetching admin user:', error)
      }
    }

    const fetchCooperativeLogo = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

        if (!token) return

        const res = await fetch(`${apiUrl}/v1/cooperative/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.logoUrl) {
            setCooperativeLogo(data.logoUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching cooperative logo:', error)
      }
    }

    fetchAdminUser()
    fetchCooperativeLogo()
  }, [])

  const handleSidebarToggle = () => {
    const newState = !sidebarExpanded
    setSidebarExpanded(newState)
    localStorage.setItem('sidebar-expanded', JSON.stringify(newState))
  }

  return (
    <AppShell
      sidebar={
        <ExpandableSidebar
          navItems={NAV_ITEMS}
          userName={adminUser?.name}
          userEmail={adminUser?.email}
          logoUrl={cooperativeLogo}
          isExpanded={sidebarExpanded}
          onToggle={handleSidebarToggle}
          footerLabel="Sahakari Cooperative Management System"
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
