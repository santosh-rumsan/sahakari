import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import {
  Search,
  Plus,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@rs/ui'
import { useContacts, useDeleteContact } from '../hooks/contacts'

export const Route = createFileRoute('/_app/contacts')({ component: Contacts })

const TAG_COLORS: Record<string, string> = {
  Client: 'bg-purple-100 text-purple-700',
  Lead: 'bg-blue-100 text-blue-700',
  Partner: 'bg-orange-100 text-orange-700',
  Vendor: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-600',
}

function Contacts() {
  const matches = useMatches()
  const isChildActive = matches[matches.length - 1]?.routeId !== '/_app/contacts'

  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const { data: contacts = [], isLoading } = useContacts()
  const deleteMutation = useDeleteContact()

  if (isChildActive) return <Outlet />

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.tag.toLowerCase().includes(search.toLowerCase()),
  )

  const activeId = selectedId ?? filtered[0]?.id ?? null
  const selected = contacts.find((c) => c.id === activeId) ?? filtered[0] ?? null

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return
    await deleteMutation.mutateAsync(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      {/* Left: contact list */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-[#f0f0f0]">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Contacts</h2>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50">
                <SlidersHorizontal size={15} />
              </button>
              <Link
                to="/contacts/new"
                className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={13} />
                Add
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {contacts.length} total · {contacts.filter((c) => c.status === 'Active').length} active
          </p>

          <div className="relative mt-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading &&
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
                  c.id === activeId ? 'bg-white shadow-sm' : 'hover:bg-white/50',
                )}
              >
                <div className="relative flex-shrink-0">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#f0f0f0]',
                      c.status === 'Active' ? 'bg-green-400' : 'bg-gray-300',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1a1a1a] truncate">{c.name}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1',
                        TAG_COLORS[c.tag] ?? 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {c.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.company}</p>
                </div>
              </button>
            ))}
          {!isLoading && filtered.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-8">No contacts found</p>
          )}
        </div>
      </div>

      {/* Right: contact detail */}
      <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="px-8 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-orange-400">
                        {selected.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="pt-1">
                    <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">{selected.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold',
                          TAG_COLORS[selected.tag] ?? 'bg-gray-100 text-gray-600',
                        )}
                      >
                        {selected.tag}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-semibold',
                          selected.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {selected.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-gray-400" />
                        {selected.email}
                      </span>
                      {selected.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-gray-400" />
                          {selected.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/contacts/$id/edit"
                    params={{ id: selected.id }}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                  <button className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Added</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Last updated</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {new Date(selected.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selected.status}</p>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Contact details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
                {[
                  { label: 'Full name', value: selected.name },
                  { label: 'Email address', value: selected.email },
                  { label: 'Phone', value: selected.phone },
                  { label: 'Company', value: selected.company },
                  { label: 'Location', value: selected.location },
                  { label: 'Tag', value: selected.tag },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
                    </div>
                  ))}
              </div>

              {selected.website && (
                <div className="mb-8">
                  <p className="text-xs text-gray-400 mb-1">Website</p>
                  <a
                    href={`https://${selected.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600"
                  >
                    <Globe size={13} />
                    {selected.website}
                  </a>
                </div>
              )}

              {selected.notes && (
                <div>
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Notes</h3>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{selected.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
            <p className="text-sm">No contact selected</p>
            <Link
              to="/contacts/new"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Add your first contact
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
