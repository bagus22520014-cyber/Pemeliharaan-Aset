const BASE = "/aset";

// Backend normalization: some backends might return PascalCase fields
// (AsetId, AccurateId, NamaAset, etc). The app expects camelCase keys
// (asetId, accurateId, namaAset). Normalize records here to avoid
// repeating mapping logic across the app.
function normalizeAset(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  // map common PascalCase variants to the expected keys
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;
  if (r.AccurateId && !r.accurateId) r.accurateId = r.AccurateId;
  if (r.NamaAset && !r.namaAset) r.namaAset = r.NamaAset;
  if (r.Spesifikasi && !r.spesifikasi) r.spesifikasi = r.Spesifikasi;
  if (r.Grup && !r.grup) r.grup = r.Grup;
  if (r.Beban && !r.beban) r.beban = r.Beban;
  if (r.AkunPerkiraan && !r.akunPerkiraan) r.akunPerkiraan = r.AkunPerkiraan;
  if (r.NilaiAset && !r.nilaiAset) r.nilaiAset = r.NilaiAset;
  if (r.TglPembelian && !r.tglPembelian) r.tglPembelian = r.TglPembelian;
  if (r.MasaManfaat && !r.masaManfaat) r.masaManfaat = r.MasaManfaat;
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  // Support AsetId as a possible primary key returned by some backends
  if (r.AsetId && !r.id) r.id = r.AsetId;
  if (r.asetId && !r.id) r.id = r.asetId;
  // Normalize tglPembelian to a date-only string (YYYY-MM-DD) for consistent UI and form values
  if (
    r.tglPembelian &&
    typeof r.tglPembelian === "string" &&
    r.tglPembelian.includes("T")
  ) {
    try {
      const d = new Date(r.tglPembelian);
      if (!Number.isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, "0");
        r.tglPembelian = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}`;
      }
    } catch {
      // leave as-is if parsing fails
    }
  }
  return r;
}

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const user = JSON.parse(raw);
    const headers = {};
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    // Some backends in dev expect an explicit 'x-role' header for role-based testing
    // (e.g. x-role: admin). Attach it if present in the session user.
    if (user?.role) headers["x-role"] = String(user.role);
    // Add x-beban to support backend filtering by user 'beban' for non-admin users
    if (user?.beban) headers["x-beban"] = String(user.beban);
    return headers;
  } catch (err) {
    // failed to parse localStorage: ignore and return no headers
  }
  return {};
}

function cleanPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v === "" || v == null) continue;
    if (k === "nilaiAset" || k === "masaManfaat") {
      let raw = v;
      if (typeof raw === "string") {
        // if user entered "12.345" (rupiah format), remove dots
        raw = raw.replace(/\./g, "");
      }
      const n = Number(raw);
      out[k] = Number.isFinite(n) ? n : v;
      continue;
    }
    out[k] = v;
  }
  return out;
}

function toServerAset(payload) {
  if (!payload || typeof payload !== "object") return payload;
  const out = {};
  const map = {
    asetId: "AsetId",
    accurateId: "AccurateId",
    namaAset: "NamaAset",
    spesifikasi: "Spesifikasi",
    grup: "Grup",
    beban: "Beban",
    akunPerkiraan: "AkunPerkiraan",
    nilaiAset: "NilaiAset",
    tglPembelian: "TglPembelian",
    masaManfaat: "MasaManfaat",
    id: "ID",
  };
  for (const [k, v] of Object.entries(payload)) {
    const key = map[k] ?? k;
    if (k === "tglPembelian" && typeof v === "string") {
      // DB expects date-only value YYYY-MM-DD. Support input as:
      //  - YYYY-MM-DD -> send untouched
      //  - ISO datetime string (contains T) -> extract date portion
      //  - Other date-like strings -> parse and format as YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        out[key] = v;
        continue;
      }
      if (v.includes("T")) {
        const dpart = v.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dpart)) {
          out[key] = dpart;
          continue;
        }
      }
      // fallback: try parse via JS Date and convert
      try {
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, "0");
          out[key] = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}`;
          continue;
        }
      } catch (err) {
        // parse error - leave the original value in place
      }
    }
    out[key] = v;
  }
  return out;
}

async function handleResponse(res) {
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let body;
    try {
      body = ct.includes("application/json")
        ? await res.json()
        : await res.text();
    } catch {
      body = null;
    }
    // Normalize server error messages: prefer body.message or body.error
    let message;
    if (body && typeof body === "object") {
      message = body.message || body.error || JSON.stringify(body);
    } else {
      message = String(body ?? res.status);
    }
    const e = new Error(message);
    // attach additional metadata for callers that might want to inspect it
    e.status = res.status;
    e.body = body;
    throw e;
  }
  // Handle No Content or non-JSON responses gracefully
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function listAset() {
  const headers = getAuthHeaders();
  const headersForLog = { ...headers };
  if (headersForLog.Authorization) delete headersForLog.Authorization;
  // debug logging removed for production
  const res = await fetch(BASE, {
    credentials: "include",
    headers,
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizeAset);
  if (Array.isArray(data?.items)) return data.items.map(normalizeAset);
  return normalizeAset(data);
}

export async function createAset(payload) {
  // debug logging removed for production
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const headersForLog = { ...headers };
  if (headersForLog.Authorization) delete headersForLog.Authorization;
  // debug logging removed for production
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(toServerAset(cleanPayload(payload))),
  });
  const data = await handleResponse(res);
  // debug logging removed for production
  return normalizeAset(data);
}

export async function updateAset(id, payload) {
  // debug logging removed for production
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const headersForLog = { ...headers };
  if (headersForLog.Authorization) delete headersForLog.Authorization;
  // debug logging removed for production
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(toServerAset(cleanPayload(payload))),
  });
  const data = await handleResponse(res);
  // debug logging removed for production
  return normalizeAset(data);
}

export async function deleteAset(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export default { listAset, createAset, updateAset, deleteAset };
