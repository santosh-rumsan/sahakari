import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  Edit,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { getStatusBadgeClass } from '@/lib/status'

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

export const Route = createFileRoute('/_app/_app/cooperative')({
  component: CooperativePage,
})

interface Cooperative {
  id: string
  name: string
  code?: string
  logoUrl?: string
  email?: string
  contactNumber?: string
  panNumber?: string
  registrationNumber?: string
  establishedYear?: string
  wardNumber?: number
  tole?: string
  address?: string
  isActive: boolean
  province?: {
    name: string
    nameNp: string
  }
  district?: {
    name: string
    nameNp: string
  }
  municipality?: {
    name: string
    nameNp: string
  }
  createdAt: string
  updatedAt: string
}

function CooperativePage() {
  const token = getToken()

  const { data: cooperative, isLoading } = useQuery<Cooperative>({
    queryKey: ['cooperative-details'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/cooperative/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch cooperative details')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!cooperative) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No cooperative information found</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAddress = () => {
    const parts = []
    if (cooperative.tole) parts.push(cooperative.tole)
    if (cooperative.wardNumber) parts.push(`Ward ${cooperative.wardNumber}`)
    if (cooperative.municipality) parts.push(cooperative.municipality.name)
    if (cooperative.district) parts.push(cooperative.district.name)
    if (cooperative.province) parts.push(cooperative.province.name)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cooperative Information
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your cooperative details
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              {cooperative.logoUrl ? (
                <img
                  src={cooperative.logoUrl}
                  alt={cooperative.name}
                  className="w-20 h-20 rounded-lg object-contain border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-blue-500" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {cooperative.name}
                </h2>
                {cooperative.code && (
                  <p className="text-sm text-gray-500 mt-1">
                    Code: {cooperative.code}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(cooperative.isActive ? 'ACTIVE' : 'INACTIVE')}`}
                  >
                    {cooperative.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<FileText className="w-5 h-5 text-gray-400" />}
                label="Registration Number"
                value={cooperative.registrationNumber}
              />
              <InfoItem
                icon={<FileText className="w-5 h-5 text-gray-400" />}
                label="PAN Number"
                value={cooperative.panNumber}
              />
              <InfoItem
                icon={<Calendar className="w-5 h-5 text-gray-400" />}
                label="Established Year"
                value={
                  cooperative.establishedYear
                    ? new Date(cooperative.establishedYear).getFullYear()
                    : 'N/A'
                }
              />
              <InfoItem
                icon={<Calendar className="w-5 h-5 text-gray-400" />}
                label="Registered On"
                value={formatDate(cooperative.createdAt)}
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                label="Email"
                value={cooperative.email}
              />
              <InfoItem
                icon={<Phone className="w-5 h-5 text-gray-400" />}
                label="Contact Number"
                value={cooperative.contactNumber}
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Address
            </h3>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-gray-700">{getAddress()}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Location Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Province</p>
                <p className="text-sm font-medium text-gray-900">
                  {cooperative.province?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">District</p>
                <p className="text-sm font-medium text-gray-900">
                  {cooperative.district?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Municipality</p>
                <p className="text-sm font-medium text-gray-900">
                  {cooperative.municipality?.name || 'N/A'}
                </p>
              </div>
              {cooperative.wardNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ward Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {cooperative.wardNumber}
                  </p>
                </div>
              )}
              {cooperative.tole && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tole/Street</p>
                  <p className="text-sm font-medium text-gray-900">
                    {cooperative.tole}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              System Status
            </h3>
            <p className="text-xs text-blue-700 mb-4">
              Last updated: {formatDate(cooperative.updatedAt)}
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              System operational
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value?: string | number
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 wrap-break-word">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  )
}
