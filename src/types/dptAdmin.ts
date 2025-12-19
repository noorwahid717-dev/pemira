export type VoterStatus = 'belum' | 'sudah'

export type AcademicStatus = 'aktif' | 'cuti' | 'nonaktif'

export type VotingMethod = 'online' | 'tps' | '-' | string

// New API: Election voter status
export type ElectionVoterStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'

// New API: Voter type (backend format)
export type VoterType = 'STUDENT' | 'LECTURER' | 'STAFF'

// New API: Academic status (backend format)
export type AcademicStatusAPI = 'ACTIVE' | 'GRADUATED' | 'ON_LEAVE' | 'DROPPED' | 'INACTIVE'

export type DPTEntry = {
  id: string // election_voter_id from new API
  voterId?: number // voter_id for reference
  nim: string
  nama: string
  email?: string
  fakultas: string
  fakultasCode?: string
  prodi: string
  prodiCode?: string
  angkatan: string
  semester?: string
  tipe?: 'mahasiswa' | 'dosen' | 'staf' | string
  kelasLabel?: string
  akademik: AcademicStatus
  statusSuara: VoterStatus
  metodeVoting: VotingMethod
  waktuVoting?: string
  tpsId?: number
  isEligible: boolean
  hasAccount?: boolean
  hasVoted?: boolean
  // New API fields
  electionVoterStatus?: ElectionVoterStatus
  checkedInAt?: string | null
  votedAt?: string | null
  updatedAt?: string
  digitalSignature?: string | null // NEW: Signature data from status
}

export type ImportStep = 1 | 2 | 3 | 4

export type ImportMapping = {
  nim: string
  nama: string
  fakultas: string
  prodi: string
  angkatan: string
  statusAkademik: string
  email?: string
}

export type ImportPreviewError = {
  row: number
  message: string
}
