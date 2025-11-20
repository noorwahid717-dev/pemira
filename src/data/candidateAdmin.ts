import type { CandidateAdmin } from '../types/candidateAdmin'

export const candidateAdminList: CandidateAdmin[] = [
  {
    id: 'cand-1',
    number: 1,
    name: 'Bagas Prasetyo',
    faculty: 'Fakultas Teknik',
    programStudi: 'Teknik Informatika',
    angkatan: '2020',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80',
    visionTitle: 'BEM UNAIR sebagai Wadah Kolaborasi',
    visionDescription: 'Menghadirkan BEM yang transparan, adaptif, dan responsif terhadap kebutuhan mahasiswa di era digital.',
    missions: [
      'Membangun sistem layanan mahasiswa berbasis teknologi',
      'Menguatkan kolaborasi lintas fakultas',
      'Memperluas dampak pengabdian masyarakat',
    ],
    programs: [
      {
        id: 'prog-1',
        title: 'Digitalisasi Layanan Mahasiswa',
        description: 'Portal terpadu untuk semua kebutuhan administrasi dan kegiatan mahasiswa.',
      },
      {
        id: 'prog-2',
        title: 'Kolaborasi Fakultas',
        description: 'Program pendanaan kegiatan gabungan antar UKM lintas fakultas.',
      },
    ],
    media: [
      { id: 'media-1', type: 'photo', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', label: 'Foto Kampanye 1' },
      { id: 'media-2', type: 'pdf', url: '/docs/visi-misi.pdf', label: 'Dokumen Visi' },
    ],
    campaignVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'cand-2',
    number: 2,
    name: 'Rani Wahyu',
    faculty: 'Fakultas Ekonomi',
    programStudi: 'Manajemen',
    angkatan: '2019',
    status: 'draft',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    visionTitle: 'BEM Humanis dan Transparan',
    visionDescription: 'Menjadikan BEM sebagai rumah bagi gagasan mahasiswa dengan tata kelola transparan.',
    missions: ['Meningkatkan literasi finansial mahasiswa', 'Menyediakan kanal aspirasi 24/7'],
    programs: [
      {
        id: 'prog-3',
        title: 'Program Inkubasi Usaha Mahasiswa',
        description: 'Pendampingan bisnis bagi mahasiswa selama 6 bulan.',
      },
    ],
    media: [],
  },
  {
    id: 'cand-3',
    number: 3,
    name: 'Fajar Nur',
    faculty: 'Fakultas Sains & Teknologi',
    programStudi: 'Sistem Informasi',
    angkatan: '2021',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
    visionTitle: 'BEM sebagai Pusat Inovasi',
    visionDescription: 'Mendorong budaya inovasi dan riset mahasiswa dengan dukungan fasilitas kampus.',
    missions: ['Mendirikan lab inovasi mahasiswa', 'Menyediakan dana riset tahunan'],
    programs: [
      { id: 'prog-4', title: 'Festival Inovasi', description: 'Ajang tahunan memamerkan produk inovasi mahasiswa.' },
      { id: 'prog-5', title: 'Grant Riset Mahasiswa', description: 'Pendanaan kompetitif untuk proyek riset mahasiswa.' },
    ],
    media: [
      { id: 'media-3', type: 'photo', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', label: 'Poster Kampanye' },
    ],
  },
]
