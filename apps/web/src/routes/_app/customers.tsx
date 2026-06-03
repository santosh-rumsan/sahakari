import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BanknoteArrowDown, Eye, HandCoins, Users } from 'lucide-react'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rs/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@rs/ui/dialog'
import { Button } from '@rs/ui/button'
import { Field, FieldLabel } from '@rs/ui/field'
import { Input } from '@rs/ui/input'
import { Textarea } from '@rs/ui/textarea'
import { toast } from '@rs/ui/toast'
import { formatStatusLabel, getStatusBadgeClass } from '@/lib/status'

export const Route = createFileRoute('/_app/customers')({
  component: CustomersPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function CustomersPage() {
  const matches = useMatches()
  const isChildActive =
    matches[matches.length - 1]?.routeId !== '/_app/customers'

  const token = getToken()
  const queryClient = useQueryClient()

  // State for deposit/withdraw dialogs
  const [depositDialog, setDepositDialog] = useState<{
    open: boolean
    userId: string
    userName: string
  }>({ open: false, userId: '', userName: '' })

  const [withdrawDialog, setWithdrawDialog] = useState<{
    open: boolean
    userId: string
    userName: string
  }>({ open: false, userId: '', userName: '' })

  const [depositForm, setDepositForm] = useState({
    amount: '',
    description: '',
  })

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    description: '',
  })

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token,
  })

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: {
      userId: string
      amount: number
      description?: string
    }) => {
      const res = await fetch(
        `${apiUrl}/v1/admin/passbook/deposit/${data.userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: data.amount,
            description: data.description,
          }),
        },
      )
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to deposit')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Deposit successful')
      setDepositDialog({ open: false, userId: '', userName: '' })
      setDepositForm({ amount: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deposit')
    },
  })

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      userId: string
      amount: number
      description?: string
    }) => {
      const res = await fetch(
        `${apiUrl}/v1/admin/passbook/withdraw/${data.userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: data.amount,
            description: data.description,
          }),
        },
      )
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to withdraw')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Withdrawal successful')
      setWithdrawDialog({ open: false, userId: '', userName: '' })
      setWithdrawForm({ amount: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to withdraw')
    },
  })

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(depositForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    depositMutation.mutate({
      userId: depositDialog.userId,
      amount,
      description: depositForm.description || undefined,
    })
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(withdrawForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    withdrawMutation.mutate({
      userId: withdrawDialog.userId,
      amount,
      description: withdrawForm.description || undefined,
    })
  }
  if (isChildActive) return <Outlet />

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">All Members</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          View all registered cooperative members
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : !customers || customers.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No members found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Phone
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Cooperative
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Passbook No.
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  KYC Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Loans
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">
                  Registered
                </th>
                <th className="text-center py-3 px-4 text-xs  font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user: any) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Users size={14} />
                      </div>
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {user.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.phone}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {typeof user.cooperative === 'string'
                      ? user.cooperative
                      : (user.cooperative?.name ?? '—')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                    {user.passbookNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(user.kyc?.status)}`}
                    >
                      {user.kyc?.status
                        ? formatStatusLabel(user.kyc.status)
                        : 'Not Started'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user._count?.loanApplications ?? 0}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 ">
                    <div className="flex items-center justify-center gap-1">
                      <TooltipProvider>
                        {/* View Action */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/customers/${user.id}`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors hover:cursor-pointer"
                            >
                              <Eye size={16} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View member details</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Deposit Action */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setDepositDialog({
                                  open: true,
                                  userId: user.id,
                                  userName: user.fullName,
                                })
                                setDepositForm({ amount: '', description: '' })
                              }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors hover:cursor-pointer"
                              disabled={!user.passbookNumber}
                            >
                              <HandCoins size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {user.passbookNumber
                                ? 'Deposit money'
                                : 'No passbook available'}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Withdraw Action */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setWithdrawDialog({
                                  open: true,
                                  userId: user.id,
                                  userName: user.fullName,
                                })
                                setWithdrawForm({
                                  amount: '',
                                  description: '',
                                })
                              }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors hover:cursor-pointer"
                              disabled={!user.passbookNumber}
                            >
                              <BanknoteArrowDown size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {user.passbookNumber
                                ? 'Withdraw money'
                                : 'No passbook available'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deposit Dialog */}
      <Dialog
        open={depositDialog.open}
        onOpenChange={(open) => setDepositDialog({ ...depositDialog, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Money</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Deposit to {depositDialog.userName}'s account
            </p>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-4 mt-4">
            <Field>
              <FieldLabel htmlFor="depositAmount">
                Amount (NPR) <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="depositAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={depositForm.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDepositForm({
                    ...depositForm,
                    amount: e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="depositDescription">
                Description (Optional)
              </FieldLabel>
              <Textarea
                id="depositDescription"
                placeholder="Enter description"
                value={depositForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDepositForm({
                    ...depositForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </Field>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDepositDialog({ open: false, userId: '', userName: '' })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={depositMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {depositMutation.isPending ? 'Processing...' : 'Deposit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={withdrawDialog.open}
        onOpenChange={(open) => setWithdrawDialog({ ...withdrawDialog, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Money</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Withdraw from {withdrawDialog.userName}'s account
            </p>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4 mt-4">
            <Field>
              <FieldLabel htmlFor="withdrawAmount">
                Amount (NPR) <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="withdrawAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={withdrawForm.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    amount: e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="withdrawDescription">
                Description (Optional)
              </FieldLabel>
              <Textarea
                id="withdrawDescription"
                placeholder="Enter description"
                value={withdrawForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </Field>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setWithdrawDialog({ open: false, userId: '', userName: '' })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={withdrawMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
