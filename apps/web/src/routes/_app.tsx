import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Users, FileText, CreditCard, LayoutDashboard } from 'lucide-react'
import { AppShell, IconSidebar } from '../components/layout'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={18} />, to: '/dashboard' },
  { icon: <FileText size={18} />, to: '/kyc' },
  { icon: <CreditCard size={18} />, to: '/loans' },
  { icon: <Users size={18} />, to: '/customers' },
]

function AppLayout() {
  return (
    <AppShell
      sidebar={
        <IconSidebar
          navItems={NAV_ITEMS}
          avatar="https://i.pravatar.cc/32?img=33"
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
