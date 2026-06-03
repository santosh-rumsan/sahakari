import React, { useState } from 'react'

export type DisbursementFormModalProps = {
  open: boolean
  onClose: () => void
  loan: any
  onDisburse: () => void
  loading?: boolean
}

function formatDate(date: string | Date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB')
}

export const DisbursementFormModal: React.FC<DisbursementFormModalProps> = ({
  open,
  onClose,
  loan,
  onDisburse,
  loading,
}) => {
  const [confirmed, setConfirmed] = useState(false)
  if (!open) return null

  // Schedule preview (first 3 installments)
  const today = new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">Loan Disbursement</h2>
        <div className="mb-3 space-y-1 text-sm">
          <div>
            <b>Reference:</b> {loan.referenceNumber}
          </div>
          <div>
            <b>User Name:</b> {loan.fullNameEn || loan.fullNameNp}
          </div>
          <div>
            <b>Phone:</b> {loan.contactNumber}
          </div>
          <div>
            <b>Passbook Number:</b> {loan.passbookNumber}
          </div>
        </div>
        <div className="mb-3 space-y-1 text-sm">
          <div>
            <b>Approved Amount:</b> NPR{' '}
            {loan.approvedAmount?.toLocaleString() ||
              loan.loanAmount?.toLocaleString()}
          </div>
          <div>
            <b>Interest Rate:</b> {loan.interestRate || 15}%
          </div>
          <div>
            <b>Frequency:</b> {loan.paymentFrequency || 'MONTHLY'}
          </div>
          <div>
            <b>Installments:</b> {loan.installments || 12}
          </div>
          <div>
            <b>Grace Period:</b> {loan.gracePeriod || 7} days
          </div>
          <div>
            <b>Late Fee:</b> {loan.lateFee || 2}%
          </div>
        </div>
        <div className="mb-3 text-sm">
          <b>Disbursement Date:</b> {formatDate(today)}
        </div>
        {/* <div className="mb-3">
          <b>Schedule Preview:</b>
          <table className="w-full text-xs mt-1 border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Due Date</th>
                <th className="border px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.number}>
                  <td className="border px-2 py-1 text-center">{s.number}</td>
                  <td className="border px-2 py-1 text-center">{s.dueDate}</td>
                  <td className="border px-2 py-1 text-right">
                    NPR {s.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="confirm-disburse"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="accent-blue-600"
          />
          <label htmlFor="confirm-disburse" className="text-xs">
            I confirm disbursing NPR{' '}
            {loan.approvedAmount?.toLocaleString() ||
              loan.loanAmount?.toLocaleString()}{' '}
            to {loan.fullNameEn || loan.fullNameNp}
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!confirmed || loading}
            onClick={onDisburse}
            type="button"
          >
            DISBURSE
          </button>
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
