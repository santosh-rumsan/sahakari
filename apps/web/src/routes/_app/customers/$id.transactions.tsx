import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  ChevronLeft,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'

export const Route = createFileRoute('/_app/customers/$id/transactions')({
  component: TransactionsPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function TransactionsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const token = getToken()

  // Fetch customer basic info
  const { data: customer } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch customer: ${res.status}`)
      }
      return res.json()
    },
    enabled: !!token,
  })

  // Fetch passbook transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions', id],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/v1/admin/passbook/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) {
        return []
      }
      return res.json()
    },
    enabled: !!token,
  })

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate summary statistics
  const totalDeposits =
    transactions?.reduce((sum: number, tx: any) => {
      return tx.type === 'DEPOSIT' ? sum + tx.amount : sum
    }, 0) ?? 0

  const totalWithdrawals =
    transactions?.reduce((sum: number, tx: any) => {
      return tx.type === 'WITHDRAWAL' ? sum + Math.abs(tx.amount) : sum
    }, 0) ?? 0

  const totalInterest =
    transactions?.reduce((sum: number, tx: any) => {
      return tx.type === 'INTEREST_CREDIT' ? sum + tx.amount : sum
    }, 0) ?? 0

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: `/customers/${id}` })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft size={16} /> Back to Member Details
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
              <Receipt size={28} />
              Transaction History
            </h1>
            {customer && (
              <p className="text-sm text-gray-500 mt-1">
                {customer.fullName} • Passbook: {customer.passbookNumber ?? '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {transactions && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Wallet size={14} />
              <span>Current Balance</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              NPR {customer?.passbook?.currentBalance?.toLocaleString() ?? '0'}
            </p>
          </div>

          {/* Total Deposits */}
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-5">
            <div className="flex items-center gap-2 text-green-700 text-xs mb-2">
              <ArrowDownToLine size={14} />
              <span>Total Deposits</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              NPR {totalDeposits.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {transactions.filter((tx: any) => tx.type === 'DEPOSIT').length}{' '}
              transactions
            </p>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-5">
            <div className="flex items-center gap-2 text-red-700 text-xs mb-2">
              <ArrowUpFromLine size={14} />
              <span>Total Withdrawals</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              NPR {totalWithdrawals.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {
                transactions.filter((tx: any) => tx.type === 'WITHDRAWAL')
                  .length
              }{' '}
              transactions
            </p>
          </div>

          {/* Total Interest */}
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-5">
            <div className="flex items-center gap-2 text-blue-700 text-xs mb-2">
              <TrendingUp size={14} />
              <span>Total Interest</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              NPR {totalInterest.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {
                transactions.filter((tx: any) => tx.type === 'INTEREST_CREDIT')
                  .length
              }{' '}
              credits
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            All Transactions
          </h2>
          {transactions && transactions.length > 0 && (
            <span className="text-sm text-gray-500">
              {transactions.length} total transaction
              {transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            Loading transactions...
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Receipt size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Transaction history will appear here once deposits or withdrawals
              are made
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">
                    Balance After
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => {
                  const isDeposit =
                    tx.type === 'DEPOSIT' || tx.type === 'INTEREST_CREDIT'
                  const isInterest = tx.type === 'INTEREST_CREDIT'

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {formatDateShort(tx.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(tx.createdAt).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {isInterest ? (
                            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                              <TrendingUp size={14} />
                              <span className="text-xs font-medium">
                                Interest
                              </span>
                            </div>
                          ) : isDeposit ? (
                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                              <span className="text-xs font-medium">
                                Deposit
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
                              <span className="text-xs font-medium">
                                Withdrawal
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs">
                        {tx.description || '—'}
                      </td>
                      <td
                        className={`py-4 px-4 text-right text-sm font-semibold ${
                          isDeposit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isDeposit ? '+' : ''}
                        NPR {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-bold text-gray-900">
                        NPR {tx.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
