import { apiRequest } from '../utils/apiClient'
import { getActiveElectionId } from '../state/activeElection'

export type MonitoringLiveResponse = {
  election_id: number
  timestamp: string
  total_votes: number
  participation: {
    total_eligible: number
    total_voted: number
    participation_pct: number
  }
  candidate_votes: Record<string, number>
  tps_stats: Array<{
    tps_id: number
    tps_name: string
    code?: string
    total_votes: number
    total_checkins?: number
    approved_checkins?: number
    pending_checkins?: number
    last_activity_at?: string
  }>
}

const unwrap = <T>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

export const fetchMonitoringLive = async (token: string, electionId: number = getActiveElectionId()): Promise<MonitoringLiveResponse> => {
  const response = await apiRequest<MonitoringLiveResponse | { data: MonitoringLiveResponse }>(`/admin/monitoring/live-count/${electionId}`, {
    token,
  })
  return unwrap(response)
}
