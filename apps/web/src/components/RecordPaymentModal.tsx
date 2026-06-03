import React, { useState } from 'react'

type Installment = {
  installmentNumber: number
  dueDate: string
  totalAmount: number
  isPaid: boolean
  paidAmount?: number | null
  paidDate?: string | null
}

export type RecordPaymentModalProps = {
  open: boolean
  onClose: () => void
  loan: any
  onSubmit: (payload: {
    installmentNumbers: Array<number>
    paymentDate: string
  }) => void
  loading?: boolean
}

function formatDate(date: string | Date) {
  if (!date) return '—'
  const value = typeof date === 'string' ? new Date(date) : date
  return value.toLocaleDateString('en-GB')
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  open,
  onClose,
  loan,
  onSubmit,
  loading,
}) => {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [selectedInstallments, setSelectedInstallments] = useState<
    Array<number>
  >([])

  React.useEffect(() => {
    if (!open) return
    setPaymentDate(new Date().toISOString().slice(0, 10))
    setSelectedInstallments([])
  }, [open, loan])

  if (!open) return null

  const installments: Array<Installment> = loan?.installments ?? []
  const unpaidInstallments = installments.filter(
    (installment) => !installment.isPaid,
  )
  const selectedSet = new Set(selectedInstallments)
  const selectedRows = installments.filter((installment) =>
    selectedSet.has(installment.installmentNumber),
  )
  const selectedBaseTotal = selectedRows.reduce(
    (sum, installment) => sum + installment.totalAmount,
    0,
  )

  const toggleInstallment = (installmentNumber: number) => {
    setSelectedInstallments((current) =>
      current.includes(installmentNumber)
        ? current.filter((value) => value !== installmentNumber)
        : [...current, installmentNumber],
    )
  }

  const selectAllUnpaid = () => {
    setSelectedInstallments(
      unpaidInstallments.map((installment) => installment.installmentNumber),
    )
  }

  const clearSelection = () => {
    setSelectedInstallments([])
  }

  const handleSubmit = () => {
    onSubmit({
      installmentNumbers: selectedInstallments,
      paymentDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Record Loan Payment
          </h2>
          <p className="text-sm text-gray-500">
            Select one or more unpaid installments and record the payment in a
            single action.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Reference
              </div>
              <div className="font-semibold">
                {loan?.referenceNumber ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Applicant
              </div>
              <div className="font-semibold">
                {loan?.fullNameEn || loan?.fullNameNp || '—'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Loan Status
              </div>
              <div className="font-semibold">{loan?.status ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Unpaid Installments
              </div>
              <div className="font-semibold">{unpaidInstallments.length}</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllUnpaid}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Select All Unpaid
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Installments
              </h3>
              <span className="text-xs text-gray-500">
                Selected: {selectedInstallments.length}
              </span>
            </div>
            <div className="max-h-[calc(95vh-420px)] overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Select</th>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Base Amount</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((installment) => {
                    const isSelected = selectedSet.has(
                      installment.installmentNumber,
                    )
                    const isPaid = installment.isPaid
                    return (
                      <tr
                        key={installment.installmentNumber}
                        className={isSelected ? 'bg-blue-50' : ''}
                      >
                        <td className="border-t border-gray-100 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isPaid}
                            onChange={() =>
                              toggleInstallment(installment.installmentNumber)
                            }
                            className="h-4 w-4 accent-blue-600"
                          />
                        </td>
                        <td className="border-t border-gray-100 px-3 py-2 font-medium">
                          {installment.installmentNumber}
                        </td>
                        <td className="border-t border-gray-100 px-3 py-2">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="border-t border-gray-100 px-3 py-2">
                          NPR {Number(installment.totalAmount).toLocaleString()}
                        </td>
                        <td className="border-t border-gray-100 px-3 py-2">
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium">Selected base amount</span>
              <span className="font-semibold">
                NPR {selectedBaseTotal.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Late penalties are calculated on submit using the selected payment
              date.
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedInstallments.length > 0
                ? `${selectedInstallments.length} installment(s) selected`
                : 'Select at least one installment to enable payment'}
            </span>
            <span className="font-semibold text-gray-900">
              NPR {selectedBaseTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading || selectedInstallments.length === 0}
            >
              {loading ? 'Recording...' : 'Pay Selected Installments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
