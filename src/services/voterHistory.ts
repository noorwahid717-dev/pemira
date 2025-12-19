import { apiRequest } from '../utils/apiClient'

export type HistoryItemType =
  | 'registration'
  | 'voting'
  | 'tps_checkin'
  | 'qr_generated'
  | 'qr_rotated'
  | 'login'
  | 'logout'

export type HistoryItem = {
  type: string
  timestamp: string
  details?: string
  metadata?: {
    method?: string
    tps_name?: string
    tps_location?: string
    qr_status?: string
    device?: string
    ip?: string
  }
}

// New response structure
export type VoterHistoryResponse = {
  voting: HistoryItem[];
  checkins: HistoryItem[];
  registration: HistoryItem[];
  qr: HistoryItem[];
  activities: HistoryItem[];
}

export const fetchVoterHistory = async (
  token: string,
  electionId: number,
  options?: { signal?: AbortSignal }
): Promise<VoterHistoryResponse> => {
  return apiRequest<VoterHistoryResponse>(
    `/elections/${electionId}/me/history`,
    {
      method: 'GET',
      token,
      signal: options?.signal,
    }
  )
}
