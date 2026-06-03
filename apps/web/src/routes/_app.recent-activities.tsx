import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Users,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/recent-activities')({
  component: RecentActivities,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function RecentActivities() {
  const navigate = useNavigate()
  const token = getToken()
  const [recentActivities, setRecentActivities] = useState<Array<any>>([])

  useQuery({
    queryKey: ['recent-activities-full'],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/v1/admin/customers/recent-activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await res.json()
      setRecentActivities(Array.isArray(data) ? data : [])
      return data
    },
    enabled: !!token,
  })

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
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">
              Recent Activities
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              All activities in your cooperative
            </p>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
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
                      <FileText size={20} className="text-yellow-600" />
                    ) : activity.type === 'loan' ? (
                      <CreditCard size={20} className="text-orange-600" />
                    ) : activity.type === 'approval' ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <Users size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[#1a1a1a] mb-1">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={14} />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-base text-gray-400 text-center py-12">
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
