import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dptListMock, importErrorsMock } from '../data/dptAdmin'
import { fetchAdminDpt } from '../services/adminDpt'
import { useAdminAuth } from './useAdminAuth'
import type { AcademicStatus, DPTEntry, ImportMapping, ImportPreviewError, ImportStep, VoterStatus } from '../types/dptAdmin'

const defaultMapping: ImportMapping = {
  nim: 'NIM',
  nama: 'Nama Lengkap',
  fakultas: 'Fakultas',
  prodi: 'Program Studi',
  angkatan: 'Angkatan',
  statusAkademik: 'Status',
  email: 'Email',
}

const DPTAdminContext = createContext<{
  voters: DPTEntry[]
  filters: {
    search: string
    fakultas: string
    angkatan: string
    statusSuara: VoterStatus | 'all'
    akademik: AcademicStatus | 'all'
  }
  setFilters: React.Dispatch<React.SetStateAction<{ search: string; fakultas: string; angkatan: string; statusSuara: VoterStatus | 'all'; akademik: AcademicStatus | 'all' }>>
  selected: Set<string>
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  importStep: ImportStep
  setImportStep: React.Dispatch<React.SetStateAction<ImportStep>>
  importFileName?: string
  setImportFileName: (value?: string) => void
  mapping: ImportMapping
  setMapping: React.Dispatch<React.SetStateAction<ImportMapping>>
  importErrors: ImportPreviewError[]
  resetImport: () => void
  refresh: () => Promise<void>
  loading: boolean
  error?: string
} | null>(null)

export const DPTAdminProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAdminAuth()
  const [voters, setVoters] = useState<DPTEntry[]>(token ? [] : dptListMock)
  const [filters, setFilters] = useState({ search: '', fakultas: 'all', angkatan: 'all', statusSuara: 'all' as VoterStatus | 'all', akademik: 'all' as AcademicStatus | 'all' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importStep, setImportStep] = useState<ImportStep>(1)
  const [importFileName, setImportFileName] = useState<string | undefined>(undefined)
  const [mapping, setMapping] = useState<ImportMapping>(defaultMapping)
  const [importErrors] = useState(importErrorsMock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const params = new URLSearchParams()
      if (filters.fakultas !== 'all') params.append('faculty', filters.fakultas)
      if (filters.angkatan !== 'all') params.append('cohort_year', filters.angkatan)
      if (filters.statusSuara !== 'all') params.append('has_voted', filters.statusSuara === 'sudah' ? 'true' : 'false')
      if (filters.search) params.append('search', filters.search)
      const { items } = await fetchAdminDpt(token, params)
      setVoters(items)
    } catch (err) {
      console.error('Failed to load DPT', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat DPT')
      setVoters((prev) => (prev.length ? prev : dptListMock))
    } finally {
      setLoading(false)
    }
  }, [filters.angkatan, filters.fakultas, filters.search, filters.statusSuara, token])

  useEffect(() => {
    if (token) {
      setVoters([])
      void refresh()
    } else {
      setVoters(dptListMock)
    }
  }, [token, refresh])

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const resetImport = useCallback(() => {
    setImportStep(1)
    setImportFileName(undefined)
    setMapping(defaultMapping)
  }, [])

  const value = useMemo(
    () => ({
      voters,
      filters,
      setFilters,
      selected,
      toggleSelect,
      selectAll,
      clearSelection,
      importStep,
      setImportStep,
      importFileName,
      setImportFileName,
      mapping,
      setMapping,
      importErrors,
      resetImport,
      refresh,
      loading,
      error,
    }),
    [clearSelection, error, filters, importErrors, importFileName, importStep, loading, mapping, refresh, resetImport, selectAll, selected, toggleSelect, voters],
  )

  return <DPTAdminContext.Provider value={value}>{children}</DPTAdminContext.Provider>
}

export const useDPTAdminStore = () => {
  const context = useContext(DPTAdminContext)
  if (!context) throw new Error('useDPTAdminStore must be used within DPTAdminProvider')
  return context
}
