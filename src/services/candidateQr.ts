import { getActiveElectionId } from '../state/activeElection'
import { apiRequest } from '../utils/apiClient'

export type CandidateQrCode = {
  id: number
  token: string
  url: string
  payload: string
  version: number
  isActive: boolean
}

type ApiCandidateQrCode = {
  id: number
  token: string
  url: string
  payload: string
  version: number
  is_active: boolean
}

type ApiCandidateWithQr = {
  id: number
  qr_code?: ApiCandidateQrCode | null
}

const unwrapResponse = (response: any) => response?.data ?? response

const parseCandidates = (response: any): ApiCandidateWithQr[] | null => {
  const root = unwrapResponse(response)
  if (Array.isArray(root?.candidates)) return root.candidates
  if (Array.isArray(root?.data?.candidates)) return root.data.candidates
  if (Array.isArray(root?.items)) return root.items
  if (Array.isArray(root?.data?.items)) return root.data.items
  if (Array.isArray(root)) return root
  return null
}

const mapQrCode = (qr?: ApiCandidateQrCode | null): CandidateQrCode | null => {
  if (!qr) return null
  return {
    id: qr.id,
    token: qr.token,
    url: qr.url,
    payload: qr.payload,
    version: qr.version,
    isActive: qr.is_active,
  }
}

export const fetchCandidateQrCodeMap = async (
  electionId: number = getActiveElectionId(),
  options?: { signal?: AbortSignal },
): Promise<Record<string, CandidateQrCode>> => {
  const response = await apiRequest<any>(`/elections/${electionId}/qr-codes`, { signal: options?.signal })
  const items = parseCandidates(response)
  if (!items) throw new Error('Invalid candidates QR response')

  return items.reduce<Record<string, CandidateQrCode>>((acc, item) => {
    const qr = mapQrCode(item.qr_code)
    if (qr?.payload) acc[String(item.id)] = qr
    return acc
  }, {})
}
