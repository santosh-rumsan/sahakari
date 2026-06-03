import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { CheckCircle2, ChevronLeft, Printer } from 'lucide-react'
import type { ApprovalFormData } from '@/components/ApprovalFormModal'
import { ApprovalFormModal } from '@/components/ApprovalFormModal'
import { DisbursementFormModal } from '@/components/DisbursementFormModal'
import { RecordPaymentModal } from '@/components/RecordPaymentModal'
import { formatStatusLabel, getStatusBadgeClass } from '@/lib/status'

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
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showDisburseModal, setShowDisburseModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [disburseLoading, setDisburseLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  // Show modals based on status
  // Approval API
  const handleApprove = async (data: ApprovalFormData) => {
    setApprovalLoading(true)
    try {
      const res = await fetch(
        `${apiUrl}/v1/admin/loans/${id}/review?action=APPROVED`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interestRate: data.interestRate,
            paymentFrequency: data.paymentFrequency,
            installments: data.installments,
            gracePeriod: data.gracePeriod,
            lateFee: data.lateFee,
          }),
        },
      )
      if (!res.ok) throw new Error('Failed to approve')
      qc.invalidateQueries({ queryKey: ['admin-loan', id] })
      setShowApprovalModal(false)
    } catch (e: any) {
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    setApprovalLoading(true)
    try {
      const res = await fetch(
        `${apiUrl}/v1/admin/loans/${id}/review?action=REJECTED&reason=${encodeURIComponent(reason)}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) throw new Error('Failed to reject')
      qc.invalidateQueries({ queryKey: ['admin-loan', id] })
      setShowApprovalModal(false)
    } catch (e: any) {
    } finally {
      setApprovalLoading(false)
    }
  }

  // Disbursement API
  const handleDisburse = async () => {
    setDisburseLoading(true)
    try {
      const res = await fetch(`${apiUrl}/v1/admin/loans/${id}/disburse`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to disburse')
      qc.invalidateQueries({ queryKey: ['admin-loan', id] })
      setShowDisburseModal(false)
    } catch (e: any) {
      // handle error (optional)
    } finally {
      setDisburseLoading(false)
    }
  }

  const handleRecordPayment = async (payload: {
    installmentNumbers: Array<number>
    paymentDate: string
  }) => {
    setPaymentLoading(true)
    try {
      const res = await fetch(`${apiUrl}/v1/admin/loans/${id}/record-payment`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to record payment')

      qc.invalidateQueries({ queryKey: ['admin-loan', id] })
      setShowPaymentModal(false)
    } catch (e: any) {
      // handle error (optional)
    } finally {
      setPaymentLoading(false)
    }
  }

  const {
    data: loan,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-loan', id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch loan: ${res.status}`)
      }
      const data = await res.json()
      return data
    },
    enabled: !!token,
  })

  const shouldShowApproval = loan?.status === 'SUBMITTED'
  const shouldShowDisburse = loan?.status === 'APPROVED' && !loan?.disbursed
  const shouldShowPayment =
    !!loan?.isDisbursed &&
    (loan?.installments ?? []).some((item: any) => !item.isPaid)

  if (isLoading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading loan: {error.message}</p>
        <button
          onClick={() => navigate({ to: '/loans' })}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Loans
        </button>
      </div>
    )
  if (!loan)
    return <div className="p-8 text-center text-gray-400">Loan not found</div>

  const formatDate = (date: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const signatureUrl =
    loan.digitalSignatureUrl ?? loan.user?.kyc?.digitalSignatureUrl
  const rightThumbUrl = loan.rightThumbUrl ?? loan.user?.kyc?.rightThumbUrl
  const leftThumbUrl = loan.leftThumbUrl ?? loan.user?.kyc?.leftThumbUrl

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 bg-gray-50">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            display: none;
          }
        }
      `}</style>
      {/* Header Actions */}
      <div className="mb-4 flex items-center justify-between no-print">
        <button
          onClick={() => navigate({ to: '/loans' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} /> Back to Loans
        </button>
        <div className="flex items-center gap-3">
          {shouldShowPayment && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 shadow-sm"
            >
              <CheckCircle2 size={16} /> Record Payment
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
          >
            <Printer size={16} /> Print
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(loan.status)}`}
          >
            {formatStatusLabel(loan.status)}
          </span>
        </div>
      </div>

      {/* Main Form Document */}
      <div className="mx-auto max-w-4xl bg-white shadow-lg border border-gray-300 p-8 mb-6 print-area">
        {/* Header with PAN and Organization */}
        <div className="pb-4 mb-4">
          <div className="mb-3 flex items-start justify-between text-sm">
            <div className="font-semibold">
              PAN No: {loan.user?.panNo ?? '60576'}
            </div>
            <div className="text-right text-sm">
              <span className="font-semibold">Registration No:</span>{' '}
              {loan.referenceNumber}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex w-40 shrink-0 flex-col items-start gap-3">
              {loan.user?.cooperative?.logoUrl ? (
                <img
                  src={
                    typeof loan.user.cooperative === 'string'
                      ? ''
                      : loan.user.cooperative.logoUrl
                  }
                  alt="Cooperative Logo"
                  className="h-32 w-32 object-contain border border-gray-300"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center border border-gray-300 text-sm text-gray-400">
                  Logo
                </div>
              )}
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {typeof loan.user?.cooperative === 'string'
                  ? loan.user.cooperative
                  : (loan.user?.cooperative?.name ??
                    'Sathi Agricultural Cooperative Society Limited')}
              </h1>
              <p className="text-md text-black">
                {typeof loan.user?.cooperative === 'string'
                  ? '—'
                  : (() => {
                      const coop = loan.user?.cooperative
                      if (typeof coop === 'string') return '—'
                      const municipality =
                        loan.municipality?.name ??
                        coop?.municipality?.name ??
                        ''
                      const ward = loan.wardNumber ?? coop?.wardNumber ?? ''
                      const district =
                        loan.district?.name ?? coop?.district?.name ?? ''
                      if (!municipality || !ward || !district)
                        return coop?.address ?? '—'
                      return `${municipality}-${ward}, ${district}`
                    })()}
              </p>
              <p className="text-md text-black">
                est.{' '}
                {typeof loan.user?.cooperative === 'string'
                  ? '—'
                  : (() => {
                      const coop = loan.user?.cooperative
                      if (!coop?.establishedYear) return '—'
                      return new Date(coop.establishedYear)
                        .getFullYear()
                        .toString()
                    })()}
              </p>
            </div>
            {loan.passportPhotoUrl ? (
              <img
                src={loan.passportPhotoUrl}
                alt="Applicant Photo"
                className="w-32 h-32 object-cover border border-gray-300"
              />
            ) : (
              <div className="w-32 h-32 border border-gray-300 flex items-center justify-center text-sm text-gray-400">
                Photo
              </div>
            )}
          </div>
        </div>

        {/* Title and Date */}
        <div className="text-center mb-4">
          <h2 className="text-base font-bold underline">Loan Request Form</h2>
        </div>
        <div className="text-right mb-4 text-sm">
          <span className="font-semibold">Date:</span>{' '}
          {formatDate(loan.createdAt)}
        </div>

        {/* To/From Section */}
        {/* <div className="mb-4 text-sm">
          <p className="mb-2">
            <span className="font-semibold">To:</span> Loan Sub-Committee
            Convener, Sathi Agricultural Cooperative Society Ltd.
          </p>
          <p className="mb-2">
            <span className="font-semibold">From:</span>{' '}
            {loan.fullNameEn ?? loan.fullNameNp ?? '—'}
          </p>
          <p className="mb-2">
            <span className="font-semibold">S/o, D/o, W/o:</span>{' '}
            {loan.fatherNameEn ?? loan.fatherNameNp ?? '—'}
          </p>
        </div> */}

        {/* Subject */}
        <div className="mb-4 text-sm">
          <span className="font-semibold">Subject:</span> Request for loan
          approval
        </div>

        {/* Salutation */}
        <div className="mb-4 text-sm">
          <p className="mb-2">Sir,</p>
        </div>

        {/* Main Content */}
        <div className="mb-4 text-sm leading-relaxed space-y-2">
          <p>
            It is to be noted that I am a member of the above-mentioned
            cooperative society with shareholder number{' '}
            <span className="font-semibold border-b border-dotted border-gray-400 px-1">
              {loan.shareholderNumber ?? '—'}
            </span>
            . The passbook number is{' '}
            <span className="font-semibold">{loan.passbookNumber ?? '—'}</span>.
          </p>
          <p>
            I am a member of the cooperative society residing in Ward No.{' '}
            <span className="font-semibold border-b border-dotted border-gray-400 px-1">
              {loan.wardNumber ?? '—'}
            </span>
            , {loan.province ?? '—'} Province. Due to my work situation, I
            require a loan.
          </p>
          <p>
            In the future, if I am unable to pay the principal and interest
            within the stipulated time, I have submitted this application to{' '}
            <span className="font-semibold">
              provide a loan for the purpose of{' '}
              {loan.purpose?.replace('_', ' ').toLowerCase() ?? '—'}
            </span>{' '}
            within the installment period of{' '}
            <span className="font-semibold">
              {loan.duration?.replace('_', ' ') ?? '—'}
            </span>
            .
          </p>
        </div>

        {/* Details of Jaminat */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 underline">
            Details of Jaminat (Collateral):
          </h3>
          <div className="border border-gray-400 p-3 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Collateral Type:</span>{' '}
                {loan.collateralType?.replace('_', ' ') ?? '—'}
              </div>
              <div>
                <span className="font-semibold">Guarantee Amount:</span>{' '}
                {loan.guaranteeAmount
                  ? `NPR ${loan.guaranteeAmount.toLocaleString()}`
                  : '—'}
              </div>
            </div>
            {loan.propertyDocumentUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Property Document:</p>
                <img
                  src={loan.propertyDocumentUrl}
                  alt="Property Document"
                  className="h-32 border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Applicant Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">Applicant Details:</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">
                Applicant Name (English):
              </span>
              <p className="font-medium">{loan.fullNameEn ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">
                Applicant Name (Nepali):
              </span>
              <p className="font-medium">{loan.fullNameNp ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Father's Name:</span>
              <p className="font-medium">
                {loan.fatherNameEn ?? loan.fatherNameNp ?? '—'}
              </p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Grandfather's Name:</span>
              <p className="font-medium">
                {loan.grandfatherNameEn ?? loan.grandfatherNameNp ?? '—'}
              </p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Age:</span>
              <p className="font-medium">{loan.age ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Shareholder No:</span>
              <p className="font-medium">{loan.shareholderNumber ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Passbook No:</span>
              <p className="font-medium">{loan.passbookNumber ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Citizenship No:</span>
              <p className="font-medium">{loan.citizenshipNumber ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">NIN ID No:</span>
              <p className="font-medium">{loan.ninIdNumber ?? '—'}</p>
            </div>
            <div className="border-b border-dotted border-gray-300 pb-1">
              <span className="text-gray-600 text-xs">Contact Number:</span>
              <p className="font-medium">{loan.contactNumber ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">Address:</h3>
          <div className="border border-gray-300 p-3">
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Province:</span>{' '}
                {loan.province ?? '—'}
              </p>
              <p>
                <span className="text-gray-600">District:</span>{' '}
                {loan.district?.name ?? loan.districtId ?? '—'}
              </p>
              <p>
                <span className="text-gray-600">Municipality:</span>{' '}
                {loan.municipality?.name ?? loan.municipalityId ?? '—'}
              </p>
              <p>
                <span className="text-gray-600">Ward Number:</span>{' '}
                {loan.wardNumber ?? '—'}
              </p>
              <p>
                <span className="text-gray-600">Tole:</span> {loan.tole ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">Loan Information:</h3>
          <div className="border border-gray-300 p-3 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Loan Amount:</span>{' '}
                <span className="text-base font-bold text-blue-700">
                  NPR {loan.loanAmount?.toLocaleString() ?? '—'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Amount in Words:</span>{' '}
                {loan.loanAmountInWords ?? '—'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Loan Purpose:</span>{' '}
                {loan.purpose?.replace('_', ' ') ?? '—'}
              </div>
              <div>
                <span className="font-semibold">Duration:</span>{' '}
                {loan.duration?.replace('_', ' ') ?? '—'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Collateral Type:</span>{' '}
                {loan.collateralType?.replace('_', ' ') ?? '—'}
              </div>
              <div>
                <span className="font-semibold">Terms Accepted:</span>{' '}
                {loan.termsAccepted ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        <div className="print-break"></div>

        {/* Guarantor Information */}
        {loan.guarantorName && (
          <div className="mb-6 no-print">
            <h3 className="text-sm font-bold mb-3">Guarantor Information:</h3>
            <div className="border border-gray-300 p-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Name:</span>{' '}
                  {loan.guarantorName ?? '—'}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{' '}
                  {loan.guarantorAddress ?? '—'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Shareholder Number:</span>{' '}
                  {loan.guarantorShareholderNumber ?? '—'}
                </div>
                <div>
                  <span className="font-semibold">Guarantee Amount:</span>{' '}
                  {loan.guaranteeAmount
                    ? `NPR ${loan.guaranteeAmount.toLocaleString()}`
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="mb-6 no-print">
          <h3 className="text-sm font-bold mb-3">Attached Documents:</h3>
          <div className="grid grid-cols-4 gap-3">
            {loan.passportPhotoUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">Passport Photo</p>
                <img
                  src={loan.passportPhotoUrl}
                  alt="Passport Photo"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            {loan.citizenshipFrontUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">
                  Citizenship (Front)
                </p>
                <img
                  src={loan.citizenshipFrontUrl}
                  alt="Citizenship Front"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            {loan.citizenshipBackUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">Citizenship (Back)</p>
                <img
                  src={loan.citizenshipBackUrl}
                  alt="Citizenship Back"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            {loan.ninIdCardUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">NIN ID Card</p>
                <img
                  src={loan.ninIdCardUrl}
                  alt="NIN ID Card"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            {loan.propertyDocumentUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">Property Document</p>
                <img
                  src={loan.propertyDocumentUrl}
                  alt="Property Document"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            {loan.salarySheetUrl && (
              <div className="border border-gray-300 p-2">
                <p className="text-xs text-gray-600 mb-1">Salary Sheet</p>
                <img
                  src={loan.salarySheetUrl}
                  alt="Salary Sheet"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
          </div>
          {!loan.passportPhotoUrl &&
            !loan.citizenshipFrontUrl &&
            !loan.citizenshipBackUrl &&
            !loan.ninIdCardUrl &&
            !loan.propertyDocumentUrl &&
            !loan.salarySheetUrl && (
              <p className="text-sm text-gray-400 italic">
                No documents attached.
              </p>
            )}
        </div>

        {/* Signature Section */}
        <div className="mt-8 grid grid-cols-3 gap-8 text-sm text-center no-print">
          <div>
            {signatureUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={signatureUrl}
                  alt="Applicant's Signature"
                  className="h-20 w-auto object-contain mb-2 border border-gray-200"
                />
                <div className="border-t border-gray-400 pt-1 w-full">
                  Applicant's Signature
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-400 pt-1 mt-12">
                Applicant's Signature
              </div>
            )}
          </div>
          <div>
            {rightThumbUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={rightThumbUrl}
                  alt="Right Thumb"
                  className="h-20 w-auto object-contain mb-2 border border-gray-200"
                />
                <div className="border-t border-gray-400 pt-1 w-full">
                  Right Thumb
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-400 pt-1 mt-12">
                Right Thumb
              </div>
            )}
          </div>
          <div>
            {leftThumbUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={leftThumbUrl}
                  alt="Left Thumb"
                  className="h-20 w-auto object-contain mb-2 border border-gray-200"
                />
                <div className="border-t border-gray-400 pt-1 w-full">
                  Left Thumb
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-400 pt-1 mt-12">
                Left Thumb
              </div>
            )}
          </div>
        </div>

        {/* Investigation Notes */}
        <div className="mt-6 pt-4 border-t-2 border-gray-300 no-print">
          <p className="text-xs italic text-gray-600 mb-3">
            While investigating the application received, Rs. ___________ has
            been deposited in the account of the organization.
          </p>
          <div className="grid grid-cols-3 gap-8 text-xs text-center mt-6">
            <div>
              <div className="border-t border-gray-400 pt-1 mt-8">
                (If the application needs clarification)
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-1 mt-8">
                Board of Directors
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-1 mt-8">Employee</div>
            </div>
          </div>
        </div>

        {/* Loan Officer Comments Section */}
        <div className="mt-6 pt-4 border-t border-gray-300 no-print">
          <h3 className="text-sm font-bold mb-2">Loan Officer Comments:</h3>
          <div className="border border-gray-300 p-3 min-h-[60px] bg-gray-50 text-sm text-gray-600 italic">
            {loan.reviewNotes ?? 'No comments yet.'}
          </div>
        </div>
      </div>

      {/* Rejection Reason */}
      {loan.rejectionReason && (
        <div className="mx-auto max-w-4xl mb-6 rounded-lg bg-red-50 border-2 border-red-300 p-4 no-print">
          <p className="text-sm font-semibold text-red-800 mb-1">
            Rejection Reason:
          </p>
          <p className="text-sm text-red-700">{loan.rejectionReason}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mx-auto max-w-4xl no-print">
        {shouldShowApproval && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
            >
              <CheckCircle2 size={18} /> Review & Approve/Reject
            </button>
          </div>
        )}
        {shouldShowDisburse && (
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={() => setShowDisburseModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
            >
              <CheckCircle2 size={18} /> Disburse Loan
            </button>
          </div>
        )}
        {!shouldShowApproval && !shouldShowDisburse && (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">
              This loan application has been{' '}
              {loan.status?.replace('_', ' ').toLowerCase()}.
            </p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <ApprovalFormModal
        open={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        loan={loan}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={approvalLoading}
      />
      {/* Disbursement Modal */}
      <DisbursementFormModal
        open={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        loan={loan}
        onDisburse={handleDisburse}
        loading={disburseLoading}
      />
      <RecordPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        loan={loan}
        onSubmit={handleRecordPayment}
        loading={paymentLoading}
      />
    </div>
  )
}
