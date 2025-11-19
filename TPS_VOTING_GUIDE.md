# 🗳️ Panduan Voting via TPS (Tempat Pemungutan Suara)

## 📋 Overview

Fitur Voting via TPS memungkinkan mahasiswa melakukan pemilihan secara offline di lokasi yang telah ditentukan dengan memindai QR Code panitia.

---

## 🎯 Fitur Utama

### ✅ Fitur yang Diimplementasikan

1. **Halaman Awal Voting TPS** (`/voting-tps`)
   - Penjelasan cara voting via TPS
   - Tombol untuk memulai scanning QR
   - Validasi status voting (belum dibuka/sudah ditutup)
   - Info penting sebelum voting

2. **Scanner QR Code** (`/voting-tps/scanner`)
   - Menggunakan @zxing/library untuk scanning
   - Fullscreen camera interface
   - Scanner overlay dengan animasi
   - Toggle flash/torch
   - Permission handling (izin kamera)
   - Error states yang jelas

3. **Validasi QR & Hak Suara** (`/voting-tps/validate`)
   - Memverifikasi QR panitia valid
   - Cek hak suara mahasiswa
   - Multiple error scenarios:
     - Mahasiswa sudah voting
     - QR kedaluwarsa
     - Voting belum dibuka
     - Voting sudah ditutup

4. **Halaman Voting** (`/voting-tps/vote`)
   - Step 1: Pilih kandidat
   - Step 2: Konfirmasi pilihan
   - Banner info TPS location
   - Checkbox konfirmasi
   - Prevent double submission

5. **Halaman Sukses** (`/voting-tps/success`)
   - Konfirmasi sukses voting
   - Tampilan lokasi TPS
   - Waktu voting
   - Token bukti anonim
   - Animasi checkmark

---

## 🚀 Flow Lengkap

```
Dashboard Pemilih
    ↓
    [Klik: Pilih via TPS (Offline)]
    ↓
Voting TPS (Intro)
    ↓
    [Klik: Scan QR Panitia]
    ↓
TPS Scanner (Kamera)
    ↓
    [QR Berhasil Dipindai]
    ↓
TPS Validation
    ↓
    [Hak Suara Valid]
    ↓
TPS Voting - Step 1 (Pilih Kandidat)
    ↓
    [Lanjut ke Konfirmasi]
    ↓
TPS Voting - Step 2 (Konfirmasi)
    ↓
    [Kirim Suara]
    ↓
TPS Success (Selesai)
    ↓
    [Kembali ke Dashboard]
```

---

## 📂 File Structure

```
src/
├── pages/
│   ├── VotingTPS.jsx           # Halaman intro TPS
│   ├── TPSScanner.jsx          # Scanner QR dengan kamera
│   ├── TPSValidation.jsx       # Validasi QR & hak suara
│   ├── TPSVoting.jsx           # Halaman voting (step 1 & 2)
│   └── TPSSuccess.jsx          # Halaman sukses
│
├── styles/
│   ├── VotingTPS.css           # Style intro TPS
│   ├── TPSScanner.css          # Style scanner
│   ├── TPSValidation.css       # Style validasi
│   ├── TPSVoting.css           # Style voting
│   └── TPSSuccess.css          # Style sukses
│
├── utils/
│   └── navigation.js           # Helper navigasi
│
└── App.jsx                     # Routing semua halaman
```

---

## 🎨 Komponen yang Digunakan

### Shared Components
- ✅ `PageHeader` - Header dengan logo & user menu
- ✅ `EmptyState` - (Opsional untuk error states)

### Custom Components
- Scanner dengan @zxing/library
- Custom animation untuk checkmark
- Responsive grid untuk kandidat
- Banner notification

---

## 🔧 Dependencies

```json
{
  "@zxing/library": "^0.21.3"  // QR Code Scanner
}
```

---

