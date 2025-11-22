import { ACTIVE_ELECTION_ID } from '../config/env'
import { apiRequest } from '../utils/apiClient'

export type AdminElectionResponse = {
  id: number
  year: number
  name: string
  slug: string
  status: string
  voting_start_at?: string | null
  voting_end_at?: string | null
  online_enabled: boolean
  tps_enabled: boolean
  created_at?: string
  updated_at?: string
}

export type AdminElectionUpdatePayload = Partial<{
  year: number
  name: string
  slug: string
  online_enabled: boolean
  tps_enabled: boolean
}>

const unwrap = <T>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

export const fetchAdminElection = async (token: string, electionId: number = ACTIVE_ELECTION_ID): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}`, {
    token,
  })
  return unwrap(response)
}

export const updateAdminElection = async (token: string, payload: AdminElectionUpdatePayload, electionId: number = ACTIVE_ELECTION_ID): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}`, {
    method: 'PUT',
    token,
    body: payload,
  })
  return unwrap(response)
}

export const openAdminElectionVoting = async (token: string, electionId: number = ACTIVE_ELECTION_ID): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}/open-voting`, {
    method: 'POST',
    token,
  })
  return unwrap(response)
}

export const closeAdminElectionVoting = async (token: string, electionId: number = ACTIVE_ELECTION_ID): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}/close-voting`, {
    method: 'POST',
    token,
  })
  return unwrap(response)
}
