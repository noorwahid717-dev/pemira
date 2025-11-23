import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { assignPanitiaTps, createAdminTps, fetchAdminTpsDetail, fetchAdminTpsList, regenerateQrTps, updateAdminTps } from '../services/adminTps'
import type { TPSAdmin, TPSPanitia, TPSStatus } from '../types/tpsAdmin'
import { useAdminAuth } from './useAdminAuth'

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
  saveTPS: (payload: TPSAdmin, mode: TPSStatus) => Promise<TPSAdmin>
  updatePanitia: (tpsId: string, panitia: TPSPanitia[]) => Promise<void>
  isKodeAvailable: (kode: string, excludeId?: string) => boolean
  refresh: () => Promise<void>
  loadDetail: (id: string) => Promise<TPSAdmin | undefined>
  regenerateQr: (id: string) => Promise<void>
  loading: boolean
  error?: string
} | null>(null)

export const TPSAdminProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAdminAuth()
  const [tpsList, setTPSList] = useState<TPSAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const getById = useCallback((id: string) => tpsList.find((tps) => tps.id === id), [tpsList])

  const createEmpty = useCallback(() => ({ ...initialForm, id: `tps-${generateId()}` }), [])

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const items = await fetchAdminTpsList(token)
      setTPSList(items)
    } catch (err) {
      console.error('Failed to load TPS', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat TPS')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    setTPSList([])
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveTPS = useCallback(
    async (payload: TPSAdmin, mode: TPSStatus) => {
      const prepared = { ...payload, status: mode }
      if (!token) throw new Error('Admin token diperlukan untuk menyimpan TPS')
      const saved = payload.id && tpsList.some((tps) => tps.id === payload.id) ? await updateAdminTps(token, payload.id, prepared) : await createAdminTps(token, prepared)
      setTPSList((prev) => {
        const exists = prev.some((tps) => tps.id === saved.id)
        if (exists) return prev.map((tps) => (tps.id === saved.id ? saved : tps))
        return [saved, ...prev]
      })
      return saved
    },
    [tpsList, token],
  )

  const updatePanitia = useCallback(
    async (tpsId: string, panitia: TPSPanitia[]) => {
      if (!token) throw new Error('Admin token diperlukan untuk mengatur panitia TPS')
      await assignPanitiaTps(token, tpsId, panitia)
      setTPSList((prev) => prev.map((tps) => (tps.id === tpsId ? { ...tps, panitia } : tps)))
    },
    [token],
  )

  const loadDetail = useCallback(
    async (id: string) => {
      if (!token) return getById(id)
      try {
        const detail = await fetchAdminTpsDetail(token, id)
        setTPSList((prev) => {
          const exists = prev.some((tps) => tps.id === detail.id)
          if (exists) return prev.map((tps) => (tps.id === detail.id ? detail : tps))
          return [detail, ...prev]
        })
        return detail
      } catch (err) {
        console.error('Failed to load TPS detail', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat detail TPS')
        return undefined
      }
    },
    [getById, token],
  )

  const regenerateQr = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Admin token diperlukan untuk generate ulang QR')
      try {
        await regenerateQrTps(token, id)
        await loadDetail(id)
      } catch (err) {
        console.error('Failed to regenerate QR', err)
        setError((err as { message?: string })?.message ?? 'Gagal generate ulang QR')
      }
    },
    [loadDetail, token],
  )

  const isKodeAvailable = useCallback(
    (kode: string, excludeId?: string) => !tpsList.some((tps) => tps.kode === kode && tps.id !== excludeId),
    [tpsList],
  )

  const value = useMemo(
    () => ({
      tpsList,
      getById,
      createEmpty,
      saveTPS,
      updatePanitia,
      isKodeAvailable,
      refresh,
      loadDetail,
      regenerateQr,
      loading,
      error,
    }),
    [createEmpty, error, getById, isKodeAvailable, loadDetail, loading, refresh, regenerateQr, saveTPS, tpsList, updatePanitia],
  )

  return <TPSAdminContext.Provider value={value}>{children}</TPSAdminContext.Provider>
}

export const useTPSAdminStore = () => {
  const context = useContext(TPSAdminContext)
  if (!context) throw new Error('useTPSAdminStore must be used within TPSAdminProvider')
  return context
}
