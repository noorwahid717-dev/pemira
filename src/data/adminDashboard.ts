import type {
  ActivityLogEntry,
  AdminOverview,
  CandidateVoteStat,
  FacultyParticipationStat,
  ParticipationStats,
  QuickAction,
  SystemInfo,
  TPSStatusSummary,
} from '../types/admin'

export const adminOverview: AdminOverview = {
  stage: 'voting_dibuka',
  stageLabel: 'Voting Dibuka',
  votingPeriod: '12–15 Juni 2024',
  totalCandidates: 3,
  totalVoters: 8432,
  activeMode: 'Online + TPS',
}

export const participationStats: ParticipationStats = {
  totalVoters: 8432,
  voted: 4112,
  notVoted: 4320,
}

export const tpsStatusSummary: TPSStatusSummary = {
  total: 5,
  active: 5,
  issue: 0,
  closed: 0,
  detail: [
    { id: 'tps-1', name: 'TPS 1 – Aula Utama', voters: 832, status: 'active' },
    { id: 'tps-2', name: 'TPS 2 – FEB', voters: 613, status: 'active' },
    { id: 'tps-3', name: 'TPS 3 – FT', voters: 542, status: 'active' },
    { id: 'tps-4', name: 'TPS 4 – FIK', voters: 301, status: 'active' },
    { id: 'tps-5', name: 'TPS 5 – FK', voters: 204, status: 'active' },
  ],
}

export const activityLogs: ActivityLogEntry[] = [
  { id: 'log-1', time: '14:22', message: 'TPS 3 memverifikasi pemilih (Dimas Pratama)' },
  { id: 'log-2', time: '14:20', message: 'Suara masuk via TPS 2 (Noah F.)' },
  { id: 'log-3', time: '14:18', message: 'Admin mengubah jadwal kampanye' },
  { id: 'log-4', time: '14:15', message: 'Kandidat #1 upload dokumen visi-misi' },
]

export const candidateVoteStats: CandidateVoteStat[] = [
  { id: 1, name: 'Kandidat 1', votes: 1942, percentage: 47.2 },
  { id: 2, name: 'Kandidat 2', votes: 1611, percentage: 39.2 },
  { id: 3, name: 'Kandidat 3', votes: 559, percentage: 13.6 },
]

export const facultyParticipationStats: FacultyParticipationStat[] = [
  { faculty: 'Teknik', voted: 1202, total: 2110 },
  { faculty: 'Ekonomi', voted: 992, total: 1830 },
  { faculty: 'Kedokteran', voted: 310, total: 430 },
  { faculty: 'Hukum', voted: 298, total: 650 },
  { faculty: 'FIK', voted: 340, total: 700 },
]

export const quickActions: QuickAction[] = [
  { id: 'candidates', label: 'Kelola Kandidat', description: 'Tambah / edit kandidat serta dokumen', href: '/admin/kandidat' },
  { id: 'announcements', label: 'Pengumuman & Konten', description: 'Upload berita resmi PEMIRA', href: '/admin/pengumuman' },
  { id: 'tps', label: 'Kelola TPS', description: 'Pantau status dan panitia TPS', href: '/admin/tps' },
  { id: 'schedule', label: 'Jadwal & Mode Voting', description: 'Atur timeline pemilu', href: '/admin/pengaturan' },
]

export const systemInfo: SystemInfo = {
  serverStatus: 'normal',
  lastSync: '14:22 WIB',
  dataLocked: false,
}
