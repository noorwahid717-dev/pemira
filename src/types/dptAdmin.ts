export type VoterStatus = 'belum' | 'sudah'

export type AcademicStatus = 'aktif' | 'cuti' | 'nonaktif'

export type VotingMethod = 'online' | 'tps' | '-' | string

export type DPTEntry = {
  id: string
  nim: string
  nama: string
  fakultas: string
  prodi: string
  angkatan: string
  akademik: AcademicStatus
  statusSuara: VoterStatus
  metodeVoting: VotingMethod
  waktuVoting?: string
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
