import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createAdminCandidate, fetchAdminCandidates, updateAdminCandidate } from '../services/adminCandidates'
import { useAdminAuth } from './useAdminAuth'
import type { CandidateAdmin, CandidateProgramAdmin, CandidateStatus } from '../types/candidateAdmin'

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

const defaultCandidate: CandidateAdmin = {
  id: '',
  number: 0,
  name: '',
  faculty: '',
  programStudi: '',
  angkatan: '',
  status: 'draft',
  photoUrl: '',
  photoMediaId: null,
  tagline: '',
  shortBio: '',
  longBio: '',
  visionTitle: '',
  visionDescription: '',
  missions: [],
  programs: [],
  media: [],
  campaignVideo: '',
}

const CandidateAdminContext = createContext<{
  candidates: CandidateAdmin[]
  getCandidateById: (id: string) => CandidateAdmin | undefined
  addCandidate: (payload: CandidateAdmin) => Promise<CandidateAdmin>
  updateCandidate: (id: string, payload: Partial<CandidateAdmin>) => Promise<CandidateAdmin>
  archiveCandidate: (id: string) => void
  createEmptyCandidate: () => CandidateAdmin
  isNumberAvailable: (number: number, excludeId?: string) => boolean
  refresh: () => Promise<void>
  loading: boolean
  error?: string
} | null>(null)

export const CandidateAdminProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAdminAuth()
  const [candidates, setCandidates] = useState<CandidateAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const items = await fetchAdminCandidates(token)
      setCandidates(items)
    } catch (err) {
      console.error('Failed to fetch candidates', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat kandidat')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    setCandidates([])
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getCandidateById = useCallback((id: string) => candidates.find((candidate) => candidate.id === id), [candidates])

  const createEmptyCandidate = useCallback(() => ({ ...defaultCandidate, id: generateId('cand') }), [])

  const addCandidate = useCallback(
    async (payload: CandidateAdmin) => {
      if (!token) throw new Error('Admin token diperlukan untuk menambah kandidat')
      const created = await createAdminCandidate(token, payload)
      setCandidates((prev) => [created, ...prev])
      return created
    },
    [token],
  )

  const updateCandidate = useCallback(
    async (id: string, payload: Partial<CandidateAdmin>) => {
      const baseCandidate = getCandidateById(id) ?? { ...createEmptyCandidate(), id }
      if (!token) throw new Error('Admin token diperlukan untuk memperbarui kandidat')
      const updated = await updateAdminCandidate(token, id, { ...baseCandidate, ...payload } as CandidateAdmin)
      setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? updated : candidate)))
      return updated
    },
    [createEmptyCandidate, getCandidateById, token],
  )

  const archiveCandidate = useCallback(
    (id: string) => {
      setCandidates((prev) =>
        prev.map((candidate) => (candidate.id === id ? { ...candidate, status: 'hidden' as CandidateStatus } : candidate)),
      )
    },
    [],
  )

  const isNumberAvailable = useCallback(
    (number: number, excludeId?: string) => {
      return !candidates.some((candidate) => candidate.number === number && candidate.id !== excludeId)
    },
    [candidates],
  )

  const value = useMemo(
    () => ({
      candidates,
      getCandidateById,
      addCandidate,
      updateCandidate,
      archiveCandidate,
      createEmptyCandidate,
      isNumberAvailable,
      refresh,
      loading,
      error,
    }),
    [archiveCandidate, candidates, createEmptyCandidate, error, getCandidateById, isNumberAvailable, loading, refresh, updateCandidate, addCandidate],
  )

  return <CandidateAdminContext.Provider value={value}>{children}</CandidateAdminContext.Provider>
}

export const useCandidateAdminStore = () => {
  const context = useContext(CandidateAdminContext)
  if (!context) {
    throw new Error('useCandidateAdminStore must be used within CandidateAdminProvider')
  }
  return context
}
