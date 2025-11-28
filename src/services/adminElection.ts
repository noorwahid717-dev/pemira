import { apiRequest } from '../utils/apiClient'
import { getActiveElectionId } from '../state/activeElection'

export type AdminElectionResponse = {
  id: number
  year: number
  name: string
  slug: string
  description?: string
  academic_year?: string
  status: string
  registration_start_at?: string | null
  registration_end_at?: string | null
  verification_start_at?: string | null
  verification_end_at?: string | null
  campaign_start_at?: string | null
  campaign_end_at?: string | null
  quiet_start_at?: string | null
  quiet_end_at?: string | null
  recap_start_at?: string | null
  recap_end_at?: string | null
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
  code: string
  description: string
  academic_year: string
  online_enabled: boolean
  tps_enabled: boolean
  status: string
  registration_start_at: string | null
  registration_end_at: string | null
  verification_start_at: string | null
  verification_end_at: string | null
  campaign_start_at: string | null
  campaign_end_at: string | null
  quiet_start_at: string | null
  quiet_end_at: string | null
  recap_start_at: string | null
  recap_end_at: string | null
  voting_start_at: string | null
  voting_end_at: string | null
}>

export type AdminElectionCreatePayload = {
  name: string
  slug: string
  year: number
  description?: string
  code?: string
  online_enabled?: boolean
  tps_enabled?: boolean
}

export type ElectionPhase = {
  key: 'REGISTRATION' | 'VERIFICATION' | 'CAMPAIGN' | 'QUIET_PERIOD' | 'VOTING' | 'RECAP'
  label?: string
  // Legacy field kept for backward compatibility with older API payloads
  phase?: 'registration' | 'verification' | 'campaign' | 'quiet' | 'voting' | 'recap'
  start_at?: string | null
  end_at?: string | null
}

export type ElectionModeSettings = {
  online_enabled: boolean
  tps_enabled: boolean
}

export type ElectionSummary = {
  total_candidates: number
  total_voters: number
  online_voters: number
  tps_voters: number
  active_tps: number
}

export type AdminElectionSettingsResponse = {
  election: AdminElectionResponse
  phases?: { phases?: ElectionPhase[] } | ElectionPhase[]
  mode_settings?: ElectionModeSettings
  branding?: { primary_logo_id?: string | null; secondary_logo_id?: string | null }
}

const unwrap = <T>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

const resolveElectionId = (value?: number | null): number => value ?? getActiveElectionId()

export const fetchAdminElection = async (token: string, electionId: number = getActiveElectionId()): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}`, {
    token,
  })
  return unwrap(response)
}

export const updateAdminElection = async (token: string, payload: AdminElectionUpdatePayload, electionId: number = getActiveElectionId()): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return unwrap(response)
}

export const fetchElectionPhases = async (token: string, electionId: number = getActiveElectionId()): Promise<ElectionPhase[]> => {
  const response = await apiRequest<ElectionPhase[] | { data: ElectionPhase[] }>(`/admin/elections/${electionId}/phases`, {
    token,
  })
  return unwrap(response)
}

export const updateElectionPhases = async (token: string, phases: ElectionPhase[], electionId: number = getActiveElectionId()): Promise<ElectionPhase[]> => {
  const response = await apiRequest<ElectionPhase[] | { data: ElectionPhase[] }>(`/admin/elections/${electionId}/phases`, {
    method: 'PUT',
    token,
    body: { phases },
  })
  return unwrap(response)
}

export const fetchElectionMode = async (token: string, electionId: number = getActiveElectionId()): Promise<ElectionModeSettings> => {
  const response = await apiRequest<ElectionModeSettings | { data: ElectionModeSettings }>(`/admin/elections/${electionId}/settings/mode`, {
    token,
  })
  return unwrap(response)
}

export const updateElectionMode = async (token: string, payload: ElectionModeSettings, electionId: number = getActiveElectionId()): Promise<ElectionModeSettings> => {
  const response = await apiRequest<ElectionModeSettings | { data: ElectionModeSettings }>(`/admin/elections/${electionId}/settings/mode`, {
    method: 'PUT',
    token,
    body: payload,
  })
  return unwrap(response)
}

export const openAdminElectionVoting = async (token: string, electionId: number = getActiveElectionId()): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}/actions/open-voting`, {
    method: 'POST',
    token,
  })
  return unwrap(response)
}

