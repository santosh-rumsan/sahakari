import { createContactsApi } from '@rs/sdk'
import type { Contact, CreateContactInput, UpdateContactInput } from '@rs/sdk'
import type { ContactStorage } from './types'

export class ApiContactStorage implements ContactStorage {
  private api: ReturnType<typeof createContactsApi>

  constructor(baseUrl: string) {
    this.api = createContactsApi(baseUrl)
  }

  list(): Promise<Contact[]> {
    return this.api.list()
  }

  getById(id: string): Promise<Contact | null> {
    return this.api.getById(id).catch(() => null)
  }

  create(data: CreateContactInput): Promise<Contact> {
    return this.api.create(data)
  }

  update(id: string, data: UpdateContactInput): Promise<Contact> {
    return this.api.update(id, data)
  }

  remove(id: string): Promise<void> {
    return this.api.remove(id)
  }
}
