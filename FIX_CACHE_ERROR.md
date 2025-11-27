# Fix: Module Export Error - Cache Issue

## Error yang Muncul
```
useTPSAdminStore.tsx:3 Uncaught SyntaxError: The requested module '/src/services/adminTps.ts?t=1764201967548' does not provide an export named 'createAdminTps'
```

## Penyebab
Error ini disebabkan oleh **cache browser/Vite** yang masih menyimpan versi lama dari module sebelum integrasi API.

## Solusi

### ✅ Cara 1: Clear Cache & Restart Dev Server (RECOMMENDED)

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear cache
rm -rf dist node_modules/.vite

# 3. Clear browser cache
# - Chrome/Edge: Ctrl+Shift+Delete → Clear cache
# - Firefox: Ctrl+Shift+Delete → Cookies and Site Data
# - Safari: Cmd+Option+E

# 4. Restart dev server
npm run dev

# 5. Hard refresh browser
# - Windows: Ctrl+Shift+R
# - Mac: Cmd+Shift+R
```

### ✅ Cara 2: Force Browser Hard Reload

Jika masih error setelah cara 1:

**Chrome/Edge:**
1. Buka DevTools (F12)
2. Klik kanan di tombol refresh
3. Pilih "Empty Cache and Hard Reload"

**Firefox:**
1. Buka DevTools (F12)
2. Klik kanan di tombol refresh
3. Pilih "Hard Refresh"

**Safari:**
1. Preferences → Advanced → "Show Develop menu"
2. Develop → Empty Caches
3. Cmd+Shift+R

### ✅ Cara 3: Incognito/Private Mode

Buka aplikasi di mode incognito/private untuk memverifikasi bahwa code baru berfungsi:

```
Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
Firefox: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
Safari: Cmd+Shift+N
```

## Verifikasi Fix

Setelah clear cache, cek di browser console:

```javascript
// Buka Console (F12)
// Paste ini dan tekan Enter:
import('/src/services/adminTps.ts').then(m => console.log(Object.keys(m)))

// Output harus menunjukkan semua exports:
// ["createAdminTps", "fetchAdminTpsList", "fetchAdminTpsDetail", ...]
```

## Build Production

Jika masih error di production build:

```bash
# Clean build
rm -rf dist

# Rebuild
npm run build

# Preview
npm run preview
```

## Technical Details

### Yang Sudah Diperbaiki:

✅ Response handling di `createAdminTps` dan `updateAdminTps`:
```typescript
// Before
const response = await apiRequest<AdminTpsDTO>(...)
return mapTps(response)

// After (handles wrapped response)
const response = await apiRequest<any>(...)
const data = (response?.data ?? response) as AdminTpsDTO
return mapTps(data)
```

✅ Semua exports sudah ada dan valid di `src/services/adminTps.ts`:
- createAdminTps ✓
- updateAdminTps ✓
- deleteAdminTps ✓
- fetchAdminTpsList ✓
- fetchAdminTpsDetail ✓
- fetchAdminTpsOperators ✓
- createAdminTpsOperator ✓
- deleteAdminTpsOperator ✓
- fetchAdminTpsAllocation ✓
- fetchAdminTpsActivity ✓
- fetchAdminTpsQrMetadata ✓
- rotateAdminTpsQr ✓
- fetchAdminTpsQrForPrint ✓

## Jika Masih Error

Jika setelah semua langkah di atas masih error, coba:

1. **Delete node_modules dan reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

2. **Check Vite config:**
   ```bash
   # Tambahkan di vite.config.ts jika belum ada:
   server: {
     fs: {
       strict: false
     }
   }
   ```

3. **Restart komputer** (last resort untuk clear semua cache)

## Contact

Jika masih mengalami error setelah semua langkah di atas, berikan info:
- Error message lengkap dari console
- Browser & version
- OS
- Node version (`node -v`)
- NPM version (`npm -v`)

---

**Status:** Fixed ✅  
**Commit:** b309571 - fix: improve response handling in createAdminTps and updateAdminTps
