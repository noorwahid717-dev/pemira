export type VotingStatus = 'not_started' | 'open' | 'closed' | 'voted'

export type Candidate = {
  id: number
  nomorUrut: number
  nama: string
  fakultas: string
  prodi: string
  angkatan: string
  foto: string
  tagline?: string
  visi?: string
  misi?: string[]
}

export type CandidateProgram = {
  id: number
  title: string
  description: string
}

export type CandidateExperience = {
  tahun: string
  posisi: string
  detail: string
}

export type CandidateCampaign = {
  videoUrl: string
  posterUrl: string
  pdfUrl: string
}

export type CandidateDetail = Candidate & {
  tagline: string
  verified: boolean
  visi: string
  misi: string[]
  programKerja: CandidateProgram[]
  pengalaman: CandidateExperience[]
  kampanye: CandidateCampaign
}

export type VoterSession = {
  nim: string
  hasVoted: boolean
  votingStatus: VotingStatus
  tanggalLahir?: string
}

export type MahasiswaProfile = {
  nama: string
  nim: string
}

export type VoterProfile = MahasiswaProfile & {
  fakultas?: string
  prodi?: string
}

export type DemoVoter = VoterSession &
  VoterProfile & {
    tanggalLahir: string
  }

export type TPSScanResult = {
  token: string
  tpsName: string
  scannedAt: string
}

export type VotingReceipt = {
  timestamp: string
  token: string
}

export type VotingRecord = {
  kandidatId: number
  kandidatNama: string
  votedAt: string
  token: string
  tpsName?: string
  mode: 'online' | 'tps'
}
