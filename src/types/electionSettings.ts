export type ElectionStatus =
  | 'pendaftaran'
  | 'pemeriksaan'
  | 'kampanye'
  | 'masa_tenang'
  | 'voting_dibuka'
  | 'voting_ditutup'
  | 'rekapitulasi'
  | 'selesai'

export type VotingMode = 'online' | 'tps' | 'hybrid'

export type TimelineStage = {
  id: ElectionStatus | 'verifikasi' | 'voting'
  label: string
  start: string
  end: string
}

export type ElectionRules = {
  allowActiveStudents: boolean
  allowLeaveStudents: boolean
  allowAlumni: boolean
  publicWeight: number
  specialWeight: number
  singleDeviceOnly: boolean
  geolocationRequired: boolean
  tpsMode: 'static' | 'dynamic'
  requirePanitiaVerification: boolean
}

export type SecuritySettings = {
  lockVoting: boolean
}
