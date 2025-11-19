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
│   │   ├── LoginMahasiswa.tsx
│   │   ├── DashboardPemilih.tsx
│   │   ├── DaftarKandidat.tsx
│   │   ├── DetailKandidat.tsx
│   │   ├── LandingPage.tsx      # 🆕 Landing layout extracted
│   │   ├── VotingOnline.tsx
│   │   ├── VotingTPS.tsx        # 🆕 TPS Intro
│   │   ├── TPSScanner.tsx       # 🆕 QR Scanner
│   │   ├── TPSValidation.tsx    # 🆕 Validation
│   │   ├── TPSVoting.tsx        # 🆕 Voting TPS
│   │   └── TPSSuccess.tsx       # 🆕 Success Page
│   │
│   ├── styles/             # CSS files
│   ├── hooks/              # 🆕 Typed hooks (useVotingSession, etc.)
│   ├── data/               # 🆕 Mock/static datasets
│   ├── types/              # 🆕 Domain type definitions
│   ├── router/            # 🆕 Centralised routing config
│   │   └── routes.ts
│   ├── App.tsx            # Root view selector
│   └── main.tsx           # Entry point
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
- **Routing**: React Router DOM 7
- **State Management**: React Hooks + SessionStorage (`useVotingSession`)

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

# Run unit tests
pnpm run test
```

---

## 🧭 TypeScript & Refactor Plan (Tahap 1)

- ✅ TypeScript toolchain aktif (`tsconfig.*`, `vite.config.ts`, ESLint) dengan mode `allowJs` sehingga migrasi komponen dapat bertahap.
- ✅ Routing dipusatkan pada `src/router/routes.ts` agar penambahan halaman cukup melalui konfigurasi.
- ✅ Layout landing diekstrak ke `pages/LandingPage.tsx`, menjadikan `App.tsx` fokus pada pemilihan view.
- ✅ React Router DOM meng-hydrate `appRoutes`, jadi tidak ada lagi switch manual berbasis `window.location`.
- ✅ Hook `useVotingSession` + domain types (`src/types/voting.ts`) menyatukan akses state TPS/online.
- ✅ Mock data (`src/data/mockCandidates.ts`, `src/data/mockVoters.ts`) dipakai lintas halaman, jadi tidak ada lagi hard-coded kandidat/sesi tersebar.
- ✅ ProtectedRoute/PublicOnlyRoute memastikan hanya rute yang berhak yang dapat mengakses dashboard/tps, sedangkan login/demo redirect jika sesi sudah aktif.

### Tahap Lanjutan yang Disarankan
1. Migrasikan sisa `.jsx` (halaman tutorial/admin) ke `.tsx` lalu sambungkan dengan tipe/domain bersama.
2. Gantikan data inline lain (mis. pengumuman, riwayat TPS) dengan adapter mock/API agar transisi ke backend makin mudah.
3. Tambahkan pengujian router (mis. menggunakan Vitest + Testing Library) untuk memastikan Protected/Public routes bekerja sesuai harapan.
4. Ekstrak hooks tambahan (`useVotingFlow`, `useScanner`) supaya state TPS/online semakin modular dan mudah diuji.
5. Tambah langkah CI untuk `pnpm exec tsc --noEmit` dan `pnpm run lint` supaya refaktor besar terjaga kualitasnya.

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
