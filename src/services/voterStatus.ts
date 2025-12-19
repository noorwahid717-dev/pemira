import { apiRequest } from '../utils/apiClient'

// Legacy format (for backward compatibility)
export type VoterMeStatus = {
  election_id: number
  voter_id: number
  eligible: boolean
  has_voted: boolean
  method: 'NONE' | 'ONLINE' | 'TPS'
  preferred_method?: 'ONLINE' | 'TPS'
  tps_id?: number | null
  last_vote_at?: string | null
  online_allowed: boolean
  tps_allowed: boolean
}

// New API format
export type VoterElectionStatus = {
  election_voter_id: number
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'
  voting_method: 'ONLINE' | 'TPS'
  tps?: {
    id: number
    name: string
    location: string
  }
  checked_in_at: string | null
  voted_at: string | null
}

export const fetchVoterStatus = async (token: string, electionId: number, options?: { signal?: AbortSignal }): Promise<VoterMeStatus> => {
  try {
    // Try new API endpoint first, with cache busting
    const timestamp = new Date().getTime()
    const response = await apiRequest<any>(`/voters/me/elections/${electionId}/status?_t=${timestamp}`, { token, signal: options?.signal })

    // Handle wrapped response (backend returns {data: {...}})
    const newStatus: VoterElectionStatus = (response as any).data || response

    // Map to legacy format
    return {
      election_id: electionId,
      voter_id: newStatus.election_voter_id,
      eligible: newStatus.status === 'VERIFIED',
      has_voted: newStatus.status === 'VOTED' || !!newStatus.voted_at,
      method: (newStatus.voted_at ? newStatus.voting_method : 'NONE') as 'NONE' | 'ONLINE' | 'TPS',
      preferred_method: newStatus.voting_method,
      tps_id: newStatus.tps?.id ?? null,
      last_vote_at: newStatus.voted_at,
      online_allowed: newStatus.voting_method === 'ONLINE',
      tps_allowed: newStatus.voting_method === 'TPS',
    }
  } catch (err: any) {
    // Fallback to legacy endpoint
    if (err?.status === 404) {
      return apiRequest<VoterMeStatus>(`/elections/${electionId}/me/status`, { token, signal: options?.signal })
    }
    throw err
  }
}

export const fetchVoterElectionStatus = async (token: string, electionId: number, options?: { signal?: AbortSignal }): Promise<VoterElectionStatus> => {
  return apiRequest<VoterElectionStatus>(`/voters/me/elections/${electionId}/status`, { token, signal: options?.signal })
}