export const closeAdminElectionVoting = async (token: string, electionId: number = getActiveElectionId()): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}/actions/close-voting`, {
    method: 'POST',
    token,
  })
  return unwrap(response)
}

export const archiveAdminElection = async (token: string, electionId: number = getActiveElectionId()): Promise<AdminElectionResponse> => {
  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>(`/admin/elections/${electionId}/actions/archive`, {
    method: 'POST',
    token,
  })
  return unwrap(response)
}

export const fetchElectionSummary = async (token: string, electionId: number = getActiveElectionId()): Promise<ElectionSummary> => {
  const readPayload = (input: any): ElectionSummary => {
    const payload = unwrap(input as any)
    const raw = (payload as any)?.summary ?? (payload as any)?.data ?? payload
    const toNumber = (value: any) => (value === null || value === undefined ? 0 : Number(value) || 0)

    const total_candidates =
      toNumber(raw?.total_candidates) ||
      toNumber(raw?.candidates_count) ||
      toNumber(raw?.candidate_count) ||
      toNumber(raw?.candidate_total)
    const total_voters = toNumber(raw?.total_voters) || toNumber(raw?.voters_total) || toNumber(raw?.voters_count)
    const online_voters = toNumber(raw?.online_voters) || toNumber(raw?.voters_online) || toNumber(raw?.online_count)
    const tps_voters = toNumber(raw?.tps_voters) || toNumber(raw?.voters_tps) || toNumber(raw?.tps_count)
    const active_tps = toNumber(raw?.active_tps) || toNumber(raw?.tps_active) || toNumber(raw?.total_tps)

    return {
      total_candidates,
      total_voters,
      online_voters,
      tps_voters,
      active_tps,
    }
  }

  try {
    const response = await apiRequest<ElectionSummary | { data: ElectionSummary } | { summary?: ElectionSummary }>(
      `/admin/elections/${resolveElectionId(electionId)}/summary`,
      {
        token,
      },
    )
    return readPayload(response)
  } catch {
    const legacy = await apiRequest<ElectionSummary | { data: ElectionSummary } | { summary?: ElectionSummary }>(`/admin/elections/${resolveElectionId(electionId)}/summary`, {
      token,
    })
    return readPayload(legacy)
  }
}

export const fetchAdminElectionSettings = async (token: string, electionId: number = getActiveElectionId()): Promise<AdminElectionSettingsResponse> => {
  const response = await apiRequest<AdminElectionSettingsResponse | { data: AdminElectionSettingsResponse }>(
    `/admin/elections/${resolveElectionId(electionId)}/settings`,
    {
      token,
    },
  )
  return unwrap(response)
}

export const fetchAdminElectionList = async (token: string): Promise<AdminElectionResponse[]> => {
  const response = await apiRequest<any>('/admin/elections', { token })
  const items = Array.isArray(response?.data?.items)
    ? response.data.items
    : Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response)
        ? response
        : null
  if (!items) return []
  return (items as AdminElectionResponse[]).map(unwrap)
}

export const createAdminElection = async (token: string, payload: AdminElectionCreatePayload): Promise<AdminElectionResponse> => {
  const resolvedPayload: AdminElectionCreatePayload = {
    ...payload,
    code: payload.code ?? payload.slug,
    online_enabled: payload.online_enabled ?? true,
    tps_enabled: payload.tps_enabled ?? true,
  }

  const response = await apiRequest<AdminElectionResponse | { data: AdminElectionResponse }>('/admin/elections', {
    method: 'POST',
    token,
    body: resolvedPayload,
  })
  return unwrap(response)
}
