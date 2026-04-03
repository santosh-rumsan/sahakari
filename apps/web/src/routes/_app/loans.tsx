import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/_app/loans')({
  component: LoansPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function LoansPage() {
  const token = getToken()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-loans', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`${apiUrl}/v1/admin/loans?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token,
  })

  const loans = data?.data ?? []

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            Loan Applications
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review and approve loan requests
          </p>
        </div>
        <div className="flex gap-2">
          {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(
            (s) => (
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
            ),
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : loans.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No loan applications found.
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan: any) => (
            <div
              key={loan.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    Ref: {loan.referenceNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {loan.user?.fullName ?? '—'} · NPR{' '}
                    {loan.loanAmount?.toLocaleString() ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {loan.purpose?.replace('_', ' ') ?? '—'} ·{' '}
                    {loan.duration?.replace('_', ' ') ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[loan.status] ?? 'bg-gray-100'}`}
                >
                  {loan.status?.replace('_', ' ')}
                </span>
                <Link
                  to={`/loans/${loan.id}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Eye size={12} /> Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
