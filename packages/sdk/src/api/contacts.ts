import type { Contact, CreateContactInput, UpdateContactInput } from '../types/contact'

export function createContactsApi(baseUrl: string) {
  const url = (path: string) => `${baseUrl}/v1/contacts${path}`

  return {
    list: async (): Promise<Contact[]> => {
      const res = await fetch(url(''))
      if (!res.ok) throw new Error('Failed to fetch contacts')
      return res.json() as Promise<Contact[]>
    },

    getById: async (id: string): Promise<Contact> => {
      const res = await fetch(url(`/${id}`))
      if (!res.ok) throw new Error('Failed to fetch contact')
      return res.json() as Promise<Contact>
    },

    create: async (data: CreateContactInput): Promise<Contact> => {
      const res = await fetch(url(''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create contact')
      return res.json() as Promise<Contact>
    },

    update: async (id: string, data: UpdateContactInput): Promise<Contact> => {
      const res = await fetch(url(`/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update contact')
      return res.json() as Promise<Contact>
    },

    remove: async (id: string): Promise<void> => {
      const res = await fetch(url(`/${id}`), { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete contact')
    },
  }
}

export type ContactsApi = ReturnType<typeof createContactsApi>
