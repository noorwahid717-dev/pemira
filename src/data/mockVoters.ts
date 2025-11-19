import type { DemoVoter, VoterProfile } from '../types/voting'

export const mockVoters: DemoVoter[] = [
  {
    nim: '2110510001',
    nama: 'Budi Santoso',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    tanggalLahir: '01/01/2000',
    hasVoted: false,
    votingStatus: 'open',
  },
  {
    nim: '2110510002',
    nama: 'Siti Nurhaliza',
    fakultas: 'Fakultas Ekonomi dan Bisnis',
    prodi: 'Manajemen',
    tanggalLahir: '02/02/2000',
    hasVoted: true,
    votingStatus: 'open',
  },
  {
    nim: '2110510003',
    nama: 'Ahmad Fauzi',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    tanggalLahir: '03/03/2000',
    hasVoted: false,
    votingStatus: 'not_started',
  },
  {
    nim: '2110510004',
    nama: 'Dewi Lestari',
    fakultas: 'Fakultas Hukum',
    prodi: 'Ilmu Hukum',
    tanggalLahir: '04/04/2000',
    hasVoted: true,
    votingStatus: 'closed',
  },
]

export const findDemoVoterByNim = (nim: string): DemoVoter | undefined =>
  mockVoters.find((voter) => voter.nim === nim)

export const getVoterProfileByNim = (nim: string): VoterProfile | null => {
  const voter = findDemoVoterByNim(nim)
  if (!voter) return null
  const { nama, fakultas, prodi } = voter
  return { nama, nim, fakultas, prodi }
}

type CredentialParams =
  | { method: 'otp'; nim: string; otp?: string }
  | { method: 'birthdate'; nim: string; tanggalLahir?: string }

export const validateDemoCredentials = (params: CredentialParams): DemoVoter | null => {
  const voter = findDemoVoterByNim(params.nim)
  if (!voter) return null

  if (params.method === 'otp') {
    return params.otp === '123456' ? voter : null
  }

  return params.tanggalLahir && params.tanggalLahir === voter.tanggalLahir ? voter : null
}
