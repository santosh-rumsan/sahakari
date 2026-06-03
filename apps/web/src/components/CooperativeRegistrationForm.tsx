import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Upload } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('adminToken') ?? ''
}

interface Province {
  id: string
  name: string
  nameNp: string
}

interface District {
  id: string
  name: string
  nameNp: string
}

interface Municipality {
  id: string
  name: string
  nameNp: string
}

const optionalText = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().optional(),
)

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Cooperative name must be at least 3 characters'),
  nameNp: optionalText,
  code: optionalText,
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  municipalityId: z.string().min(1, 'Municipality is required'),
  wardNumber: z
    .string()
    .trim()
    .min(1, 'Ward number is required')
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, {
      message: 'Ward number must be a positive number',
    }),
  tole: z.string().trim().min(2, 'Tole/Street is required'),
  establishedYear: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z
      .string()
      .regex(/^\d{4}$/, 'Establishment year must be a 4 digit year')
      .optional(),
  ),
  panNumber: optionalText,
  registrationNumber: z
    .string()
    .trim()
    .min(3, 'Registration number is required'),
  logoUrl: optionalText,
  email: z.string().trim().email('Enter a valid email address'),
  contactNumber: z
    .string()
    .trim()
    .min(7, 'Contact number is required')
    .regex(/^[+\d\s-]+$/, 'Enter a valid contact number'),
})

type FormData = {
  name: string
  nameNp: string
  code: string
  provinceId: string
  districtId: string
  municipalityId: string
  wardNumber: string
  tole: string
  establishedYear: string
  panNumber: string
  registrationNumber: string
  logoUrl: string
  email: string
  contactNumber: string
}

type FormField = keyof FormData

export function CooperativeRegistrationForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = getToken()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    nameNp: '',
    code: '',
    provinceId: '',
    districtId: '',
    municipalityId: '',
    wardNumber: '',
    tole: '',
    establishedYear: '',
    panNumber: '',
    registrationNumber: '',
    logoUrl: '',
    email: '',
    contactNumber: '',
  })
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({})

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Fetch provinces
  const { data: provinces = [] } = useQuery<Array<Province>>({
    queryKey: ['provinces'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/geo/provinces`)
      return res.json()
    },
  })

  // Fetch districts based on province
  const { data: districts = [] } = useQuery<Array<District>>({
    queryKey: ['districts', formData.provinceId],
    queryFn: async () => {
      if (!formData.provinceId) return []
      const res = await fetch(
        `${apiUrl}/v1/geo/districts?provinceId=${formData.provinceId}`,
      )
      return res.json()
    },
    enabled: !!formData.provinceId,
  })

  // Fetch municipalities based on district
  const { data: municipalities = [] } = useQuery<Array<Municipality>>({
    queryKey: ['municipalities', formData.districtId],
    queryFn: async () => {
      if (!formData.districtId) return []
      const res = await fetch(
        `${apiUrl}/v1/geo/municipalities?districtId=${formData.districtId}`,
      )
      return res.json()
    },
    enabled: !!formData.districtId,
  })

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const res = await fetch(`${apiUrl}/v1/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      })
      const data = await res.json()
      return data.url
    },
  })

  // Create cooperative mutation
  const createCooperativeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${apiUrl}/v1/cooperative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create cooperative')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperative-check'] })
      navigate({ to: '/dashboard' })
    },
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const validationResult = formSchema.safeParse(formData)
      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors
        const nextErrors: Partial<Record<FormField, string>> = {}

        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (!messages[0]) continue
          nextErrors[field as FormField] = messages[0]
        }

        setErrors(nextErrors)
        return
      }

      let logoUrl = formData.logoUrl

      // Upload logo if selected
      if (logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(logoFile)
      }

      // Prepare data
      const cooperativeData = {
        name: formData.name,
        code: formData.code || undefined,
        provinceId: formData.provinceId || undefined,
        districtId: formData.districtId || undefined,
        municipalityId: formData.municipalityId || undefined,
        wardNumber: formData.wardNumber
          ? parseInt(formData.wardNumber)
          : undefined,
        tole: formData.tole || undefined,
        establishedYear: formData.establishedYear
          ? new Date(formData.establishedYear).toISOString()
          : undefined,
        panNumber: formData.panNumber || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        logoUrl: logoUrl || undefined,
        email: formData.email || undefined,
        contactNumber: formData.contactNumber || undefined,
      }

      await createCooperativeMutation.mutateAsync(cooperativeData)
    } catch (error) {
      console.error('Error creating cooperative:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to create cooperative',
      )
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    const fieldName = name as FormField

    const nextFormData = {
      ...formData,
      [fieldName]: value,
    }

    if (name === 'provinceId') {
      nextFormData.districtId = ''
      nextFormData.municipalityId = ''
    }
    if (name === 'districtId') {
      nextFormData.municipalityId = ''
    }

    setFormData(nextFormData)

    // Reset dependent fields when parent changes
    const fieldSchema = formSchema.shape[fieldName]
    const result = fieldSchema.safeParse(value)
    setErrors((prev) => ({
      ...prev,
      [fieldName]: result.success
        ? undefined
        : result.error.issues[0]?.message || 'Invalid value',
    }))

    if (name === 'provinceId') {
      setErrors((prev) => ({
        ...prev,
        districtId: undefined,
        municipalityId: undefined,
      }))
    }
    if (name === 'districtId') {
      setErrors((prev) => ({ ...prev, municipalityId: undefined }))
    }
  }

  const isLoading =
    uploadLogoMutation.isPending || createCooperativeMutation.isPending
  const isFormValid = formSchema.safeParse(formData).success

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            R
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Register Cooperative
          </h1>
          <p className="text-gray-500 mt-2">Set up your cooperative details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Cooperative Logo
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-blue-500 text-sm">
                      Click to upload logo
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Cooperative Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cooperative Name (English)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Rahat Saving & Credit Cooperative"
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cooperative Name (Nepali)
              </label>
              <input
                type="text"
                name="nameNp"
                value={formData.nameNp}
                onChange={handleChange}
                placeholder="सहकारीको नाम"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
          </div>

          {/* Address Section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  name="provinceId"
                  value={formData.provinceId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.provinceId ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.provinceId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.provinceId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  disabled={!formData.provinceId}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${
                    errors.districtId ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.districtId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.districtId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipality
                </label>
                <select
                  name="municipalityId"
                  value={formData.municipalityId}
                  onChange={handleChange}
                  disabled={!formData.districtId}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${
                    errors.municipalityId ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select municipality</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
                {errors.municipalityId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.municipalityId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ward No.
                </label>
                <input
                  type="number"
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.wardNumber ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.wardNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.wardNumber}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tole/Street
                </label>
                <input
                  type="text"
                  name="tole"
                  value={formData.tole}
                  onChange={handleChange}
                  placeholder="e.g., Thamel"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tole ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.tole && (
                  <p className="mt-1 text-xs text-red-600">{errors.tole}</p>
                )}
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Establishment Year (BS)
              </label>
              <input
                type="text"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                placeholder="2080"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.establishedYear ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.establishedYear && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.establishedYear}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="e.g., 610061234V056"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g., Reg-2080-001"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.registrationNumber ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.registrationNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.registrationNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cooperative Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., info@maile.uk"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g., +977-98XXXXXXXX"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactNumber ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contactNumber}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}
