import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { dptListMock, importErrorsMock } from '../data/dptAdmin'
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
} | null>(null)

export const DPTAdminProvider = ({ children }: { children: ReactNode }) => {
  const [voters] = useState<DPTEntry[]>(dptListMock)
  const [filters, setFilters] = useState({ search: '', fakultas: 'all', angkatan: 'all', statusSuara: 'all' as VoterStatus | 'all', akademik: 'all' as AcademicStatus | 'all' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importStep, setImportStep] = useState<ImportStep>(1)
  const [importFileName, setImportFileName] = useState<string | undefined>(undefined)
  const [mapping, setMapping] = useState<ImportMapping>(defaultMapping)
  const [importErrors] = useState(importErrorsMock)

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
    }),
    [clearSelection, filters, importErrors, importFileName, importStep, mapping, resetImport, selectAll, selected, toggleSelect, voters],
  )

  return <DPTAdminContext.Provider value={value}>{children}</DPTAdminContext.Provider>
}

export const useDPTAdminStore = () => {
  const context = useContext(DPTAdminContext)
  if (!context) throw new Error('useDPTAdminStore must be used within DPTAdminProvider')
  return context
}
