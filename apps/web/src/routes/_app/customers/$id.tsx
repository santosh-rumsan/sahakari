import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
  useNavigate,
} from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  User,
  Wallet,
  XCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rs/ui/dialog'
import { Button } from '@rs/ui/button'
import { Field, FieldLabel } from '@rs/ui/field'
import { Input } from '@rs/ui/input'
import { toast } from '@rs/ui/toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rs/ui/tooltip'
import { formatStatusLabel, getStatusBadgeClass } from '@/lib/status'

export const Route = createFileRoute('/_app/customers/$id')({
  component: CustomerDetailPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function CustomerDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const matches = useMatches()
  const isChildActive =
    matches[matches.length - 1]?.routeId !== '/_app/customers/$id'
  const token = getToken()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [passbookForm, setPassbookForm] = useState({
    openingBalance: 0,
    currentBalance: 0,
    interestRateSavings: 0,
    interestRateLoan: 0,
  })

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
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

  const createPassbookMutation = useMutation({
    mutationFn: async (data: typeof passbookForm) => {
      const res = await fetch(`${apiUrl}/v1/admin/passbook`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id,
          ...data,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create passbook')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Passbook created successfully')
      setIsDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-customer', id] })
      setPassbookForm({
        openingBalance: 0,
        currentBalance: 0,
        interestRateSavings: 0,
        interestRateLoan: 0,
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create passbook')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPassbookMutation.mutate(passbookForm)
  }

  if (isLoading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading customer: {error.message}</p>
        <button
          onClick={() => navigate({ to: '/customers' })}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Members
        </button>
      </div>
    )
  if (!customer)
    return (
      <div className="p-8 text-center text-gray-400">Customer not found</div>
    )

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 size={14} />
      case 'REJECTED':
        return <XCircle size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const isKycApproved = customer?.kyc?.status === 'APPROVED'
  const hasPassbook = !!customer?.passbook
  const canCreatePassbook = isKycApproved && !hasPassbook

  const getButtonTooltip = () => {
    if (hasPassbook) return 'Passbook already created'
    if (!isKycApproved) return 'KYC must be approved before creating passbook'
    return ''
  }

  // If child route (transactions) is active, render it
  if (isChildActive) return <Outlet />

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto px-8 py-7 bg-gray-50">
        {/* Header */}
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate({ to: '/customers' })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:cursor-pointer"
            >
              <ChevronLeft size={16} /> Back to Members
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* View Transactions Button */}
              {customer?.passbook && (
                <Button
                  onClick={() =>
                    navigate({ to: `/customers/${id}/transactions` })
                  }
                  variant="outline"
                  className="flex py-5 items-center gap-2 hover:cursor-pointer"
                >
                  <Receipt size={16} />
                  View Transactions
                </Button>
              )}

              {/* Create Passbook Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-flex ${!canCreatePassbook ? 'cursor-not-allowed' : ''}`}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={`flex items-center gap-2 px-4 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors ${!canCreatePassbook ? 'cursor-not-allowed opacity-50' : ''}`}
                          disabled={!canCreatePassbook}
                        >
                          <Plus className="w-4 h-4" />
                          Create Passbook
                        </Button>
                      </DialogTrigger>
                    </span>
                  </TooltipTrigger>
                  {!canCreatePassbook && (
                    <TooltipContent>{getButtonTooltip()}</TooltipContent>
                  )}
                </Tooltip>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Passbook</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Field>
                      <FieldLabel htmlFor="openingBalance">
                        Opening Balance
                      </FieldLabel>
                      <Input
                        id="openingBalance"
                        type="number"
                        step="0.01"
                        value={passbookForm.openingBalance}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassbookForm({
                            ...passbookForm,
                            openingBalance: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="currentBalance">
                        Current Balance
                      </FieldLabel>
                      <Input
                        id="currentBalance"
                        type="number"
                        step="0.01"
                        value={passbookForm.currentBalance}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassbookForm({
                            ...passbookForm,
                            currentBalance: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="interestRateSavings">
                        Interest Rate on Savings (%)
                      </FieldLabel>
                      <Input
                        id="interestRateSavings"
                        type="number"
                        step="0.01"
                        value={passbookForm.interestRateSavings}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassbookForm({
                            ...passbookForm,
                            interestRateSavings:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="interestRateLoan">
                        Interest Rate on Loans (%)
                      </FieldLabel>
                      <Input
                        id="interestRateLoan"
                        type="number"
                        step="0.01"
                        value={passbookForm.interestRateLoan}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassbookForm({
                            ...passbookForm,
                            interestRateLoan: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex items-center gap-3 px-4 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPassbookMutation.isPending}
                        className="flex items-center gap-3 px-4 py-2 bg-blue-500"
                      >
                        {createPassbookMutation.isPending
                          ? 'Creating...'
                          : 'Create Passbook'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
                  {customer.fullName?.charAt(0) ?? 'U'}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {customer.fullName ?? '—'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      {customer.phone ?? '—'}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      Passbook: {customer.passbookNumber ?? '—'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Joined: {formatDate(customer.createdAt)}
                    </div>
                  </div>
                </div>
                {customer.kyc?.status && (
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(customer.kyc.status)}`}
                  >
                    {getStatusIcon(customer.kyc.status)}
                    KYC: {formatStatusLabel(customer.kyc.status)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cooperative Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} />
                  Cooperative Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Cooperative Name
                    </p>
                    <p className="font-medium text-gray-900">
                      {typeof customer.cooperative === 'string'
                        ? customer.cooperative
                        : (customer.cooperative?.name ?? '—')}
                    </p>
                  </div>
                  {customer.cooperative?.code && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Code</p>
                      <p className="font-medium text-gray-900">
                        {customer.cooperative.code}
                      </p>
                    </div>
                  )}
                  {customer.cooperative?.address && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Address</p>
                      <p className="font-medium text-gray-900">
                        {customer.cooperative.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* KYC Summary */}
              {customer.kyc && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} />
                    KYC Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(customer.kyc.status)}`}
                      >
                        {getStatusIcon(customer.kyc.status)}
                        {formatStatusLabel(customer.kyc.status)}
                      </span>
                    </div>
                    {customer.kyc.citizenshipNumber && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Citizenship Number
                        </p>
                        <p className="font-medium text-gray-900">
                          {customer.kyc.citizenshipNumber}
                        </p>
                      </div>
                    )}
                    {customer.kyc.dob && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Date of Birth
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(customer.kyc.dob)}
                        </p>
                      </div>
                    )}
                    {customer.kyc.submittedAt && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Submitted At
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(customer.kyc.submittedAt)}
                        </p>
                      </div>
                    )}
                    {customer.kyc.rejectionReason && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">
                          Rejection Reason
                        </p>
                        <p className="font-medium text-red-700">
                          {customer.kyc.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* KYC Details (if approved) */}
            {customer.kyc && customer.kyc.status === 'APPROVED' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {(() => {
                    const genealogyData = customer.kyc.genealogyJson as Array<{
                      relation?: string
                      nameEn?: string
                      surnameEn?: string
                      nameNp?: string
                      surnameNp?: string
                    }> | null

                    if (!genealogyData || genealogyData.length === 0) {
                      return null
                    }

                    const getFullName = (item: (typeof genealogyData)[0]) => {
                      const nameEn = [item.nameEn, item.surnameEn]
                        .filter(Boolean)
                        .join(' ')
                      const nameNp = [item.nameNp, item.surnameNp]
                        .filter(Boolean)
                        .join(' ')
                      return nameEn || nameNp
                    }

                    const grandfather = genealogyData.find(
                      (item) => item.relation === 'Grandfather',
                    )
                    const father = genealogyData.find(
                      (item) => item.relation === 'Father',
                    )
                    const spouse = genealogyData.find(
                      (item) => item.relation === 'Spouse',
                    )

                    return (
                      <>
                        {grandfather && getFullName(grandfather) && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">
                              Grandfather's Name
                            </p>
                            <p className="font-medium text-gray-900">
                              {getFullName(grandfather)}
                            </p>
                          </div>
                        )}
                        {father && getFullName(father) && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">
                              Father's Name
                            </p>
                            <p className="font-medium text-gray-900">
                              {getFullName(father)}
                            </p>
                          </div>
                        )}
                        {spouse && getFullName(spouse) && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">
                              Spouse's Name
                            </p>
                            <p className="font-medium text-gray-900">
                              {getFullName(spouse)}
                            </p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                {(customer.kyc.district || customer.kyc.municipality) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Address Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      {customer.kyc.district?.name && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">District</p>
                          <p className="font-medium text-gray-900">
                            {customer.kyc.district.name}
                          </p>
                        </div>
                      )}
                      {customer.kyc.municipality?.name && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">
                            Municipality
                          </p>
                          <p className="font-medium text-gray-900">
                            {customer.kyc.municipality.name}
                          </p>
                        </div>
                      )}
                      {customer.kyc.wardNumber && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">
                            Ward Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {customer.kyc.wardNumber}
                          </p>
                        </div>
                      )}
                      {customer.kyc.tole && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Tole</p>
                          <p className="font-medium text-gray-900">
                            {customer.kyc.tole}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Passbook Details */}
            {customer.passbook && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet size={18} />
                  Passbook Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Opening Balance
                    </p>
                    <p className="font-medium text-gray-900 text-lg">
                      NPR{' '}
                      {customer.passbook.openingBalance?.toLocaleString() ??
                        '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Current Balance
                    </p>
                    <p className="font-medium text-gray-900 text-lg">
                      NPR{' '}
                      {customer.passbook.currentBalance?.toLocaleString() ??
                        '0'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-green-700 text-xs mb-1 font-semibold">
                      Accrued Interest
                    </p>
                    <p className="font-bold text-green-900 text-lg">
                      NPR{' '}
                      {customer.passbook.accruedInterest?.toLocaleString() ??
                        '0'}
                    </p>
                    {customer.passbook.interestPeriodDays > 0 && (
                      <p className="text-green-600 text-xs mt-1">
                        {customer.passbook.interestPeriodDays} days
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Total Savings</p>
                    <p className="font-medium text-gray-900 text-lg">
                      NPR{' '}
                      {customer.passbook.totalSavings?.toLocaleString() ?? '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Total Withdrawals
                    </p>
                    <p className="font-medium text-gray-900 text-lg">
                      NPR{' '}
                      {customer.passbook.totalWithdrawals?.toLocaleString() ??
                        '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Interest Rate on Savings
                    </p>
                    <p className="font-medium text-gray-900">
                      {customer.passbook.interestRateSavings ?? '0'}% per annum
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Interest Rate on Loans
                    </p>
                    <p className="font-medium text-gray-900">
                      {customer.passbook.interestRateLoan ?? '0'}% per annum
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Interest Calculated From
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(customer.passbook.interestCalculatedFrom)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Created At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(customer.passbook.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Interest Calculation Info */}
                {customer.passbook.accruedInterest > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4 text-sm">
                      <p className="text-blue-900 font-medium mb-1">
                        💡 Interest Calculation
                      </p>
                      <p className="text-blue-700">
                        Simple interest is calculated daily on the current
                        balance of{' '}
                        <span className="font-semibold">
                          NPR{' '}
                          {customer.passbook.currentBalance?.toLocaleString()}
                        </span>{' '}
                        at{' '}
                        <span className="font-semibold">
                          {customer.passbook.interestRateSavings}% per annum
                        </span>
                        . Interest has been accruing for{' '}
                        <span className="font-semibold">
                          {customer.passbook.interestPeriodDays} days
                        </span>{' '}
                        since{' '}
                        {formatDate(customer.passbook.interestCalculatedFrom)}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loan Applications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} />
                  Loan Applications ({customer._count?.loanApplications ?? 0})
                </h2>
              </div>
              {!customer.loanApplications ||
              customer.loanApplications.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">
                  No loan applications yet
                </p>
              ) : (
                <div className="space-y-3">
                  {customer.loanApplications.map((loan: any) => (
                    <Link
                      key={loan.id}
                      to={`/loans/${loan.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              Ref: {loan.referenceNumber}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(loan.status)}`}
                            >
                              {getStatusIcon(loan.status)}
                              {formatStatusLabel(loan.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                              NPR {loan.loanAmount?.toLocaleString() ?? '—'}
                            </span>
                            <span>
                              {loan.purpose?.replace('_', ' ') ?? '—'}
                            </span>
                            <span>
                              {loan.duration?.replace('_', ' ') ?? '—'}
                            </span>
                            {loan.submittedAt && (
                              <span>
                                Submitted: {formatDate(loan.submittedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronLeft
                          className="rotate-180 text-gray-400"
                          size={16}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
