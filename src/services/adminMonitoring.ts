import { ACTIVE_ELECTION_ID } from '../config/env'
import { apiRequest } from '../utils/apiClient'

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
    total_votes: number
    pending_checkins?: number
  }>
}

export const fetchMonitoringLive = async (token: string): Promise<MonitoringLiveResponse> => {
  // Sementara skip jika endpoint belum tersedia di backend
  const MONITORING_ENDPOINT_AVAILABLE = false // Set true jika backend sudah implement
  
  if (!MONITORING_ENDPOINT_AVAILABLE) {
    // Return mock data tanpa request ke backend
    return Promise.reject(new Error('Monitoring endpoint not yet implemented'))
  }
  
  return apiRequest<MonitoringLiveResponse>(`/admin/monitoring/live-count/${ACTIVE_ELECTION_ID}`, {
    token,
  })
}
