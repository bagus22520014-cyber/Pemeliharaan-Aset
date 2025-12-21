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

# Copilot / Agent Instructions — Pemeliharaan-Aset (concise)

Purpose: help an AI coding assistant be immediately productive in this repo — frontend React+Vite app with a sibling Node backend in `pemeliharaan-aset-database`.

Repo layout (explicit):

- `Pemeliharaan-Aset` = frontend (React + Vite, UI assets in `src/`).
- `pemeliharaan-aset-database` = backend (Node/Express routes, DB access in `db.js`).

- Quick run: `npm run dev` in the `Pemeliharaan-Aset` folder (Vite frontend). Backend runs separately (default: http://localhost:4000).
- Backend code and routes live in `pemeliharaan-aset-database/routes/*.js` and `pemeliharaan-aset-database/index.js`.

Key patterns (actionable, repo-specific):

- API layer: one file per resource in `src/api/` (e.g., `src/api/aset.js`, `src/api/aset-lokasi.js`). Use these helpers — they normalize PascalCase ↔ camelCase and centralize `fetch`/headers.
- Normalization: prefer camelCase in UI. Use `normalizeAset()` / `toServerAset()` in `src/api/aset.js` when reading/sending assets.
- Encoding: asset identifiers contain `/` — always `encodeURIComponent(asetId)` when constructing URLs.
- Auth headers: calls use `getAuthHeaders()` which adds `Authorization`, `x-role`, `x-username`, and optionally `x-beban` for server-side filtering. Inspect `src/api/*` for examples.

Important components and where to look:

- Pages and entry: [src/main.jsx](src/main.jsx), [src/App.jsx](src/App.jsx), [src/pages/](src/pages/)
- Asset features: [src/components/tabelAset/](src/components/tabelAset/) (table, detail, tabs, actions)
- Hooks: `useCreateAsset.js`, `useAssetDetail.js`, `useTabAksi.js` — these encapsulate form, barcode, and transaction logic.
- Location allocation: `DistribusiLokasiInput.jsx` and `src/api/aset-lokasi.js` — ensure total allocation equals `form.jumlah`.
- Barcode: `src/utils/barcode.js` (uses bwip-js) — returns image data URLs for display and printing.

Developer workflows & gotchas:

- Dev server: `npm run dev` (frontend). Proxy configured in `vite.config.js` to forward API calls to `http://localhost:4000`.
- Backend dev: open `pemeliharaan-aset-database/index.js` and run `node index.js` (or `npm start` inside that folder). Routes are in `pemeliharaan-aset-database/routes/`.
- Login dev fallback: `src/pages/Login.jsx` contains a dev-only path if the backend is down — useful for UI work.
- File uploads: backend expects PascalCase fields (e.g., `Gambar`) in FormData — check `create` and `update` flows in `src/api/aset.js`.

Conventions to follow when editing code:

- Stick to camelCase in UI code; rely on API normalization helpers for server compatibility.
- Prefer small, focused changes in `src/api/*` rather than spreading header/normalize logic across components.
- When adding features that change data shape, update the matching `normalize` and `toServer` helpers.

Where the backend matters:

- Cross-repo link: `pemeliharaan-aset-database/` contains database access (`db.js`) and route logic — change both frontend and backend when altering API contracts.

Testing and debugging tips:

- Common error checks: URL-encoding for IDs, `x-beban` header for filtered lists, total of `distribusi_lokasi` equals `form.jumlah`, FormData field names for file uploads.
- Use browser DevTools to inspect requests (headers and body) and confirm normalized payloads match backend expectations.

If you change API shapes or field casing, update `src/api/*` normalization helpers first and run integration checks against the local backend in `pemeliharaan-aset-database`.

Files to reference when implementing or reviewing changes:

- Frontend entry and routing: [src/main.jsx](src/main.jsx) and [src/App.jsx](src/App.jsx)
- API layer: [src/api/aset.js](src/api/aset.js) and other files in [src/api/](src/api/)
- Asset UI and hooks: [src/components/tabelAset/](src/components/tabelAset/) and [src/utils/barcode.js](src/utils/barcode.js)
- Backend: [pemeliharaan-aset-database/index.js](pemeliharaan-aset-database/index.js) and [pemeliharaan-aset-database/routes/](pemeliharaan-aset-database/routes/)

Ask me to expand any section (API examples, common edits, or a checklist for PR reviews) and I'll iterate.

## Component Conventions
