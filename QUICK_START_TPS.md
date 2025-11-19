# ⚡ Quick Start - TPS Voting Feature

## 🚀 Getting Started in 5 Minutes

### 1. Install & Run
```bash
cd pemira
pnpm install              # Install dependencies (includes @zxing/library)
pnpm run dev             # Start dev server
```

### 2. Test the Flow
1. Open browser → http://localhost:5174
2. Go to `/login`
3. Login with: `NIM: 2110510001` | `Password: mahasiswa123`
4. Click **"Pilih via TPS (Offline)"** button
5. Click **"Scan QR Panitia"**
6. Allow camera access
7. Scan any QR code (will be validated)
8. Follow the voting flow
9. Done! ✨

---

## 📍 URLs for Testing

| URL | Page | Description |
|-----|------|-------------|
| `/voting-tps` | Intro | Start here |
| `/voting-tps/scanner` | Scanner | QR scanning |
| `/voting-tps/validate` | Validation | Auto after scan |
| `/voting-tps/vote` | Voting | Select & confirm |
| `/voting-tps/success` | Success | Final page |

---

## 🎯 Key Features to Test

### ✅ Happy Path
1. Login → Dashboard
2. Click "Pilih via TPS"
3. Scan QR → Validate → Vote → Success

### ✅ Error Scenarios
1. **Deny Camera Permission**
   - Scanner shows: "Izin Kamera Diperlukan"
   - Button: "Izinkan Kamera"

2. **Already Voted**
   - Validation shows: "Anda sudah menggunakan hak suara"
   - Shows voting time
   - Button: "Kembali ke Dashboard"

3. **Invalid/Expired QR**
   - Validation shows: "QR tidak valid"
   - Button: "Scan Ulang QR"

---

## 🔧 Developer Notes

### File to Edit for API Integration

1. **TPSScanner.jsx** (Line ~61)
   ```javascript
   const handleQRScanned = (qrData) => {
     // TODO: Validate QR with backend
     // const response = await fetch('/api/tps/validate-qr', {...})
   }
   ```

2. **TPSValidation.jsx** (Line ~35)
   ```javascript
   const validateVotingEligibility = () => {
     // TODO: Call backend API
     // const response = await fetch('/api/voting/eligibility')
   }
   ```

3. **TPSVoting.jsx** (Line ~96)
   ```javascript
   const handleSubmitVote = async () => {
     // TODO: Submit to backend
     // const response = await fetch('/api/voting/submit', {...})
   }
   ```

### Shared Components Used
```javascript
import PageHeader from '../components/shared/PageHeader';
// Props: title, user, onLogout
```

### State Management
```javascript
// User data
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

// QR data
const qrData = JSON.parse(sessionStorage.getItem('scannedQR'));

// Vote data
const voteData = JSON.parse(sessionStorage.getItem('voteData'));
```

---

## 📱 Camera API Notes

### Requirements
- ✅ HTTPS in production (or localhost for dev)
- ✅ Browser support: Chrome, Firefox, Safari, Edge
- ✅ User permission required

### Troubleshooting
```javascript
// Check camera availability
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('Camera OK'))
  .catch(err => console.log('Camera Error:', err));
```

---

## 🎨 Customization

### Colors (CSS Variables)
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success */
background: #c6f6d5;
color: #22543d;

/* Error */
background: #fed7d7;
color: #742a2a;
```

### Change TPS Name
```javascript
// TPSValidation.jsx
tpsName: 'Aula Utama - TPS 1'  // Change this
```

---

## 🧪 Mock Data for Testing

### Generate Test QR
Use any QR generator with text:
```
TPS_TOKEN_ABC123XYZ789
```

Scanner will accept any QR and proceed to validation.

### Mock Users
```javascript
// In DashboardPemilih.jsx
2110510001 - Belum voting
2110510002 - Belum voting  
2110510003 - Belum voting
2110510004 - Belum voting
```

---

## 📊 Production Checklist

Before deploying:
- [ ] Replace all mock data with real API calls
- [ ] Add proper error logging
- [ ] Test on HTTPS
- [ ] Test on multiple devices/browsers
- [ ] Add analytics tracking
- [ ] Configure CORS for camera API
- [ ] Add rate limiting for QR validation
- [ ] Test QR expiry mechanism

---

## 🆘 Common Issues

### Issue: Camera not working
**Solution**: Make sure you're on HTTPS or localhost

### Issue: Permission denied
**Solution**: Clear site settings and retry, or check browser permissions

### Issue: QR not scanning
**Solution**: Ensure QR is clear and well-lit, check console for errors

### Issue: Navigation not working
**Solution**: Check browser console, verify navigation.js is imported

---

## 📚 Documentation Links

- **Full Guide**: See `TPS_VOTING_GUIDE.md`
- **Summary**: See `TPS_IMPLEMENTATION_SUMMARY.md`
- **Structure**: See `STRUCTURE.md`
- **Main README**: See `README.md`

---

## 💡 Tips

1. **Dev Controls**: Dashboard has toggle buttons (bottom-left) to test different states
2. **Console Logs**: Check browser console for debug info
3. **Session Storage**: Clear sessionStorage to reset state
4. **Camera Test**: Test camera at `/voting-tps/scanner` directly

---

## ⚡ Quick Commands

```bash
# Development
pnpm run dev

# Build
pnpm run build

# Preview production
pnpm run preview

# Lint
pnpm run lint

# Clear cache
rm -rf node_modules dist
pnpm install
```

---

## 🎯 Next Steps

1. ✅ Test all flows manually
2. ✅ Integrate with backend API
3. ✅ Deploy to staging
4. ✅ User acceptance testing
5. ✅ Production deployment

---

**Need Help?** Check the full documentation or contact the dev team.

**Version**: 1.0.0  
**Last Updated**: 2024-11-19
