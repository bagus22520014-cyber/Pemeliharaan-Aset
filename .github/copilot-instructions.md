# Pemeliharaan-Aset Project Guide

## Architecture Overview

This is a React + Vite asset management system with role-based access (admin/user) and a backend proxy architecture. The frontend communicates with a separate backend server at `localhost:4000` via Vite's dev proxy.

**Key Components:**

- `src/pages/`: Role-based views (`Admin.jsx`, `User.jsx`, `Login.jsx`)
- `src/api/`: Backend communication layer (`aset.js`, `user.js`)
- `src/components/tabelAset/`: Asset table, creation, and detail views
- Authentication stored in `localStorage` as JSON with `{id, username, role, token?, beban?}`

## Critical Data Flow Patterns

### Backend Normalization

The backend returns inconsistent field casing (PascalCase vs camelCase). **All API functions normalize responses** in `src/api/aset.js`:

- `normalizeAset()` converts `AsetId→asetId`, `NamaAset→namaAset`, etc.
- `toServerAset()` converts payloads back to PascalCase for API requests
- Always use camelCase in UI code; normalization handles backend variations

### Asset ID Generation

Assets use composite IDs in format `xxxx/BEBAN/YYYY` (e.g., `0008/SRG-NET/2019`):

```javascript
// src/utils/format.js
generateAsetId(assets, beban, tglPembelian);
// Finds max sequence per-beban across all years, increments by 1
```

- Admin creates with auto-generated ID from `aset` table
- Users get read-only auto-generated IDs
- Manual override available for admins via `manualMode` toggle

### Role-Based Data Filtering

**Admin**: Can see/manage all assets (uses `listAset()` with `includeBebanHeader: false`)
**User**: Filtered by `beban` (department) with location-prefix matching:

- User with `BNT-NET` sees both `BNT-NET` and `BNT-MEDIA` assets
- Filtering uses `parseBebans()` + `getAllowedBebansForUser()` logic (see `src/pages/User.jsx`)
- Backend expects `x-beban` header for filtering (added by `getAuthHeaders()`)

## Development Workflow

### Running the App

```bash
npm run dev          # Starts Vite dev server on port 5173
# Backend must run separately on port 4000
```

### API Proxy Configuration

`vite.config.js` proxies `/user`, `/aset`, `/perbaikan` to `http://localhost:4000`. Update proxy config if backend endpoints change.

### State Management

- No Redux/Context - uses local component state + prop drilling
- Session state in `App.jsx` synced with `localStorage`
- Asset lists fetched fresh on mount via `loadAssets()` in page components

## Component Conventions

### Custom Hooks Pattern

Components with complex logic extract to `use*.js` hooks:

- `useAssetDetail.js`: Handles image upload, barcode generation, master/aset record fetching
- `useCreateAsset.js`: Auto-generated ID toggle, file preview, barcode rendering
- `useAssetTable.js`: Pagination, sorting, selection, highlighting logic

### Form State Structure

Asset forms use a single `form` object with these exact keys:

```javascript
{
  asetId,
    accurateId,
    namaAset,
    spesifikasi,
    grup,
    beban,
    akunPerkiraan,
    nilaiAset,
    tglPembelian,
    masaManfaat,
    statusAset,
    keterangan;
}
```

- Initial values use empty strings for `grup`, `beban`, and `akunPerkiraan` (placeholder-based)
- Use `resetForm()` pattern to restore initial state

### Barcode Generation

Uses `bwip-js` for Code128 barcodes. See `useCreateAsset.js` and `useAssetDetail.js` for canvas-based generation patterns.

## API Conventions

### Authentication Headers

All API calls use `getAuthHeaders()` which injects:

- `Authorization: Bearer ${token}` (if available)
- `x-role: admin|user` (for role-based backend logic)
- `x-beban: <department>` (for user data filtering)

### Error Handling

```javascript
try {
  const data = await someApiCall();
} catch (err) {
  // err.status contains HTTP status code
  // err.message contains normalized error message
  // err.body contains raw response body
}
```

### Date Handling

- UI displays dates as `YYYY-MM-DD` (date inputs)
- Backend may return ISO strings with `T` - normalize using regex in `normalizeAset()`
- When sending dates, extract date portion only (see `toServerAset()`)

## Constants & Configuration

**Predefined Options** (defined in both `Admin.jsx` and `User.jsx`):

```javascript
GROUPS: ["BANGUNAN", "DISTRIBUSI JARINGAN", "HEADEND", ...]
BEBANS: ["MLM", "BJR-NET", "BNT-NET", ...] // 35 departments
AKUN: ["1701-01 (Tanah)", "1701-02 (Bangunan)", ...]
STATUSES: ["aktif", "rusak", "diperbaiki", "dipinjam", "dijual"]
```

## Testing & Debugging

### Dev Fallback Login

If backend unavailable, use `password: "dev"` to simulate local session:

- `username: admin` → admin role
- Any other username → user role with `beban: "MLG-NET,MLG-MEDIA"`

### Common Issues

1. **Assets not appearing**: Check `x-beban` header filtering - ensure `includeBebanHeader: false` for full lists
2. **404 on asset updates**: Asset IDs with `/` must be URL-encoded (`encodeURIComponent()`)
3. **Image upload fails**: Verify backend endpoint expects `Gambar` field name (not `gambar`)
4. **Barcode not generating**: Check `bwip-js` canvas rendering in browser DevTools

## File Organization Rules

- **Page components** (`src/pages/`): Handle authentication, role guards, and top-level data fetching
- **Feature components** (`src/components/tabelAset/`): Nested by feature (table, filter, detail)
- **Shared components** (`src/components/`): Reusable UI (`Alert`, `Confirm`, `Navbar`)
- **Utils** (`src/utils/format.js`): Pure functions for formatting, parsing, and ID generation

## Styling

- Uses Tailwind CSS v4 with custom indigo/gray/red color variables (see `tailwind.config.js`)
- Responsive design: mobile-first with `md:` breakpoints
- No CSS modules - utility classes only
- Form inputs: `border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-300`
