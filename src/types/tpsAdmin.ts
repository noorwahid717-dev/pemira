export type TPSStatus = 'active' | 'inactive'

export type TPSOperator = {
  userId: number
  username: string
  name?: string
  email?: string
}

export type TPSAdmin = {
  id: string
  kode: string
  nama: string
  lokasi: string
  kapasitas: number
  jamBuka?: string
  jamTutup?: string
  picNama?: string
  picKontak?: string
  catatan?: string
  status: TPSStatus
  qrAktif: boolean
  qrToken?: string
  qrPayload?: string
  qrCreatedAt?: string
  createdAt?: string
  updatedAt?: string
  operators?: TPSOperator[]
}

export type TPSAllocationSummary = {
  totalTpsVoters: number
  allocatedToThisTps: number
  voted: number
  notVoted: number
  voters?: Array<{
    voterId: number
    nim: string
    name: string
    hasVoted: boolean
    votedAt?: string | null
  }>
}

export type TPSTimelinePoint = {
  hour: string
  checkins: number
  approved: number
  voted: number
}

export type TPSActivitySummary = {
  checkinsToday: number
  voted: number
  notVoted: number
  timeline: TPSTimelinePoint[]
}
