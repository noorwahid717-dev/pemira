import { ACTIVE_ELECTION_ID } from '../config/env'
import type { DPTEntry, VoterStatus, VotingMethod } from '../types/dptAdmin'
import { apiRequest } from '../utils/apiClient'

type DptApiItem = {
  voter_id: number
  nim: string
  name: string
  faculty_name: string
  study_program_name: string
  cohort_year: number
  email?: string
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

export const fetchAdminDpt = async (token: string, params: URLSearchParams): Promise<{ items: DPTEntry[]; total: number }> => {
  const response = await apiRequest<{
    items: DptApiItem[] | null
    pagination: { total_items: number }
  }>(`/admin/elections/${ACTIVE_ELECTION_ID}/voters?${params.toString()}`, { token })

  const items: DPTEntry[] = (response.items ?? []).map((item) => ({
    id: item.voter_id.toString(),
    nim: item.nim,
    nama: item.name,
    fakultas: item.faculty_name,
    prodi: item.study_program_name,
    angkatan: item.cohort_year.toString(),
    akademik: 'aktif',
    statusSuara: mapStatus(item.status.has_voted),
    metodeVoting: mapVotingMethod(item.status.last_vote_channel),
    waktuVoting: item.status.last_vote_at ?? undefined,
  }))

  return { items, total: response.pagination?.total_items ?? 0 }
}
