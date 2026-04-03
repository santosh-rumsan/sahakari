import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function Dashboard() {
  const navigate = useNavigate()
  const token = getToken()
  const [stats, setStats] = useState<{
    totalUsers: number
    kycPending: number
    loanPending: number
  } | null>(null)

  useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/customers/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setStats(data)
      return data
    },
    enabled: !!token,
  })

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate({ to: '/login' })
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">
            Sahakari Admin
          </h1>
          <p className="text-sm text-gray-400 mt-1">Cooperative dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Members',
            value: stats?.totalUsers ?? '—',
            icon: Users,
            color: 'bg-blue-50 text-blue-500',
          },
          {
            label: 'KYC Pending',
            value: stats?.kycPending ?? '—',
            icon: FileText,
            color: 'bg-yellow-50 text-yellow-600',
          },
          {
            label: 'Loan Pending',
            value: stats?.loanPending ?? '—',
            icon: CreditCard,
            color: 'bg-orange-50 text-orange-500',
          },
          {
            label: 'Loans Approved',
            value: '—',
            icon: CheckCircle2,
            color: 'bg-green-50 text-green-500',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-gray-50 rounded-2xl p-5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
              >
                <Icon size={17} />
              </div>
              <p className="text-2xl font-black text-[#1a1a1a]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link
          to="/kyc"
          className="bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FileText size={17} className="text-yellow-600" />
            </div>
            <ArrowRight size={14} className="text-gray-400" />
          </div>
          <h2 className="text-base font-bold text-[#1a1a1a]">
            KYC Applications
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Review and approve member KYC
          </p>
        </Link>

        <Link
          to="/loans"
          className="bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <CreditCard size={17} className="text-orange-600" />
            </div>
            <ArrowRight size={14} className="text-gray-400" />
          </div>
          <h2 className="text-base font-bold text-[#1a1a1a]">
            Loan Applications
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Review and approve loan requests
          </p>
        </Link>

        <Link
          to="/customers"
          className="bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={17} className="text-blue-600" />
            </div>
            <ArrowRight size={14} className="text-gray-400" />
          </div>
          <h2 className="text-base font-bold text-[#1a1a1a]">All Members</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            View all registered members
          </p>
        </Link>
      </div>
    </div>
  )
}
