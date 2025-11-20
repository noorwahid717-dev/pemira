import type {
  CandidateLiveStat,
  FacultyParticipation,
  LiveLogEntry,
  LiveSummary,
  TPSLiveStatus,
} from '../types/monitoring'

export const monitoringSummary: LiveSummary = {
  totalVoters: 8432,
  votesIn: 4112,
  onlineVotes: 2580,
  tpsVotes: 1532,
  tpsActive: 5,
  tpsTotal: 5,
  lastUpdated: '14:22:31 WIB',
  statusLabel: 'Voting Berlangsung',
  statusType: 'running',
}

export const candidateLiveStats: CandidateLiveStat[] = [
  { id: 1, name: 'Bagas Prasetyo', votes: 1942, percentage: 47.2, color: '#4338ca' },
  { id: 2, name: 'Rani Wahyu', votes: 1611, percentage: 39.2, color: '#0ea5e9' },
  { id: 3, name: 'Fajar Nur', votes: 559, percentage: 13.6, color: '#fb7185' },
]

export const facultyParticipationLive: FacultyParticipation[] = [
  { faculty: 'Teknik', voted: 1202, total: 2110 },
  { faculty: 'Ekonomi', voted: 992, total: 1830 },
  { faculty: 'Kedokteran', voted: 310, total: 430 },
  { faculty: 'Hukum', voted: 298, total: 650 },
  { faculty: 'FIK', voted: 340, total: 700 },
]

export const tpsLiveStatus: TPSLiveStatus[] = [
  { id: 'tps-1', name: 'TPS 1', location: 'Aula Utama', votes: 832, status: 'active' },
  { id: 'tps-2', name: 'TPS 2', location: 'FEB', votes: 613, status: 'active' },
  { id: 'tps-3', name: 'TPS 3', location: 'FT', votes: 542, status: 'active' },
  { id: 'tps-4', name: 'TPS 4', location: 'FIK', votes: 301, status: 'active' },
  { id: 'tps-5', name: 'TPS 5', location: 'FK', votes: 204, status: 'active' },
]

export const liveLogEntries: LiveLogEntry[] = [
  { id: 'log-1', timestamp: '14:22', message: 'Suara masuk via TPS 2 (anon-hash x83a)' },
  { id: 'log-2', timestamp: '14:21', message: 'TPS 3 melaporkan koneksi lambat' },
  { id: 'log-3', timestamp: '14:20', message: 'Admin mengubah mode voting menjadi Hybrid' },
  { id: 'log-4', timestamp: '14:18', message: 'Kandidat 1 mengunggah dokumen visi-misi' },
]
