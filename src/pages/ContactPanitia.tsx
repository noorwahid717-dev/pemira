import type { JSX } from 'react'
import Header from '../components/Header'
import '../styles/ContactPanitia.css'

interface CommitteeContact {
  position: string
  name: string
  email: string
  phone: string
  office: string
}

const committeeContacts: CommitteeContact[] = [
  {
    position: 'Ketua Panitia',
    name: 'Nama Ketua',
    email: 'ketua@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
  {
    position: 'Wakil Ketua Panitia',
    name: 'Nama Wakil Ketua',
    email: 'wakil@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
  {
    position: 'Bendahara',
    name: 'Nama Bendahara',
    email: 'bendahara@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
  {
    position: 'Sekretaris',
    name: 'Nama Sekretaris',
    email: 'sekretaris@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
  {
    position: 'Koordinator Logistik',
    name: 'Nama Koordinator Logistik',
    email: 'logistik@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
  {
    position: 'Koordinator Teknologi',
    name: 'Nama Koordinator Teknologi',
    email: 'teknologi@pemira.online',
    phone: '+62 XXX XXXX XXXX',
    office: 'Ruang BEM, Lantai 2 Gedung Rektorat',
  },
]

const ContactPanitia = (): JSX.Element => {
  return (
    <div className="contact-panitia-page">
      <Header />

      <main className="contact-panitia-container">
        <div className="contact-panitia-header">
          <h1 className="contact-panitia-title">Kontak Panitia</h1>
          <p className="contact-panitia-subtitle">
            Komisi Pemilihan Umum Raya UNIWA 2025
          </p>
        </div>

        <div className="contact-panitia-content">
          <section className="contact-panitia-section">
            <h2 className="section-title">Tentang Panitia</h2>
            <div className="section-content">
              <p>
                Panitia Pemilihan Umum Raya (PEMIRA) UNIWA 2025 adalah badan
                independen yang bertanggung jawab dalam menyelenggarakan proses
                pemilihan ketua BEM secara demokratis, transparan, dan adil.
              </p>
              <p>
                Panitia berkomitmen untuk memastikan setiap pemilih memiliki hak
                yang sama dan kesempatan yang fair dalam menggunakan suara mereka
                untuk memilih pemimpin yang terbaik.
              </p>
            </div>
          </section>

          <section className="contact-panitia-section">
            <h2 className="section-title">Anggota Panitia</h2>
            <div className="contact-list">
              {committeeContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-card-header">
                    <h3 className="contact-position">{contact.position}</h3>
                    <p className="contact-name">{contact.name}</p>
                  </div>
                  <div className="contact-card-body">
                    <div className="contact-info-item">
                      <span className="contact-label">📧 Email:</span>
                      <a href={`mailto:${contact.email}`} className="contact-value">
                        {contact.email}
                      </a>
                    </div>
                    <div className="contact-info-item">
                      <span className="contact-label">📱 Telepon:</span>
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="contact-value">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="contact-info-item">
                      <span className="contact-label">📍 Kantor:</span>
                      <p className="contact-value">{contact.office}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-panitia-section">
            <h2 className="section-title">Jam Kerja Panitia</h2>
            <div className="section-content">
              <div className="working-hours">
                <div className="working-hours-item">
                  <h4>Senin - Jumat</h4>
                  <p>09:00 - 17:00 WIB</p>
                </div>
                <div className="working-hours-item">
                  <h4>Sabtu</h4>
                  <p>10:00 - 15:00 WIB</p>
                </div>
                <div className="working-hours-item">
                  <h4>Minggu & Hari Libur</h4>
                  <p>Tutup</p>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-panitia-section">
            <h2 className="section-title">Hubungi Kami</h2>
            <div className="section-content">
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <h4>Email Umum</h4>
                  <a href="mailto:panitia@pemira.online">panitia@pemira.online</a>
                </div>
                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <h4>Telepon</h4>
                  <a href="tel:+62xxxxxxxxxx">+62 XXX XXXX XXXX</a>
                </div>
                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <h4>Lokasi</h4>
                  <p>Ruang BEM, Lantai 2<br />Gedung Rektorat<br />Universitas Wahidiyah</p>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-panitia-section">
            <h2 className="section-title">Peran & Tanggung Jawab</h2>
            <div className="section-content">
              <div className="responsibilities">
                <div className="responsibility-item">
                  <h4>✓ Transparansi</h4>
                  <p>Menyelenggarakan pemilihan yang terbuka dan dapat dipertanggungjawabkan</p>
                </div>
                <div className="responsibility-item">
                  <h4>✓ Keadilan</h4>
                  <p>Memastikan setiap pemilih memiliki kesempatan yang sama dan setara</p>
                </div>
                <div className="responsibility-item">
                  <h4>✓ Keamanan</h4>
                  <p>Menjaga keamanan data dan integritas proses pemilihan</p>
                </div>
                <div className="responsibility-item">
                  <h4>✓ Profesionalisme</h4>
                  <p>Menjalankan tugas dengan dedikasi dan integritas tinggi</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ContactPanitia
