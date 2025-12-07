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
  if (r.AkunPerkiraan && !r.akunPerkiraan) r.akunPerkiraan = r.AkunPerkiraan;
  if (r.NilaiAset && !r.nilaiAset) r.nilaiAset = r.NilaiAset;
  if (r.TglPembelian && !r.tglPembelian) r.tglPembelian = r.TglPembelian;
  if (r.StatusAset && !r.statusAset) r.statusAset = r.StatusAset;
  if (r.Status && !r.statusAset) r.statusAset = r.Status;
  if (r.Keterangan && !r.keterangan) r.keterangan = r.Keterangan;
  if (r.Gambar && !r.gambar) r.gambar = r.Gambar;
  if (r.MasaManfaat && !r.masaManfaat) r.masaManfaat = r.MasaManfaat;
  if (r.Pengguna && !r.pengguna) r.pengguna = r.Pengguna;
  if (r.Lokasi && !r.lokasi) r.lokasi = r.Lokasi;
  if (r.jumlah === undefined && r.Jumlah !== undefined) r.jumlah = r.Jumlah;
  if (r.nilai_satuan === undefined && r.NilaiSatuan !== undefined)
    r.nilai_satuan = r.NilaiSatuan;
  if (r.nilai_satuan === undefined && r.nilaiSatuan !== undefined)
    r.nilai_satuan = r.nilaiSatuan;

  // Handle beban_id and nested beban object
  if (r.beban_id === undefined && r.BebanId !== undefined)
    r.beban_id = r.BebanId;
  if (r.beban && typeof r.beban === "object" && r.beban.kode) {
    // Backend returns nested beban object, extract kode for backward compatibility
    r.bebanKode = r.beban.kode;
  } else if (r.Beban && !r.bebanKode) {
    // Old format: Beban as string
    r.bebanKode = r.Beban;
  }

  // Handle departemen_id and nested departemen object
  if (r.departemen_id === undefined && r.DepartemenId !== undefined)
    r.departemen_id = r.DepartemenId;
  if (r.departemen && typeof r.departemen === "object" && r.departemen.nama) {
    r.departemenNama = r.departemen.nama;
    r.departemenKode = r.departemen.kode;
  }

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
    // Extract date portion directly from ISO string (e.g., "2025-12-11T17:00:00.000Z" -> "2025-12-11")
    const datePart = r.tglPembelian.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      r.tglPembelian = datePart;
    }
  }
  // Backend may return distribusi_lokasi as nested object with locations array
  if (r.distribusi_lokasi && typeof r.distribusi_lokasi === "object") {
    // Keep the structure for display
    // Expected format: { total_allocated, available, locations: [...] }
    r.distribusi_lokasi = r.distribusi_lokasi;
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
    // Add x-username header for backend logging/audit trail
    if (user?.username) headers["x-username"] = String(user.username);
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
    beban_id: "beban_id",
    departemen_id: "departemen_id",
    akunPerkiraan: "AkunPerkiraan",
    nilaiAset: "NilaiAset",
    jumlah: "jumlah",
    nilai_satuan: "nilai_satuan",
    tglPembelian: "TglPembelian",
    statusAset: "StatusAset",
    status: "StatusAset",
    keterangan: "Keterangan",
    masaManfaat: "MasaManfaat",
    pengguna: "Pengguna",
    lokasi: "Lokasi",
    distribusi_lokasi: "distribusi_lokasi",
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

export async function listAset(opts = { includeBebanHeader: true }) {
  const headers = getAuthHeaders();
  if (opts && opts.includeBebanHeader === false) {
    // Remove x-beban to allow fetching all assets regardless of the session user's beban.
    if (headers && headers["x-beban"]) delete headers["x-beban"];
  }
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

export async function getAset(id, opts = { includeBebanHeader: true }) {
  if (!id) return null;
  const encoded = encodeURIComponent(String(id));
  const headers = getAuthHeaders();
  if (opts && opts.includeBebanHeader === false) {
    if (headers && headers["x-beban"]) delete headers["x-beban"];
  }
  const res = await fetch(`${BASE}/${encoded}`, {
    credentials: "include",
    headers,
  });
  const data = await handleResponse(res);
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

// When sending an asset identifier in the URL, ensure it's properly encoded
// so that characters like `/` are percent-encoded and treated as a single
// path segment by the backend. Some backends map resources by "AsetId"
// (e.g., '0008/SRG-NET/2019') — encoding prevents those slashes from
// being interpreted as separate path segments by the dev server or proxy.
export async function updateAset(id, payload) {
  // debug logging removed for production
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const headersForLog = { ...headers };
  if (headersForLog.Authorization) delete headersForLog.Authorization;
  // debug logging removed for production
  const encoded = encodeURIComponent(String(id));
  // Temporary debug: show outgoing update request to help diagnose server issues
  try {
    // eslint-disable-next-line no-console
    console.debug(
      "updateAset -> URL:",
      `${BASE}/${encoded}`,
      "payload:",
      JSON.stringify(toServerAset(cleanPayload(payload)))
    );
  } catch {}
  const res = await fetch(`${BASE}/${encoded}`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(toServerAset(cleanPayload(payload))),
  });
  const data = await handleResponse(res);
  try {
    // eslint-disable-next-line no-console
    console.debug("updateAset -> response:", res.status, data);
  } catch {}
  // debug logging removed for production
  return normalizeAset(data);
}

export async function deleteAset(id) {
  const encoded = encodeURIComponent(String(id));
  const res = await fetch(`${BASE}/${encoded}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function uploadAsetImage(id, file) {
  if (!id) throw new Error("No id provided");
  if (!file) throw new Error("No file provided");

  const encoded = encodeURIComponent(String(id));
  const form = new FormData();
  // Use 'Gambar' field name to match the backend example
  form.append("Gambar", file);

  const headers = getAuthHeaders();

  // When sending FormData, do not set Content-Type header (browser will set it)
  const res = await fetch(`${BASE}/${encoded}/gambar`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: form,
  });

  const data = await handleResponse(res);

  const normalized = normalizeAset(data) || {};
  // If server didn't include id/asetId in response, fill it from the provided id
  if (!normalized.id && !normalized.asetId) {
    // if id looks numeric, set as id; otherwise set as asetId
    const idStr = String(id ?? "");
    if (/^\d+$/.test(idStr)) normalized.id = idStr;
    else normalized.asetId = idStr;
  }
  return normalized;
}

// Perbaikan (repairs) api helpers
function normalizePerbaikan(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;
  if (r.tanggal_perbaikan && !r.tanggal) r.tanggal = r.tanggal_perbaikan;
  if (r.Tanggal && !r.tanggal) r.tanggal = r.Tanggal;
  // Normalize tanggal to YYYY-MM-DD date-only if it's an ISO string
  if (r.tanggal && typeof r.tanggal === "string" && r.tanggal.includes("T")) {
    try {
      const d = new Date(r.tanggal);
      if (!Number.isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, "0");
        r.tanggal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}`;
      }
    } catch (err) {}
  }
  // Map backend fields to frontend
  if (r.deskripsi) r.deskripsi = r.deskripsi;
  if (r.biaya) r.biaya = r.biaya;
  if (r.teknisi) r.teknisi = r.teknisi;
  if (r.status) r.status = r.status;
  return r;
}

