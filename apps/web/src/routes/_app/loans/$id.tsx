import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react'

export const Route = createFileRoute('/_app/loans/$id')({
  component: LoanDetailPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function LoanDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const token = getToken()
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  const { data: loan, isLoading } = useQuery({
    queryKey: ['admin-loan', id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token,
  })

  const reviewMutation = useMutation({
    mutationFn: async ({
      action,
      reason,
    }: {
      action: 'APPROVED' | 'REJECTED'
      reason?: string
    }) => {
      const params = new URLSearchParams({ action })
      if (reason) params.set('reason', reason)
      const res = await fetch(
        `${apiUrl}/v1/admin/loans/${id}/review?${params}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) throw new Error('Failed to review')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-loans'] })
      navigate({ to: '/loans' })
    },
  })

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  }

  const tabs = [
    'Personal Info',
    'Loan Details',
    'Address',
    'Terms & Guarantor',
    'Documents',
  ]

  if (isLoading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (!loan)
    return <div className="p-8 text-center text-gray-400">Loan not found</div>

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate({ to: '/loans' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Loan Review</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[loan.status] ?? 'bg-gray-100'}`}
        >
          {loan.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Loan Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 block">Reference No.</span>
            <span className="text-sm font-mono font-medium">
              {loan.referenceNumber}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Amount</span>
            <span className="text-sm font-medium">
              NPR {loan.loanAmount?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Purpose</span>
            <span className="text-sm">
              {loan.purpose?.replace('_', ' ') ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Duration</span>
            <span className="text-sm">
              {loan.duration?.replace('_', ' ') ?? '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Member Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 block">Full Name</span>
            <span className="text-sm font-medium">
              {loan.user?.fullName ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Phone</span>
            <span className="text-sm">{loan.user?.phone ?? '—'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Cooperative</span>
            <span className="text-sm">{loan.user?.cooperative ?? '—'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Passbook No.</span>
            <span className="text-sm">{loan.user?.passbookNumber ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        {activeTab === 0 && (
          <div className="grid grid-cols-2 gap-4">
            {[
              ['First Name', loan.firstName],
              ['Middle Name', loan.middleName],
              ['Last Name', loan.lastName],
              ['Date of Birth', loan.dateOfBirth],
              ['Gender', loan.gender],
              ['Marital Status', loan.maritalStatus],
              ['Citizenship No.', loan.citizenshipNo],
              ['Phone', loan.phone],
              ['Occupation', loan.occupation],
              [
                'Monthly Income',
                loan.monthlyIncome
                  ? `NPR ${loan.monthlyIncome.toLocaleString()}`
                  : null,
              ],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <span className="text-xs text-gray-400 block">{label}</span>
                  <span className="text-sm">{value}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {[
              [
                'Loan Amount',
                loan.loanAmount
                  ? `NPR ${loan.loanAmount.toLocaleString()}`
                  : null,
              ],
              ['Loan Purpose', loan.purpose?.replace('_', ' ')],
              ['Duration', loan.duration?.replace('_', ' ')],
              [
                'Interest Rate',
                loan.interestRate ? `${loan.interestRate}%` : null,
              ],
              ['Existing Loans', (loan.existingLoans ?? false) ? 'Yes' : 'No'],
              [
                'Existing Loan Amount',
                loan.existingLoanAmount
                  ? `NPR ${loan.existingLoanAmount.toLocaleString()}`
                  : null,
              ],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <span className="text-xs text-gray-400 block">{label}</span>
                  <span className="text-sm">{value}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
        {activeTab === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Province', loan.permanentProvince],
              ['District', loan.permanentDistrict],
              ['Municipality', loan.permanentMunicipality],
              ['Ward No.', loan.permanentWardNo],
              ['Tole', loan.permanentTole],
              ['Province (Current)', loan.currentProvince],
              ['District (Current)', loan.currentDistrict],
              ['Municipality (Current)', loan.currentMunicipality],
              ['Ward No. (Current)', loan.currentWardNo],
              ['Tole (Current)', loan.currentTole],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <span className="text-xs text-gray-400 block">{label}</span>
                  <span className="text-sm">{value}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Loan Terms
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Collateral Type', loan.collateralType?.replace('_', ' ')],
                  ['Collateral Description', loan.collateralDescription],
                  ['Repayment Plan', loan.repaymentPlan?.replace('_', ' ')],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <span className="text-xs text-gray-400 block">
                        {label}
                      </span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Guarantor
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Guarantor Name', loan.guarantorName],
                  ['Guarantor Phone', loan.guarantorPhone],
                  ['Guarantor Address', loan.guarantorAddress],
                  ['Guarantor Relation', loan.guarantorRelation],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <span className="text-xs text-gray-400 block">
                        {label}
                      </span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 4 && (
          <div className="space-y-4">
            {loan.citizenshipUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Citizenship Copy
                </span>
                <img
                  src={loan.citizenshipUrl}
                  alt="Citizenship"
                  className="h-40 border rounded"
                />
              </div>
            )}
            {loan.photoUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">Photo</span>
                <img
                  src={loan.photoUrl}
                  alt="Photo"
                  className="h-40 border rounded"
                />
              </div>
            )}
            {loan.incomeProofUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Income Proof
                </span>
                <img
                  src={loan.incomeProofUrl}
                  alt="Income Proof"
                  className="h-40 border rounded"
                />
              </div>
            )}
            {loan.collateralPhotoUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Collateral Photo
                </span>
                <img
                  src={loan.collateralPhotoUrl}
                  alt="Collateral"
                  className="h-40 border rounded"
                />
              </div>
            )}
            {!loan.citizenshipUrl &&
              !loan.photoUrl &&
              !loan.incomeProofUrl &&
              !loan.collateralPhotoUrl && (
                <p className="text-sm text-gray-400">No documents uploaded.</p>
              )}
          </div>
        )}
      </div>

      {loan.rejectionReason && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-700">
            Rejection Reason: {loan.rejectionReason}
          </p>
        </div>
      )}

      {loan.status === 'SUBMITTED' || loan.status === 'UNDER_REVIEW' ? (
        <div className="flex gap-3">
          <button
            onClick={() => reviewMutation.mutate({ action: 'APPROVED' })}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle size={16} /> Reject
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          This loan has already been {loan.status?.toLowerCase()}.
        </p>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold mb-2">Reject Loan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  reviewMutation.mutate({
                    action: 'REJECTED',
                    reason: rejectReason,
                  })
                  setShowRejectModal(false)
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
