# Pemeliharaan-Aset Project Guide

## Architecture Overview

This is a React + Vite asset management system with role-based access (admin/user) and a backend proxy architecture. The frontend communicates with a separate backend server at `localhost:4000` via Vite's dev proxy.

**Key Components:**

- `src/pages/`: Role-based views (`Admin.jsx`, `User.jsx`, `Login.jsx`)
- `src/api/`: Backend communication layer (`aset.js`, `user.js`, `beban.js`, `departemen.js`, `aset-lokasi.js`, `transaksi.js`)
- `src/components/tabelAset/`: Asset table, creation, and detail views with nested feature components
- Authentication stored in `localStorage` as JSON with `{id, username, role, token?, beban?}`

## Critical Data Flow Patterns

### Backend Normalization

The backend returns inconsistent field casing (PascalCase vs camelCase). **All API functions normalize responses** in `src/api/aset.js`:

- `normalizeAset()` converts `AsetId→asetId`, `NamaAset→namaAset`, etc., including nested objects (`beban`, `departemen`)
- `toServerAset()` converts payloads back to PascalCase for API requests
- Always use camelCase in UI code; normalization handles backend variations
- Date normalization extracts `YYYY-MM-DD` from ISO strings (removes `T` and timezone)

### Asset ID Generation

Assets use composite IDs in format `xxxx/BEBAN/YYYY` (e.g., `0008/SRG-NET/2019`):

```javascript
// src/utils/format.js
generateAsetId(assets, beban, tglPembelian);
// Finds max sequence per-beban across ALL years, increments by 1
// Sequence is per-department, not per-year
```

- Admin creates with auto-generated ID from full `aset` table
- Users get read-only auto-generated IDs (fetch master list with `includeBebanHeader: false`)
- Manual override available for admins via `manualMode` toggle in `useCreateAsset.js`

### Role-Based Data Filtering

**Admin**: Can see/manage all assets (uses `listAset()` with `includeBebanHeader: false`)
**User**: Filtered by `beban` (department) with location-prefix matching:

- User with `BNT-NET` sees both `BNT-NET` and `BNT-MEDIA` assets (same prefix)
- `parseBebans()` splits comma/semicolon/pipe-separated beban strings into arrays
- `getAllowedBebansForUser()` extracts prefix (e.g., `BNT` from `BNT-NET`) and matches all bebans with same prefix
- Backend expects `x-beban` header for filtering (added by `getAuthHeaders()`)

### Location Distribution System (`distribusi_lokasi`)

Assets can be split across multiple locations using `aset_lokasi` table:

- `DistribusiLokasiInput.jsx` manages location allocations (room + quantity)
- Each location has: `{lokasi, jumlah, keterangan, id?}`
- Total allocated must not exceed `form.jumlah`
- Backend API: `src/api/aset-lokasi.js` with CRUD operations (`createAsetLokasi`, `updateAsetLokasi`, `deleteAsetLokasi`)
- Transactions (perbaikan, rusak, dipinjam, dijual) use `lokasi_id` from `aset_lokasi` as stock source
- Available rooms filtered by `beban` with autocomplete support

### Asset Transactions

All transactions (repairs, damages, loans, sales) follow similar patterns:

- API endpoints: `/perbaikan`, `/rusak`, `/dipinjam`, `/dijual`
- Each transaction references `lokasi_id` from `aset_lokasi` (not just asetId)
- Transaction tabs in `src/components/tabelAset/tabel/detail/tabs/aksi/`
- `useTabAksi.js` centralizes transaction logic with CRUD operations
- History view in `TabRiwayat.jsx` shows timeline of all transactions

## Development Workflow

### Running the App

```bash
npm run dev          # Starts Vite dev server on port 5173
# Backend must run separately on port 4000
```

### API Proxy Configuration

`vite.config.js` proxies all backend routes to `http://localhost:4000`:

- `/user`, `/aset`, `/beban`, `/departemen`, `/aset-lokasi`
- `/perbaikan`, `/rusak`, `/dipinjam`, `/dijual`, `/riwayat`

Update proxy config if backend endpoints change.

### State Management

- No Redux/Context - uses local component state + prop drilling
- Session state in `App.jsx` synced with `localStorage` (key: `"user"`)
- Asset lists fetched fresh on mount via `loadAssets()` in page components
- Mutations trigger optimistic updates + refetch patterns

## Component Conventions

### Custom Hooks Pattern

Components with complex logic extract to `use*.js` hooks:

