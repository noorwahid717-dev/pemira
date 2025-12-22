import { getActiveElectionId } from '../state/activeElection'
import type { Candidate } from '../types/voting'
import { apiRequest } from '../utils/apiClient'

type PublicCandidateResponse = {
  id: number
  number: number
  name: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  photo_url?: string
  tagline?: string
  vision?: string
  missions?: string[]
}

type PublicCandidateDetailResponse = PublicCandidateResponse & {
  short_bio?: string
  long_bio?: string
  tagline?: string
  vision?: string
  missions?: string[]
  main_programs?: {
    title: string
    description: string
    category?: string
  }[]
  media?: {
    video_url?: string | null
    gallery_photos?: string[]
    document_manifesto_url?: string | null
  }
}

const mapCandidate = (item: PublicCandidateResponse): Candidate => ({
  id: item.id,
  nomorUrut: item.number,
  nama: item.name,
  fakultas: item.faculty_name ?? 'Fakultas',
  prodi: item.study_program_name ?? '',
  angkatan: item.cohort_year?.toString() ?? '',
  foto: item.photo_url ?? '',
  tagline: item.tagline ?? '',
  visi: item.vision ?? '',
  misi: item.missions ?? [],
})

export const fetchPublicCandidates = async (options?: {
  signal?: AbortSignal
  token?: string
  electionId?: number
}): Promise<Candidate[]> => {
  const { signal, token, electionId = getActiveElectionId() } = options ?? {}
  const parseItems = (response: any) => {
    if (Array.isArray(response?.data?.items)) return response.data.items
    if (Array.isArray(response?.items)) return response.items
    if (Array.isArray(response)) return response
    return null
  }

  try {
    const response = await apiRequest<any>(`/elections/${electionId}/candidates`, { signal })
    const items = parseItems(response)
    if (!items) throw new Error('Invalid candidates response')
    return (items as PublicCandidateResponse[]).map(mapCandidate)
  } catch (err) {
    if (token) {
      const fallBackResponse = await apiRequest<any>(`/admin/elections/${electionId}/candidates`, { signal, token })
      const items = parseItems(fallBackResponse)
      if (!items) throw new Error('Invalid admin candidates response')
      return (items as PublicCandidateResponse[]).map(mapCandidate)
    }
    throw err
  }
}

export const fetchPublicCandidateDetail = async (
  candidateId: number,
  options?: { signal?: AbortSignal; token?: string },
): Promise<PublicCandidateDetailResponse> => {
  const { signal, token } = options ?? {}
  const parseDetail = (response: any) => response?.data ?? response
  const electionId = getActiveElectionId()

  try {
    const response = await apiRequest<any>(`/elections/${electionId}/candidates/${candidateId}`, { signal })
    const detail = parseDetail(response)
    if (!detail) throw new Error('Invalid candidate detail response')
    return detail as PublicCandidateDetailResponse
  } catch (err) {
    if (token) {
      const fallback = await apiRequest<any>(`/admin/elections/${electionId}/candidates/${candidateId}`, { signal, token })
      const detail = parseDetail(fallback)
      if (!detail) throw new Error('Invalid admin candidate detail response')
      return detail as PublicCandidateDetailResponse
    }
    throw err
  }
}
