import { apiRequest } from '../utils/apiClient'

export type VoterMeStatus = {
  election_id: number
  voter_id: number
  eligible: boolean
  has_voted: boolean
  method: 'NONE' | 'ONLINE' | 'TPS'
  tps_id?: number | null
  last_vote_at?: string | null
  online_allowed: boolean
  tps_allowed: boolean
}

export const fetchVoterStatus = async (token: string, electionId: number, options?: { signal?: AbortSignal }): Promise<VoterMeStatus> => {
  return apiRequest<VoterMeStatus>(`/elections/${electionId}/me/status`, { token, signal: options?.signal })
}
