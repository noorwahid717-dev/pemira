import type { Candidate, CandidateDetail } from '../types/voting'

export const mockCandidates: Candidate[] = [
  {
    id: 1,
    nomorUrut: 1,
    nama: 'Ahmad Fauzi',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    angkatan: '2021',
    foto: '1',
  },
  {
    id: 2,
    nomorUrut: 2,
    nama: 'Siti Nurhaliza',
    fakultas: 'Fakultas Ekonomi dan Bisnis',
    prodi: 'Manajemen',
    angkatan: '2021',
    foto: '2',
  },
  {
    id: 3,
    nomorUrut: 3,
    nama: 'Budi Santoso',
    fakultas: 'Fakultas Hukum',
    prodi: 'Ilmu Hukum',
    angkatan: '2020',
    foto: '3',
  },
]

const sharedPrograms = [
  {
    id: 1,
    title: 'Beasiswa Sahabat Kelas',
    description: 'Program bantuan finansial untuk mahasiswa berprestasi dengan ekonomi kurang mampu.',
  },
  {
    id: 2,
    title: 'Pusat Aspirasi Online',
    description: 'Platform digital untuk menampung dan merespon aspirasi mahasiswa secara cepat dan transparan.',
  },
  {
    id: 3,
    title: 'Kampus Ramah Difabel',
    description: 'Advokasi fasilitas kampus yang inklusif bagi mahasiswa berkebutuhan khusus.',
  },
]

const sharedExperience = [
  {
    tahun: '2024',
    posisi: 'Ketua Himpunan',
    detail: 'Memimpin organisasi dengan 200+ anggota aktif',
  },
  {
    tahun: '2023',
    posisi: 'Koordinator Kegiatan Sosial',
    detail: 'Mengelola berbagai kegiatan sosial kampus lintas fakultas',
  },
  {
    tahun: '2022',
    posisi: 'Staf PSDM BEM',
    detail: 'Bertanggung jawab pengembangan SDM anggota organisasi',
  },
]

const createDetail = (base: Candidate): CandidateDetail => ({
  ...base,
  tagline: 'Mewujudkan kampus yang inklusif dan berdaya untuk semua',
  verified: true,
  visi:
    'Mewujudkan BEM sebagai organisasi yang inklusif, responsif, dan berdaya guna bagi seluruh mahasiswa dengan mengedepankan transparansi, kolaborasi, dan inovasi.',
  misi: [
    'Menyediakan ruang aspirasi yang responsif dan terbuka bagi seluruh mahasiswa',
    'Mendorong kegiatan ekstrakurikuler yang merata di semua fakultas',
    'Menerapkan transparansi penuh dalam pengelolaan dana kegiatan kemahasiswaan',
    'Membangun kolaborasi aktif lintas fakultas dan organisasi mahasiswa',
    'Mengoptimalkan digitalisasi layanan kemahasiswaan untuk kemudahan akses',
  ],
  programKerja: sharedPrograms,
  pengalaman: sharedExperience,
  kampanye: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    posterUrl: '/poster-kampanye.jpg',
    pdfUrl: '/program-kerja.pdf',
  },
})

export const mockCandidateDetails: Record<number, CandidateDetail> = Object.fromEntries(
  mockCandidates.map((candidate) => [candidate.id, createDetail(candidate)]),
)

export const getCandidateById = (id: number): CandidateDetail | null => mockCandidateDetails[id] ?? null
