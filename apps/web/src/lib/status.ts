const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-emerald-200 text-black border border-cyan-200',
  APPROVED: 'bg-lime-100 text-black border border-lime-200',
  SUBMITTED: 'bg-amber-100 text-black border border-amber-200',
  PENDING: 'bg-orange-100 text-black border border-orange-200',
  UNDER_REVIEW: 'bg-indigo-100 text-black border border-indigo-200',
  REJECTED: 'bg-red-100 text-black border border-red-200',
  INACTIVE: 'bg-neutral-100 text-black border border-neutral-200',
  DRAFT: 'bg-stone-100 text-black border border-stone-200',
}

export function getStatusBadgeClass(status?: string | null) {
  if (!status) return 'bg-gray-100 text-gray-600'

  const normalized = status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  return STATUS_BADGE_CLASSES[normalized] ?? 'bg-gray-100 text-gray-600'
}

export function formatStatusLabel(status?: string | null) {
  if (!status) return '—'

  return status.replace(/_/g, ' ')
}
