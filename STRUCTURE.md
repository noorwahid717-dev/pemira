# 📁 Struktur Folder PEMIRA UNIWA

## 🗂️ Struktur Direktori

```
pemira/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── shared/     # ✨ Komponen reusable
│   │   │   ├── PageHeader.jsx
│   │   │   ├── KandidatCard.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── StagesSection.jsx
│   │   ├── VotingModeSection.jsx
│   │   ├── CandidatesPreview.jsx
│   │   ├── FAQSection.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages/           # Page-level components
│   │   ├── LoginMahasiswa.jsx
│   │   ├── DashboardPemilih.jsx
│   │   ├── DaftarKandidat.jsx
│   │   └── DemoAccounts.jsx
│   │
│   ├── styles/          # CSS files
│   │   ├── shared/     # ✨ Shared component styles
│   │   │   ├── PageHeader.css
│   │   │   ├── KandidatCard.css
│   │   │   └── EmptyState.css
│   │   ├── Header.css
│   │   ├── HeroSection.css
│   │   └── ... (page styles)
│   │
│   ├── App.jsx          # Main app router
│   ├── App.css          # Global app styles
│   ├── index.css        # Global reset & base styles
│   └── main.jsx         # Entry point
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Shared Components

### 1. **PageHeader** (`components/shared/PageHeader.jsx`)

Header dengan logo, title, dan user menu dropdown.

**Props:**
- `logo`: boolean - Tampilkan logo (default: true)
- `title`: string - Judul halaman
- `user`: object - Data user `{ nama, nim, fakultas }`
- `showUserMenu`: boolean - Tampilkan user menu (default: true)
- `onLogout`: function - Custom logout handler

**Usage:**
```jsx
import PageHeader from '../components/shared/PageHeader';

<PageHeader 
  title="Dashboard Pemilih"
  user={mahasiswaData}
  onLogout={handleLogout}
/>
```

---

### 2. **KandidatCard** (`components/shared/KandidatCard.jsx`)

Kartu kandidat dengan 2 variant: `full` dan `preview`.

**Props:**
- `kandidat`: object - Data kandidat
- `onClick`: function - Handler saat kartu diklik
- `variant`: 'full' | 'preview' - Tipe tampilan

**Usage:**
```jsx
import KandidatCard from '../components/shared/KandidatCard';

// Full card
<KandidatCard 
  kandidat={kandidatData}
  onClick={(id) => handleClick(id)}
/>

// Preview variant
<KandidatCard 
  kandidat={kandidatData}
  variant="preview"
/>
```

---

### 3. **EmptyState** (`components/shared/EmptyState.jsx`)

Komponen untuk menampilkan empty state dengan icon, title, description, dan optional action button.

**Props:**
- `icon`: string - Emoji/icon (default: "📭")
- `title`: string - Judul pesan
- `description`: string - Deskripsi
- `action`: object - `{ label, onClick }`

**Usage:**
```jsx
import EmptyState from '../components/shared/EmptyState';

<EmptyState 
  icon="🔍"
  title="Tidak ada kandidat ditemukan"
  description="Coba gunakan kata kunci lain"
  action={{
    label: "Reset Filter",
    onClick: handleReset
  }}
/>
```

---

## 📋 Best Practices

### ✅ **DO's**

1. **Gunakan Shared Components**
   - Untuk header yang sama: gunakan `<PageHeader />`
   - Untuk kartu kandidat: gunakan `<KandidatCard />`
   - Untuk empty state: gunakan `<EmptyState />`

2. **Struktur File yang Konsisten**
   ```
   Component.jsx        → Logic
   Component.css        → Styles
   ```

3. **Naming Convention**
   - Components: PascalCase (`PageHeader`, `KandidatCard`)
   - CSS classes: kebab-case (`page-header`, `kandidat-card`)
   - Props: camelCase (`showUserMenu`, `onClick`)

4. **Import Order**
   ```jsx
   // 1. React & hooks
   import { useState, useEffect } from 'react';
   
   // 2. Components
   import PageHeader from '../components/shared/PageHeader';
   
   // 3. Styles
   import '../styles/MyPage.css';
   ```

5. **Props Destructuring**
   ```jsx
   export default function MyComponent({ 
     title, 
     user, 
     onClick 
   }) {
     // Component logic
   }
   ```

### ❌ **DON'Ts**

1. **Jangan Duplikasi Kode**
   - ❌ Copy-paste header code di setiap halaman
   - ✅ Gunakan `<PageHeader />` shared component

2. **Jangan Inline Styles (kecuali necessary)**
   - ❌ `<div style={{ color: 'red' }}>`
   - ✅ Gunakan CSS classes

3. **Jangan Hardcode Data**
   - ❌ `const users = [...]` di dalam component
   - ✅ Pass data via props atau fetch dari API

4. **Jangan Nested Folders Berlebihan**
   - ❌ `components/admin/pages/dashboard/components/`
   - ✅ `components/`, `pages/`, `components/shared/`

---

## 🔄 Migration Guide

### Migrate ke Shared Components

**Before:**
```jsx
// DashboardPemilih.jsx - Duplicated header code
<header className="dashboard-header">
  <div className="dashboard-header-container">
    <div className="header-logo">
      <div className="logo-circle">P</div>
      ...
    </div>
    // ... 50 lines of duplicated code
  </div>
</header>
```

**After:**
```jsx
import PageHeader from '../components/shared/PageHeader';

<PageHeader 
  title="Dashboard Pemilih"
  user={mahasiswaData}
/>
```

**Benefits:**
- ✅ Reduced code: ~50 lines → 4 lines
- ✅ Consistency: Semua header sama
- ✅ Maintainability: Update 1 file = update semua halaman

---

## 📊 Metrics

### Code Reduction
- **PageHeader**: ~150 lines → Reused 3x = **~300 lines saved**
- **KandidatCard**: ~80 lines → Reused 2x = **~80 lines saved**
- **EmptyState**: ~30 lines → Reused 2x = **~30 lines saved**

**Total**: **~410 lines of code eliminated** ✨

### Maintenance
- Before: Update 3 files untuk ubah header
- After: Update 1 file (`PageHeader.jsx`) ✅

---

## 🚀 Next Steps

1. **Refactor existing pages** to use shared components
2. **Create more shared components** jika ada pola yang berulang:
   - `<InfoCard />` untuk kartu informasi
   - `<StatusBadge />` untuk badge status
   - `<FilterBar />` untuk filter & search
   
3. **Add unit tests** untuk shared components
4. **Document component props** dengan PropTypes atau TypeScript

---

## 📝 Notes

- Shared components harus **generic** dan **reusable**
- Jika component hanya dipakai 1x → bukan shared component
- Jika component dipakai 2x+ → pertimbangkan jadi shared component
- Keep shared components **simple** dan **focused**

---

**Last Updated**: 2024-11-19
**Maintained by**: PEMIRA Dev Team
