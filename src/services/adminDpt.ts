import { ACTIVE_ELECTION_ID } from '../config/env'
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
  if (value === 'lecturer' || value.includes('dosen')) return 'dosen'
  if (value === 'staff' || value.includes('staf') || value.includes('pegawai')) return 'staf'
  if (value === 'student' || value.includes('mahasiswa') || value.includes('mhs')) return 'mahasiswa'
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
  raw.map((item) => ({
    id: item.voter_id?.toString() ?? crypto.randomUUID(),
    nim: item.nim,
    nama: item.name,
    email: item.email,
    fakultas: item.faculty_name || item.faculty || '-',
    fakultasCode: item.faculty_code,
    prodi: item.study_program_name || item.study_program || '-',
    prodiCode: item.study_program_code,
    angkatan: item.cohort_year ? item.cohort_year.toString() : '-',
    semester: item.semester ?? item.class_label ?? (typeof item.cohort_year === 'number' ? `${(new Date().getFullYear() - item.cohort_year) * 2 + 1}` : undefined),
    kelasLabel: item.class_label,
    akademik: mapAcademicStatus(item.academic_status),
    tipe: mapVoterType(item.type || item.voter_type || item.category || item.role),
    statusSuara: mapStatus(Boolean(item.status?.has_voted)),
    metodeVoting: mapVotingMethod(item.status?.last_vote_channel),
    waktuVoting: item.status?.last_vote_at ?? undefined,
    tpsId: item.status?.last_tps_id ?? undefined,
    isEligible: item.status?.is_eligible ?? true,
    hasAccount: item.has_account,
  }))

export const fetchAdminDpt = async (token: string, params: URLSearchParams, electionId: number = ACTIVE_ELECTION_ID): Promise<{ items: DPTEntry[]; total: number }> => {
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
