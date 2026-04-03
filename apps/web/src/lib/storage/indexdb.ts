import type { Contact, CreateContactInput, UpdateContactInput } from '@rs/sdk'
import type { ContactStorage } from './types'

const DB_NAME = 'rumsan-craft'
const DB_VERSION = 1
const CONTACTS_STORE = 'contacts'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(CONTACTS_STORE)) {
        db.createObjectStore(CONTACTS_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => reject(req.error)
  })
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONTACTS_STORE, mode)
    const store = transaction.objectStore(CONTACTS_STORE)
    const req = fn(store)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export class IndexedDBContactStorage implements ContactStorage {
  async list(): Promise<Contact[]> {
    const db = await openDb()
    const result = await tx(db, 'readonly', (s) => s.getAll())
    db.close()
    const contacts = result as Contact[]
    return contacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  async getById(id: string): Promise<Contact | null> {
    const db = await openDb()
    const result = await tx(db, 'readonly', (s) => s.get(id))
    db.close()
    return (result as Contact | undefined) ?? null
  }

  async create(data: CreateContactInput): Promise<Contact> {
    const contact: Contact = {
      ...data,
      id: newId(),
      createdAt: now(),
      updatedAt: now(),
    }
    const db = await openDb()
    await tx(db, 'readwrite', (s) => s.add(contact))
    db.close()
    return contact
  }

  async update(id: string, data: UpdateContactInput): Promise<Contact> {
    const db = await openDb()
    const existing = (await tx(db, 'readonly', (s) => s.get(id))) as Contact | undefined
    if (!existing) {
      db.close()
      throw new Error(`Contact ${id} not found`)
    }
    const updated: Contact = { ...existing, ...data, updatedAt: now() }
    await tx(db, 'readwrite', (s) => s.put(updated))
    db.close()
    return updated
  }

  async remove(id: string): Promise<void> {
    const db = await openDb()
    await tx(db, 'readwrite', (s) => s.delete(id))
    db.close()
  }
}
