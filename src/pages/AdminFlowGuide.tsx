import AdminLayout from '../components/admin/AdminLayout'
import '../styles/AdminFlowGuide.css'

const flowSections = [
  {
    title: 'LEVEL 1 — Alur Besar PEMIRA',
    body: `START
   ↓
Pendaftaran Pemilih
   ↓
Verifikasi DPT
   ↓
Hari H Pemungutan Suara
   ↓
( ONLINE ) atau ( TPS OFFLINE )
   ↓
Rekapitulasi Suara
   ↓
Publikasi Hasil
   ↓
END`,
  },
  {
    title: 'LEVEL 2 — Pendaftaran Pemilih (Online + Offline)',
    body: `[User Membuka Halaman Pendaftaran]
               ↓
         Input Data
  (Nama, NIM, Prodi, Email, dst)
               ↓
        Pilih Mode Pemilihan
         ┌───────────────┐
         │    ONLINE     │
         └───────────────┘
                atau
         ┌───────────────┐
         │    OFFLINE    │
         │     (TPS)     │
         └───────────────┘
               ↓
           Submit Form
               ↓
    ┌───────────────────────────────┬───────────────────────────────┐
    │ ONLINE                        │ OFFLINE (TPS)                 │
    ↓                               ↓                               │
[Generate Akun Login]        [Generate QR Pendaftaran]             │
[Akses dikirim ke email]     [Tampilkan QR + tombol unduh/print]   │
    ↓                               ↓                               │
 Masuk DPT Online             Masuk DPT Offline (TPS)               │
    ↓                               ↓                               │
           Pendaftaran Selesai (END)`,
  },
  {
    title: 'LEVEL 3 — Alur Voting Online',
    body: `[User Login]
    ↓
[System validasi: DPT Online?]
    ↓
[Masuk Dashboard Pemilih]
    ↓
Klik "Lihat Kandidat"
    ↓
Pilih Kandidat → Konfirmasi
    ↓
POST /voting/online/cast
    ↓
System:
  - Validasi belum voting
  - Catat vote (channel=ONLINE)
  - Update voter_status
    ↓
Tampilkan "Suara Berhasil Direkam"
    ↓
Selesai`,
  },
  {
    title: 'LEVEL 4 — Alur Voting Offline (TPS + QR Pendaftaran + QR Paslon)',
    body: `4.1 Kedatangan di TPS
Pemilih Datang → Tunjukkan QR Pendaftaran
      ↓
Operator Scan QR (Check-in)
      ↓
System:
  - Validasi QR & identitas
  - Buat row di tps_checkins (status=PENDING)
      ↓
Operator Menyetujui (Approve)
      ↓
System → tps_checkins.status = APPROVED
      ↓
Pemilih Ambil Surat Suara

4.2 Masuk Bilik Suara & Scan QR Paslon
Pemilih Masuk Bilik → Mencoblos Surat Suara
      ↓
Scan QR Paslon di Surat Suara (oleh operator/pemilih)
      ↓
POST /tps/{tpsID}/checkins/{checkinID}/scan-candidate
      ↓
System:
  - Parse QR paslon (candidate_id, election_id)
  - Validasi checkin (APPROVED)
  - Cek belum voting
  - Insert vote (channel = TPS)
  - Update tps_checkins.status = VOTED
  - Log scan ke tps_ballot_scans
      ↓
Operator memberi izin memasukkan surat suara ke kotak
      ↓
Pemilih celup tinta
      ↓
Selesai`,
  },
  {
    title: 'LEVEL 5 — Rekapitulasi & Penghitungan Suara',
    body: `Sumber Data:

Online → tabel votes.channel = ONLINE

Offline TPS → tabel votes.channel = TPS

Voting Ditutup
      ↓
System Tarik Semua Votes (ONLINE + TPS)
      ↓
Hitung Total per Kandidat
      ↓
Buat Rekap per Fakultas, per TPS, per Mode
      ↓
Validasi Panitia + Audit
      ↓
Publikasi Hasil PEMIRA`,
  },
]

const AdminFlowGuide = (): JSX.Element => {
  return (
    <AdminLayout title="Panduan Alur Pemilihan">
      <div className="flow-page">
        <header className="flow-hero">
          <div>
            <p className="pill">Panduan</p>
            <h1>Alur Pemilihan PEMIRA UNIWA</h1>
            <p className="muted">Flow diagram lengkap dari pendaftaran sampai publikasi hasil.</p>
          </div>
          <button className="btn-outline" type="button" onClick={() => window.history.back()}>
            ◀ Kembali
          </button>
        </header>

        <div className="flow-grid">
          {flowSections.map((section) => (
            <article key={section.title} className="flow-card">
              <h2>{section.title}</h2>
              <pre>{section.body}</pre>
            </article>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminFlowGuide
