import { ACTIVE_ELECTION_ID } from '../config/env'
import type { AcademicStatus, DPTEntry, VoterStatus, VotingMethod } from '../types/dptAdmin'
import { apiRequest } from '../utils/apiClient'

type DptApiItem = {
  voter_id: number
  nim: string
  name: string
  email?: string
  faculty_code?: string
  faculty_name: string
  study_program_code?: string
  study_program_name: string
  cohort_year: number
  class_label?: string
  academic_status?: 'ACTIVE' | 'LEAVE' | 'INACTIVE'
  has_account?: boolean
  status: {
    is_eligible: boolean
    has_voted: boolean
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

export const fetchAdminDpt = async (token: string, params: URLSearchParams): Promise<{ items: DPTEntry[]; total: number }> => {
  const response = await apiRequest<{
    items: DptApiItem[] | null
    pagination: { total_items: number }
  }>(`/admin/elections/${ACTIVE_ELECTION_ID}/voters?${params.toString()}`, { token })

  const items: DPTEntry[] = (response.items ?? []).map((item) => ({
    id: item.voter_id.toString(),
    nim: item.nim,
    nama: item.name,
    email: item.email,
    fakultas: item.faculty_name,
    fakultasCode: item.faculty_code,
    prodi: item.study_program_name,
    prodiCode: item.study_program_code,
    angkatan: item.cohort_year.toString(),
    kelasLabel: item.class_label,
    akademik: mapAcademicStatus(item.academic_status),
    statusSuara: mapStatus(item.status.has_voted),
    metodeVoting: mapVotingMethod(item.status.last_vote_channel),
    waktuVoting: item.status.last_vote_at ?? undefined,
    tpsId: item.status.last_tps_id ?? undefined,
    isEligible: item.status.is_eligible,
    hasAccount: item.has_account,
  }))

  return { items, total: response.pagination?.total_items ?? 0 }
}
