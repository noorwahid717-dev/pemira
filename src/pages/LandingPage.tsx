import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import StagesSection from '../components/StagesSection'
import VotingModeSection from '../components/VotingModeSection'
import CandidatesPreview from '../components/CandidatesPreview'
import FAQSection from '../components/FAQSection'
import Footer from '../components/Footer'

const LandingPage = () => (
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

export default LandingPage
