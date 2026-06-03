import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Handshake, Key, Mail, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: AdminLoginPage,
})

const apiUrl = import.meta.env['VITE_API_URL'] ?? ''

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiUrl}/v1/auth/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to send OTP')
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiUrl}/v1/auth/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Invalid OTP')
      localStorage.setItem('adminToken', data.accessToken)

      // Check if cooperative is set up
      try {
        const checkRes = await fetch(`${apiUrl}/v1/cooperative/check`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        })
        const checkData = await checkRes.json()

        if (checkData.isSetup) {
          navigate({ to: '/dashboard' })
        } else {
          navigate({ to: '/setup-cooperative' })
        }
      } catch (checkError) {
        // If check fails, go to dashboard (they can set up later)
        console.error('Error checking cooperative setup:', checkError)
        navigate({ to: '/dashboard' })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="rounded-full bg-blue-50 p-3 mb-3">
              <Handshake className="text-blue-600" size={36} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Sahakari Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
              {step === 'email'
                ? 'Enter your admin email to continue'
                : 'Enter the 6-digit OTP sent to your email'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="admin@sahakari.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Key size={16} />
                  </span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 pl-10 text-center text-xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Having trouble? Contact your cooperative admin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
