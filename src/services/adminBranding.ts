import { API_BASE_URL } from '../config/env'
import { getActiveElectionId } from '../state/activeElection'
import type { ApiError } from '../utils/apiClient'
import { apiRequest } from '../utils/apiClient'

export type BrandingMetadata = {
  primary_logo_id: string | null
  secondary_logo_id: string | null
  updated_at?: string
  updated_by?: {
    id: number
    username: string
  } | null
}

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

export const fetchBranding = async (token: string, electionId: number = getActiveElectionId()): Promise<BrandingMetadata> => {
  return apiRequest<BrandingMetadata>(`/admin/elections/${electionId}/branding`, { token })
}

export const fetchBrandingLogo = async (token: string, slot: 'primary' | 'secondary', electionId: number = getActiveElectionId()): Promise<string | null> => {
  const url = `${API_BASE_URL}/admin/elections/${electionId}/branding/logo/${slot}`
  const response = await fetch(url, { headers: buildAuthHeaders(token) })
  if (response.status === 404) return null
  if (!response.ok) {
    const message = `Gagal mengambil logo ${slot}`
    throw new Error(message)
  }
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export const uploadBrandingLogo = async (
  token: string,
  slot: 'primary' | 'secondary',
  file: File,
  electionId: number = getActiveElectionId(),
): Promise<{ id: string; content_type: string; size: number }> => {
  const url = `${API_BASE_URL}/admin/elections/${electionId}/branding/logo/${slot}`
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(url, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  })

  if (!response.ok) {
    let message = `Gagal mengunggah logo ${slot}`
    try {
      const payload = (await response.json()) as ApiError
      if (payload?.message) message = payload.message
    } catch {
      // ignore parsing error, keep default message
    }
    throw new Error(message)
  }

  return response.json() as Promise<{ id: string; content_type: string; size: number }>
}

export const deleteBrandingLogo = async (token: string, slot: 'primary' | 'secondary', electionId: number = getActiveElectionId()): Promise<BrandingMetadata> => {
  const url = `${API_BASE_URL}/admin/elections/${electionId}/branding/logo/${slot}`
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  })
  if (response.status === 404) {
    return {
      primary_logo_id: null,
      secondary_logo_id: null,
    }
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(payload?.message ?? `Gagal menghapus logo ${slot}`)
  }
  return response.json() as Promise<BrandingMetadata>
}
