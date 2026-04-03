import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateContactInput, UpdateContactInput } from '@rs/sdk'
import { getContactStorage } from '../lib/storage'

const CONTACTS_KEY = ['contacts'] as const

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: () => getContactStorage().list(),
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: () => getContactStorage().getById(id),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateContactInput) => getContactStorage().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactInput }) =>
      getContactStorage().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: CONTACTS_KEY })
      qc.invalidateQueries({ queryKey: [...CONTACTS_KEY, id] })
    },
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getContactStorage().remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}