- `useAssetDetail.js`: Image upload, barcode generation, edit mode, location distribution fetching
- `useCreateAsset.js`: Auto-generated ID toggle, file preview, barcode rendering
- `useAssetTable.js`: Pagination, sorting, selection, row highlighting logic
- `useTabAksi.js`: Transaction management (repairs, damages, loans, sales) with CRUD operations

### Form State Structure

Asset forms use a single `form` object with these exact keys:

```javascript
{
  asetId,
    accurateId,
    namaAset,
    spesifikasi,
    grup,
    beban_id, // NEW: FK to beban table (replaces string beban)
    departemen_id, // NEW: FK to departemen table
    akunPerkiraan,
    nilaiAset,
    tglPembelian,
    masaManfaat,
    statusAset,
    keterangan,
    pengguna,
    lokasi,
    distribusi_lokasi; // NEW: Array of location allocations
}
```

- `beban_id` and `departemen_id` are foreign keys (integers), not string codes
- `distribusi_lokasi` managed by `DistribusiLokasiInput` component
- Use `resetForm()` pattern to restore initial state

### Barcode Generation

Uses `bwip-js` for Code128 barcodes:

```javascript
// src/utils/barcode.js
generateBarcode(text, options);
// Returns data URL for canvas-based barcode
```

See `useCreateAsset.js` and `useAssetDetail.js` for integration patterns.

## API Conventions

### Authentication Headers

All API calls use `getAuthHeaders()` which injects:

- `Authorization: Bearer ${token}` (if available)
- `x-role: admin|user` (for role-based backend logic)
- `x-username: <username>` (for audit logging)
- `x-beban: <department>` (for user data filtering, optional via `includeBebanHeader`)

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
- When sending dates, `toServerAset()` extracts date portion only

### URL Encoding

Asset IDs contain `/` characters - always use `encodeURIComponent(asetId)` when building API URLs:

```javascript
const encodedId = encodeURIComponent(asetId);
fetch(`/aset/${encodedId}`);
```

## Constants & Configuration

**Predefined Options** (loaded dynamically from API):

- `GROUPS`: Asset categories (e.g., "BANGUNAN", "DISTRIBUSI JARINGAN", "HEADEND")
- `AKUN`: Chart of accounts (e.g., "1701-01 (Tanah)", "1701-02 (Bangunan)")
- `STATUSES`: ["aktif", "rusak", "diperbaiki", "dipinjam", "dijual"]

**Dynamic Options** (from backend tables):

- `bebanList`: Loaded via `listBeban()` → filter by `aktif: true` → display `kode`
- `departemenList`: Loaded via `listDepartemen()` → display `nama`

## Testing & Debugging

### Dev Fallback Login

If backend unavailable, use `password: "dev"` in `Login.jsx`:

- `username: admin` → admin role
- Any other username → user role with `beban: "MLG-NET,MLG-MEDIA"`

This bypass is in `src/pages/Login.jsx` line 109.

### Common Issues

1. **Assets not appearing**: Check `x-beban` header filtering - ensure `includeBebanHeader: false` for full lists
2. **404 on asset updates**: Asset IDs with `/` must be URL-encoded (`encodeURIComponent()`)
3. **Image upload fails**: Backend expects `Gambar` field (PascalCase) in FormData
4. **Barcode not generating**: Verify `bwip-js` canvas rendering in DevTools
5. **Location allocation errors**: Total `distribusi_lokasi[].jumlah` must equal `form.jumlah`
6. **Prefix filtering not working**: Ensure `bebanOptions` loaded and `getAllowedBebansForUser()` logic matches prefix extraction

## File Organization Rules

- **Page components** (`src/pages/`): Handle authentication, role guards, and top-level data fetching
- **Feature components** (`src/components/tabelAset/`): Nested by feature (table, filter, detail, FormLayout)
- **Shared components** (`src/components/`): Reusable UI (`Alert`, `Confirm`, `Navbar`, modals)
- **API layer** (`src/api/`): One file per resource (aset, beban, departemen, aset-lokasi, transaksi)
- **Utils** (`src/utils/`): Pure functions (`format.js` for parsing/formatting, `barcode.js` for barcode generation)

## Styling

- Uses Tailwind CSS v4 with custom CSS variables (indigo/gray/red palettes)
- Variables defined in `src/index.css` (e.g., `--color-indigo-600`)
- Responsive design: mobile-first with `md:` breakpoints
- No CSS modules - utility classes only
- Form inputs: `border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-300`
- Status badges use dynamic colors via `getStatusClass()` in `src/utils/format.js`
