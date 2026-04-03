export type ContactTag = 'Client' | 'Lead' | 'Partner' | 'Vendor' | 'Archived'
export type ContactStatus = 'Active' | 'Inactive'

export interface Contact {
  id: string
  name: string
  email: string
  tag: ContactTag
  status: ContactStatus
  avatar?: string
  phone?: string
  company?: string
  website?: string
  location?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateContactInput {
  name: string
  email: string
  tag: ContactTag
  status: ContactStatus
  avatar?: string
  phone?: string
  company?: string
  website?: string
  location?: string
  notes?: string
}

export type UpdateContactInput = Partial<CreateContactInput>
