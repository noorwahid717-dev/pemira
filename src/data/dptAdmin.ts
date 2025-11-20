import type { DPTEntry, ImportPreviewError, ImportStep } from '../types/dptAdmin'

export const dptListMock: DPTEntry[] = [
  {
    id: 'dpt-1',
    nim: '2110510023',
    nama: 'Noah Febriyansyah',
    fakultas: 'Teknik',
    prodi: 'Informatika',
    angkatan: '2021',
    akademik: 'aktif',
    statusSuara: 'belum',
    metodeVoting: '-',
  },
  {
    id: 'dpt-2',
    nim: '2109920344',
    nama: 'Rani Putri',
    fakultas: 'Ekonomi',
    prodi: 'Manajemen',
    angkatan: '2020',
    akademik: 'aktif',
    statusSuara: 'sudah',
    metodeVoting: 'online',
    waktuVoting: '2024-06-12T10:24:00',
  },
  {
    id: 'dpt-3',
    nim: '2108810041',
    nama: 'Dimas Pratama',
    fakultas: 'Hukum',
    prodi: 'Ilmu Hukum',
    angkatan: '2019',
    akademik: 'cuti',
    statusSuara: 'sudah',
    metodeVoting: 'TPS 2',
    waktuVoting: '2024-06-12T10:32:00',
  },
]

export const importSteps: ImportStep[] = [1, 2, 3, 4]

export const importErrorsMock: ImportPreviewError[] = [
  { row: 23, message: 'NIM kosong' },
  { row: 48, message: 'NIM duplikat' },
]
