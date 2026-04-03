import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { cn } from '@rs/ui'
import type { UpdateContactInput, ContactTag, ContactStatus } from '@rs/sdk'
import { useContact, useUpdateContact } from '../hooks/contacts'

export const Route = createFileRoute('/_app/contacts/$id/edit')({
  component: EditContact,
})

const TAGS: ContactTag[] = ['Client', 'Lead', 'Partner', 'Vendor', 'Archived']
const STATUSES: ContactStatus[] = ['Active', 'Inactive']

function EditContact() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: contact, isLoading } = useContact(id)
  const updateMutation = useUpdateContact()

  const [form, setForm] = React.useState<UpdateContactInput>({})
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    if (contact && !initialized) {
      setForm({
        name: contact.name,
        email: contact.email,
        tag: contact.tag,
        status: contact.status,
        phone: contact.phone ?? '',
        company: contact.company ?? '',
        website: contact.website ?? '',
        location: contact.location ?? '',
        notes: contact.notes ?? '',
        avatar: contact.avatar ?? '',
      })
      setInitialized(true)
    }
  }, [contact, initialized])

  const set = (key: keyof UpdateContactInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMutation.mutateAsync({ id, data: form })
    navigate({ to: '/contacts' })
  }

  if (isLoading) {
    return (
      <div className="flex h-full bg-[#f0f0f0] items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-full bg-[#f0f0f0] items-center justify-center flex-col gap-3">
        <p className="text-sm text-gray-500">Contact not found</p>
        <Link to="/contacts" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          Back to contacts
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      <div className="flex-1 bg-white rounded-l-3xl overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link
              to="/contacts"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Contacts
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-[#1a1a1a]">Edit</span>
          </div>

          <h1 className="text-3xl font-black text-[#1a1a1a] mb-8">Edit contact</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Full name *">
                <input
                  required
                  value={form.name ?? ''}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Anita Sharma"
                  className={inputCls}
                />
              </Field>

              <Field label="Email address *">
                <input
                  required
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="anita@example.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={form.phone ?? ''}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+977-980-000-0000"
                  className={inputCls}
                />
              </Field>

              <Field label="Company">
                <input
                  value={form.company ?? ''}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder="Acme Corp"
                  className={inputCls}
                />
              </Field>

              <Field label="Location">
                <input
                  value={form.location ?? ''}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Kathmandu, Nepal"
                  className={inputCls}
                />
              </Field>

              <Field label="Website">
                <input
                  value={form.website ?? ''}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="example.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Tag">
                <select
                  value={form.tag ?? 'Lead'}
                  onChange={(e) => set('tag', e.target.value as ContactTag)}
                  className={inputCls}
                >
                  {TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={form.status ?? 'Active'}
                  onChange={(e) => set('status', e.target.value as ContactStatus)}
                  className={inputCls}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any notes about this contact…"
                rows={4}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>

            {updateMutation.error && (
              <p className="text-sm text-red-500">
                {(updateMutation.error as Error).message}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                to="/contacts"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
