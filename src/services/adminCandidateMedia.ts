import { API_BASE_URL } from '../config/env'
import { getActiveElectionId } from '../state/activeElection'
import type { CandidateMediaSlot } from '../types/candidateAdmin'
import type { ApiError } from '../utils/apiClient'

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

export const fetchCandidateProfileMedia = async (token: string, candidateId: string | number): Promise<string | null> => {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media/profile`, {
    headers: authHeaders(token),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Gagal mengambil foto profil kandidat')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export const fetchPublicCandidateProfileMedia = async (candidateId: string | number): Promise<string | null> => {
  const electionId = getActiveElectionId()
  const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/v1/elections/${electionId}/candidates/${candidateId}/media/profile?t=${Date.now()}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Gagal mengambil foto profil kandidat')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export const uploadCandidateProfileMedia = async (
  token: string,
  candidateId: string | number,
  file: File,
): Promise<{ id: string; content_type: string; size: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media/profile`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(payload?.message ?? 'Gagal mengunggah foto profil')
  }
  return response.json() as Promise<{ id: string; content_type: string; size: number }>
}

export const deleteCandidateProfileMedia = async (token: string, candidateId: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media/profile`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (response.status === 404) return
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(payload?.message ?? 'Gagal menghapus foto profil')
  }
}

export const uploadCandidateMedia = async (
  token: string,
  candidateId: string | number,
  slot: CandidateMediaSlot,
  file: File,
): Promise<{ id: string; slot: CandidateMediaSlot; content_type: string; size: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('slot', slot)
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(payload?.message ?? 'Gagal mengunggah media')
  }
  return response.json() as Promise<{ id: string; slot: CandidateMediaSlot; content_type: string; size: number }>
}

export const fetchCandidateMediaFile = async (token: string, candidateId: string | number, mediaId: string): Promise<string | null> => {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media/${mediaId}`, {
    headers: authHeaders(token),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Gagal mengambil media kandidat')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export const deleteCandidateMedia = async (token: string, candidateId: string | number, mediaId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/media/${mediaId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (response.status === 404) return
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(payload?.message ?? 'Gagal menghapus media kandidat')
  }
}
