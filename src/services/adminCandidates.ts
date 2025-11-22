import { ACTIVE_ELECTION_ID } from '../config/env'
import type { CandidateAdmin, CandidateProgramAdmin, CandidateStatus } from '../types/candidateAdmin'
import { apiRequest } from '../utils/apiClient'

export type AdminCandidateResponse = {
  id: number
  election_id: number
  number: number
  name: string
  photo_url?: string
  short_bio?: string
  long_bio?: string
  tagline?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
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
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED'
  created_at?: string
  updated_at?: string
}

const mapStatusFromApi = (status: AdminCandidateResponse['status']): CandidateStatus => {
  if (status === 'PUBLISHED') return 'active'
  if (status === 'HIDDEN') return 'hidden'
  if (status === 'ARCHIVED') return 'archived'
  return 'draft'
}

const mapStatusToApi = (status: CandidateStatus): AdminCandidateResponse['status'] => {
  if (status === 'active') return 'PUBLISHED'
  if (status === 'hidden') return 'HIDDEN'
  if (status === 'archived') return 'ARCHIVED'
  return 'DRAFT'
}

export const transformCandidateFromApi = (payload: AdminCandidateResponse): CandidateAdmin => ({
  id: payload.id.toString(),
  number: payload.number,
  name: payload.name,
  faculty: payload.faculty_name ?? '',
  programStudi: payload.study_program_name ?? '',
  angkatan: payload.cohort_year?.toString() ?? '',
  status: mapStatusFromApi(payload.status),
  photoUrl: payload.photo_url ?? '',
  tagline: payload.tagline,
  shortBio: payload.short_bio,
  longBio: payload.long_bio,
  visionTitle: payload.vision ?? '',
  visionDescription: payload.vision ?? '',
  missions: payload.missions ?? [],
  programs: (payload.main_programs ?? []).map((program, index) => ({
    id: `program-${program.title}-${index}`,
    title: program.title,
    description: program.description,
    category: program.category,
  })),
  media: [
    ...(payload.media?.gallery_photos?.map((url, index) => ({ id: `photo-${index}`, type: 'photo' as const, url, label: `Foto ${index + 1}` })) ?? []),
    ...(payload.media?.document_manifesto_url ? [{ id: 'pdf-1', type: 'pdf' as const, url: payload.media.document_manifesto_url, label: 'Manifesto' }] : []),
  ],
  campaignVideo: payload.media?.video_url ?? undefined,
})

export const buildCandidatePayload = (candidate: CandidateAdmin) => {
  const programs: CandidateProgramAdmin[] = candidate.programs ?? []
  const photos = candidate.media.filter((item) => item.type === 'photo').map((item) => item.url)
  const pdf = candidate.media.find((item) => item.type === 'pdf')
  const video = candidate.media.find((item) => item.type === 'video')

  return {
    number: candidate.number,
    name: candidate.name,
    photo_url: candidate.photoUrl,
    short_bio: candidate.shortBio,
    long_bio: candidate.longBio,
    tagline: candidate.tagline,
    faculty_name: candidate.faculty,
    study_program_name: candidate.programStudi,
    cohort_year: candidate.angkatan ? Number(candidate.angkatan) : undefined,
    vision: candidate.visionDescription || candidate.visionTitle,
    missions: candidate.missions,
    main_programs: programs.map((program) => ({
      title: program.title,
      description: program.description,
      category: program.category,
    })),
    media: {
      video_url: video?.url ?? candidate.campaignVideo ?? null,
      gallery_photos: photos,
      document_manifesto_url: pdf?.url ?? null,
    },
    status: mapStatusToApi(candidate.status),
  }
}

export const fetchAdminCandidates = async (token: string, electionId: number = ACTIVE_ELECTION_ID): Promise<CandidateAdmin[]> => {
  const response = await apiRequest<any>(`/admin/elections/${electionId}/candidates`, {
    token,
  })
  const items = Array.isArray(response?.data?.items) ? response.data.items : Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : null
  if (!items) throw new Error('Invalid candidate list response')
  return (items as AdminCandidateResponse[]).map(transformCandidateFromApi)
}

export const createAdminCandidate = async (token: string, candidate: CandidateAdmin): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate)
  const response = await apiRequest<{ data: AdminCandidateResponse }>(`/admin/elections/${ACTIVE_ELECTION_ID}/candidates`, {
    method: 'POST',
    token,
    body: payload,
  })
  return transformCandidateFromApi(response.data)
}

export const updateAdminCandidate = async (token: string, id: string, candidate: Partial<CandidateAdmin>): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate as CandidateAdmin)
  const response = await apiRequest<{ data: AdminCandidateResponse }>(`/admin/candidates/${id}?election_id=${ACTIVE_ELECTION_ID}`, {
    method: 'PUT',
    token,
    body: payload,
  })
  return transformCandidateFromApi(response.data)
}
