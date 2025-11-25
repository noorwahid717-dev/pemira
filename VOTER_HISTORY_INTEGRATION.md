# Voter History Feature - Integration Guide

## 📋 Overview

Halaman **Riwayat Aktivitas** untuk menampilkan kronologi aktivitas pemilih selama proses PEMIRA.

---

## 🔌 Backend Endpoint

### GET `/api/v1/elections/{electionID}/me/history`

**Authentication:** Required (Bearer token)

**Response Structure:**

```json
{
  "items": [
    {
      "type": "voting",
      "timestamp": "2025-12-17T10:30:00+07:00",
      "description": "Anda telah berhasil melakukan voting",
      "metadata": {
        "method": "Online",
        "candidate_number": "1"
      }
    },
    {
      "type": "tps_checkin",
      "timestamp": "2025-12-17T09:15:00+07:00",
      "description": "Check-in berhasil di TPS",
      "metadata": {
        "tps_name": "TPS Gedung A - Lantai 1",
        "tps_location": "Gedung Rektorat Lt. 1",
        "officer": "Ahmad Zaki"
      }
    },
    {
      "type": "qr_generated",
      "timestamp": "2025-12-16T14:20:00+07:00",
      "description": "QR Code untuk voting TPS dibuat",
      "metadata": {
        "qr_status": "Aktif"
      }
    },
    {
      "type": "registration",
      "timestamp": "2025-11-20T14:20:00+07:00",
      "description": "Registrasi akun pemilih berhasil",
      "metadata": {
        "method": "TPS"
      }
    },
    {
      "type": "login",
      "timestamp": "2025-12-17T09:10:00+07:00",
      "description": "Login ke sistem",
      "metadata": {
        "device": "Mobile",
        "ip": "192.168.1.100"
      }
    }
  ],
  "voter_name": "Ahmad Budi Santoso",
  "voter_nim": "2021010001"
}
```

---

## 📝 History Item Types

| Type | Description | Metadata Fields |
|------|-------------|-----------------|
| `registration` | Registrasi akun | `method` (Online/TPS) |
| `voting` | Voting berhasil | `method`, `candidate_number` |
| `tps_checkin` | Check-in di TPS | `tps_name`, `tps_location`, `officer` |
| `qr_generated` | QR Code dibuat | `qr_status` |
| `qr_rotated` | QR Code diperbarui | `qr_status` |
| `login` | Login sistem | `device`, `ip` |
| `logout` | Logout sistem | `device` |

---

## 🎯 Data Sources

Backend mengumpulkan data dari:

1. **voter_status table**
   - `created_at` → registration timestamp
   - `voted_at` + `method` → voting timestamp & method

2. **tps_checkins table**
   - `status`, `scan_at`, `voted_at`, `tps_id` → check-in history

3. **voter_tps_qr table**
   - `created_at`, `rotated_at` → QR generation/rotation
   - `is_active` → QR status

4. **user_sessions table**
   - `created_at` → login timestamp
   - `revoked_at` → logout timestamp

---

## 🖥️ Frontend Implementation

### Files Created:

1. **`src/services/voterHistory.ts`** - API service
2. **`src/pages/VoterHistory.tsx`** - Main page component
3. **`src/styles/VoterHistory.css`** - Styles

### Route Added:

```typescript
{
  id: 'voter-history',
  path: '/dashboard/riwayat',
  Component: VoterHistory,
  requiresAuth: true
}
```

### Navigation:

- Button "Riwayat" di Dashboard Pemilih footer → `/dashboard/riwayat`
- Back button → kembali ke `/dashboard`

---

## ✨ Features

### UI Components:

1. **Header**
   - Back button
   - Voter info card (nama, NIM)

2. **Timeline View**
   - Icon per jenis aktivitas
   - Timestamp formatted (Indonesia)
   - Description text
   - Metadata details

3. **Empty State**
   - Ditampilkan jika belum ada riwayat

4. **Loading State**
   - Spinner animation

5. **Error State**
   - Error message jika gagal load

### Styling:

- Konsisten dengan DashboardPemilihHiFi
- Gradient purple background
- White cards dengan shadow
- Timeline dengan marker dan connecting line
- Responsive mobile-first

---

## 🧪 Testing

### Manual Test:

1. Login sebagai pemilih
2. Buka Dashboard Pemilih
3. Klik button "Riwayat" di footer
4. Verify:
   - ✅ Halaman load dengan header voter info
   - ✅ Timeline menampilkan aktivitas (jika ada)
   - ✅ Empty state (jika belum ada aktivitas)
   - ✅ Back button kembali ke dashboard

### API Test:

```bash
# Get voter history
TOKEN="your_voter_token"
ELECTION_ID=2

curl -X GET \
  "http://localhost:8080/api/v1/elections/${ELECTION_ID}/me/history" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.'
```

Expected response:
```json
{
  "items": [...],
  "voter_name": "...",
  "voter_nim": "..."
}
```

---

## 📊 Timeline Rendering Logic

```typescript
// Icon mapping
registration → 📱
voting → 🗳️
tps_checkin → 📍
qr_generated → 🎫
qr_rotated → 🔄
login → 🔐
logout → 🚪

// Sort: newest first (backend should sort)
items.sort((a, b) => b.timestamp - a.timestamp)

// Format timestamp
timestamp → "17 Desember 2025, 10:30 WIB"
```

---

## 🔒 Security

- ✅ Endpoint requires authentication
- ✅ User can only see their own history
- ✅ Token validated on backend
- ✅ CORS configured

---

## 📱 Responsive Design

- Mobile: Compact timeline, smaller icons
- Tablet: Medium spacing
- Desktop: Wider cards, max-width 800px

---

## 🚀 Next Steps

1. Test dengan real backend data
2. Verify timeline sorting (newest first)
3. Test semua jenis history items
4. Verify metadata rendering
5. Test loading/error states

---

## ✅ Checklist

Backend:
- [ ] Endpoint `/elections/{id}/me/history` implemented
- [ ] Returns correct DTO structure
- [ ] Includes all history types
- [ ] Sorted by timestamp DESC
- [ ] Metadata populated correctly

Frontend:
- [x] Service layer created (`voterHistory.ts`)
- [x] Page component created (`VoterHistory.tsx`)
- [x] Styles created (`VoterHistory.css`)
- [x] Route added to `routes.ts`
- [x] Navigation button added to Dashboard
- [x] Build successful

Testing:
- [ ] Backend returns data correctly
- [ ] Frontend displays timeline
- [ ] All history types render properly
- [ ] Empty state works
- [ ] Error handling works
- [ ] Navigation works (back button, footer)

---

## 📞 Support

Jika ada issue:
1. Check browser console for errors
2. Check network tab for API response
3. Verify token is valid
4. Check backend logs
