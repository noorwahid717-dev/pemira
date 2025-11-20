import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  initialTPSHistory,
  initialTPSLogs,
  initialTPSQueue,
  panitiaProfile,
  tpsPanelInfo,
  tpsQueueFeed,
  tpsStaticQRInfo,
} from '../data/tpsPanel'
import type {
  TPSActivityLog,
  TPSHistoryRecord,
  TPSPanelInfo,
  TPSPanitiaProfile,
  TPSPanelNotification,
  TPSQueueEntry,
  TPSQueueFeedPayload,
  TPSQueueStatus,
  TPSStaticQRInfo,
  TPSVotingMode,
} from '../types/tpsPanel'

type QueueSnapshotEntry = Omit<TPSQueueEntry, 'token' | 'verifiedAt'> & {
  id?: string
  token?: string
  verifiedAt?: string
}

type QueueSnapshotResponse = {
  panel?: Partial<Pick<TPSPanelInfo, 'status' | 'totalVoters'>>
  queue: QueueSnapshotEntry[]
}

const QR_ROTATION_INTERVAL = 30

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

const createToken = () => {
  const chunk = Math.random().toString(16).slice(2, 10)
  return `tps_1_${chunk}`
}

type UpdateQueueOptions = {
  reason?: string
  notify?: boolean
}

type TPSPanelContextValue = {
  panelInfo: TPSPanelInfo
  panitia: TPSPanitiaProfile
  staticQr: TPSStaticQRInfo
  queue: TPSQueueEntry[]
  logs: TPSActivityLog[]
  historyRecords: TPSHistoryRecord[]
  qrToken: string
  tokenExpiresIn: number
  panelMode: TPSVotingMode
  notification: TPSPanelNotification | null
  refreshQrToken: () => void
  setPanelStatus: (status: string) => void
  triggerManualRefresh: () => void
  updateQueueStatus: (entryId: string, status: TPSQueueStatus, options?: UpdateQueueOptions) => void
  addQueueEntry: (entry: Omit<TPSQueueEntry, 'id' | 'status' | 'token' | 'waktuScan'>) => void
  removeFromQueue: (entryId: string) => void
  dismissNotification: () => void
  setPanelMode: (mode: TPSVotingMode) => void
}

const TPSPanelContext = createContext<TPSPanelContextValue | undefined>(undefined)

