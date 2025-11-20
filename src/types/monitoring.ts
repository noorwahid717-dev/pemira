export type CandidateLiveStat = {
  id: number
  name: string
  votes: number
  percentage: number
  color: string
}

export type FacultyParticipation = {
  faculty: string
  voted: number
  total: number
}

export type TPSLiveStatus = {
  id: string
  name: string
  location: string
  votes: number
  status: 'active' | 'issue' | 'closed'
  note?: string
}

export type LiveSummary = {
  totalVoters: number
  votesIn: number
  onlineVotes: number
  tpsVotes: number
  tpsActive: number
  tpsTotal: number
  lastUpdated: string
  statusLabel: string
  statusType: 'running' | 'closed' | 'final'
}

export type LiveLogEntry = {
  id: string
  timestamp: string
  message: string
}
