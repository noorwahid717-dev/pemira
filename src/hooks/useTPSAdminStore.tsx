import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { tpsAdminList } from '../data/tpsAdmin'
import type { TPSAdmin, TPSPanitia, TPSStatus } from '../types/tpsAdmin'

const generateId = () => Math.random().toString(36).slice(2, 8)

const initialForm: TPSAdmin = {
  id: '',
  kode: '',
  nama: '',
  fakultasArea: 'Semua Fakultas',
  lokasi: '',
  deskripsi: '',
  tipe: 'umum',
  tanggalVoting: '2024-06-12',
  jamBuka: '08:00',
  jamTutup: '16:00',
  kapasitas: 0,
  dptTarget: [],
  qrId: '',
  qrStatus: 'aktif',
  status: 'draft',
  panitia: [],
  totalSuara: 0,
}

const TPSAdminContext = createContext<{
  tpsList: TPSAdmin[]
  getById: (id: string) => TPSAdmin | undefined
  createEmpty: () => TPSAdmin
  saveTPS: (payload: TPSAdmin, mode: 'draft' | 'active') => void
  updatePanitia: (tpsId: string, panitia: TPSPanitia[]) => void
  isKodeAvailable: (kode: string, excludeId?: string) => boolean
} | null>(null)

export const TPSAdminProvider = ({ children }: { children: ReactNode }) => {
  const [tpsList, setTPSList] = useState<TPSAdmin[]>(tpsAdminList)

  const getById = useCallback((id: string) => tpsList.find((tps) => tps.id === id), [tpsList])

  const createEmpty = useCallback(() => ({ ...initialForm, id: `tps-${generateId()}` }), [])

  const saveTPS = useCallback((payload: TPSAdmin, mode: 'draft' | 'active') => {
    setTPSList((prev) => {
      const exists = prev.some((tps) => tps.id === payload.id)
      if (exists) {
        return prev.map((tps) => (tps.id === payload.id ? { ...payload, status: mode } : tps))
      }
      return [{ ...payload, status: mode }, ...prev]
    })
  }, [])

  const updatePanitia = useCallback((tpsId: string, panitia: TPSPanitia[]) => {
    setTPSList((prev) => prev.map((tps) => (tps.id === tpsId ? { ...tps, panitia } : tps)))
  }, [])

  const isKodeAvailable = useCallback(
    (kode: string, excludeId?: string) => !tpsList.some((tps) => tps.kode === kode && tps.id !== excludeId),
    [tpsList],
  )

  const value = useMemo(
    () => ({ tpsList, getById, createEmpty, saveTPS, updatePanitia, isKodeAvailable }),
    [createEmpty, getById, isKodeAvailable, saveTPS, tpsList, updatePanitia],
  )

  return <TPSAdminContext.Provider value={value}>{children}</TPSAdminContext.Provider>
}

export const useTPSAdminStore = () => {
  const context = useContext(TPSAdminContext)
  if (!context) throw new Error('useTPSAdminStore must be used within TPSAdminProvider')
  return context
}
