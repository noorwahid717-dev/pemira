import { useEffect, useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import StagesSection from '../components/StagesSection'
import VotingModeSection from '../components/VotingModeSection'
import CandidatesPreview from '../components/CandidatesPreview'
import FAQSection from '../components/FAQSection'
import Footer from '../components/Footer'
import { fetchCurrentElection, type PublicElection } from '../services/publicElection'
import type { ApiError } from '../utils/apiClient'

const LandingPage = () => {
  const [election, setElection] = useState<PublicElection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const displayError = error && !error.toLowerCase().includes('pemilu aktif') ? error : null

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetchCurrentElection({ signal: controller.signal })
      .then((data) => {
        setElection(data)
        setError(null)
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        const apiError = err as ApiError
        if (apiError?.status === 404) {
          setError('Tidak ada pemilu aktif saat ini.')
          setElection(null)
        } else {
          setError(apiError?.message ?? 'Gagal memuat data pemilu.')
          setElection(null)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return (
    <div className="app">
      <Header />
      <HeroSection election={election} loading={loading} error={displayError} />
      <CandidatesPreview />
      <StagesSection />
      <VotingModeSection
        onlineEnabled={Boolean(election?.online_enabled)}
        tpsEnabled={Boolean(election?.tps_enabled)}
        loading={loading}
        error={displayError}
      />
      <FAQSection />
      <Footer />
    </div>
  )
}

export default LandingPage
