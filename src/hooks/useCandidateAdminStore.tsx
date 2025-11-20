import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { candidateAdminList } from '../data/candidateAdmin'
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
  addCandidate: (payload: CandidateAdmin) => void
  updateCandidate: (id: string, payload: Partial<CandidateAdmin>) => void
  archiveCandidate: (id: string) => void
  createEmptyCandidate: () => CandidateAdmin
  isNumberAvailable: (number: number, excludeId?: string) => boolean
} | null>(null)

export const CandidateAdminProvider = ({ children }: { children: ReactNode }) => {
  const [candidates, setCandidates] = useState<CandidateAdmin[]>(candidateAdminList)

  const getCandidateById = useCallback((id: string) => candidates.find((candidate) => candidate.id === id), [candidates])

  const addCandidate = useCallback((payload: CandidateAdmin) => {
    setCandidates((prev) => [{ ...payload, id: generateId('cand') }, ...prev])
  }, [])

  const updateCandidate = useCallback((id: string, payload: Partial<CandidateAdmin>) => {
    setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, ...payload } : candidate)))
  }, [])

  const archiveCandidate = useCallback(
    (id: string) => {
      setCandidates((prev) =>
        prev.map((candidate) => (candidate.id === id ? { ...candidate, status: 'hidden' as CandidateStatus } : candidate)),
      )
    },
    [],
  )

  const createEmptyCandidate = useCallback(() => ({ ...defaultCandidate, id: generateId('cand') }), [])

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
    }),
    [archiveCandidate, candidates, getCandidateById, isNumberAvailable, updateCandidate, addCandidate, createEmptyCandidate],
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
