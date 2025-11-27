# Registration API v2.0 - Quick Reference Guide

## 🚀 Quick Start

### For Students
```typescript
// Register a student
const response = await registerStudent({
  nim: "2024001002",
  name: "Budi Santoso",
  email: "",  // Will auto-generate as 2024001002@pemira.ac.id
  faculty_name: "Fakultas Ekonomi",
  study_program_name: "Akuntansi",
  semester: "5",
  password: "password123",
  voting_mode: "ONLINE"  // or "TPS"
});
```

### For Lecturers
```typescript
// Register a lecturer
const response = await registerLecturerOrStaffV2({
  type: "LECTURER",
  nidn: "0020129001",
  name: "Prof. Dr. Hartono, M.Sc",
  email: "",  // Will auto-generate as 0020129001@pemira.ac.id
  faculty_name: "Fakultas Kesehatan",
  department_name: "Keperawatan",
  position: "Guru Besar",
  password: "password123",
  voting_mode: "ONLINE"
});
```

### For Staff
```typescript
// Register a staff member
const response = await registerLecturerOrStaffV2({
  type: "STAFF",
  nip: "199203151234568",
  name: "Indah Permata Sari",
  email: "",  // Will auto-generate as 199203151234568@pemira.ac.id
  unit_name: "Biro Administrasi Keuangan",
  position: "Staf",
  password: "password123",
  voting_mode: "TPS"
});
```

---

## 📋 Master Data Endpoints

```typescript
// Get faculties and programs (legacy)
const { faculties } = await fetchFacultiesPrograms();

// Get faculties with IDs
const { data: faculties } = await fetchFaculties();

// Get study programs (optionally filtered by faculty)
const { data: programs } = await fetchStudyPrograms(5);

// Get lecturer units (faculties, research centers)
const { data: units } = await fetchLecturerUnits();

// Get lecturer positions (optionally filtered by category)
const { data: positions } = await fetchLecturerPositions('FUNGSIONAL');

// Get staff units (bureaus, UPT)
const { data: units } = await fetchStaffUnits();

// Get staff positions
const { data: positions } = await fetchStaffPositions();
```

---

## ✅ Required Fields

### Student
- ✓ nim (username)
- ✓ name
- ✓ faculty_name
- ✓ study_program_name
- ✓ semester (1-14)
- ✓ password (min 6 chars)
- ⚪ email (optional, auto-generated)
- ⚪ voting_mode (optional, defaults to ONLINE)

### Lecturer
- ✓ nidn (username)
- ✓ name
- ✓ faculty_name
- ✓ department_name
- ✓ position
- ✓ password (min 6 chars)
- ⚪ email (optional, auto-generated)
- ⚪ voting_mode (optional, defaults to ONLINE)

### Staff
- ✓ nip (username)
- ✓ name
- ✓ unit_name
- ✓ position
- ✓ password (min 6 chars)
- ⚪ email (optional, auto-generated)
- ⚪ voting_mode (optional, defaults to ONLINE)

---

## 🔐 Auto-Generated Emails

When email field is empty or omitted, the system generates:
- Students: `{nim}@pemira.ac.id`
- Lecturers: `{nidn}@pemira.ac.id`
- Staff: `{nip}@pemira.ac.id`

---

## 🎯 Voting Modes

### ONLINE Mode (Default)
- Voter can login to platform
- Vote through web interface
- Available during election period
- No need to visit TPS

### TPS Mode (Offline)
- Voter receives QR code
- Must visit physical TPS
- TPS officer scans QR code
- Voting done at TPS location

---

## 📱 Form Component Usage

