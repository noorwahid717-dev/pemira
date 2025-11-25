# Voter Profile Page - Backend API Specification

## 📋 Overview

Halaman **Profil Pemilih** di dashboard untuk menampilkan informasi pemilih, pengaturan akun, dan statistik partisipasi.

---

## 🔌 Backend Endpoints yang Dibutuhkan

### 1. GET `/api/v1/auth/me/profile` ✅ (Already Exists - via `/auth/me`)

**Authentication:** Required (Bearer token)

**Current Response:**
```json
{
  "id": 1,
  "username": "2021010001",
  "role": "voter",
  "voter_id": 123,
  "profile": {
    "name": "Ahmad Budi Santoso",
    "faculty_name": "Fakultas Teknik",
    "study_program_name": "Teknik Informatika",
    "cohort_year": 2021,
    "semester": "5"
  }
}
```

**Status:** ✅ Sudah ada, bisa digunakan

---

### 2. GET `/api/v1/voters/me/complete-profile` 🔴 (NEW - Perlu dibuat)

**Authentication:** Required (Bearer token)

**Purpose:** Mendapatkan informasi lengkap pemilih termasuk kontak dan partisipasi

**Expected Response:**
```json
{
  "personal_info": {
    "voter_id": 123,
    "voter_type": "STUDENT",
    "name": "Ahmad Budi Santoso",
    "username": "2021010001",
    "email": "ahmad.budi@uniwa.ac.id",
    "phone": "08123456789",
    "faculty_name": "Fakultas Teknik",
    "study_program_name": "Teknik Informatika",
    "cohort_year": 2021,
    "semester": "5",
    "photo_url": "https://storage.supabase.co/..."
  },
  "voting_info": {
    "preferred_method": "TPS",
    "has_voted": false,
    "voted_at": null,
    "tps_name": "TPS Gedung A - Lantai 1",
    "tps_location": "Gedung Rektorat Lt. 1"
  },
  "participation": {
    "total_elections": 3,
    "participated_elections": 2,
    "participation_rate": 66.67,
    "last_participation": "2024-12-15T10:30:00+07:00"
  },
  "account_info": {
    "created_at": "2024-11-01T08:00:00+07:00",
    "last_login": "2025-11-25T15:30:00+07:00",
    "login_count": 15,
    "account_status": "active"
  }
}
```

**Implementation Notes:**
- Join `users`, `voters`, `voter_status`, `tps` tables
- Calculate participation dari history voting
- Include account metadata dari `user_sessions`
- Return `voter_type` field: "STUDENT", "LECTURER", or "STAFF"

**Response Examples:**

**For Student (STUDENT):**
```json
{
  "personal_info": {
    "voter_type": "STUDENT",
    "username": "2021010001",
    "faculty_name": "Fakultas Teknik",
    "study_program_name": "Teknik Informatika",
    "cohort_year": 2021,
    "semester": "5"
  }
}
```

**For Lecturer (LECTURER):**
```json
{
  "personal_info": {
    "voter_type": "LECTURER",
    "username": "198501012010121001",
    "nidn": "0101018501",
    "title": "Dr.",
    "department": "Jurusan Teknik Informatika",
    "faculty_name": "Fakultas Teknik"
  }
}
```

**For Staff (STAFF):**
```json
{
  "personal_info": {
    "voter_type": "STAFF",
    "username": "199001012015031001",
    "nip": "199001012015031001",
    "position": "Kepala Bagian",
    "unit": "Biro Akademik"
  }
}
```

---

### 3. PUT `/api/v1/voters/me/profile` 🔴 (NEW - Perlu dibuat)

**Authentication:** Required (Bearer token)

**Purpose:** Update informasi profil pemilih (email, phone, photo)

**Request Body:**
```json
{
  "email": "ahmad.budi@uniwa.ac.id",
  "phone": "08123456789",
  "photo_url": "https://storage.supabase.co/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "updated_fields": ["email", "phone"]
}
```

**Validation:**
- Email format valid
- Phone number format (08xxx atau +62xxx)
- Photo URL valid (optional)

---

### 4. PUT `/api/v1/voters/me/voting-method` 🔴 (NEW - Perlu dibuat)

**Authentication:** Required (Bearer token)

**Purpose:** Ubah metode voting preference (Online/TPS)

**Request Body:**
```json
{
  "election_id": 2,
  "preferred_method": "ONLINE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Metode voting berhasil diubah ke ONLINE",
  "new_method": "ONLINE",
  "warning": "Jika sudah check-in TPS, perubahan tidak berlaku untuk election ini"
}
```

**Business Rules:**
- Hanya bisa diubah jika belum voting
- Jika sudah check-in TPS, tidak bisa ubah ke Online
- Validate election masih dalam fase yang tepat

---

### 5. POST `/api/v1/voters/me/change-password` 🔴 (NEW - Perlu dibuat)

**Authentication:** Required (Bearer token)

**Purpose:** Ganti password akun

**Request Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456",
  "confirm_password": "newpass456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

**Validation:**
- Current password harus benar
- New password minimum 8 karakter
- New password != current password
- confirm_password harus match

---

### 6. GET `/api/v1/voters/me/participation-stats` 🔴 (NEW - Perlu dibuat)

**Authentication:** Required (Bearer token)

**Purpose:** Statistik partisipasi pemilih

