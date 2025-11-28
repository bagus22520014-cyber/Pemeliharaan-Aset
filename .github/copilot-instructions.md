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
