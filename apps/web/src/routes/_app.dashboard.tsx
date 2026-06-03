import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  LogOut,
  TrendingDown,
  TrendingUp,
  Users,
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
    kycApproved: number
    loanApproved: number
    loanRejected: number
  } | null>(null)
  const [recentActivities, setRecentActivities] = useState<Array<any>>([])
  const [monthlyStats, setMonthlyStats] = useState<{
    newMembers: number
    loansDisbursed: number
    kycApproved: number
    totalDisbursed: number
  } | null>(null)
  const safeRecentActivities = Array.isArray(recentActivities)
    ? recentActivities
    : []

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

  useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/v1/admin/customers/recent-activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await res.json()
      setRecentActivities(data)
      return data
    },
    enabled: !!token,
  })

  useQuery({
    queryKey: ['monthly-stats'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/customers/monthly-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMonthlyStats(data)
      return data
    },
    enabled: !!token,
  })

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate({ to: '/login' })
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffInMs = now.getTime() - then.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    } else {
      return then.toLocaleDateString()
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="px-8 py-7">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">
              Welcome back 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Here's what's happening with your cooperative today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            {
              label: 'Total Members',
              value: stats?.totalUsers ?? '—',
              icon: Users,
              color: 'bg-blue-500',
              bgColor: 'bg-blue-50',
              change: '+12.5%',
              trend: 'up',
            },
            {
              label: 'KYC Pending',
              value: stats?.kycPending ?? '—',
              icon: FileText,
              color: 'bg-yellow-500',
              bgColor: 'bg-yellow-50',
              change: '+3',
              trend: 'up',
            },
            {
              label: 'Loan Pending',
              value: stats?.loanPending ?? '—',
              icon: CreditCard,
              color: 'bg-orange-500',
              bgColor: 'bg-orange-50',
              change: '-2',
              trend: 'down',
            },
            {
              label: 'Loans Approved',
              value: stats?.loanApproved ?? '—',
              icon: CheckCircle2,
              color: 'bg-green-500',
              bgColor: 'bg-green-50',
              change: '+8.2%',
              trend: 'up',
            },
          ].map((stat) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <Icon
                      size={20}
                      className={stat.color.replace('bg-', 'text-')}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                      stat.trend === 'up'
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    <TrendIcon size={12} />
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-black text-[#1a1a1a] mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <Link
            to="/kyc"
            className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                <FileText size={20} className="text-yellow-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
              KYC Applications
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Review and approve member KYC
            </p>
            <div className="flex items-center text-xs text-yellow-600 font-semibold">
              {stats?.kycPending ?? 0} pending
            </div>
          </Link>

          <Link
            to="/loans"
            className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <CreditCard size={20} className="text-orange-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
              Loan Applications
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Review and approve loan requests
            </p>
            <div className="flex items-center text-xs text-orange-600 font-semibold">
              {stats?.loanPending ?? 0} pending
            </div>
          </Link>

          <Link
            to="/customers"
            className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users size={20} className="text-blue-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
              All Members
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              View all registered members
            </p>
            <div className="flex items-center text-xs text-blue-600 font-semibold">
              {stats?.totalUsers ?? 0} total members
            </div>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1a1a1a]">
                Recent Activities
              </h3>
              <Link
                to="/recent-activities"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all
                <ExternalLink size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {safeRecentActivities.slice(0, 5).length > 0 ? (
                safeRecentActivities.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activity.type === 'kyc'
                          ? 'bg-yellow-50'
                          : activity.type === 'loan'
                            ? 'bg-orange-50'
                            : activity.type === 'approval'
                              ? 'bg-green-50'
                              : 'bg-blue-50'
                      }`}
                    >
                      {activity.type === 'kyc' ? (
                        <FileText size={16} className="text-yellow-600" />
                      ) : activity.type === 'loan' ? (
                        <CreditCard size={16} className="text-orange-600" />
                      ) : activity.type === 'approval' ? (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ) : (
                        <Users size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a] mb-0.5">
                        {activity.user}
                      </p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  No recent activities
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-5">
              This Month
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-medium">
                    New Members
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {monthlyStats?.newMembers ?? 0}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((monthlyStats?.newMembers ?? 0) / 30) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-medium">
                    Loans Disbursed
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {monthlyStats?.loansDisbursed ?? 0}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((monthlyStats?.loansDisbursed ?? 0) / 20) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-medium">
                    KYC Approved
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {monthlyStats?.kycApproved ?? 0}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((monthlyStats?.kycApproved ?? 0) / 30) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium">
                      Total Disbursed
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#1a1a1a]">
                    NPR{' '}
                    {monthlyStats?.totalDisbursed
                      ? (monthlyStats.totalDisbursed / 1000000).toFixed(1) + 'M'
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
