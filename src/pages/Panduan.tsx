import Header from '../components/Header'
import FlowGuide from '../components/FlowGuide'
import Footer from '../components/Footer'
import '../styles/StagesSection.css'

const Panduan = (): JSX.Element => (
  <div className="app">
    <Header />
    <section className="guide-hero">
      <div className="guide-hero-container">
        <div>
          <h1>Panduan PEMIRA UNIWA</h1>
          <p>Cara memilih secara online atau di TPS dengan langkah yang sederhana.</p>
        </div>
        <a href="/">
          <button className="btn-outline">Kembali ke Beranda</button>
        </a>
      </div>
    </section>
    <FlowGuide />
    <Footer />
  </div>
)

export default Panduan
