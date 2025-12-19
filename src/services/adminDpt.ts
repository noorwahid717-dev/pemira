import { getActiveElectionId } from '../state/activeElection'
import type { AcademicStatus, DPTEntry, VoterStatus, VotingMethod, VoterType, AcademicStatusAPI } from '../types/dptAdmin'
import { apiRequest } from '../utils/apiClient'

// API response types matching the contract
type DptApiItem = {
  // New API fields (election_voters)
  election_voter_id?: number
  election_id?: number
  voter_id: number
  nim: string
  name: string
  email?: string
  faculty_code?: string
  faculty_name?: string
  faculty?: string
  study_program_code?: string
  study_program_name?: string
  study_program?: string
  cohort_year?: number | string
  class_label?: string
  semester?: string | number
  academic_status?: AcademicStatusAPI
  has_account?: boolean
  has_voted?: boolean
  voter_type?: VoterType | string
  type?: string
  category?: string
  role?: string
  // New API: election_voter status fields
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED' | {
    is_eligible?: boolean
    has_voted?: boolean
    last_vote_at?: string | null
    last_vote_channel?: string | null
    last_tps_id?: number | null
    digital_signature?: string | null // NEW: Signature data
  }
  voting_method?: 'ONLINE' | 'TPS'
  tps_id?: number | null
  checked_in_at?: string | null
  voted_at?: string | null
  updated_at?: string
  digital_signature?: string | null
}

// Lookup response type
export type VoterLookupResponse = {
  voter: {
    id: number
    nim: string
    name: string
    voter_type: VoterType
    email?: string
    faculty_code?: string
    study_program_code?: string
    cohort_year?: number
    semester?: number
    academic_status?: AcademicStatusAPI
    has_account: boolean
    lecturer_id?: number | null
    staff_id?: number | null
    voting_method?: 'ONLINE' | 'TPS'
  }
  election_voter?: {
    election_voter_id: number
    election_id: number
    voter_id: number
    nim: string
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'
    voting_method: 'ONLINE' | 'TPS'
    tps_id: number | null
    checked_in_at: string | null
    voted_at: string | null
    updated_at: string
    voter_type: VoterType
    name: string
    email: string
    faculty_code?: string
    study_program_code?: string
    cohort_year?: number
  }
}

// Upsert request type
export type UpsertVoterRequest = {
  voter_type: VoterType
  nim: string
  name: string
  email: string
  phone?: string
  faculty_code?: string
  faculty_name?: string
  study_program_code?: string
  study_program_name?: string
  cohort_year?: number
  semester?: number
  academic_status?: AcademicStatusAPI
  lecturer_id?: number | null
  staff_id?: number | null
  voting_method: 'ONLINE' | 'TPS'
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'BLOCKED'
  tps_id?: number | null
}

// Upsert response type
export type UpsertVoterResponse = {
  voter_id: number
  election_voter_id: number
  status: string
  voting_method: string
  tps_id: number | null
  created_voter: boolean
  created_election_voter: boolean
  duplicate_in_election: boolean
}

// Import result type
export type ImportResult = {
  success: number
  failed: number
  total: number
  errors: Array<{
    row: number
    nim: string
    error: string
  }>
}

const mapVotingMethod = (channel?: string | null): VotingMethod => {
  if (!channel) return '-'
  if (channel.toUpperCase() === 'ONLINE') return 'online'
  if (channel.toUpperCase() === 'TPS') return 'tps'
  return channel.toLowerCase()
}

const mapStatus = (item: DptApiItem): VoterStatus => {
  // New API: check voted_at or status='VOTED' or top-level has_voted
  if (item.voted_at) return 'sudah'
  if (item.has_voted) return 'sudah'
  if (typeof item.status === 'string' && item.status === 'VOTED') return 'sudah'
  // Legacy API: check status.has_voted
  if (typeof item.status === 'object' && item.status?.has_voted) return 'sudah'
  return 'belum'
}

const mapAcademicStatus = (status?: AcademicStatusAPI): AcademicStatus => {
  if (!status || status === 'ACTIVE') return 'aktif'
  if (status === 'ON_LEAVE') return 'cuti'
  if (status === 'INACTIVE' || status === 'GRADUATED' || status === 'DROPPED') return 'nonaktif'
  return 'aktif'
}