```tsx
import { useState, useEffect } from 'react'
import { 
  registerStudent, 
  registerLecturerOrStaffV2 
} from '../services/auth'
import { 
  fetchFacultiesPrograms,
  fetchLecturerPositions,
  fetchStaffPositions 
} from '../services/meta'

function RegistrationForm() {
  const [voterType, setVoterType] = useState<'student' | 'lecturer' | 'staff'>('student')
  const [faculties, setFaculties] = useState([])
  
  useEffect(() => {
    // Load master data
    fetchFacultiesPrograms().then(res => setFaculties(res.faculties))
  }, [])
  
  const handleSubmit = async (formData) => {
    if (voterType === 'student') {
      await registerStudent(formData)
    } else {
      await registerLecturerOrStaffV2({
        type: voterType === 'lecturer' ? 'LECTURER' : 'STAFF',
        ...formData
      })
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 🔄 Response Structure

### Success Response
```json
{
  "message": "Registrasi berhasil.",
  "user": {
    "id": 67,
    "username": "2024001002",
    "role": "STUDENT",
    "voter_id": 62,
    "profile": { ... }
  },
  "voting_mode": "ONLINE"
}
```

### Error Responses
```json
// Username exists
{ "code": "USERNAME_EXISTS", "message": "Username sudah terdaftar." }

// Validation error
{ "code": "VALIDATION_ERROR", "message": "Data tidak valid." }

// Not found
{ "code": "IDENTITY_NOT_FOUND", "message": "Identitas tidak ditemukan." }
```

---

## 🐛 Common Errors

### 409 - Username Already Exists
**Cause:** NIM/NIDN/NIP already registered  
**Solution:** Check if user already has an account, or use different identifier

### 400 - Validation Error
**Cause:** Missing or invalid required fields  
**Solution:** Ensure all required fields are filled correctly

### 404 - Identity Not Found
**Cause:** NIM/NIDN/NIP not in system database  
**Solution:** Contact admin to add identity data first

---

## 🎨 UI Components

### Role Selector
```tsx
<div className="role-selector">
  <button onClick={() => setRole('student')}>Mahasiswa</button>
  <button onClick={() => setRole('lecturer')}>Dosen</button>
  <button onClick={() => setRole('staff')}>Staf</button>
</div>
```

### Faculty & Program Cascade
```tsx
<select 
  value={faculty} 
  onChange={e => {
    setFaculty(e.target.value)
    setProgram('')  // Reset program when faculty changes
  }}
>
  {faculties.map(f => <option key={f.faculty}>{f.faculty}</option>)}
</select>

<select 
  value={program}
  disabled={!faculty}
  onChange={e => setProgram(e.target.value)}
>
  {faculties
    .find(f => f.faculty === faculty)
    ?.programs.map(p => <option key={p}>{p}</option>)
  }
</select>
```

### Voting Mode Radio
```tsx
<fieldset>
  <label>
    <input 
      type="radio" 
      value="ONLINE" 
      checked={mode === 'ONLINE'}
      onChange={() => setMode('ONLINE')}
    />
    Pemilihan Online
  </label>
  <label>
    <input 
      type="radio" 
      value="TPS"
      checked={mode === 'TPS'}
      onChange={() => setMode('TPS')}
    />
    Pemilihan TPS (Offline)
  </label>
</fieldset>
```

---

## 📊 Validation Rules

```typescript
// Password validation
const isPasswordValid = password.length >= 6

// Email validation (optional)
const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Student validation
const isStudentValid = 
  nim && name && faculty && program && semester && password.length >= 6

// Lecturer validation
const isLecturerValid = 
  nidn && name && faculty && department && position && password.length >= 6

// Staff validation
const isStaffValid = 
  nip && name && unit && position && password.length >= 6
```

---

## 🔗 Related Files

- `/src/services/auth.ts` - Auth service with registration functions
- `/src/services/meta.ts` - Master data service
- `/src/pages/RegisterNew.tsx` - Main registration component
- `/src/pages/Register.tsx` - Legacy registration component
- `/src/router/routes.ts` - Router configuration

---

## 📞 Support

For issues or questions:
1. Check API contract: `REGISTRATION_API_V2_IMPLEMENTATION.md`
2. Review error codes in API response
3. Verify master data is loaded correctly
4. Test with demo accounts
5. Contact system administrator

---

**Last Updated:** 2025-11-27  
**API Version:** 2.0  
**Status:** Production Ready ✅