export const TPSPanelProvider = ({ children }: { children: ReactNode }) => {
  const [panelInfo, setPanelInfo] = useState<TPSPanelInfo>(tpsPanelInfo)
  const [queue, setQueue] = useState<TPSQueueEntry[]>(initialTPSQueue)
  const [logs, setLogs] = useState<TPSActivityLog[]>(initialTPSLogs)
  const [historyRecords, setHistoryRecords] = useState<TPSHistoryRecord[]>(initialTPSHistory)
  const [qrToken, setQrToken] = useState<string>(createToken)
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number>(QR_ROTATION_INTERVAL)
  const [notification, setNotification] = useState<TPSPanelNotification | null>(null)
  const [panelMode, setPanelMode] = useState<TPSVotingMode>('mobile')

  const feedRef = useRef<TPSQueueFeedPayload[]>([...tpsQueueFeed])

  const pushLog = useCallback((message: string) => {
    setLogs((prev) => {
      const entry: TPSActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        message,
      }
      const next = [entry, ...prev]
      return next.slice(0, 20)
    })
  }, [])

  const showNotification = useCallback((payload: Omit<TPSPanelNotification, 'id'>) => {
    setNotification({ ...payload, id: generateId('notif') })
  }, [])

  const pushHistory = useCallback((record: Omit<TPSHistoryRecord, 'id' | 'timestamp'>) => {
    setHistoryRecords((prev) => {
      const entry: TPSHistoryRecord = {
        ...record,
        id: generateId('history'),
        timestamp: new Date().toISOString(),
      }
      const next = [entry, ...prev]
      return next.slice(0, 100)
    })
  }, [])

  const setPanelStatus = useCallback(
    (status: string) => {
      setPanelInfo((prevInfo) => ({ ...prevInfo, status }))
      const isOpening = status === 'Aktif'
      const activityLabel = isOpening ? 'TPS dibuka' : 'TPS ditutup'
      pushLog(`${activityLabel} oleh ${panitiaProfile.nama}`)
      pushHistory({
        type: isOpening ? 'open' : 'close',
        nama: `Panitia: ${panitiaProfile.nama}`,
        detail: `${activityLabel} (${panelInfo.tpsName})`,
      })
    },
    [panelInfo.tpsName, pushHistory, pushLog],
  )

  const rotateQrToken = useCallback((source: 'auto' | 'manual' = 'auto') => {
    setQrToken(createToken())
    setTokenExpiresIn(QR_ROTATION_INTERVAL)
    const label = source === 'manual' ? 'QR diperbarui manual oleh panitia' : 'QR baru dibuat otomatis'
    pushLog(label)
    pushHistory({ type: 'qr', detail: label })
    showNotification({
      type: 'info',
      title: 'Token QR diperbarui',
      message: source === 'manual' ? 'Token baru siap dipindai oleh pemilih.' : 'Token berganti otomatis untuk keamanan.',
    })
  }, [pushHistory, pushLog, showNotification])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTokenExpiresIn((prev) => {
        if (prev <= 1) {
          rotateQrToken('auto')
          return QR_ROTATION_INTERVAL
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [rotateQrToken])

  const addQueueEntry = useCallback(
    (entry: Omit<TPSQueueEntry, 'id' | 'status' | 'token' | 'waktuScan'>) => {
      const payload: TPSQueueEntry = {
        ...entry,
        id: generateId('queue'),
        status: 'waiting',
        token: createToken(),
        waktuScan: new Date().toISOString(),
      }
      setQueue((prev) => [payload, ...prev])
      pushLog(`${payload.nama} scan QR dan menunggu verifikasi`)
      pushHistory({ type: 'open', nim: payload.nim, nama: payload.nama, detail: 'Scan QR TPS' })
      showNotification({
        type: 'queue',
        title: 'Pemilih baru scan QR',
        message: `${payload.nama} (${payload.nim}) menunggu verifikasi`,
        entryId: payload.id,
      })
    },
    [pushHistory, pushLog, showNotification],
  )

  const updateQueueStatus = useCallback(
    (entryId: string, status: TPSQueueStatus, options?: UpdateQueueOptions) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === entryId)
        if (!target) return prev
        const transformed = prev.map((item) => {
          if (item.id !== entryId) return item
          return {
            ...item,
            status,
            verifiedAt: status === 'verified' ? new Date().toISOString() : item.verifiedAt,
            hasVoted: status === 'verified' ? true : item.hasVoted,
            rejectionReason: options?.reason ?? item.rejectionReason,
          }
        })

        const baseMessage =
          status === 'verified'
            ? `${target.nama} diverifikasi dan diarahkan voting`
            : status === 'rejected'
              ? `${target.nama} ditolak (${options?.reason ?? 'tanpa alasan'})`
              : `${target.nama} dikeluarkan dari antrean`

        pushLog(baseMessage)

        const historyPayload: Omit<TPSHistoryRecord, 'id' | 'timestamp'> = {
          type: status === 'verified' ? 'verification' : 'rejection',
          nim: target.nim,
          nama: target.nama,
          detail:
            status === 'verified'
              ? 'Diizinkan voting'
              : options?.reason
                ? `Ditolak - ${options.reason}`
                : 'Ditolak',
        }
        pushHistory(historyPayload)

        if (status === 'verified' && target.status !== 'verified') {
          setPanelInfo((prevInfo) => ({ ...prevInfo, totalVoters: prevInfo.totalVoters + 1 }))
        }

        if (options?.notify !== false) {
          showNotification({
            type: status === 'verified' ? 'success' : 'warning',
            title: status === 'verified' ? 'Akses Voting Disetujui' : 'Antrean diperbarui',
            message: baseMessage,
            entryId,
          })
        }

        return transformed
      })
    },
    [pushHistory, pushLog, showNotification],
  )

  const removeFromQueue = useCallback(
    (entryId: string) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === entryId)
        if (!target) return prev
        pushLog(`${target.nama} dihapus dari antrean`)
        pushHistory({ type: 'rejection', nim: target.nim, nama: target.nama, detail: 'Dihapus dari antrean' })
        return prev.filter((item) => item.id !== entryId)
      })
      showNotification({
        type: 'warning',
        title: 'Antrean dihapus',
        message: 'Pemilih dihapus dari antrean oleh panitia.',
        entryId,
      })
    },
    [pushHistory, pushLog, showNotification],
  )

  const fetchQueueSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`/api/tpsQueue.json?ts=${Date.now()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch snapshot')
      }
      const payload = (await response.json()) as QueueSnapshotResponse
      setQueue(
        payload.queue.map((item) => ({
          ...item,
          id: item.id ?? generateId('queue'),
          token: item.token ?? createToken(),
        })),
      )
      if (payload.panel) {
        setPanelInfo((prev) => ({ ...prev, ...payload.panel }))
      }
      pushLog('Queue disinkron dari endpoint TPS')
      pushHistory({ type: 'open', detail: 'Sinkronisasi data queue manual' })
      showNotification({
        type: 'info',
        title: 'Data queue diperbarui',
        message: 'Daftar pemilih terbaru sudah dimuat.',
      })
    } catch (error) {
      console.error(error)
      showNotification({
        type: 'warning',
        title: 'Refresh gagal',
        message: 'Tidak dapat mengambil data TPS. Coba lagi beberapa saat.',
      })
    }
  }, [pushHistory, pushLog, setPanelInfo, showNotification])

  useEffect(() => {
    if (!feedRef.current.length) return

    let timer: number | undefined

    const scheduleNext = () => {
      if (!feedRef.current.length) return
      const nextPayload = feedRef.current.shift()
      if (!nextPayload) return

      timer = window.setTimeout(() => {
        addQueueEntry({
          nim: nextPayload.nim,
          nama: nextPayload.nama,
          fakultas: nextPayload.fakultas,
          prodi: nextPayload.prodi,
          statusMahasiswa: nextPayload.statusMahasiswa,
          mode: nextPayload.mode,
        })
        scheduleNext()
      }, nextPayload.delayMs)
    }

    scheduleNext()

    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [addQueueEntry])

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notification])

  const value = useMemo(
    () => ({
      panelInfo,
      panitia: panitiaProfile,
      staticQr: tpsStaticQRInfo,
      queue,
      logs,
      historyRecords,
      qrToken,
      tokenExpiresIn,
      notification,
      panelMode,
      refreshQrToken: () => rotateQrToken('manual'),
      setPanelStatus,
      triggerManualRefresh: () => {
        void fetchQueueSnapshot()
      },
      updateQueueStatus,
      addQueueEntry,
      removeFromQueue,
      dismissNotification: () => setNotification(null),
      setPanelMode,
    }),
    [
      addQueueEntry,
      fetchQueueSnapshot,
      historyRecords,
      logs,
      notification,
      panelInfo,
      panelMode,
      queue,
      qrToken,
      removeFromQueue,
      rotateQrToken,
      setPanelStatus,
      tokenExpiresIn,
      updateQueueStatus,
    ],
  )

  return <TPSPanelContext.Provider value={value}>{children}</TPSPanelContext.Provider>
}

export const useTPSPanelStore = () => {
  const context = useContext(TPSPanelContext)
  if (!context) {
    throw new Error('useTPSPanelStore must be used within TPSPanelProvider')
  }
  return context
}