const mapVoterType = (raw?: string): 'mahasiswa' | 'dosen' | 'staf' | string | undefined => {
  const value = (raw ?? '').toLowerCase()
  if (!value) return undefined
  if (value === 'lecturer' || value === 'LECTURER' || value.includes('dosen')) return 'dosen'
  if (value === 'staff' || value === 'STAFF' || value.includes('staf') || value.includes('pegawai')) return 'staf'
  if (value === 'student' || value === 'STUDENT' || value.includes('mahasiswa') || value.includes('mhs')) return 'mahasiswa'
  return raw
}

const extractItems = (payload: any): DptApiItem[] => {
  let items: any[] = []

  if (Array.isArray(payload)) {
    items = payload
  } else if (Array.isArray(payload?.items)) {
    items = payload.items
  } else if (Array.isArray(payload?.data?.items)) {
    items = payload.data.items
  } else if (Array.isArray(payload?.data)) {
    items = payload.data
  }

  // Filter out null/undefined items and items without required fields
  return items.filter(item =>
    item &&
    typeof item === 'object' &&
    (item.nim || item.voter_id || item.election_voter_id)
  )
}

const extractTotal = (payload: any, fallback: number) => {
  const rawTotal =
    payload?.pagination?.total_items ??
    payload?.data?.pagination?.total_items ??
    payload?.total_items ??
    payload?.data?.total_items ??
    payload?.total ??
    payload?.data?.total ??
    payload?.data?.total_eligible

  const numericTotal = typeof rawTotal === 'string' ? parseInt(rawTotal, 10) : rawTotal
  return Number.isFinite(numericTotal) ? (numericTotal as number) : fallback
}

const normalizeSemesterValue = (value?: string | number): string | undefined => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return value.toString()
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || /tidak\s+diisi/i.test(trimmed)) return undefined
    const digitMatch = trimmed.match(/(\d{1,2})/)
    if (digitMatch) return digitMatch[1]
    return trimmed
  }
  return undefined
}

