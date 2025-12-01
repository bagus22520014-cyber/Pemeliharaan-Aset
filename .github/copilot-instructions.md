# Copilot / AI Agent Instructions — Pemeliharaan-Aset

Short summary

- React + Vite SPA (TailwindCSS) for asset management. Back-end expects: `/user` and `/aset` endpoints (plus `/perbaikan` and `/aset/{id}/gambar`).

Quick start

- Dev: `npm run dev` (Vite HMR). Build: `npm run build`. Preview: `npm run preview`. Lint: `npm run lint`.

Key patterns & constraints

- Session & auth: session kept in `localStorage.user` (JSON: {id, username, role, token?, beban?}). Use `getAuthHeaders()` in `src/api/aset.js` to include `Authorization`, `x-role`, and `x-beban` headers. `fetch` calls use `credentials: 'include'`.
- Use API helpers in `src/api/aset.js` — avoid calling fetch directly. Important helpers: `listAset`, `createAset`, `updateAset`, `deleteAset`, `uploadAsetImage` (FormData, field name 'Gambar').
- Normalization & payloads: `normalizeAset()` handles PascalCase ↔ camelCase; `cleanPayload()` removes empty strings and coerces numbers; `toServerAset()` maps client keys to backend keys and formats dates (YYYY-MM-DD).
- AsetId behavior: `generateAsetId(assets, beban, tglPembelian)` in `src/utils/format.js` formats IDs as `0001/BEBAN/YEAR`. `CreateAsset.jsx` supports manual toggle or auto suggestion (`autoAsetId`, `readOnlyAsetId`). When sending `id` in URLs, use `encodeURIComponent()` to support slashes in the asetId.
- Date & currency: UI uses `YYYY-MM-DD`. Display money with `formatRupiah()`; numeric payloads use `unformatRupiah()` before sending.

Pages & components to inspect first

- `src/App.jsx` (session routing)
- `src/pages/Login.jsx` (login + dev fallback: password `dev` creates UI-only session)
- `src/pages/Admin.jsx` (CRUD flows, `GROUPS`, `BEBANS`, `AKUN`, merge editing with form, suggested ID, filters)
- `src/pages/User.jsx` (simplified UI for non-admins)
- `src/components/CreateAsset.jsx`, `AssetTable.jsx`, `SearchFilterBar.jsx`, `AssetDetail.jsx`, `PerbaikanModal.jsx`.

Common gotchas

- The backend may return 204 No Content on update; callers should refresh state where needed (Admin currently reloads list in that case).
- `getAuthHeaders()` expects `localStorage.user` — tests or dev sessions must populate this object to simulate roles.
- Upload image endpoint expects FormData named 'Gambar' and server responses may or may not include id/asetId — upload helper sets id/asetId if missing.
- Backend responses may be an array, an object with `items`, or a single object — `listAset()` handles these variants.

Useful examples & dev tips

- Simulate admin: `localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dev', role: 'admin', beban: '' }))` then reload.
- Use `createAset(payload)` not `fetch('/aset')` to preserve normalization and headers.

Questions before changes

- If changing `src/api/aset.js`, preserve normalization, `handleResponse` semantics and the `x-role`/`x-beban` header behavior.

If you'd like, I can also add small code samples for mocking the API or extend this with a troubleshooting checklist (login issues, permissions, 204 responses, image upload errors).

# Copilot / AI Agent Instructions — Pemeliharaan-Aset

Summary

- React + Vite SPA (TailwindCSS) for asset management. UI expects endpoints like: `POST /user`, `GET/POST/PUT/DELETE /aset`, `/perbaikan` and `/aset/{id}/gambar`.
- Major pages: `src/pages/Login.jsx`, `src/pages/Admin.jsx`, `src/pages/User.jsx`. Main shared components: `src/components/CreateAsset.jsx`, `src/components/AssetTable.jsx`, `src/components/SearchFilterBar.jsx`.

