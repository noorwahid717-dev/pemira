import { API_BASE_URL } from '../config/env'
import { getActiveElectionId } from '../state/activeElection'
import type { CandidateAdmin, CandidateMedia, CandidateMediaSlot, CandidateProgramAdmin, CandidateStatus } from '../types/candidateAdmin'
import { apiRequest } from '../utils/apiClient'

export type AdminCandidateResponse = {
  id: number | string
  election_id: number
  number: number
  name: string
  photo_url?: string
  photo_media_id?: string | null
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
  media_files?: {
    id: string
    slot: CandidateMediaSlot | 'profile'
    label?: string | null
    content_type?: string | null
  }[]
  status: CandidateStatus
  created_at?: string
  updated_at?: string
}

const mapStatusFromApi = (status: CandidateStatus): CandidateStatus => {
  return status
}

const mapStatusToApi = (status: CandidateStatus): CandidateStatus => {
  return status
}

const mapSlotToLabel = (slot: CandidateMediaSlot | 'profile') => {
  switch (slot) {
    case 'profile':
      return 'Foto Profil'
    case 'poster':
      return 'Poster'
    case 'photo_extra':
      return 'Foto Kampanye'
    case 'pdf_program':
      return 'Program Kerja (PDF)'
    case 'pdf_visimisi':
      return 'Visi Misi (PDF)'
    default:
      return 'Media'
  }
}

const mapSlotToType = (slot: CandidateMediaSlot | 'profile'): CandidateMedia['type'] => {
  if (slot === 'pdf_program' || slot === 'pdf_visimisi') return 'pdf'
  return 'photo'
}

const buildMediaFromMeta = (candidateId: string, media?: AdminCandidateResponse['media_files']): CandidateMedia[] => {
  if (!media?.length) return []
  return media
    .filter((item) => item.slot !== 'profile')
    .map((item) => ({
      id: item.id,
      slot: (item.slot === 'profile' ? 'photo_extra' : item.slot) as CandidateMediaSlot,
      type: mapSlotToType(item.slot),
      url: '',
      label: item.label ?? mapSlotToLabel(item.slot),
      contentType: item.content_type ?? undefined,
    }))
}

export const transformCandidateFromApi = (payload: AdminCandidateResponse | null | undefined): CandidateAdmin => {
  if (!payload) {
    throw new Error('Invalid candidate data from API: payload is null or undefined')
  }

  if (!payload.id && payload.id !== 0) {
    throw new Error('Invalid candidate data from API: missing id')
  }

  return {
    id: String(payload.id),
    number: payload.number ?? 0,
    name: payload.name ?? '',
    faculty: payload.faculty_name ?? '',
    programStudi: payload.study_program_name ?? '',
    angkatan: payload.cohort_year?.toString() ?? '',
    status: mapStatusFromApi(payload.status),
    photoUrl: payload.photo_url ? (payload.photo_url.startsWith('http') ? payload.photo_url : `http://localhost:8080${payload.photo_url}`) : '',
    photoMediaId: payload.photo_media_id ?? null,
    tagline: payload.tagline ?? '',
    shortBio: payload.short_bio ?? '',
    longBio: payload.long_bio ?? '',
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
      ...(payload.media_files && payload.media_files.length === 0
        ? []
        : buildMediaFromMeta(payload.id.toString(), payload.media_files)),
      ...(payload.media_files?.length
        ? []
        : payload.media?.gallery_photos?.map((url, index) => ({
          id: `photo-${index}`,
          slot: 'photo_extra' as CandidateMediaSlot,
          type: 'photo' as const,
          url,
          label: `Foto ${index + 1}`,
        })) ?? []),
      ...(payload.media?.document_manifesto_url
        ? [
          {
            id: 'pdf-1',
            slot: 'pdf_visimisi' as CandidateMediaSlot,
            type: 'pdf' as const,
            url: payload.media.document_manifesto_url,
            label: 'Manifesto',
          },
        ]
        : []),
    ],
    campaignVideo: payload.media?.video_url ?? undefined,
  }
}

export const buildCandidatePayload = (candidate: CandidateAdmin, excludeStatus = false) => {
  const programs: CandidateProgramAdmin[] = candidate.programs ?? []
  const photos = candidate.media.filter((item) => item.type === 'photo').map((item) => item.url).filter((url) => url && !url.startsWith('blob:'))
  const pdf = candidate.media.find((item) => item.type === 'pdf')

  // Only send photo_url if there's no photo_media_id (backward compatibility)
  // When photo_media_id exists, the API should use that instead
  const photoUrl = candidate.photoMediaId ? undefined : (candidate.photoUrl?.startsWith('blob:') ? undefined : candidate.photoUrl)

  const payload: any = {
    number: candidate.number,
    name: candidate.name,
    photo_url: photoUrl,
    photo_media_id: candidate.photoMediaId ?? undefined,
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
      video_url: candidate.campaignVideo ?? null,
      gallery_photos: photos,
      document_manifesto_url: pdf?.url ?? null,
    },
  }

  if (!excludeStatus) {
    payload.status = mapStatusToApi(candidate.status)
  }

  return payload
}

export const fetchAdminCandidates = async (token: string, electionId: number = getActiveElectionId()): Promise<CandidateAdmin[]> => {
  const response = await apiRequest<any>(`/admin/elections/${electionId}/candidates`, {
    token,
  })
  const items = Array.isArray(response?.data?.items) ? response.data.items : Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : null
  if (!items) throw new Error('Invalid candidate list response')
  return (items as AdminCandidateResponse[]).map(transformCandidateFromApi)
}

export const createAdminCandidate = async (token: string, candidate: CandidateAdmin, electionId: number = getActiveElectionId()): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate)
  const response = await apiRequest<AdminCandidateResponse>(`/admin/elections/${electionId}/candidates`, {
    method: 'POST',
    token,
    body: payload,
  })
  return transformCandidateFromApi(response)
}

export const updateAdminCandidate = async (
  token: string,
  id: string,
  candidate: Partial<CandidateAdmin>,
  excludeStatus = true,
  electionId: number = getActiveElectionId(),
): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate as CandidateAdmin, excludeStatus)
  const response = await apiRequest<AdminCandidateResponse>(`/admin/elections/${electionId}/candidates/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
  return transformCandidateFromApi(response)
}

export const fetchAdminCandidateDetail = async (token: string, id: string | number, electionId: number = getActiveElectionId()): Promise<CandidateAdmin> => {
  const response = await apiRequest<AdminCandidateResponse>(
    `/admin/elections/${electionId}/candidates/${id}`,
    { token },
  )
  return transformCandidateFromApi(response)
}
