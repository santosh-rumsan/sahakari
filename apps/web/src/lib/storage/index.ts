import { getSDKApiUrl } from '@rs/sdk'
import { ApiContactStorage } from './api'
import { IndexedDBContactStorage } from './indexdb'
import type { ContactStorage } from './types'

export type { ContactStorage }

let _contactStorage: ContactStorage | null = null

export function getContactStorage(): ContactStorage {
  if (!_contactStorage) {
    const apiUrl = getSDKApiUrl()
    _contactStorage =
      apiUrl === 'indexdb'
        ? new IndexedDBContactStorage()
        : new ApiContactStorage(apiUrl)
  }
  return _contactStorage
}
