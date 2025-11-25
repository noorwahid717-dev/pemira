import { useEffect, useState } from 'react'
import { fetchAuthMe } from '../services/auth'
import { fetchCurrentElection, fetchPublicPhases } from '../services/publicElection'
import { fetchVoterStatus } from '../services/voterStatus'
import { getVoterQr } from '../services/voterQr'
import type { PublicElection, PublicPhase } from '../services/publicElection'
import type { VoterMeStatus } from '../services/voterStatus'
import type { VoterQRResult } from '../services/voterQr'
import type { AuthUser } from '../services/auth'

export type PemiraStage = 'registration' | 'verification' | 'campaign' | 'silence' | 'voting' | 'rekapitulasi'

export type DashboardData = {
  user: AuthUser | null
  election: PublicElection | null
  phases: PublicPhase[]
  voterStatus: VoterMeStatus | null
  qrData: VoterQRResult | null
  currentStage: PemiraStage
  loading: boolean
  error: string | null
}

const determineCurrentStage = (election: PublicElection | null, phases: PublicPhase[]): PemiraStage => {
  if (!election) return 'registration'

  // Use current_phase from backend if available (already calculated correctly)
  if (election.current_phase) {
    const phase = election.current_phase.toUpperCase()
    if (phase === 'REGISTRATION') return 'registration'
    if (phase === 'VERIFICATION') return 'verification'
    if (phase === 'CAMPAIGN') return 'campaign'
    if (phase === 'QUIET_PERIOD') return 'silence'
    if (phase === 'VOTING') return 'voting'
    if (phase === 'RECAP' || phase === 'RECAPITULATION') return 'rekapitulasi'
  }

  const now = new Date()
  
  // Check from phases (fallback)
  for (const phase of phases) {
    if (phase.start_at && phase.end_at) {
      const start = new Date(phase.start_at)
      const end = new Date(phase.end_at)
      
      if (now >= start && now <= end) {
        const key = phase.key || phase.phase || ''
        const keyLower = key.toLowerCase()
        if (keyLower.includes('registration') || keyLower.includes('pendaftaran')) return 'registration'
        if (keyLower.includes('verification') || keyLower.includes('verifikasi')) return 'verification'
        if (keyLower.includes('campaign') || keyLower.includes('kampanye')) return 'campaign'
        if (keyLower.includes('quiet') || keyLower.includes('tenang')) return 'silence'
        if (keyLower.includes('voting') || keyLower.includes('pemilihan')) return 'voting'
        if (keyLower.includes('recap') || keyLower.includes('rekapitulasi')) return 'rekapitulasi'
      }
    }
  }

  // Default fallback
  return 'registration'
}

export const useDashboardPemilih = (token: string | null) => {
  const [data, setData] = useState<DashboardData>({
    user: null,
    election: null,
    phases: [],
    voterStatus: null,
    qrData: null,
    currentStage: 'registration',
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!token) {
      setData((prev) => ({ ...prev, loading: false, error: 'Token tidak tersedia' }))
      return
    }

    const controller = new AbortController()
    const { signal } = controller

    const loadData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }))

        // Fetch all data in parallel
        const [user, election] = await Promise.all([
          fetchAuthMe(token, { signal }),
          fetchCurrentElection({ signal }),
        ])

        // Fetch voter status
        const voterStatus = await fetchVoterStatus(token, election.id, { signal })

        // Fetch phases
        let phases: PublicPhase[] = []
        try {
          phases = await fetchPublicPhases(election.id, { signal })
        } catch (err) {
          console.warn('Failed to fetch phases:', err)
          // Use phases from election if available
          if (election.phases) {
            phases = election.phases
          }
        }

        // Determine current stage
        const currentStage = determineCurrentStage(election, phases)

        // Fetch QR if voter is TPS mode
        let qrData: VoterQRResult | null = null
        if (voterStatus.preferred_method === 'TPS' && user.voter_id) {
          try {
            qrData = await getVoterQr(token, user.voter_id)
          } catch (err) {
            console.warn('Failed to fetch QR:', err)
          }
        }

        setData({
          user,
          election,
          phases,
          voterStatus,
          qrData,
          currentStage,
          loading: false,
          error: null,
        })
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Dashboard data error:', err)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Gagal memuat data',
        }))
      }
    }

    loadData()

    return () => {
      controller.abort()
    }
  }, [token])

  return data
}