const mapDptItems = (raw: DptApiItem[]): DPTEntry[] =>
  raw.map((item) => {
    const voterType = mapVoterType(item.type || item.voter_type || item.category || item.role)
    const isStaff = voterType === 'staf'


    // For staff, faculty_name might contain study program data incorrectly
    // So we handle it specially
    let fakultas: string
    let prodi: string

    if (isStaff) {
      // Check if faculty_name looks like a study program (starts with "S1", "S2", "S3", etc.)
      const facultyLooksLikeStudyProgram = item.faculty_name && (
        item.faculty_name.startsWith('S1 ') ||
        item.faculty_name.startsWith('S2 ') ||
        item.faculty_name.startsWith('S3 ') ||
        item.faculty_name.startsWith('D3 ') ||
        item.faculty_name.startsWith('D4 ')
      )

      if (facultyLooksLikeStudyProgram) {
        // Faculty field contains study program data - treat it as department/role
        fakultas = 'Staff UNIWA'
        prodi = item.faculty_name || '-'
      } else if (item.faculty_name && item.faculty_name !== '-') {
        // Faculty field contains proper faculty name
        fakultas = item.faculty_name
        prodi = item.study_program_name || '-'
      } else {
        // No faculty data
        fakultas = 'Staff UNIWA'
        prodi = '-'
      }
    } else {
      // For students/lecturers, use normal mapping
      fakultas = item.faculty_name || item.faculty || '-'
      prodi = item.study_program_name || item.study_program || '-'
    }

    // Determine voting method (new API vs legacy)
    let votingMethod: VotingMethod
    if (item.voting_method) {
      votingMethod = mapVotingMethod(item.voting_method)
    } else if (typeof item.status === 'object' && item.status?.last_vote_channel) {
      votingMethod = mapVotingMethod(item.status.last_vote_channel)
    } else {
      votingMethod = '-'
    }

    // Determine voted_at timestamp
    const votedAt = item.voted_at || (typeof item.status === 'object' ? item.status?.last_vote_at : undefined)

    // Determine TPS ID
    const tpsId = item.tps_id ?? (typeof item.status === 'object' ? item.status?.last_tps_id : undefined)

    // Determine eligibility (new API uses status field directly)
    const isEligible = typeof item.status === 'object' ? (item.status?.is_eligible ?? true) : true

    // Get has_voted flag
    const hasVoted = item.has_voted ?? (typeof item.status === 'object' ? item.status?.has_voted : false) ?? false

    // Get election voter status if available
    let electionVoterStatus: ElectionVoterStatus | undefined
    if (typeof item.status === 'string') {
      electionVoterStatus = item.status
    } else if (typeof item.status === 'object') {
      // If status is an object, map based on verified logic or eligibility
      // Assuming if they have an object status from election_voter, they are likely VERIFIED or VOTED unless specified
      if (hasVoted) electionVoterStatus = 'VOTED'
      else if (isEligible) electionVoterStatus = 'VERIFIED'
      else electionVoterStatus = 'PENDING'
    }

    const id = item.election_voter_id
      ? item.election_voter_id.toString()
      : `voter_${item.voter_id}`

    let cohortYearNumeric: number | undefined
    if (typeof item.cohort_year === 'number') {
      cohortYearNumeric = item.cohort_year
    } else if (typeof item.cohort_year === 'string' && item.cohort_year) {
      const parsed = Number.parseInt(item.cohort_year, 10)
      cohortYearNumeric = Number.isNaN(parsed) ? undefined : parsed
    }
    const fallbackSemester =
      typeof cohortYearNumeric === 'number'
        ? `${(new Date().getFullYear() - cohortYearNumeric) * 2 + 1}`
        : undefined
    const classLabelSemester = voterType === 'mahasiswa' ? item.class_label : undefined
    const semesterValue = normalizeSemesterValue(item.semester ?? classLabelSemester ?? fallbackSemester)

    const statusSuara = mapStatus(item)

    // Determine voted_at timestamp with fallback to updated_at if voted
    const explicitVotedAt = item.voted_at || (typeof item.status === 'object' ? item.status?.last_vote_at : undefined)
    const waktuVoting = explicitVotedAt || (statusSuara === 'sudah' ? item.updated_at : undefined)

    return {
      id,
      voterId: item.voter_id,
      nim: item.nim,
      nama: item.name,
      email: item.email,
      fakultas,
      fakultasCode: item.faculty_code,
      prodi,
      prodiCode: item.study_program_code,
      angkatan: item.cohort_year ? item.cohort_year.toString() : '-',
      semester: semesterValue != null && semesterValue !== '' ? semesterValue.toString() : undefined,
      kelasLabel: item.class_label,
      akademik: mapAcademicStatus(item.academic_status),
      tipe: voterType,
      statusSuara,
      metodeVoting: votingMethod,
      waktuVoting,
      tpsId: tpsId ?? undefined,
      isEligible,
      hasAccount: item.has_account,
      hasVoted,
      electionVoterStatus,
      checkedInAt: item.checked_in_at ?? undefined,
      votedAt: item.voted_at ?? undefined,
      updatedAt: item.updated_at,
      digitalSignature: item.digital_signature ?? (typeof item.status === 'object' ? item.status?.digital_signature : null)
    }
  })

export const fetchAdminDpt = async (token: string, params: URLSearchParams, electionId: number = getActiveElectionId()): Promise<{ items: DPTEntry[]; total: number }> => {
  try {
    const timestamp = new Date().getTime()
    const primary = await apiRequest<any>(`/admin/elections/${electionId}/voters?${params.toString()}&_t=${timestamp}`, { token })
    const rawItems = extractItems(primary)
    const items = mapDptItems(rawItems)
    return { items, total: extractTotal(primary, items.length) }
  } catch (err: any) {
    if (err?.status === 404 || err?.status === 500) {
      const fallback = await apiRequest<any>(`/admin/voters?${params.toString()}`, { token })
      const items = mapDptItems(extractItems(fallback))
      return { items, total: extractTotal(fallback, items.length) }
    }
    throw err
  }
}

export const fetchAdminDptVoterById = async (token: string, electionVoterId: string, electionId: number = getActiveElectionId()): Promise<DPTEntry | null> => {
  try {
    const timestamp = new Date().getTime()

    // Check if this is a synthetic voter_X ID (meaning election_voter_id was missing)
    if (electionVoterId.startsWith('voter_')) {
      const voterId = electionVoterId.replace('voter_', '')
      // Try to find this voter via a lookup endpoint or list search
      // First, attempt to search by voter_id in the election voters list
      const searchParams = new URLSearchParams({ per_page: '1', page: '1' })
      const searchResponse = await apiRequest<any>(`/admin/elections/${electionId}/voters?${searchParams.toString()}&voter_id=${voterId}&_t=${timestamp}`, { token })
      const items = extractItems(searchResponse)
      if (items.length > 0) {
        const mapped = mapDptItems(items)
        return mapped[0]
      }

      // Fallback: Try to get from base voters endpoint (if the API supports it)
      try {
        const voterResponse = await apiRequest<DptApiItem>(`/admin/voters/${voterId}?_t=${timestamp}`, { token })
        const mappedItems = mapDptItems([voterResponse])
        return mappedItems[0]
      } catch {
        // If all fallbacks fail, return null
        return null
      }
    }

    // Standard path: Use the election_voter_id directly
    const response = await apiRequest<DptApiItem>(`/admin/elections/${electionId}/voters/${electionVoterId}?_t=${timestamp}`, { token })
    const items = mapDptItems([response])
    return items[0]
  } catch (err: any) {
    if (err?.status === 404) {
      return null
    }
    throw err
  }
}