Quick facts (what you'll need first)

- Dev: `npm run dev` → Vite HMR (recommended). Preview: `npm run preview`, Build: `npm run build`, Lint: `npm run lint`.
- Session is stored in `localStorage.user` as JSON: {id, username, role, token?, beban?}. Use `getAuthHeaders()` from `src/api/aset.js` to generate headers (handles Authorization, `x-role`, and `x-beban`).
- Backend may return fields in PascalCase or camelCase. Use API helpers in `src/api/aset.js` to normalize (normalizeAset, toServerAset).

Architecture & Major Patterns

- Single-page React app. `App.jsx` controls authentication and routes users by role (`admin` vs `user`).
- Pages own state; components are presentational. For example, `CreateAsset.jsx` is a stateless controlled form — the parent (Admin/User) manages `form` and `setForm` and passes handlers.
- API helpers centralize network logic (`src/api/aset.js`):
  - `listAset()`, `createAset(payload)`, `updateAset(id, payload)`, `deleteAset(id)`, `uploadAsetImage(id, file)`.
  - `normalizeAset()` normalizes PascalCase -> camelCase and standardizes `tglPembelian` to `YYYY-MM-DD`.
  - `cleanPayload()` removes empty strings and converts `nilaiAset`/`masaManfaat` strings to numbers.
  - `toServerAset()` maps client fields to expected server keys. Always call helpers rather than manual fetch to maintain consistent behavior.

Auth, Roles & Dev Login

- Login endpoint: `POST /user` with `credentials: 'include'` (cookie-based or token allowed). If backend returns token, `Login` will include it in `localStorage`.
- Dev fallback: if login fails and password is `dev`, the app will create a UI-only session. Username `admin` => admin role; otherwise user role (see `Login.jsx`).
- For API calls that need auth or role simulation, `getAuthHeaders()` picks tokens, `role` and `beban` from `localStorage.user` and attaches `Authorization` and `x-role`, `x-beban` headers.

Key Developer Conventions

- Forms & state
  - Parent component owns the `form` object and passes `form` and `setForm` to `CreateAsset` (stateless form component).
  - When editing, Admin merges `editing` + `form` to send updates, preventing overwriting missing fields.
- AsetId behavior
  - Auto-generated AsetId via `generateAsetId(assets, beban, tglPembelian)` from `src/utils/format.js`. Format: `0001/BEBAN/YEAR`.
  - `CreateAsset.jsx` supports manual editing (toggle) and `readOnlyAsetId` and `autoAsetId` props.
  - Use `asetId` (preferred) or numeric DB `id` for network calls; the API `updateAset` URL is encoded using `encodeURIComponent` to support slashes in `asetId`.
- Date & money values
  - UI uses `YYYY-MM-DD` for dates. API helpers will format/parse; keep UI values as `YYYY-MM-DD`.
  - Currency: format displayed values using `formatRupiah()` and store numbers using `unformatRupiah()`; `cleanPayload()` coerces `nilaiAset` numbers on the client.

Network & API GOTCHAS

- The backend may return 204 No Content on update; API helpers return `null` and callers (e.g. Admin) should refresh the list if needed.
- Upload image uses `PUT /aset/{encodedId}/gambar` with FormData 'Gambar' field; do NOT set Content-Type when sending FormData.
- Errors: `handleResponse` throws enriched errors with `status` and `body`. Inspect `err.status` for 401/403 to detect session issues.
- For role-restricted views, Admin checks `sessionUser.role === 'admin'` in `Admin.jsx` and shows a `Forbidden` page otherwise.

UX & Components

- `SearchFilterBar` supports filters and a `Scan` modal that looks up `asetId` by exact match; `onScanFound` receives the asset.
- `AssetTable` supports selection and batch actions (e.g., mass delete), and exposes a `goToAsset(asetId)` method via `ref` for programmatic navigation from parent.
- `CreateAsset` props to note: `form`, `setForm`, `onSubmit`, `onCancel`, `isEditing`, `loading`, `error`, `groups`, `bebans`, `akun`, `autoAsetId`, `readOnlyAsetId`, `submitDisabled`.

Files of interest

- `src/App.jsx` — session routing
- `src/pages/Login.jsx` — login & dev fallback
- `src/pages/Admin.jsx` — admin CRUD, constants (GROUPS, BEBANS, AKUN), suggested AsetId behavior
- `src/pages/User.jsx` — read-only or user-facing actions (mirrors Admin conventions)
- `src/api/aset.js` — network helpers & normalization (single source of truth); DON'T call fetch directly in pages unless necessary
- `src/components/CreateAsset.jsx` — form for create/edit; stateless
- `src/components/SearchFilterBar.jsx` — filters & scan
- `src/components/AssetTable.jsx` — list, selection, actions
- `src/utils/format.js` — `formatRupiah`, `unformatRupiah`, `generateAsetId`

Examples & snippets

- Simulate admin login in browser console (UI-only session):
  - localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dev', role: 'admin', beban: '' }))
- Use API helper (do not call fetch directly):
  - import { listAset, createAset, updateAset } from 'src/api/aset.js'
  - const result = await createAset(payload) // payload => will be cleaned & mapped

Quick debugging tips

- Look for `console.debug` calls in `src/api/aset.js` and pages for helpful logging; many debug lines are only present in non-production development
- For auth tests: either start a backend or use the `dev` password fallback to create a local UI session.

Contribute & follow-up

- Keep business logic in pages, not in form components. Form components should stay stateless and accept `form`, `setForm` and `onSubmit` handlers.
- When changing API helpers, preserve behavior for Pascal vs camelCase API responses and 204 No Content cases.

If any specific area (e.g., `AssetTable`, CSV import/export, image upload flow) needs more detail, say which one and I’ll expand the instructions.

# Copilot / AI Agent Instructions — Pemeliharaan-Aset

Summary

- This is a small React + Vite SPA (TailwindCSS) to manage assets. The frontend expects a backend with endpoints for authentication and assets (e.g., `POST/GET /user`, `GET/POST/PUT/DELETE /aset`).
- Key pages: `src/pages/Login.jsx`, `src/pages/Admin.jsx`, `src/pages/User.jsx`. Shared form component: `src/components/CreateAsset.jsx`.

Architecture & "Why" (big picture)

- Single-page React app using Vite (fast dev HMR). The app manages session state in `localStorage` under the `user` key; `App.jsx` centralizes session and role-based routing.
- API calls are routed through `src/api/aset.js`, which intentionally normalizes server responses so the app can work with different backend field naming styles (PascalCase or camelCase).
- The UI uses Tailwind classes and local component state for forms (controlled by `form` and `setForm` props). Pages are stateful and call API helper functions to perform side effects.

Developer workflows (quick commands)

- Start dev server: `npm run dev` (Vite HMR, default https://localhost:5173 or http://localhost:5173)
- Build production assets: `npm run build`
- Quick preview for production build: `npm run preview`
- Linting: `npm run lint` (ESLint)

Conventions & patterns

- Session & auth

  - The session is kept in `localStorage.user` (JSON). Shape used in code: `{ id, username, role, token?, beban? }`.
  - `src/api/aset.js#getAuthHeaders()` reads this object and adds `Authorization: Bearer <token>`, `x-role`, and `x-beban` headers when available.
  - `fetch(...)` calls set `credentials: "include"`. The app expects either cookie-based auth (via `credentials`) or `token` in localStorage for Authorization header.
  - Login fallback: the login form accepts a password `dev` and will create a UI-only session for local development (username `admin` => admin role), helpful when the backend is unavailable. See `src/pages/Login.jsx`.

- API helpers & normalization

  - Use the functions exported from `src/api/aset.js` (listAset, createAset, updateAset, deleteAset) rather than calling `fetch` directly. Helpers:
    - Normalize fields (PascalCase to camelCase) via `normalizeAset()`.
    - Convert client date (`YYYY-MM-DD`) to backend ISO with `toServerAset()`.
    - Clean empty or local-UI-only fields with `cleanPayload()`.
    - Convert a rupiah string to a number and vice versa using `formatRupiah` / `unformatRupiah` in `src/utils/format.js`.
  - `handleResponse` centralizes error parsing and attaches `status` and `body` properties to thrown errors — inspect these in callers for custom behavior.

- Data & UI
  - `CreateAsset.jsx` is a controlled form: the parent page owns the `form` and `setForm`. To add fields, update the parent `form` initial state and form mapping in the child.
  - `Admin.jsx` includes `GROUPS`, `BEBANS`, and `AKUN` lists (page-level constants). Update these lists in `Admin.jsx` / `User.jsx` if new options are needed.
  - When updating or removing assets, `Admin.jsx` merges `editing` and `form` objects before calling `updateAset()` so partial edits don't remove earlier values.

Patterns to follow when editing or extending

- Prefer using API helpers in `src/api/aset.js` to keep behavior consistent across pages.
- Use `id ?? asetId` when referring to record identity — the backend may return fields differently.
- Keep business logic in pages, not in the form component — `CreateAsset.jsx` is intentionally stateless.
- Keep date fields as `YYYY-MM-DD` in UI forms, rely on `toServerAset()` to convert to ISO timestamp as the backend needs.

- Split presentational concerns into small, reusable components (e.g., `CreateAsset.jsx` (form), `SearchFilterBar.jsx` (filter + search), `AssetTable.jsx` (table)). Pages should own state and pass props/handlers down to components.

Debugging & testing hints

- Browser console: many functions log `console.debug` to help during development. Search for `console.debug` calls (e.g., `listAset`, create/update functions) to find runtime logs.
- Backend not available? Use the dev login fallback: submit `password: dev` on the login form (username `admin` → admin role, other names → user). This bypasses the backend for UI-only workflows.
- For unit tests or mocking: mock `global.fetch` and ensure returned records are either an array or an object with `items` (code handles both). Return either PascalCase or camelCase fields (helper functions will normalize).

Files to reference when working in the codebase

- App entry: `src/App.jsx` — session and top-level routing
- Pages: `src/pages/Login.jsx`, `src/pages/Admin.jsx`, `src/pages/User.jsx`
- Reusable UI: `src/components/CreateAsset.jsx`, `src/components/Forbidden.jsx`, `src/components/SearchFilterBar.jsx`, `src/components/AssetTable.jsx`
- API helpers: `src/api/aset.js` (normalization, headers, error handling)
- Formatting: `src/utils/format.js` (currency -> rupiah format)
- Tailwind entry: `src/index.css` and `tailwind` is a dev dependency

Examples

- Use `listAset()` instead of `fetch("/aset")` to preserve normalization & headers.
- In Admin update flow: `const payload = { ...editing, ...form }; updateAset(id, payload);` — this preserves unseen fields from the previous version.
- Auth headers & role simulation: set `localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dev', role: 'admin', beban: '' }));` then reload to simulate login.

Gotchas & watchouts

- There is duplicated form markup between `CreateAsset.jsx` and `src/pages/User.jsx` — consider consolidating to avoid inconsistent behavior across pages.
- Backend shape may vary (PascalCase vs camelCase). Never rely on a specific case when reading from the network; instead, rely on `src/api/aset.js`.
- Some servers return 204 No Content on update; callers handle this by reloading the list and showing a warning in UI. If you change the API helpers, preserve this behavior.

If anything above is unclear or you want the copilot instructions to include more examples (mock server responses, sample `fetch` payloads), tell me which area to expand and I’ll update the file.
