import { getActiveElectionId } from '../state/activeElection'
import type { AcademicStatus, DPTEntry, VoterStatus, VotingMethod } from '../types/dptAdmin'
import { apiRequest } from '../utils/apiClient'

type DptApiItem = {
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
  semester?: string
  academic_status?: 'ACTIVE' | 'LEAVE' | 'INACTIVE'
  has_account?: boolean
  voter_type?: string
  type?: string
  category?: string
  role?: string
  status?: {
    is_eligible?: boolean
    has_voted?: boolean
    last_vote_at?: string | null
    last_vote_channel?: string | null
    last_tps_id?: number | null
  }
}

const mapVotingMethod = (channel?: string | null): VotingMethod => {
  if (!channel) return '-'
  if (channel.toUpperCase() === 'ONLINE') return 'online'
  if (channel.toUpperCase() === 'TPS') return 'tps'
  return channel.toLowerCase()
}

const mapStatus = (hasVoted: boolean): VoterStatus => (hasVoted ? 'sudah' : 'belum')

const mapAcademicStatus = (status?: 'ACTIVE' | 'LEAVE' | 'INACTIVE'): AcademicStatus => {
  if (!status || status === 'ACTIVE') return 'aktif'
  if (status === 'LEAVE') return 'cuti'
  if (status === 'INACTIVE') return 'nonaktif'
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
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const extractTotal = (payload: any, fallback: number) => payload?.pagination?.total_items ?? payload?.data?.pagination?.total_items ?? fallback

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

    return {
      id: item.voter_id?.toString() ?? crypto.randomUUID(),
      nim: item.nim,
      nama: item.name,
      email: item.email,
      fakultas,
      fakultasCode: item.faculty_code,
      prodi,
      prodiCode: item.study_program_code,
      angkatan: item.cohort_year ? item.cohort_year.toString() : '-',
      semester: item.semester ?? item.class_label ?? (typeof item.cohort_year === 'number' ? `${(new Date().getFullYear() - item.cohort_year) * 2 + 1}` : undefined),
      kelasLabel: item.class_label,
      akademik: mapAcademicStatus(item.academic_status),
      tipe: voterType,
      statusSuara: mapStatus(Boolean(item.status?.has_voted)),
      metodeVoting: mapVotingMethod(item.status?.voting_method || item.status?.last_vote_channel),
      waktuVoting: item.status?.last_vote_at ?? undefined,
      tpsId: item.status?.last_tps_id ?? undefined,
      isEligible: item.status?.is_eligible ?? true,
      hasAccount: item.has_account,
    }
  })

export const fetchAdminDpt = async (token: string, params: URLSearchParams, electionId: number = getActiveElectionId()): Promise<{ items: DPTEntry[]; total: number }> => {
  try {
    const primary = await apiRequest<any>(`/admin/elections/${electionId}/voters?${params.toString()}`, { token })
    const items = mapDptItems(extractItems(primary))
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

export const fetchAdminDptVoterById = async (token: string, voterId: string, electionId: number = getActiveElectionId()): Promise<DPTEntry | null> => {
  try {
    const response = await apiRequest<DptApiItem>(`/admin/elections/${electionId}/voters/${voterId}`, { token })
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
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  semester?: number
  email?: string
  phone?: string
  is_eligible?: boolean
  voter_type?: string
  voting_method?: string
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
  voterId: string,
  updates: UpdateVoterPayload,
  electionId: number = getActiveElectionId(),
): Promise<DPTEntry> => {
  const response = await apiRequest<DptApiItem>(`/admin/elections/${electionId}/voters/${voterId}`, {
    method: 'PUT',
    token,
    body: updates,
  })
  const items = mapDptItems([response])
  return items[0]
}

export const deleteAdminDptVoter = async (token: string, voterId: string, electionId: number = getActiveElectionId()): Promise<void> => {
  await apiRequest<void>(`/admin/elections/${electionId}/voters/${voterId}`, {
    method: 'DELETE',
    token,
  })
}