**Expected Response:**
```json
{
  "summary": {
    "total_elections": 5,
    "participated": 3,
    "not_participated": 2,
    "participation_rate": 60.0
  },
  "elections": [
    {
      "election_id": 2,
      "election_name": "PEMIRA 2025",
      "year": 2025,
      "voted": true,
      "voted_at": "2025-12-15T10:30:00+07:00",
      "method": "TPS"
    },
    {
      "election_id": 1,
      "election_name": "PEMIRA 2024",
      "year": 2024,
      "voted": true,
      "voted_at": "2024-12-10T14:20:00+07:00",
      "method": "ONLINE"
    },
    {
      "election_id": 3,
      "election_name": "PEMIRA 2023",
      "year": 2023,
      "voted": false,
      "voted_at": null,
      "method": "NONE"
    }
  ]
}
```

---

### 7. DELETE `/api/v1/voters/me/photo` 🔴 (NEW - Optional)

**Authentication:** Required (Bearer token)

**Purpose:** Hapus foto profil

**Response:**
```json
{
  "success": true,
  "message": "Foto profil berhasil dihapus"
}
```

---

### 8. POST `/api/v1/voters/me/regenerate-qr` ⚠️ (Check if exists)

**Authentication:** Required (Bearer token)

**Purpose:** Generate ulang QR Code untuk TPS

**Request Body:**
```json
{
  "election_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "qr_token": "abc123xyz789...",
  "qr_url": "data:image/png;base64,...",
  "expires_at": "2025-12-17T23:59:59+07:00",
  "message": "QR Code baru berhasil dibuat"
}
```

---

## 📊 Database Tables Involved

### Existing Tables:
- `users` - Basic account info
- `voters` - Voter details (name, faculty, etc)
- `voter_status` - Voting status per election
- `tps` - TPS information
- `voter_tps_qr` - QR codes for TPS
- `user_sessions` - Login sessions

### Potential New Fields:
```sql
-- Add to voters table (if not exists)
ALTER TABLE voters ADD COLUMN email VARCHAR(255);
ALTER TABLE voters ADD COLUMN phone VARCHAR(20);
ALTER TABLE voters ADD COLUMN photo_url TEXT;
ALTER TABLE voters ADD COLUMN bio TEXT;
ALTER TABLE voters ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Add to users table (if not exists)
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
```

---

## 🎯 Priority Implementation

### 🔴 CRITICAL (Must Have):
1. ✅ GET `/auth/me` - Already exists
2. 🔴 GET `/voters/me/complete-profile` - Needed for profile display
3. 🔴 PUT `/voters/me/profile` - Needed for edit profile
4. 🔴 POST `/voters/me/change-password` - Security essential

### 🟡 MEDIUM (Nice to Have):
5. 🟡 PUT `/voters/me/voting-method` - User convenience
6. 🟡 GET `/voters/me/participation-stats` - Gamification
7. 🟡 POST `/voters/me/regenerate-qr` - Recovery feature

### 🟢 LOW (Optional):
8. 🟢 DELETE `/voters/me/photo` - Can use PUT with null

---

## 🧪 Testing Endpoints

### Test GET complete-profile:
```bash
TOKEN="your_voter_token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/voters/me/complete-profile | jq '.'
```

### Test PUT profile:
```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@uniwa.ac.id","phone":"08199999999"}' \
  http://localhost:8080/api/v1/voters/me/profile
```

### Test change password:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"old","new_password":"new123","confirm_password":"new123"}' \
  http://localhost:8080/api/v1/voters/me/change-password
```

---

## 📝 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (tidak punya akses) |
| 404 | Not Found (voter tidak ditemukan) |
| 409 | Conflict (email sudah digunakan) |
| 500 | Internal Server Error |

---

## 🔒 Security Considerations

1. **Password Change:**
   - Verify current password
   - Hash new password dengan bcrypt
   - Invalidate all sessions setelah password change
   - Send email notification (optional)

2. **Profile Update:**
   - Validate email uniqueness
   - Sanitize input data
   - Log profile changes for audit

3. **Photo Upload:**
   - Validate file type (jpg, png)
   - Maximum file size (2MB)
   - Store in Supabase Storage
   - Generate thumbnail (optional)

4. **Rate Limiting:**
   - Password change: 3 attempts per hour
   - Profile update: 10 per hour
   - QR regenerate: 5 per day

---

## ✅ Frontend Implementation Plan

Once endpoints are ready, frontend will show:

**Profile Sections:**
1. Personal Info (name, NIM, faculty, prodi, angkatan)
2. Contact (email, phone) - Editable
3. Voting Info (method preference, TPS location)
4. Statistics (participation rate, history)
5. Account Settings (change password, logout)
6. QR Code (download, regenerate)

**Features:**
- Edit mode toggle
- Form validation
- Success/error toast notifications
- Loading states
- Confirmation dialogs

---

## 📞 Next Steps

1. Backend developer implement endpoints (prioritas: CRITICAL first)
2. Test endpoints dengan curl
3. Frontend developer integrate dengan UI
4. End-to-end testing
5. Deploy ke production

---

## 📄 Related Files

- Frontend will create:
  - `src/pages/VoterProfile.tsx`
  - `src/styles/VoterProfile.css`
  - `src/services/voterProfile.ts`

- Backend will create:
  - `internal/voter/profile_handler.go`
  - `internal/voter/profile_repository.go`
  - `internal/voter/profile_service.go`

---

**Status:** 📝 Specification Complete - Ready for Backend Implementation

**Contact:** Share this doc with backend team untuk implementasi
