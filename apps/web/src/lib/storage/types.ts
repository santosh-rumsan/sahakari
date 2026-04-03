import type { Contact, CreateContactInput, UpdateContactInput } from '@rs/sdk'

export interface ContactStorage {
  list(): Promise<Contact[]>
  getById(id: string): Promise<Contact | null>
  create(data: CreateContactInput): Promise<Contact>
  update(id: string, data: UpdateContactInput): Promise<Contact>
  remove(id: string): Promise<void>
}
