import type {
  TPSActivityLog,
  TPSHistoryRecord,
  TPSPanelInfo,
  TPSPanitiaProfile,
  TPSQueueEntry,
  TPSQueueFeedPayload,
  TPSStaticQRInfo,
  TPSSecurityChecklist,
  TPSVotingCandidate,
} from '../types/tpsPanel'

const withTime = (time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, seconds ?? 0, 0)
  return date.toISOString()
}

const randomToken = (suffix: string) => `tps_1_${suffix}`

export const tpsPanelInfo: TPSPanelInfo = {
  tpsName: 'Aula Utama',
  tpsCode: 'TPS 1',
  lokasi: 'Aula Utama Kampus Utama',
  status: 'Aktif',
  jamOperasional: '08:00 – 16:00',
  totalVoters: 132,
}

export const panitiaProfile: TPSPanitiaProfile = {
  nama: 'Budi Santosa',
  role: 'Koordinator TPS',
  shift: 'Shift Pagi',
}

export const initialTPSQueue: TPSQueueEntry[] = [
  {
    id: 'queue-1',
    nim: '2110510023',
    nama: 'Noah Febriyansyah',
    fakultas: 'Fakultas Teknik',
    prodi: 'Informatika',
    angkatan: '2021',
    statusMahasiswa: 'Aktif',
    mode: 'mobile',
    waktuScan: withTime('10:22:14'),
    status: 'waiting',
    token: randomToken('2837f9e1'),
  },
  {
    id: 'queue-2',
    nim: '2109920344',
    nama: 'Rani Putri',
    fakultas: 'Fakultas Ekonomi',
    prodi: 'Manajemen',
    angkatan: '2020',
    statusMahasiswa: 'Aktif',
    mode: 'mobile',
    waktuScan: withTime('10:22:09'),
    status: 'waiting',
    token: randomToken('a81f770b'),
  },
  {
    id: 'queue-3',
    nim: '2108810041',
    nama: 'Dimas Pratama',
    fakultas: 'Fakultas Hukum',
    prodi: 'Ilmu Hukum',
    angkatan: '2019',
    statusMahasiswa: 'Aktif',
    mode: 'mobile',
    waktuScan: withTime('10:21:43'),
    status: 'verified',
    hasVoted: true,
    token: randomToken('9ab3e0cd'),
  },
]

export const initialTPSLogs: TPSActivityLog[] = [
  {
    id: 'log-1',
    timestamp: withTime('10:22:00'),
    message: 'Noah F. diverifikasi dan memulai voting',
  },
  {
    id: 'log-2',
    timestamp: withTime('10:20:00'),
    message: 'QR baru dibuat otomatis',
  },
  {
    id: 'log-3',
    timestamp: withTime('08:00:00'),
    message: 'TPS dibuka',
  },
]

export const securityChecklist: TPSSecurityChecklist[] = [
  {
    id: 'qr',
    label: 'QR terenkripsi dan berganti tiap 30 detik',
    completed: true,
    description: 'Token unik tidak menyimpan data pribadi',
  },
  {
    id: 'ws',
    label: 'Queue realtime dengan WebSocket',
    completed: true,
    description: 'Panitia mendapat notifikasi instan',
  },
  {
    id: 'audit',
    label: 'Log aktivitas tercatat untuk audit',
    completed: true,
  },
  {
    id: 'privasi',
    label: 'Data NIM/Nama hanya tampil di panel panitia',
    completed: true,
  },
]

export const rejectionReasons = ['Data pemilih tidak cocok', 'TPS tidak sesuai', 'Mahasiswa sudah voting', 'Lainnya']

export const tpsQueueFeed: TPSQueueFeedPayload[] = [
  {
    nim: '2107720199',
    nama: 'Hendra Wijaya',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Industri',
    angkatan: '2020',
    statusMahasiswa: 'Aktif',
    mode: 'mobile',
    delayMs: 20000,
  },
  {
    nim: '2110123301',
    nama: 'Dewi Anggraini',
    fakultas: 'Fakultas Ilmu Sosial',
    prodi: 'Hubungan Internasional',
    angkatan: '2021',
    statusMahasiswa: 'Aktif',
    mode: 'mobile',
    delayMs: 36000,
  },
  {
    nim: '2108811443',
    nama: 'Ridho Saputra',
    fakultas: 'Fakultas Ekonomi',
    prodi: 'Akuntansi',
    angkatan: '2019',
    statusMahasiswa: 'Aktif',
    mode: 'device',
    delayMs: 48000,
  },
]

export const tpsVotingCandidates: TPSVotingCandidate[] = [
  {
    id: 1,
    nama: 'Kandidat 1 - Aisyah Ramadhani',
    nomorUrut: 1,
    deskripsi: 'Fokus pada digitalisasi layanan kampus dan transparansi anggaran BEM.',
  },
  {
    id: 2,
    nama: 'Kandidat 2 - Gibran Tegar',
    nomorUrut: 2,
    deskripsi: 'Mengusung program kolaborasi lintas fakultas dan pusat karier baru.',
  },
  {
    id: 3,
    nama: 'Kandidat 3 - Lala Aprilia',
    nomorUrut: 3,
    deskripsi: 'Prioritas peningkatan fasilitas mahasiswa dan dana kegiatan UKM.',
  },
]

export const tpsStaticQRInfo: TPSStaticQRInfo = {
  id: 'TPS1_STATIC_8392AF',
  status: 'Aktif',
  description: 'QR fisik sudah dicetak dan ditempel di area TPS.',
  notes: [
    'Pemilih scan QR ini di area TPS',
    'Panitia wajib verifikasi manual setiap pemilih',
  ],
  fileUrl: '/assets/tps-static-qr.svg',
}

export const initialTPSHistory: TPSHistoryRecord[] = [
  {
    id: 'history-1',
    timestamp: withTime('10:22:40'),
    type: 'verification',
    nim: '2110510023',
    nama: 'Noah Febriyansyah',
    detail: 'Diizinkan voting via HP',
  },
  {
    id: 'history-2',
    timestamp: withTime('10:20:13'),
    type: 'rejection',
    nim: '2109920344',
    nama: 'Rani Putri',
    detail: 'Ditolak - sudah terdaftar memilih',
  },
  {
    id: 'history-3',
    timestamp: withTime('10:00:01'),
    type: 'open',
    nama: 'Panitia: Budi Santosa',
    detail: 'TPS dibuka',
  },
]
