import { useState } from 'react'
import '../styles/FAQSection.css'

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'Apa syarat memilih?',
    answer:
      'Mahasiswa aktif Universitas Wahidiyah yang terdaftar dengan NIM valid dan telah melakukan aktivasi akun.',
  },
  {
    question: 'Bagaimana cara login?',
    answer:
      'Gunakan NIM sebagai username dan password yang telah dikirim ke email kampus Anda. Verifikasi dengan OTP yang dikirim ke nomor HP terdaftar.',
  },
  {
    question: 'Apakah suara saya rahasia?',
    answer:
      'Ya, sistem kami menjamin kerahasiaan pilihan Anda. Tidak ada pihak yang dapat melihat pilihan individu, termasuk panitia.',
  },
  {
    question: 'Bagaimana jika saya lupa password?',
    answer:
      "Klik 'Lupa Password' di halaman login, masukkan NIM Anda, dan ikuti instruksi reset password via email.",
  },
  {
    question: 'Bagaimana cara memilih offline?',
    answer:
      'Login ke sistem, generate QR Hak Suara, datang ke TPS dengan membawa KTM, dan tunjukkan QR kepada petugas.',
  },
]

const FAQSection = (): JSX.Element => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section className="faq">
      <div className="faq-container">
        <h2 className="section-title">Pertanyaan Umum</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={faq.question} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFAQ(index)} type="button">
                <span>{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
