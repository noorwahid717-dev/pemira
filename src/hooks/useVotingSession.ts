import { useCallback, useMemo, useState } from 'react'
import { getVoterProfileByNim } from '../data/mockVoters'
import type { VoterProfile, VoterSession } from '../types/voting'

const fallbackProfile: VoterProfile = {
  nama: 'Ahmad Fauzi',
  nim: '2110510023',
  fakultas: 'Fakultas Teknik',
}

const readSession = (): VoterSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem('currentUser')
  if (!raw) return null

  try {
    return JSON.parse(raw) as VoterSession
  } catch {
    return null
  }
}

const persistSession = (value: VoterSession | null) => {
  if (typeof window === 'undefined') return
  if (value) {
    window.sessionStorage.setItem('currentUser', JSON.stringify(value))
  } else {
    window.sessionStorage.removeItem('currentUser')
  }
}

export const useVotingSession = () => {
  const [session, setSession] = useState<VoterSession | null>(() => readSession())

  const setSessionAndPersist = useCallback((value: VoterSession | null) => {
    persistSession(value)
    setSession(value)
  }, [])

  const refreshSession = useCallback(() => {
    setSession(readSession())
  }, [])

  const updateSession = useCallback((updates: Partial<VoterSession>) => {
    setSession((prev) => {
      if (!prev) return prev
      const next: VoterSession = { ...prev, ...updates }
      persistSession(next)
      return next
    })
  }, [])

  const clearSession = useCallback(() => {
    setSessionAndPersist(null)
  }, [setSessionAndPersist])

  const mahasiswa = useMemo<VoterProfile>(() => {
    if (!session) return fallbackProfile
    return getVoterProfileByNim(session.nim) ?? fallbackProfile
  }, [session])

  return {
    session,
    hasSession: Boolean(session),
    mahasiswa,
    updateSession,
    refreshSession,
    clearSession,
    setSession: setSessionAndPersist,
  }
}
