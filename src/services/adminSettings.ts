import { apiRequest } from '../utils/apiClient'

export type AdminSettings = {
  active_election_id: number
  default_election_id?: number
}

const unwrap = <T>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

const normalizeSettings = (raw: Partial<AdminSettings>): AdminSettings => {
  const toNumber = (value: unknown): number | undefined => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const activeElectionId =
    toNumber(raw.active_election_id) ?? toNumber((raw as any).activeElectionId) ?? toNumber((raw as any).value)
  const defaultElectionId =
    toNumber(raw.default_election_id) ?? toNumber((raw as any).defaultElectionId)

  return {
    active_election_id: activeElectionId ?? 1,
    default_election_id: defaultElectionId,
  }
}

export const fetchAdminSettings = async (token: string): Promise<AdminSettings> => {
  const response = await apiRequest<AdminSettings | { data: AdminSettings }>('/admin/settings', { token })
  return normalizeSettings(unwrap(response))
}

export const fetchActiveElectionSetting = async (token: string): Promise<AdminSettings> => {
  const response = await apiRequest<AdminSettings | { data: AdminSettings } | { active_election_id: number }>(
    '/admin/settings/active-election',
    { token },
  )
  return normalizeSettings(unwrap(response))
}

export const updateActiveElectionSetting = async (token: string, electionId: number): Promise<AdminSettings> => {
  const response = await apiRequest<AdminSettings | { data: AdminSettings }>(
    '/admin/settings/active-election',
    {
      method: 'PUT',
      token,
      body: { election_id: electionId },
    },
  )
  return normalizeSettings(unwrap(response))
}
