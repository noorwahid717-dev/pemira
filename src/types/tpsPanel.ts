export type TPSQueueStatus = 'PENDING' | 'CHECKED_IN' | 'VOTED'

export type TPSVotingMode = 'mobile' | 'device'

export type TPSQueueEntry = {
  id: string
  nim: string
  nama: string
  fakultas: string
  prodi: string
  angkatan: string
  statusMahasiswa: string
  mode: TPSVotingMode
  waktuCheckIn: string
  status: TPSQueueStatus
  hasVoted?: boolean
  voteTime?: string
  checkInToken?: string
}

export type TPSActivityLog = {
  id: string
  timestamp: string
  message: string
}

export type TPSPanelInfo = {
  tpsName: string
  tpsCode: string
  lokasi?: string
  status: string
  jamOperasional?: string
  totalVoters: number
}

export type TPSPanitiaProfile = {
  nama: string
  role: string
  shift: string
}

export type TPSSecurityChecklist = {
  id: string
  label: string
  completed: boolean
  description?: string
}

export type TPSPanelNotification = {
  id: string
  type: 'queue' | 'success' | 'warning' | 'info'
  title: string
  message: string
  entryId?: string
}

export type TPSVotingCandidate = {
  id: number
  nama: string
  nomorUrut: number
  deskripsi: string
}

export type TPSQueueFeedPayload = Omit<TPSQueueEntry, 'id' | 'waktuCheckIn' | 'status' | 'checkInToken'> & {
  nim: string
  nama: string
  delayMs: number
}

export type TPSStaticQRInfo = {
  id: string
  status: 'Aktif' | 'Nonaktif'
  description: string
  notes: string[]
  fileUrl: string
}

export type TPSHistoryRecord = {
  id: string
  timestamp: string
  type: 'checkin' | 'verification' | 'rejection' | 'open' | 'close' | 'qr' | 'vote'
  nim?: string
  nama?: string
  detail?: string
}

export type TPSPanelStats = {
  totalRegisteredTpsVoters: number
  totalCheckedIn: number
  totalVoted: number
  totalNotVoted: number
}

export type TPSTimelinePoint = {
  hour: string
  checkedIn: number
  voted: number
}
