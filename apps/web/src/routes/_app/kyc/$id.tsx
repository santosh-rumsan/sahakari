import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react'

export const Route = createFileRoute('/_app/kyc/$id')({
  component: KycDetailPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function KycDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const token = getToken()
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['admin-kyc', id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/kyc/${id}`, {
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
      const res = await fetch(`${apiUrl}/v1/admin/kyc/${id}/review?${params}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Request failed (${res.status})`)
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-kyc'] })
      navigate({ to: '/kyc' })
    },
    onError: (err: Error) => {
      setReviewError(err.message ?? 'Failed to update status')
    },
  })

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  }

  const tabs = ['Basic Info', 'Mandatory / Nominee', 'Signature']

  if (isLoading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>

  if (!kyc)
    return <div className="p-8 text-center text-gray-400">KYC not found</div>

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/kyc' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">KYC Review</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[kyc.status] ?? 'bg-gray-100'}`}
        >
          {kyc.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Member Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 block">Full Name</span>
            <span className="text-sm font-medium">
              {kyc.user?.fullName ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Phone</span>
            <span className="text-sm font-medium">
              {kyc.user?.phone ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Cooperative</span>
            <span className="text-sm font-medium">
              {kyc.user?.cooperative ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Passbook No.</span>
            <span className="text-sm font-medium">
              {kyc.user?.passbookNumber ?? '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        {activeTab === 0 && (
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Full Name (EN)', kyc.fullNameEn],
              ['Full Name (NP)', kyc.fullNameNp],
              ['Passbook No.', kyc.passbookNo],
              ['Member Type', kyc.memberType],
              ['Date of Birth', kyc.dob ? new Date(kyc.dob).toLocaleDateString() : null],
              ['Gender', kyc.gender],
              ['Nationality', kyc.nationality],
              ['Religion', kyc.religion],
              ['Occupation', kyc.occupation],
              ['Education', kyc.education],
              ['District', kyc.district?.name],
              ['Municipality', kyc.municipality?.name],
              ['Ward No.', kyc.wardNumber],
              ['Tole', kyc.tole],
              ['Contact Number', kyc.contactNumber],
              ['Mobile Number', kyc.mobileNumber],
              ['Email', kyc.email],
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
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Mandatory Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Citizenship No.', kyc.citizenshipNumber],
                  ['Citizenship Issue District', kyc.citizenshipIssuedDistrict],
                  ['Citizenship Issue Date', kyc.citizenshipIssuedDate ? new Date(kyc.citizenshipIssuedDate).toLocaleDateString() : null],
                  ['NIN ID Number', kyc.ninIdNumber],
                  ['NIN Issue District', kyc.ninIssuedDistrict],
                  ['NIN Issue Date', kyc.ninIssuedDate ? new Date(kyc.ninIssuedDate).toLocaleDateString() : null],
                  ['Monthly Income', kyc.monthlyIncome],
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
                Nominee Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Nominee Name', kyc.nomineeName],
                  ['Nominee Relation', kyc.nomineeRelation],
                  ['Nominee Phone', kyc.nomineeContactNumber],
                  ['Nominee Address', kyc.nomineeAddress],
                  ['Nominee DOB', kyc.nomineeDob ? new Date(kyc.nomineeDob).toLocaleDateString() : null],
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
        {activeTab === 2 && (
          <div className="space-y-4">
            {kyc.digitalSignatureUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Digital Signature
                </span>
                <img
                  src={kyc.digitalSignatureUrl}
                  alt="Signature"
                  className="h-20 border rounded"
                />
              </div>
            )}
            {kyc.passportPhotoUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Passport Photo
                </span>
                <img
                  src={kyc.passportPhotoUrl}
                  alt="Passport Photo"
                  className="h-40 border rounded"
                />
              </div>
            )}
            {kyc.rightThumbUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Right Thumb
                </span>
                <img
                  src={kyc.rightThumbUrl}
                  alt="Right Thumb"
                  className="h-20 border rounded"
                />
              </div>
            )}
            {kyc.leftThumbUrl && (
              <div>
                <span className="text-xs text-gray-400 block mb-2">
                  Left Thumb
                </span>
                <img
                  src={kyc.leftThumbUrl}
                  alt="Left Thumb"
                  className="h-20 border rounded"
                />
              </div>
            )}
            {!kyc.digitalSignatureUrl &&
              !kyc.passportPhotoUrl &&
              !kyc.rightThumbUrl &&
              !kyc.leftThumbUrl && (
                <p className="text-sm text-gray-400">
                  No signature or document images uploaded.
                </p>
              )}
          </div>
        )}
      </div>

      {kyc.rejectionReason && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-700">
            Rejection Reason: {kyc.rejectionReason}
          </p>
        </div>
      )}

      {reviewError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center justify-between">
          <p className="text-sm text-red-700">{reviewError}</p>
          <button
            onClick={() => setReviewError(null)}
            className="text-red-400 hover:text-red-600 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {kyc.status === 'PENDING' || kyc.status === 'UNDER_REVIEW' ? (
        <div className="flex gap-3">
          <button
            onClick={() => { setReviewError(null); reviewMutation.mutate({ action: 'APPROVED' }) }}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> Approve
          </button>
          <button
            onClick={() => { setReviewError(null); setShowRejectModal(true) }}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle size={16} /> Reject
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          This KYC has already been {kyc.status?.toLowerCase()}.
        </p>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold mb-2">Reject KYC</h3>
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
