import { getActiveElectionId } from '../state/activeElection'
import { apiRequest } from '../utils/apiClient'

export type ElectionStatus =
  | 'DRAFT'
  | 'REGISTRATION'
  | 'REGISTRATION_OPEN'
  | 'CAMPAIGN'
  | 'VOTING_OPEN'
  | 'VOTING_CLOSED'
  | 'CLOSED'
  | 'ARCHIVED'

export type PublicElection = {
  id: number
  year: number
  name: string
  slug: string
  status: ElectionStatus
  current_phase?: string
  voting_start_at?: string | null
  voting_end_at?: string | null
  online_enabled: boolean
  tps_enabled: boolean
  phases?: Array<{
    key?: string
    phase?: string
    label?: string
    start_at?: string | null
    end_at?: string | null
  }>
}

export type PublicPhase = {
  key?: string
  phase?: string
  label?: string
  start_at?: string | null
  end_at?: string | null
}

const unwrapList = (payload: any): PublicElection[] | null => {
  if (Array.isArray(payload)) return payload as PublicElection[]
  if (Array.isArray(payload?.data?.items)) return payload.data.items as PublicElection[]
  if (Array.isArray(payload?.items)) return payload.items as PublicElection[]
  if (Array.isArray(payload?.data)) return payload.data as PublicElection[]
  return null
}

const pickActiveElection = (items: PublicElection[]): PublicElection | null => {
  if (!items.length) return null
  const statusPriority: ElectionStatus[] = ['VOTING_OPEN', 'VOTING_CLOSED', 'CAMPAIGN', 'REGISTRATION_OPEN', 'REGISTRATION', 'DRAFT']
  const byPriority = statusPriority
    .map((status) => items.find((item) => item.status === status))
    .find(Boolean)
  if (byPriority) return byPriority

  const now = Date.now()
  const withFutureStart = items
    .map((item) => ({
      item,
      start: item.voting_start_at ? new Date(item.voting_start_at).getTime() : Number.POSITIVE_INFINITY,
    }))
    .filter(({ start }) => !Number.isNaN(start) && start >= now)
    .sort((a, b) => a.start - b.start)
  if (withFutureStart[0]) return withFutureStart[0].item

  return items[0]
}

const fetchElectionListFallback = async (signal?: AbortSignal): Promise<PublicElection> => {
  const response = await apiRequest<any>('/elections', { signal })
  const items = unwrapList(response)
  if (!items || !items.length) throw new Error('Tidak ada pemilu aktif')
  const picked = pickActiveElection(items)
  if (!picked) throw new Error('Tidak ada pemilu aktif')
  return picked
}

export const fetchCurrentElection = async (options?: { signal?: AbortSignal }): Promise<PublicElection> => {
  const signal = options?.signal
  try {
    return await apiRequest<PublicElection>('/elections/current', { signal })
  } catch (err: any) {
    if (err?.status === 404) {
      try {
        return await apiRequest<PublicElection>('/elections/current', { signal })
      } catch (legacyErr: any) {
        if (legacyErr?.status === 404) {
          try {
            const settings = await apiRequest<any>(`/admin/elections/${getActiveElectionId()}/settings`, { signal })
            if ((settings as any)?.election) return (settings as any).election as PublicElection
          } catch {
            // ignore and continue to list fallback
          }
          return fetchElectionListFallback(signal)
        }
        throw legacyErr
      }
    }
    throw err
  }
}

export const fetchPublicPhases = async (electionId: number, options?: { signal?: AbortSignal }): Promise<PublicPhase[]> => {
  const { signal } = options ?? {}
  const response = await apiRequest<any>(`/elections/${electionId}/phases`, { signal }).catch(() => apiRequest<any>(`/elections/${electionId}/timeline`, { signal }))
  const items = Array.isArray(response?.data?.phases)
    ? response.data.phases
    : Array.isArray(response?.phases)
      ? response.phases
      : Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : []
  return items as PublicPhase[]
}
