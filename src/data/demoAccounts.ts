import { mockVoters } from './mockVoters'
import type { VotingStatus } from '../types/voting'

type DemoAccountMeta = {
  role: string
  statusLabel: string
}

const scenarioMeta: Record<string, DemoAccountMeta> = {
  '2110510001': { role: 'Mahasiswa (Belum Voting)', statusLabel: 'Belum memilih' },
  '2110510002': { role: 'Mahasiswa (Sudah Voting)', statusLabel: 'Sudah memilih' },
  '2110510003': { role: 'Mahasiswa (Voting Belum Dibuka)', statusLabel: 'Menunggu' },
  '2110510004': { role: 'Mahasiswa (Voting Ditutup)', statusLabel: 'Sudah memilih' },
}

export type DemoAccountCard = {
  nim: string
  password: string
  tanggalLahir: string
  votingStatus: VotingStatus
  hasVoted: boolean
  role: string
  statusLabel: string
}

export const demoAccountCards: DemoAccountCard[] = mockVoters.map((voter) => {
  const meta = scenarioMeta[voter.nim] ?? { role: 'Mahasiswa', statusLabel: 'Status tidak diketahui' }
  return {
    nim: voter.nim,
    password: 'demo123',
    tanggalLahir: voter.tanggalLahir,
    votingStatus: voter.votingStatus,
    hasVoted: voter.hasVoted,
    role: meta.role,
    statusLabel: meta.statusLabel,
  }
})
