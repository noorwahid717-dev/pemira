import Header from './components/Header'
import HeroSection from './components/HeroSection'
import StagesSection from './components/StagesSection'
import VotingModeSection from './components/VotingModeSection'
import CandidatesPreview from './components/CandidatesPreview'
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'
import LoginMahasiswa from './pages/LoginMahasiswa'
import DashboardPemilih from './pages/DashboardPemilih'
import DemoAccounts from './pages/DemoAccounts'
import DaftarKandidat from './pages/DaftarKandidat'
import DetailKandidat from './pages/DetailKandidat'
import VotingOnline from './pages/VotingOnline'
import './App.css'

function App() {
  const currentPath = window.location.pathname;

  if (currentPath === '/demo') {
    return <DemoAccounts />;
  }

  if (currentPath === '/login') {
    return <LoginMahasiswa />;
  }

  if (currentPath === '/dashboard') {
    return <DashboardPemilih />;
  }

  if (currentPath === '/kandidat') {
    return <DaftarKandidat />;
  }

  if (currentPath.startsWith('/kandidat/detail/')) {
    return <DetailKandidat />;
  }

  if (currentPath === '/voting') {
    return <VotingOnline />;
  }

  return (
    <div className="app">
      <Header />
      <HeroSection />
      <StagesSection />
      <VotingModeSection />
      <CandidatesPreview />
      <FAQSection />
      <Footer />
    </div>
  )
}

export default App
