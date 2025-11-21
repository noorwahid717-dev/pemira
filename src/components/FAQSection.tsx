import { useState } from 'react'
import '../styles/FAQSection.css'

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'Apa syarat untuk memilih?',
    answer: 'Anda hanya perlu memiliki akun PEMIRA dan terdaftar sebagai mahasiswa aktif Universitas Wahidiyah.',
  },
  {
    question: 'Bagaimana cara login?',
    answer: 'Masuk menggunakan username/email kampus dan password yang Anda buat saat pendaftaran.',
  },
  {
    question: 'Apakah suara saya benar-benar rahasia?',
    answer: 'Ya. Sistem tidak menyimpan identitas pilihan Anda. Data pemilih dan data suara dipisahkan sepenuhnya.',
  },
  {
    question: 'Bagaimana jika saya lupa password?',
    answer: 'Gunakan fitur pemulihan password di halaman login atau hubungi panitia KPUM.',
  },
  {
    question: 'Apa beda memilih online dan offline?',
    answer: 'Online melalui aplikasi, offline melalui TPS kampus dengan scan QR. Keduanya sah dan aman.',
  },
]

const FAQSection = (): JSX.Element => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section className="faq" id="faq">
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
