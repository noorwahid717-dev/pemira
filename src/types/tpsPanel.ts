export type TPSQueueStatus = 'waiting' | 'verified' | 'rejected' | 'cancelled'

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
  waktuScan: string
  status: TPSQueueStatus
  token: string
  hasVoted?: boolean
  verifiedAt?: string
  rejectionReason?: string
}

export type TPSActivityLog = {
  id: string
  timestamp: string
  message: string
}

export type TPSPanelInfo = {
  tpsName: string
  tpsCode: string
  lokasi: string
  status: string
  jamOperasional: string
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

export type TPSQueueFeedPayload = Omit<TPSQueueEntry, 'id' | 'waktuScan' | 'status' | 'token'> & {
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
  type: 'verification' | 'rejection' | 'open' | 'close' | 'qr'
  nim?: string
  nama?: string
  detail?: string
}
