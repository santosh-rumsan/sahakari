import React, { useState } from 'react'

export type ApprovalFormModalProps = {
  open: boolean
  onClose: () => void
  loan: any
  onApprove: (data: ApprovalFormData) => void
  onReject: (reason: string) => void
  loading?: boolean
}

export type ApprovalFormData = {
  approvedAmount: number
  interestRate: number
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  installments: number
  gracePeriod: number
  lateFee: number
  approvalNotes?: string
}

const defaultInterest = 15
const defaultInstallments = 12
const defaultGrace = 7
const defaultLateFee = 2

export const ApprovalFormModal: React.FC<ApprovalFormModalProps> = ({
  open,
  onClose,
  loan,
  onApprove,
  onReject,
  loading,
}) => {
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [approvedAmount, setApprovedAmount] = useState(loan?.loanAmount || 0)
  const [interestRate, setInterestRate] = useState(defaultInterest)
  const [paymentFrequency, setPaymentFrequency] = useState<
    'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  >('MONTHLY')
  const [installments, setInstallments] = useState(defaultInstallments)
  const [gracePeriod, setGracePeriod] = useState(defaultGrace)
  const [lateFee, setLateFee] = useState(defaultLateFee)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  React.useEffect(() => {
    if (open) {
      setDecision(null)
      setApprovedAmount(loan?.loanAmount || 0)
      setInterestRate(defaultInterest)
      setPaymentFrequency('MONTHLY')
      setInstallments(defaultInstallments)
      setGracePeriod(defaultGrace)
      setLateFee(defaultLateFee)
      setApprovalNotes('')
      setRejectionReason('')
    }
  }, [open, loan])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">Loan Approval</h2>
        <div className="mb-3 space-y-1 text-sm">
          <div>
            <b>Reference:</b> {loan.referenceNumber}
          </div>
          <div>
            <b>User Name:</b> {loan.fullNameEn || loan.fullNameNp}
          </div>
          <div>
            <b>Requested Amount:</b> NPR {loan.loanAmount?.toLocaleString()}
          </div>
          <div>
            <b>Purpose:</b> {loan.purpose}
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 rounded-lg py-2 font-semibold border ${decision === 'APPROVE' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setDecision('APPROVE')}
            type="button"
          >
            ✓ Approve
          </button>
          <button
            className={`flex-1 rounded-lg py-2 font-semibold border ${decision === 'REJECT' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setDecision('REJECT')}
            type="button"
          >
            ○ Reject
          </button>
        </div>
        {decision === 'APPROVE' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">
                Approved Amount
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={approvedAmount}
                min={0}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={interestRate}
                min={0}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Payment Frequency
              </label>
              <select
                className="w-full border rounded px-2 py-1"
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value as any)}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Number of Installments
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={installments}
                min={1}
                onChange={(e) => setInstallments(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Grace Period Days
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={gracePeriod}
                min={0}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Late Fee %
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={lateFee}
                min={0}
                onChange={(e) => setLateFee(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Approval Notes (optional)
              </label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
        {decision === 'REJECT' && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded px-2 py-1"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
            />
          </div>
        )}
        <div className="flex gap-2 mt-4">
          {decision === 'APPROVE' && (
            <button
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
              onClick={() =>
                onApprove({
                  approvedAmount,
                  interestRate,
                  paymentFrequency,
                  installments,
                  gracePeriod,
                  lateFee,
                  approvalNotes: approvalNotes.trim() || undefined,
                })
              }
              type="button"
            >
              APPROVE
            </button>
          )}
          {decision === 'REJECT' && (
            <button
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              disabled={loading || !rejectionReason.trim()}
              onClick={() => onReject(rejectionReason)}
              type="button"
            >
              REJECT
            </button>
          )}
          <button
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
