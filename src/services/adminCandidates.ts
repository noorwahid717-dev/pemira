import { API_BASE_URL } from '../config/env'
import { getActiveElectionId } from '../state/activeElection'
import type { CandidateAdmin, CandidateMedia, CandidateMediaSlot, CandidateProgramAdmin, CandidateQrCode, CandidateStatus } from '../types/candidateAdmin'
import { apiRequest } from '../utils/apiClient'

type ApiCandidateQrCode = {
  id: number
  token: string
  url?: string
  payload?: string
  version?: number
  is_active: boolean
}

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
  qr_code?: ApiCandidateQrCode | null
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

const mapQrCodeFromApi = (qr?: ApiCandidateQrCode | null): CandidateQrCode | null => {
  if (!qr) return null
  return {
    id: qr.id,
    token: qr.token,
    url: qr.url,
    payload: qr.payload ?? '',
    version: qr.version ?? 1,
    isActive: qr.is_active,
  }
}

const assertNumericId = (value: string | number, label: string) => {
  const str = String(value)
  if (!/^\d+$/.test(str)) {
    throw new Error(`${label} harus berupa angka`)
  }
  return str
}

export const publishAdminCandidate = async (
  token: string,
  electionId: number,
  candidateId: string | number,
): Promise<CandidateAdmin> => {
  const safeElectionId = Number(electionId)
  if (!Number.isFinite(safeElectionId)) throw new Error('Election ID tidak valid')
  const safeCandidateId = assertNumericId(candidateId, 'Candidate ID')
  const response = await apiRequest<any>(
    `/admin/elections/${safeElectionId}/candidates/${safeCandidateId}/publish`,
    { method: 'POST', token },
  )
  return transformCandidateFromApi((response?.data ?? response) as AdminCandidateResponse)
}

export const unpublishAdminCandidate = async (
  token: string,
  electionId: number,
  candidateId: string | number,
): Promise<CandidateAdmin> => {
  const safeElectionId = Number(electionId)
  if (!Number.isFinite(safeElectionId)) throw new Error('Election ID tidak valid')
  const safeCandidateId = assertNumericId(candidateId, 'Candidate ID')
  const response = await apiRequest<any>(
    `/admin/elections/${safeElectionId}/candidates/${safeCandidateId}/unpublish`,
    { method: 'POST', token },
  )
  return transformCandidateFromApi((response?.data ?? response) as AdminCandidateResponse)
}

export const generateAdminCandidateQrCode = async (
  token: string,
  electionId: number,
  candidateId: string | number,
): Promise<CandidateQrCode> => {
  const safeElectionId = Number(electionId)
  if (!Number.isFinite(safeElectionId)) throw new Error('Election ID tidak valid')
  const safeCandidateId = assertNumericId(candidateId, 'Candidate ID')
  const response = await apiRequest<any>(
    `/admin/elections/${safeElectionId}/candidates/${safeCandidateId}/qr/generate`,
    { method: 'POST', token },
  )
  const qr = response?.qr_code ?? response?.data?.qr_code ?? response?.data?.data?.qr_code ?? null
  if (!qr?.token) throw new Error('Response QR code tidak valid')
  return {
    id: Number(qr.id ?? 0),
    token: String(qr.token),
    url: qr.url ? String(qr.url) : undefined,
    payload: String(qr.payload ?? ''),
    version: Number(qr.version ?? 1),
    isActive: Boolean(qr.is_active ?? qr.isActive ?? true),
  }
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
    qrCode: mapQrCodeFromApi(payload.qr_code),
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

export const buildCandidatePayload = (candidate: Partial<CandidateAdmin>) => {
  const programs: CandidateProgramAdmin[] = candidate.programs ?? []
  const media = candidate.media ?? []
  const photos = media
    .filter((item) => item.type === 'photo')
    .map((item) => item.url)
    .filter((url) => url && !url.startsWith('blob:'))
  const pdfUrl = media.find((item) => item.type === 'pdf')?.url
  const pdf = pdfUrl && !pdfUrl.startsWith('blob:') ? pdfUrl : undefined

  const visionDescription = candidate.visionDescription?.trim()
  const visionTitle = candidate.visionTitle?.trim()
  const vision = visionDescription || visionTitle || ''

  // Only send photo_url if there's no photo_media_id (backward compatibility)
  // When photo_media_id exists, the API should use that instead.
  const photoUrl =
    candidate.photoMediaId != null
      ? undefined
      : candidate.photoUrl && candidate.photoUrl.startsWith('blob:')
        ? undefined
        : candidate.photoUrl

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
    vision,
    missions: candidate.missions,
    main_programs: candidate.programs
      ? programs.map((program) => ({
          title: program.title,
          description: program.description,
          category: program.category,
        }))
      : undefined,
    status: candidate.status ? mapStatusToApi(candidate.status) : undefined,
  }

  const shouldIncludeMedia = candidate.campaignVideo !== undefined || candidate.media !== undefined
  if (shouldIncludeMedia) {
    payload.media = {
      video_url: candidate.campaignVideo ?? null,
      gallery_photos: photos,
      document_manifesto_url: pdf ?? null,
    }
  }

  return payload
}

export const fetchAdminCandidates = async (token: string, electionId: number = getActiveElectionId()): Promise<CandidateAdmin[]> => {
  const unwrap = (payload: any) => payload?.data ?? payload
  const extractItems = (payload: any): AdminCandidateResponse[] | null => {
    const root = unwrap(payload)
    if (Array.isArray(root?.items)) return root.items
    if (Array.isArray(root)) return root
    return null
  }
  const extractPagination = (payload: any) => {
    const root = unwrap(payload)
    return root?.pagination ?? null
  }

  const limit = 50
  const baseParams = new URLSearchParams({ page: '1', limit: String(limit) })
  const firstResponse = await apiRequest<any>(`/admin/elections/${electionId}/candidates?${baseParams.toString()}`, { token })
  const firstItems = extractItems(firstResponse)
  if (!firstItems) throw new Error('Invalid candidate list response')

  const pagination = extractPagination(firstResponse)
  const totalPages = Number(pagination?.total_pages ?? pagination?.totalPages ?? 1)

  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return firstItems.map(transformCandidateFromApi)
  }

  const pageFetches = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 2).map((page) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    return apiRequest<any>(`/admin/elections/${electionId}/candidates?${params.toString()}`, { token })
  })

  const remainingResponses = await Promise.all(pageFetches)
  const remainingItems = remainingResponses.flatMap((resp) => extractItems(resp) ?? [])
  return [...firstItems, ...remainingItems].map(transformCandidateFromApi)
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
  electionId: number = getActiveElectionId(),
): Promise<CandidateAdmin> => {
  const payload = buildCandidatePayload(candidate)
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

export const deleteAdminCandidate = async (token: string, id: string | number, electionId: number = getActiveElectionId()): Promise<void> => {
  await apiRequest<any>(`/admin/elections/${electionId}/candidates/${id}`, {
    method: 'DELETE',
    token,
  })
}
