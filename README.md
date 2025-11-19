# 🗳️ PEMIRA UNIWA - Sistem Pemilihan Raya

Aplikasi web untuk Pemilihan Raya (PEMIRA) Universitas Wahid Hasyim berbasis React + Vite.

## ✨ Fitur Utama

### 🎯 Untuk Mahasiswa (Pemilih)
- ✅ Login dengan NIM & Password
- ✅ Dashboard pemilih dengan status voting
- ✅ Daftar kandidat dengan detail lengkap
- ✅ **Voting Online** - Pilih kandidat secara online
- ✅ **Voting via TPS** - Voting offline dengan QR Scanner
- ✅ Riwayat voting & token bukti

### 📊 Mode Voting

#### 1. Voting Online
- Akses langsung dari dashboard
- Pilih kandidat → Konfirmasi → Selesai
- Real-time validation

#### 2. Voting via TPS (Tempat Pemungutan Suara)
- **Scanner QR Code** dengan kamera
- Validasi QR panitia
- Validasi hak suara mahasiswa
- Voting dengan verifikasi lokasi
- Error handling lengkap

### 🔐 Keamanan
- Session-based authentication
- Anti double voting
- Anonymous voting token
- QR validation

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 16
pnpm (recommended) or npm
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd pemira

# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

### Demo Accounts
```
NIM: 2110510001 | Password: mahasiswa123 | Nama: Budi Santoso
NIM: 2110510002 | Password: mahasiswa123 | Nama: Siti Nurhaliza
NIM: 2110510003 | Password: mahasiswa123 | Nama: Ahmad Fauzi
NIM: 2110510004 | Password: mahasiswa123 | Nama: Dewi Lestari
```

---

## 📂 Project Structure

```
pemira/
├── src/
│   ├── components/          # React components
│   │   ├── shared/         # Reusable components
│   │   │   ├── PageHeader.jsx
│   │   │   ├── KandidatCard.jsx
│   │   │   └── EmptyState.jsx
│   │   └── ...
│   │
│   ├── pages/              # Page components
│   │   ├── LoginMahasiswa.jsx
│   │   ├── DashboardPemilih.jsx
│   │   ├── DaftarKandidat.jsx
│   │   ├── VotingOnline.jsx
│   │   ├── VotingTPS.jsx        # 🆕 TPS Intro
│   │   ├── TPSScanner.jsx       # 🆕 QR Scanner
│   │   ├── TPSValidation.jsx    # 🆕 Validation
│   │   ├── TPSVoting.jsx        # 🆕 Voting TPS
│   │   └── TPSSuccess.jsx       # 🆕 Success Page
│   │
│   ├── styles/             # CSS files
│   ├── utils/              # Utility functions
│   ├── App.jsx            # Main app router
│   └── main.jsx           # Entry point
│
├── public/                 # Static assets
├── TPS_VOTING_GUIDE.md    # 📘 TPS Voting Guide
├── STRUCTURE.md           # 📘 Project Structure Guide
└── package.json
```

---

## 🗺️ Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing Page | Home page |
| `/login` | Login | Mahasiswa login |
| `/dashboard` | Dashboard | Pemilih dashboard |
| `/kandidat` | Daftar Kandidat | List all kandidat |
| `/kandidat/detail/:id` | Detail Kandidat | Kandidat details |
| `/voting` | Voting Online | Online voting |
| `/voting-tps` | Voting TPS Intro | TPS voting intro |
| `/voting-tps/scanner` | QR Scanner | Scan QR panitia |
| `/voting-tps/validate` | Validation | Validate QR & eligibility |
| `/voting-tps/vote` | TPS Voting | Voting at TPS |
| `/voting-tps/success` | Success | Vote success page |

---

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite 7
- **Styling**: CSS (Custom)
- **QR Scanner**: @zxing/library
- **State Management**: React Hooks + SessionStorage

---

## 📖 Dokumentasi

- [STRUCTURE.md](./STRUCTURE.md) - Panduan struktur project & shared components
- [TPS_VOTING_GUIDE.md](./TPS_VOTING_GUIDE.md) - Panduan lengkap fitur Voting TPS

---

## 🎨 Features Detail

### Voting via TPS Flow
```
Dashboard → Intro TPS → Scanner QR → Validation → Voting → Success
```

**Fitur Scanner:**
- Real-time QR scanning
- Camera permission handling
- Flash/torch toggle
- Error states yang jelas

**Validasi:**
- QR panitia valid/expired
- Status hak suara
- Status voting (open/closed)
- Already voted check

---

## 🧪 Development

```bash
# Run dev server
pnpm run dev

# Build production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

---

## 📱 Browser Support

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ⚠️ Camera API requires HTTPS in production

---

## 🚧 Roadmap

- [ ] Backend API integration
- [ ] Real-time results dashboard
- [ ] Admin panel
- [ ] Email notifications
- [ ] PDF certificate generation
- [ ] Analytics & reporting

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributors

PEMIRA UNIWA Dev Team

---

**Last Updated**: 2024-11-19  
**Version**: 1.0.0
