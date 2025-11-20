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
  voting_start_at?: string | null
  voting_end_at?: string | null
  online_enabled: boolean
  tps_enabled: boolean
}

export const fetchCurrentElection = async (options?: { signal?: AbortSignal }): Promise<PublicElection> => {
  return apiRequest<PublicElection>('/elections/current', { signal: options?.signal })
}
