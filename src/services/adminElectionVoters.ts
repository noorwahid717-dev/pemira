import { API_BASE_URL } from '../config/env'
import { getActiveElectionId } from '../state/activeElection'
import { apiRequest } from '../utils/apiClient'

// ========== Types ==========

export type ElectionVoterStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'
export type VotingMethod = 'ONLINE' | 'TPS'
export type VoterType = 'STUDENT' | 'LECTURER' | 'STAFF'

export type VoterLookupResponse = {
  voter: {
    id: number
    voter_type: VoterType
    nim: string
    name: string
    email: string
    academic_status?: 'ACTIVE' | 'LEAVE' | 'INACTIVE'
    faculty_code?: string
    study_program_code?: string
  }
  election_voter: {
    is_enrolled: boolean
    id?: number
    status?: ElectionVoterStatus
    voting_method?: VotingMethod
    tps_id?: number | null
  }
}

export type RegisterVoterRequest = {
  voter_type: VoterType
  nim?: string
  name: string
  email: string
  phone?: string
  faculty_code?: string
  faculty_name?: string
  study_program_code?: string
  study_program_name?: string
  cohort_year?: number
  academic_status?: 'ACTIVE' | 'LEAVE' | 'INACTIVE'
  lecturer_id?: string | null
  staff_id?: string | null
  voting_method: VotingMethod
  tps_id?: number | null
  status?: ElectionVoterStatus
}

export type RegisterVoterResponse = {
  voter_id: number
  election_voter_id: number
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  created_voter: boolean
  created_election_voter: boolean
  duplicate_in_election: boolean
}

export type ElectionVoterListItem = {
  election_voter_id: number
  voter_id: number
  nim: string
  name: string
  voter_type: VoterType
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  checked_in_at: string | null
  voted_at: string | null
  updated_at: string
  email?: string
  faculty_code?: string
  study_program_code?: string
  cohort_year?: number
}

export type ElectionVotersListResponse = {
  items: ElectionVoterListItem[]
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export type UpdateElectionVoterRequest = {
  status?: ElectionVoterStatus
  voting_method?: VotingMethod
  tps_id?: number | null
}

// ========== API Functions ==========

/**
 * Lookup voter by NIM in specific election
 * GET /admin/elections/{election_id}/voters/lookup?nim=STRING
 */
export const lookupVoterByNim = async (
  token: string,
  nim: string,
  electionId: number = getActiveElectionId()
): Promise<VoterLookupResponse> => {
  const response = await apiRequest<{ data: VoterLookupResponse } | VoterLookupResponse>(
    `/admin/elections/${electionId}/voters/lookup?nim=${encodeURIComponent(nim)}`,
    { token }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as VoterLookupResponse
}

/**
 * Register/upsert voter to election
 * POST /admin/elections/{election_id}/voters
 */
export const registerVoterToElection = async (
  token: string,
  data: RegisterVoterRequest,
  electionId: number = getActiveElectionId()
): Promise<RegisterVoterResponse> => {
  const response = await apiRequest<{ data: RegisterVoterResponse } | RegisterVoterResponse>(
    `/admin/elections/${electionId}/voters`,
    {
      method: 'POST',
      token,
      body: data,
    }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as RegisterVoterResponse
}

/**
 * List voters in election with filters
 * GET /admin/elections/{election_id}/voters
 */
export const listElectionVoters = async (
  token: string,
  params: URLSearchParams,
  electionId: number = getActiveElectionId()
): Promise<ElectionVotersListResponse> => {
  const response = await apiRequest<{ data: ElectionVotersListResponse } | ElectionVotersListResponse>(
    `/admin/elections/${electionId}/voters?${params.toString()}`,
    { token }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as ElectionVotersListResponse
}

/**
 * Update election voter status/method/tps
 * PATCH /admin/elections/{election_id}/voters/{election_voter_id}
 */
export const updateElectionVoter = async (
  token: string,
  electionVoterId: number,
  updates: UpdateElectionVoterRequest,
  electionId: number = getActiveElectionId()
): Promise<ElectionVoterListItem> => {
  const response = await apiRequest<{ data: ElectionVoterListItem } | ElectionVoterListItem>(
    `/admin/elections/${electionId}/voters/${electionVoterId}`,
    {
      method: 'PATCH',
      token,
      body: updates,
    }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as ElectionVoterListItem
}

/**
 * Import result type
 */
export type ImportResult = {
  success: number
  failed: number
  total: number
  errors: Array<{
    row: number
    nim: string
    error: string
  }>
}

/**
 * Import DPT from CSV
 * POST /admin/elections/{election_id}/voters/import
 */
export const importVotersCsv = async (
  token: string,
  file: File,
  electionId: number = getActiveElectionId()
): Promise<ImportResult> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE_URL}/admin/elections/${electionId}/voters/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Import failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Export DPT to CSV
 * GET /admin/elections/{election_id}/voters/export
 */
export const exportVotersCsv = async (
  token: string,
  filters?: URLSearchParams,
  electionId: number = getActiveElectionId()
): Promise<Blob> => {
  const exportParams = filters ? new URLSearchParams(filters.toString()) : new URLSearchParams()
  if (!exportParams.has('format')) exportParams.set('format', 'xlsx')
  const queryString = exportParams.toString() ? `?${exportParams.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/admin/elections/${electionId}/voters/export${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Export failed: HTTP ${response.status}`)
  }
  
  return response.blob()
}

/**
 * Blacklist voter
 * POST /admin/elections/{election_id}/voters/{voter_id}/blacklist
 */
export const blacklistVoter = async (
  token: string,
  voterId: number,
  reason?: string,
  electionId: number = getActiveElectionId()
): Promise<void> => {
  await apiRequest(
    `/admin/elections/${electionId}/voters/${voterId}/blacklist`,
    {
      method: 'POST',
      token,
      body: reason ? { reason } : undefined,
    }
  )
}

/**
 * Unblacklist voter
 * POST /admin/elections/{election_id}/voters/{voter_id}/unblacklist
 */
export const unblacklistVoter = async (
  token: string,
  voterId: number,
  electionId: number = getActiveElectionId()
): Promise<void> => {
  await apiRequest(
    `/admin/elections/${electionId}/voters/${voterId}/unblacklist`,
    {
      method: 'POST',
      token,
    }
  )
}