export type UpdateVoterPayload = {
  // Voter bio fields (legacy compatibility)
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  semester?: number
  email?: string
  phone?: string
  is_eligible?: boolean
  voter_type?: string
  // New API: election_voter fields
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'
  voting_method?: 'ONLINE' | 'TPS'
  tps_id?: number | null
}

// Helper functions for voter type mapping
export const mapFrontendToApiVoterType = (frontendType: 'mahasiswa' | 'dosen' | 'staf'): string => {
  switch (frontendType) {
    case 'mahasiswa': return 'STUDENT'
    case 'dosen': return 'LECTURER'
    case 'staf': return 'STAFF'
    default: return 'STUDENT'
  }
}

export const mapApiToFrontendVoterType = (apiType?: string): 'mahasiswa' | 'dosen' | 'staf' => {
  if (!apiType) return 'mahasiswa'
  switch (apiType.toUpperCase()) {
    case 'STUDENT': return 'mahasiswa'
    case 'LECTURER': return 'dosen'
    case 'STAFF': return 'staf'
    default: return 'mahasiswa'
  }
}

export const updateAdminDptVoter = async (
  token: string,
  electionVoterId: string,
  updates: UpdateVoterPayload,
  electionId: number = getActiveElectionId(),
): Promise<DPTEntry> => {
  const response = await apiRequest<DptApiItem>(`/admin/elections/${electionId}/voters/${electionVoterId}`, {
    method: 'PATCH',
    token,
    body: updates,
  })
  const items = mapDptItems([response])
  return items[0]
}

export const deleteAdminDptVoter = async (token: string, electionVoterId: string, electionId: number = getActiveElectionId()): Promise<void> => {
  await apiRequest<void>(`/admin/elections/${electionId}/voters/${electionVoterId}`, {
    method: 'DELETE',
    token,
  })
}

/**
 * Lookup voter by NIM
 * GET /admin/elections/{electionID}/voters/lookup?nim=STRING
 */
export const lookupVoterByNim = async (
  token: string,
  nim: string,
  electionId: number = getActiveElectionId()
): Promise<VoterLookupResponse> => {
  const response = await apiRequest<{ data: VoterLookupResponse }>(
    `/admin/elections/${electionId}/voters/lookup?nim=${encodeURIComponent(nim)}`,
    { token }
  )
  return response.data || response as any
}

/**
 * Add/Update voter (Upsert)
 * POST /admin/elections/{electionID}/voters
 */
export const upsertVoter = async (
  token: string,
  data: UpsertVoterRequest,
  electionId: number = getActiveElectionId()
): Promise<UpsertVoterResponse> => {
  const response = await apiRequest<{ data: UpsertVoterResponse }>(
    `/admin/elections/${electionId}/voters`,
    {
      method: 'POST',
      token,
      body: data,
    }
  )
  return response.data || response as any
}

/**
 * Import DPT from CSV
 * POST /admin/elections/{electionID}/voters/import
 */
export const importDptCsv = async (
  token: string,
  file: File,
  electionId: number = getActiveElectionId()
): Promise<ImportResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/elections/${electionId}/voters/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Import failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const result = await response.json()
  return result.data || result
}

/**
 * Export DPT to CSV
 * GET /admin/elections/{electionID}/voters/export
 */
export const exportDptCsv = async (
  token: string,
  filters?: URLSearchParams,
  electionId: number = getActiveElectionId()
): Promise<Blob> => {
  const queryString = filters ? `?${filters.toString()}` : ''
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/elections/${electionId}/voters/export${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Export failed: HTTP ${response.status}`)
  }

  return response.blob()
}
