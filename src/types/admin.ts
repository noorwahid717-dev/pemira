export type ElectionStage = 'pendaftaran' | 'kampanye' | 'voting_dibuka' | 'voting_ditutup' | 'rekapitulasi'

export type AdminOverview = {
  stage: ElectionStage
  stageLabel: string
  votingPeriod: string
  totalCandidates: number
  totalVoters: number
  activeMode: string
}

export type ParticipationStats = {
  totalVoters: number
  voted: number
  notVoted: number
}

export type TPSMiniStatus = {
  id: string
  name: string
  voters: number
  status: 'active' | 'issue' | 'closed'
}

export type TPSStatusSummary = {
  total: number
  active: number
  issue: number
  closed: number
  detail: TPSMiniStatus[]
}

export type ActivityLogEntry = {
  id: string
  time: string
  message: string
  highlight?: boolean
}

export type CandidateVoteStat = {
  id: number
  name: string
  votes: number
  percentage: number
}

export type FacultyParticipationStat = {
  faculty: string
  voted: number
  total: number
}

export type QuickAction = {
  id: string
  label: string
  description: string
  href: string
}

export type SystemInfo = {
  serverStatus: 'normal' | 'warning' | 'down'
  lastSync: string
  dataLocked: boolean
}
