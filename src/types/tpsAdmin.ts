export type TPSStatus = 'draft' | 'active' | 'closed'

export type TPSType = 'umum' | 'fakultas'

export type TPSPanitia = {
  id: string
  nama: string
  peran: string
}

export type TPSAdmin = {
  id: string
  kode: string
  nama: string
  fakultasArea: string
  lokasi: string
  deskripsi?: string
  tipe: TPSType
  tanggalVoting: string
  jamBuka: string
  jamTutup: string
  kapasitas: number
  dptTarget: string[]
  qrId: string
  qrStatus: 'aktif' | 'nonaktif'
  status: TPSStatus
  panitia: TPSPanitia[]
  totalSuara: number
}
