import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye, ChevronLeft, FileText } from 'lucide-react'

export const Route = createFileRoute('/_app/kyc')({
  component: KycPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function KycPage() {
  const matches = useMatches()
  const isChildActive = matches[matches.length - 1]?.routeId !== '/_app/kyc'

  const token = getToken()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`${apiUrl}/v1/admin/kyc?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token && !isChildActive,
  })

  if (isChildActive) return <Outlet />

  const kycList = data?.data ?? []

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            KYC Applications
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review and approve member KYC
          </p>
        </div>
        <div className="flex gap-2">
          {['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s || 'ALL'}
              onClick={() => {
                setStatusFilter(s)
                setPage(1)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : kycList.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No KYC applications found.
        </div>
      ) : (
        <div className="space-y-3">
          {kycList.map((kyc: any) => (
            <div
              key={kyc.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {kyc.user?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {kyc.user?.phone ?? ''} · {kyc.user?.cooperative ?? ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[kyc.status] ?? 'bg-gray-100'}`}
                >
                  {kyc.status?.replace('_', ' ')}
                </span>
                <Link
                  to={`/kyc/${kyc.id}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Eye size={12} /> Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.total > 20 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            <ChevronLeft size={14} className="inline" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={kycList.length < 20}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Next <ChevronLeft size={14} className="inline rotate-180" />
          </button>
        </div>
      )}
    </div>
  )
}