## 💻 Cara Menggunakan

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm run dev
```

### 3. Testing Flow

1. **Login** sebagai mahasiswa di `/login`
2. Masuk ke **Dashboard** di `/dashboard`
3. Klik tombol **"Pilih via TPS (Offline)"**
4. Scan QR panitia (gunakan QR simulator atau generate QR)
5. Sistem akan validasi dan lanjut ke voting
6. Pilih kandidat → Konfirmasi → Selesai

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Flow (Happy Path)
```
✅ User login → Dashboard → Voting TPS → Scanner → 
   Validation (Valid) → Voting → Success
```

### Scenario 2: Already Voted
```
❌ User sudah voting → Validation shows error
   "Anda sudah menggunakan hak suara"
```

### Scenario 3: QR Expired
```
❌ QR kedaluwarsa → Validation shows error
   "QR tidak valid atau sudah kedaluwarsa"
```

### Scenario 4: Camera Permission Denied
```
❌ User menolak akses kamera → Scanner shows error
   "Izin kamera diperlukan" + button untuk retry
```

### Scenario 5: Voting Not Started/Closed
```
❌ Voting belum dibuka/sudah ditutup → 
   Intro page shows status notice
```

---

## 🔒 Security & Validation

### Client-Side Validation
- ✅ Check user login status
- ✅ Check voting eligibility
- ✅ Prevent double submission
- ✅ Token generation untuk bukti

### Backend Integration Points
Halaman ini siap untuk integrasi backend:

1. **QR Validation Endpoint**
   ```
   POST /api/tps/validate-qr
   Body: { token: string }
   Response: { valid: boolean, tpsName: string }
   ```

2. **Check Voting Eligibility**
   ```
   GET /api/voting/eligibility
   Response: { canVote: boolean, reason?: string }
   ```

3. **Submit Vote**
   ```
   POST /api/voting/submit
   Body: { kandidatId: number, mode: 'tps', qrToken: string }
   Response: { success: boolean, token: string }
   ```

---

## 🎨 UI/UX Features

### ✨ Animations
- Scanner line animation
- Checkmark draw animation
- Button hover effects
- Smooth transitions

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly buttons
- Readable text sizes
- Proper spacing

### ♿ Accessibility
- Clear error messages
- High contrast colors
- Large touch targets
- Keyboard navigation support

---

## 🐛 Known Issues & Future Improvements

### Current Limitations
1. Scanner menggunakan browser API (perlu HTTPS di production)
2. Torch/Flash mungkin tidak support di semua device
3. QR validation masih mock data

### Future Improvements
1. **Real-time QR Expiry**: QR code dengan timer 30 detik
2. **Offline Support**: Service Worker untuk offline capability
3. **Multiple Camera Support**: Switch antara front/back camera
4. **QR Code Generator**: Generate QR di admin panel
5. **Live TPS Status**: Real-time info jumlah pemilih di setiap TPS

---

## 📊 Status Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| Halaman Intro TPS | ✅ Done | Complete with info & validation |
| QR Scanner | ✅ Done | Using @zxing/library |
| Camera Permission | ✅ Done | With error handling |
| QR Validation | ✅ Done | Mock data, ready for API |
| Voting Flow | ✅ Done | Step 1 & 2 implemented |
| Success Page | ✅ Done | With token & animations |
| Error Handling | ✅ Done | All edge cases covered |
| Responsive Design | ✅ Done | Mobile & desktop |
| Backend Integration | ⏳ Pending | API endpoints needed |

---

## 🚦 Demo Accounts

Gunakan akun demo untuk testing:

| NIM | Nama | Status |
|-----|------|--------|
| 2110510001 | Budi Santoso | Belum voting |
| 2110510002 | Siti Nurhaliza | Belum voting |
| 2110510003 | Ahmad Fauzi | Belum voting |
| 2110510004 | Dewi Lestari | Belum voting |

Password: `mahasiswa123`

---

## 📝 Notes

- Semua halaman menggunakan **shared components** yang sudah ada
- Code style mengikuti best practices project
- Tidak ada hardcoded data (semua dari sessionStorage)
- Siap untuk integrasi backend
- Full error handling & edge cases

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console log untuk error details
2. Pastikan browser support camera API
3. Test di HTTPS untuk production
4. Verify permission settings

---

**Last Updated**: 2024-11-19  
**Status**: ✅ Ready for Integration  
**Version**: 1.0.0
