import { getActiveElectionId } from '../state/activeElection'
import { apiRequest } from '../utils/apiClient'

export type VoterQRResult = {
  id: number
  voter_id: number
  election_id: number
  qr_token: string
  is_active: boolean
  rotated_at?: string | null
  created_at: string
}

export const getVoterQr = async (token: string, voterId: number) => {
  const electionId = getActiveElectionId()
  const params = new URLSearchParams({ election_id: String(electionId) })
  const url = `/voters/${voterId}/tps/qr?${params.toString()}`
  
  const response = await apiRequest<any>(url, { token })
  
  // Handle wrapped response
  const qrData = response.data || response
  
  return qrData as VoterQRResult
}

export const rotateVoterQr = (token: string, voterId: number) => {
  const electionId = getActiveElectionId()
  return apiRequest<VoterQRResult>(`/voters/${voterId}/tps/qr`, {
    method: 'POST',
    token,
    body: { election_id: electionId },
  })
}
