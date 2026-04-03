import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Users, FileText } from 'lucide-react'

export const Route = createFileRoute('/_app/customers')({
  component: CustomersPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''
function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

function CustomersPage() {
  const token = getToken()

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
                    {user.cooperative}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                    {user.passbookNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${user.kyc?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : user.kyc?.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {user.kyc?.status ?? 'Not Started'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user._count?.loanApplications ?? 0}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
