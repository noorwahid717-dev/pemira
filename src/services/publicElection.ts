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
  name?: string
  title?: string
  start_at?: string | null
  end_at?: string | null
}

const unwrapElection = (payload: any): PublicElection | null => {
  if (!payload) return null
  if (payload.election) return payload.election as PublicElection
  if (payload.data?.election) return payload.data.election as PublicElection
  if (payload.data && !payload.data.items) return payload.data as PublicElection
  if (payload.data?.data && !payload.data.data.items) return payload.data.data as PublicElection
  return null
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
    const res = await apiRequest<PublicElection | { data?: PublicElection } | { election?: PublicElection } | { data?: { election?: PublicElection } }>('/elections/current', { signal })
    return unwrapElection(res) ?? (res as PublicElection)
  } catch (err: any) {
    if (err?.status === 404) {
      try {
        const res = await apiRequest<PublicElection | { data?: PublicElection } | { election?: PublicElection } | { data?: { election?: PublicElection } }>('/elections/current', {
          signal,
        })
        return unwrapElection(res) ?? (res as PublicElection)
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

const normalizePhaseKey = (value?: string | null) => (value ? value.toString().trim().replace(/-/g, '_').toUpperCase() : '')

const stageIdToPhaseKey: Record<string, string> = {
  REGISTRATION: 'REGISTRATION',
  VERIFICATION: 'VERIFICATION',
  CAMPAIGN: 'CAMPAIGN',
  SILENCE: 'QUIET_PERIOD',
  QUIET: 'QUIET_PERIOD',
  QUIET_PERIOD: 'QUIET_PERIOD',
  VOTING: 'VOTING',
  REKAPITULASI: 'RECAP',
  RECAP: 'RECAP',
}

const mapStagesToPhases = (stages: any[]): PublicPhase[] =>
  stages.map((stage) => {
    const key = stageIdToPhaseKey[normalizePhaseKey(stage.id ?? stage.key ?? stage.phase)] ?? stage.key ?? stage.phase
    const start_at = stage.start_at ?? stage.startAt ?? stage.start ?? null
    const end_at = stage.end_at ?? stage.endAt ?? stage.end ?? null
    return {
      key,
      label: stage.name ?? stage.label ?? stage.title,
      start_at,
      end_at,
    }
  })

export const fetchPublicPhases = async (electionId: number, options?: { signal?: AbortSignal }): Promise<PublicPhase[]> => {
  const { signal } = options ?? {}
  const response = await apiRequest<any>(`/elections/${electionId}/phases`, { signal }).catch(() => apiRequest<any>(`/elections/${electionId}/timeline`, { signal }))
  const payload =
    (Array.isArray(response?.data?.phases) && response.data.phases) ||
    (Array.isArray(response?.phases) && response.phases) ||
    (Array.isArray(response?.items) && response.items) ||
    (Array.isArray(response?.data?.items) && response.data.items) ||
    (Array.isArray(response?.data?.data) && response.data.data) ||
    (Array.isArray(response?.election?.phases) && response.election.phases) ||
    (Array.isArray(response?.data?.election?.phases) && response.data.election.phases) ||
    (Array.isArray(response?.data) && response.data) ||
    (Array.isArray(response?.stages) && mapStagesToPhases(response.stages)) ||
    (Array.isArray(response?.data?.stages) && mapStagesToPhases(response.data.stages)) ||
    (Array.isArray(response) && response) ||
    []

  return payload as PublicPhase[]
}
