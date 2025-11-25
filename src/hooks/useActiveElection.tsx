import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createAdminElection, fetchAdminElectionList, type AdminElectionCreatePayload, type AdminElectionResponse } from '../services/adminElection'
import { fetchActiveElectionSetting, fetchAdminSettings, updateActiveElectionSetting, type AdminSettings } from '../services/adminSettings'
import { fetchCurrentElection } from '../services/publicElection'
import type { ApiError } from '../utils/apiClient'
import { useAdminAuth } from './useAdminAuth'
import {
  getActiveElectionId,
  getDefaultElectionId,
  setActiveElectionId as setGlobalActiveElectionId,
  setDefaultElectionId as setGlobalDefaultElectionId,
} from '../state/activeElection'

type ActiveElectionContextValue = {
  activeElectionId: number
  defaultElectionId: number
  elections: AdminElectionResponse[]
  loading: boolean
  updating: boolean
  error?: string
  refresh: () => Promise<void>
  refreshElections: () => Promise<void>
  setActiveElection: (id: number) => Promise<number>
  createElection: (payload: AdminElectionCreatePayload) => Promise<AdminElectionResponse>
}

const ActiveElectionContext = createContext<ActiveElectionContextValue | null>(null)

const toNumber = (value: unknown): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const extractIdsFromSettings = (settings?: Partial<AdminSettings>) => ({
  active: toNumber(settings?.active_election_id ?? (settings as any)?.activeElectionId ?? (settings as any)?.value),
  default: toNumber(settings?.default_election_id ?? (settings as any)?.defaultElectionId),
})

export const ActiveElectionProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAdminAuth()
  const [activeElectionId, setActiveElectionId] = useState<number>(getActiveElectionId())
  const [defaultElectionId, setDefaultElectionId] = useState<number>(getDefaultElectionId())
  const [elections, setElections] = useState<AdminElectionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const syncIds = useCallback(
    (activeId?: number, defaultId?: number) => {
      const resolvedDefault = toNumber(defaultId) ?? toNumber(defaultElectionId) ?? getDefaultElectionId()
      const resolvedActive = toNumber(activeId) ?? activeElectionId ?? resolvedDefault ?? getActiveElectionId()

      if (toNumber(resolvedDefault) !== undefined) {
        const nextDefault = resolvedDefault as number
        setDefaultElectionId(nextDefault)
        setGlobalDefaultElectionId(nextDefault)
      }
      if (toNumber(resolvedActive) !== undefined) {
        const nextActive = resolvedActive as number
        setActiveElectionId(nextActive)
        setGlobalActiveElectionId(nextActive)
      }
    },
    [activeElectionId, defaultElectionId],
  )

  const refreshElections = useCallback(async () => {
    if (!token) {
      setElections([])
      return
    }
    try {
      const list = await fetchAdminElectionList(token)
      setElections(list)
    } catch (err) {
      console.warn('Failed to fetch elections list', err)
    }
  }, [token])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      if (token) {
        let settings: AdminSettings | null = null
        try {
          settings = await fetchAdminSettings(token)
        } catch (err) {
          console.warn('Primary settings endpoint failed, fallback to active-election only', err)
          settings = await fetchActiveElectionSetting(token)
        }
        const { active, default: defaultId } = extractIdsFromSettings(settings ?? undefined)
        syncIds(active, defaultId ?? active)
        await refreshElections()
      } else {
        try {
          const current = await fetchCurrentElection()
          syncIds(current.id, current.id)
        } catch (err) {
          console.warn('Failed to fetch public current election, using fallback', err)
          syncIds(getActiveElectionId(), getDefaultElectionId())
        }
        setElections([])
      }
    } catch (err) {
      console.error('Failed to refresh election settings', err)
      setError((err as ApiError)?.message ?? 'Gagal memuat pengaturan pemilu')
    } finally {
      setLoading(false)
    }
  }, [refreshElections, syncIds, token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setActiveElection = useCallback(
    async (id: number) => {
      if (!token) throw new Error('Admin harus login untuk mengatur pemilu aktif')
      setUpdating(true)
      setError(undefined)
      try {
        const settings = await updateActiveElectionSetting(token, id)
        const { active, default: defaultId } = extractIdsFromSettings(settings)
        syncIds(active ?? id, defaultId ?? active ?? id)
        await refreshElections()
        return active ?? id
      } catch (err) {
        console.error('Failed to update active election', err)
        setError((err as ApiError)?.message ?? 'Gagal mengubah pemilu aktif')
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [refreshElections, syncIds, token],
  )

  const createElection = useCallback(
    async (payload: AdminElectionCreatePayload) => {
      if (!token) throw new Error('Admin harus login untuk membuat pemilu baru')
      setUpdating(true)
      setError(undefined)
      try {
        const created = await createAdminElection(token, payload)
        setElections((prev) => {
          const filtered = prev.filter((item) => item.id !== created.id)
          return [created, ...filtered]
        })
        return created
      } catch (err) {
        console.error('Failed to create election', err)
        setError((err as ApiError)?.message ?? 'Gagal membuat pemilu baru')
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [token],
  )

  const value = useMemo<ActiveElectionContextValue>(
    () => ({
      activeElectionId,
      defaultElectionId,
      elections,
      loading,
      updating,
      error,
      refresh,
      refreshElections,
      setActiveElection,
      createElection,
    }),
    [activeElectionId, createElection, defaultElectionId, elections, error, loading, refresh, refreshElections, setActiveElection, updating],
  )

  return <ActiveElectionContext.Provider value={value}>{children}</ActiveElectionContext.Provider>
}

export const useActiveElection = () => {
  const ctx = useContext(ActiveElectionContext)
  if (!ctx) throw new Error('useActiveElection must be used within ActiveElectionProvider')
  return ctx
}