export async function listPerbaikan(asetId) {
  const encoded = encodeURIComponent(String(asetId));
  const res = await fetch(`/perbaikan/aset/${encoded}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizePerbaikan);
  if (Array.isArray(data?.items)) return data.items.map(normalizePerbaikan);
  return normalizePerbaikan(data);
}

export async function createPerbaikan(asetId, payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const body = JSON.stringify({
    AsetId: asetId,
    lokasi_id: payload.lokasi_id || payload.lokasiId,
    tanggal_perbaikan: payload.tanggal,
    deskripsi: payload.deskripsi || null,
    biaya: payload.biaya || null,
    teknisi: payload.teknisi || null,
    status: payload.status || "pending",
  });

  const res = await fetch(`/perbaikan`, {
    method: "POST",
    credentials: "include",
    headers,
    body,
  });

  const data = await handleResponse(res);
  return normalizePerbaikan(data);
}

export async function deletePerbaikan(id) {
  const encoded = encodeURIComponent(String(id));
  const res = await fetch(`/perbaikan/${encoded}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Rusak (damage) api helpers
function normalizeRusak(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;
  if (r.TglRusak && !r.tanggal) r.tanggal = r.TglRusak;
  if (r.Tanggal && !r.tanggal) r.tanggal = r.Tanggal;
  if (r.tanggal && typeof r.tanggal === "string" && r.tanggal.includes("T")) {
    const datePart = r.tanggal.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      r.tanggal = datePart;
    }
  }
  if (r.Kerusakan && !r.keterangan) r.keterangan = r.Kerusakan;
  if (r.Keterangan && !r.keterangan) r.keterangan = r.Keterangan;
  if (r.jumlah_rusak && !r.jumlahRusak) r.jumlahRusak = r.jumlah_rusak;
  if (r.StatusRusak && !r.statusRusak) r.statusRusak = r.StatusRusak;
  if (r.catatan && !r.catatan) r.catatan = r.catatan;
  if (r.user_id && !r.userId) r.userId = r.user_id;
  if (r.Username && !r.username) r.username = r.Username;
  return r;
}

export async function listRusak(asetId) {
  const encoded = encodeURIComponent(String(asetId));
  const res = await fetch(`/rusak/aset/${encoded}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizeRusak);
  if (Array.isArray(data?.items)) return data.items.map(normalizeRusak);
  return normalizeRusak(data);
}

export async function createRusak(asetId, payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const body = JSON.stringify({
    AsetId: asetId,
    TglRusak: payload.tanggal,
    lokasi_id: payload.lokasi_id,
    Kerusakan: payload.keterangan,
    jumlah_rusak: payload.jumlahRusak || 1,
    StatusRusak: payload.statusRusak || "temporary",
    catatan: payload.catatan,
  });

  const res = await fetch(`/rusak`, {
    method: "POST",
    credentials: "include",
    headers,
    body,
  });

  const data = await handleResponse(res);

  // Handle response that might have nested structure
  const rusak = data?.rusak || data;
  return normalizeRusak(rusak);
}

export async function deleteRusak(id) {
  const encoded = encodeURIComponent(String(id));
  const res = await fetch(`/rusak/${encoded}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Dipinjam (borrowed) api helpers
function normalizeDipinjam(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;
  if (r.tanggal_pinjam && !r.tanggalPinjam) r.tanggalPinjam = r.tanggal_pinjam;
  if (r.TglPinjam && !r.tanggalPinjam) r.tanggalPinjam = r.TglPinjam;
  if (r.tanggal_kembali && !r.tanggalKembali)
    r.tanggalKembali = r.tanggal_kembali;
  // Normalize dates
  if (
    r.tanggalPinjam &&
    typeof r.tanggalPinjam === "string" &&
    r.tanggalPinjam.includes("T")
  ) {
    const datePart = r.tanggalPinjam.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      r.tanggalPinjam = datePart;
    }
  }
  if (
    r.tanggalKembali &&
    typeof r.tanggalKembali === "string" &&
    r.tanggalKembali.includes("T")
  ) {
    const datePart = r.tanggalKembali.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      r.tanggalKembali = datePart;
    }
  }
  if (r.Peminjam && !r.peminjam) r.peminjam = r.Peminjam;
  if (r.Keperluan && !r.keperluan) r.keperluan = r.Keperluan;
  if (r.jumlah_dipinjam && !r.jumlahDipinjam)
    r.jumlahDipinjam = r.jumlah_dipinjam;
  if (r.Status && !r.status) r.status = r.Status;
  if (r.user_id && !r.userId) r.userId = r.user_id;
  if (r.Username && !r.username) r.username = r.Username;
  return r;
}

export async function listDipinjam(asetId) {
  const encoded = encodeURIComponent(String(asetId));
  const res = await fetch(`/dipinjam/aset/${encoded}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizeDipinjam);
  if (Array.isArray(data?.items)) return data.items.map(normalizeDipinjam);
  return normalizeDipinjam(data);
}

export async function createDipinjam(asetId, payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const body = JSON.stringify({
    AsetId: asetId,
    lokasi_id: payload.lokasi_id,
    tanggal_pinjam: payload.tanggalPinjam,
    tanggal_kembali: payload.tanggalKembali,
    peminjam: payload.peminjam,
    keperluan: payload.keperluan || payload.catatan,
    jumlah_dipinjam: payload.jumlahDipinjam || 1,
    status: payload.status || "dipinjam",
  });

  const res = await fetch(`/dipinjam`, {
    method: "POST",
    credentials: "include",
    headers,
    body,
  });

  const data = await handleResponse(res);

  // Handle response that might have nested structure
  const dipinjam = data?.dipinjam || data;
  return normalizeDipinjam(dipinjam);
}

export async function deleteDipinjam(id) {
  const encoded = encodeURIComponent(String(id));
  const res = await fetch(`/dipinjam/${encoded}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Dijual (sold) api helpers
function normalizeDijual(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;
  if (r.tanggal_jual && !r.tanggalJual) r.tanggalJual = r.tanggal_jual;
  if (r.TglDijual && !r.tanggalJual) r.tanggalJual = r.TglDijual;
  if (
    r.tanggalJual &&
    typeof r.tanggalJual === "string" &&
    r.tanggalJual.includes("T")
  ) {
    const datePart = r.tanggalJual.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      r.tanggalJual = datePart;
    }
  }
  if (r.Pembeli && !r.pembeli) r.pembeli = r.Pembeli;
  if (r.harga_jual && !r.hargaJual) r.hargaJual = r.harga_jual;
  if (r.HargaJual && !r.hargaJual) r.hargaJual = r.HargaJual;
  if (r.jumlah_dijual && !r.jumlahDijual) r.jumlahDijual = r.jumlah_dijual;
  if (r.Alasan && !r.catatan) r.catatan = r.Alasan;
  if (r.catatan && !r.catatan) r.catatan = r.catatan;
  if (r.user_id && !r.userId) r.userId = r.user_id;
  if (r.Username && !r.username) r.username = r.Username;
  return r;
}

export async function listDijual(asetId) {
  const encoded = encodeURIComponent(String(asetId));
  const res = await fetch(`/dijual/aset/${encoded}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizeDijual);
  if (Array.isArray(data?.items)) return data.items.map(normalizeDijual);
  return normalizeDijual(data);
}

export async function createDijual(asetId, payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const body = JSON.stringify({
    AsetId: asetId,
    lokasi_id: payload.lokasi_id,
    tanggal_jual: payload.tanggalJual,
    pembeli: payload.pembeli,
    harga_jual: payload.hargaJual,
    jumlah_dijual: payload.jumlahDijual || 1,
    catatan: payload.catatan || payload.alasan,
  });

  const res = await fetch(`/dijual`, {
    method: "POST",
    credentials: "include",
    headers,
    body,
  });

  const data = await handleResponse(res);

  // Handle response that might have nested structure
  const dijual = data?.dijual || data;
  return normalizeDijual(dijual);
}

export async function deleteDijual(id) {
  const encoded = encodeURIComponent(String(id));
  const res = await fetch(`/dijual/${encoded}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Riwayat (history) api helpers
function normalizeRiwayat(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Id && !r.id) r.id = r.Id;
  if (r.jenis_aksi && !r.jenisAksi) r.jenisAksi = r.jenis_aksi;
  if (r.user_id && !r.userId) r.userId = r.user_id;
  if (r.aset_id && !r.asetId) r.asetId = r.aset_id;
  if (r.AsetId && !r.asetIdString) r.asetIdString = r.AsetId;
  if (r.NamaAset && !r.namaAset) r.namaAset = r.NamaAset;
  if (r.tabel_ref && !r.tabelRef) r.tabelRef = r.tabel_ref;
  if (r.record_id && !r.recordId) r.recordId = r.record_id;
  // Normalize waktu to ISO string or date-only if needed
  if (r.waktu && typeof r.waktu === "string" && r.waktu.includes("T")) {
    try {
      const d = new Date(r.waktu);
      if (!Number.isNaN(d.getTime())) {
        r.waktu = d.toISOString();
      }
    } catch (err) {}
  }
  return r;
}

export async function listRiwayat(asetId) {
  if (!asetId) return [];

  // Remove x-beban header to allow users to access history of their own assets
  const headers = getAuthHeaders();
  if (headers["x-beban"]) {
    delete headers["x-beban"];
  }

  const res = await fetch(`/riwayat?aset_id=${encodeURIComponent(asetId)}`, {
    credentials: "include",
    headers,
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) return data.map(normalizeRiwayat);
  if (Array.isArray(data?.items)) return data.items.map(normalizeRiwayat);
  return [normalizeRiwayat(data)];
}

export default {
  listAset,
  getAset,
  createAset,
  updateAset,
  deleteAset,
  uploadAsetImage,
  listPerbaikan,
  createPerbaikan,
  deletePerbaikan,
  listRusak,
  createRusak,
  deleteRusak,
  listDipinjam,
  createDipinjam,
  deleteDipinjam,
  listDijual,
  createDijual,
  deleteDijual,
  listRiwayat,
};
