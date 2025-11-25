import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createAdminTps,
  fetchAdminTpsDetail,
  fetchAdminTpsList,
  fetchAdminTpsQrForPrint,
  fetchAdminTpsQrMetadata,
  deleteAdminTps,
  rotateAdminTpsQr,
  updateAdminTps,
} from '../services/adminTps'
import type { TPSAdmin } from '../types/tpsAdmin'
import { useAdminAuth } from './useAdminAuth'
import { useActiveElection } from './useActiveElection'

const initialForm: TPSAdmin = {
  id: '',
  kode: '',
  nama: '',
  lokasi: '',
  kapasitas: 0,
  jamBuka: '08:00',
  jamTutup: '17:00',
  picNama: '',
  picKontak: '',
  catatan: '',
  status: 'active',
  qrAktif: false,
}

const TPSAdminContext = createContext<{
  tpsList: TPSAdmin[]
  getById: (id: string) => TPSAdmin | undefined
  createEmpty: () => TPSAdmin
  saveTPS: (payload: TPSAdmin) => Promise<TPSAdmin>
  isKodeAvailable: (kode: string, excludeId?: string) => boolean
  refresh: () => Promise<void>
  loadDetail: (id: string) => Promise<TPSAdmin | undefined>
  rotateQr: (id: string) => Promise<TPSAdmin | undefined>
  deleteTPS: (id: string) => Promise<void>
  loading: boolean
  error?: string
} | null>(null)

export const TPSAdminProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [tpsList, setTPSList] = useState<TPSAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const getById = useCallback((id: string) => tpsList.find((tps) => tps.id === id), [tpsList])

  const createEmpty = useCallback(() => ({ ...initialForm }), [])

  const refresh = useCallback(async () => {
    if (!token || !activeElectionId) return
    setLoading(true)
    setError(undefined)
    try {
      const items = await fetchAdminTpsList(token, activeElectionId)
      setTPSList(items)
    } catch (err) {
      console.error('Failed to load TPS', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat TPS')
    } finally {
      setLoading(false)
    }
  }, [activeElectionId, token])

  useEffect(() => {
    setTPSList([])
  }, [token, activeElectionId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveTPS = useCallback(
    async (payload: TPSAdmin) => {
      if (!token) throw new Error('Admin token diperlukan untuk menyimpan TPS')
      const isUpdate = Boolean(payload.id && tpsList.some((tps) => tps.id === payload.id))
      let saved = isUpdate ? await updateAdminTps(token, payload.id, payload, activeElectionId) : await createAdminTps(token, payload, activeElectionId)
      if (!isUpdate && payload.status === 'inactive' && saved.status !== 'inactive') {
        saved = await updateAdminTps(token, saved.id, { ...saved, status: 'inactive' })
      }
      setTPSList((prev) => {
        const exists = prev.some((tps) => tps.id === saved.id)
        if (exists) return prev.map((tps) => (tps.id === saved.id ? saved : tps))
        return [saved, ...prev]
      })
      return saved
    },
    [activeElectionId, tpsList, token],
  )

  const loadDetail = useCallback(
    async (id: string) => {
      if (!token) return undefined
      if (!/^\d+$/.test(id)) {
        setError('ID TPS tidak valid')
        return undefined
      }
      setLoading(true)
      setError(undefined)
      try {
        const [detail, qrMeta] = await Promise.all([
          fetchAdminTpsDetail(token, id, activeElectionId),
          fetchAdminTpsQrMetadata(token, id).catch(() => undefined),
        ])
        const qrPayload = qrMeta?.qrAktif ? await fetchAdminTpsQrForPrint(token, id).catch(() => undefined) : undefined
        const merged: TPSAdmin = {
          ...detail,
          qrAktif: qrMeta?.qrAktif ?? detail.qrAktif,
          qrToken: qrMeta?.qrToken ?? detail.qrToken,
          qrCreatedAt: qrMeta?.qrCreatedAt ?? detail.qrCreatedAt,
          qrPayload: qrPayload ?? detail.qrPayload,
        }
        setTPSList((prev) => {
          const exists = prev.some((tps) => tps.id === merged.id)
          if (exists) return prev.map((tps) => (tps.id === merged.id ? merged : tps))
          return [merged, ...prev]
        })
        return merged
      } catch (err) {
        console.error('Failed to load TPS detail', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat detail TPS')
        return undefined
      } finally {
        setLoading(false)
      }
    },
    [activeElectionId, token],
  )

  const rotateQr = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Admin token diperlukan untuk generate ulang QR')
      try {
        const rotated = await rotateAdminTpsQr(token, id)
        const payload = rotated.qrAktif ? await fetchAdminTpsQrForPrint(token, id).catch(() => undefined) : undefined
        setTPSList((prev) =>
          prev.map((tps) =>
            tps.id === id
              ? {
                  ...tps,
                  qrAktif: rotated.qrAktif,
                  qrToken: rotated.qrToken ?? tps.qrToken,
                  qrCreatedAt: rotated.qrCreatedAt ?? tps.qrCreatedAt,
                  qrPayload: payload ?? tps.qrPayload,
                }
              : tps,
          ),
        )
        return await loadDetail(id)
      } catch (err) {
        console.error('Failed to regenerate QR', err)
        setError((err as { message?: string })?.message ?? 'Gagal generate ulang QR')
        return undefined
      }
    },
    [loadDetail, token],
  )

  const deleteTPS = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Admin token diperlukan untuk menghapus TPS')
      await deleteAdminTps(token, id)
      setTPSList((prev) => prev.filter((tps) => tps.id !== id))
    },
    [token],
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
      isKodeAvailable,
      refresh,
      loadDetail,
      rotateQr,
      deleteTPS,
      loading,
      error,
    }),
    [createEmpty, deleteTPS, error, getById, isKodeAvailable, loadDetail, loading, refresh, rotateQr, saveTPS, tpsList],
  )

  return <TPSAdminContext.Provider value={value}>{children}</TPSAdminContext.Provider>
}

export const useTPSAdminStore = () => {
  const context = useContext(TPSAdminContext)
  if (!context) throw new Error('useTPSAdminStore must be used within TPSAdminProvider')
  return context
}
