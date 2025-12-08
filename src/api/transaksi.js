/**
 * API functions for asset transactions (perbaikan, rusak, dipinjam, dijual)
 * All transactions now use aset_lokasi as stock source
 */

const API_BASE = "";

/**
 * Helper function to get auth headers
 */
function getAuthHeaders() {
  const session = localStorage.getItem("session");
  if (!session) return {};

  try {
    const parsed = JSON.parse(session);
    const headers = {};

    if (parsed.token) {
      headers["Authorization"] = `Bearer ${parsed.token}`;
    }
    if (parsed.role) {
      headers["x-role"] = parsed.role;
    }
    if (parsed.beban) {
      headers["x-beban"] = parsed.beban;
    }

    return headers;
  } catch {
    return {};
  }
}

/**
 * ==================== PERBAIKAN ====================
 */

/**
 * Create perbaikan (repair) transaction
 * @param {Object} data - Repair data
 * @param {string} data.AsetId - Asset ID
 * @param {number} data.lokasi_id - Location ID from aset_lokasi
 * @param {string} data.tanggal_perbaikan - Repair date (YYYY-MM-DD)
 * @param {string} data.deskripsi - Description
 * @param {number} [data.biaya] - Cost
 * @param {string} [data.teknisi] - Technician name
 * @param {string} [data.status] - Status (pending/ongoing/completed)
 * @returns {Promise<Object>} Created repair record with lokasi info
 */
export async function createPerbaikan(data) {
  const response = await fetch(`${API_BASE}/perbaikan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create perbaikan");
  }

  return response.json();
}

/**
 * Get all perbaikan records
 * @returns {Promise<Array>} List of repair records
 */
export async function listPerbaikan() {
  const response = await fetch(`${API_BASE}/perbaikan`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch perbaikan list");
  }

  return response.json();
}

/**
 * ==================== RUSAK ====================
 */

/**
 * Create rusak (damaged) transaction
 * @param {Object} data - Damage data
 * @param {string} data.AsetId - Asset ID
 * @param {number} data.lokasi_id - Location ID from aset_lokasi
 * @param {string} data.TglRusak - Damage date (YYYY-MM-DD)
 * @param {string} [data.Kerusakan] - Damage description
 * @param {string} [data.StatusRusak] - Status (temporary/permanent)
 * @param {string} [data.catatan] - Notes
 * @returns {Promise<Object>} Created damage record with lokasi info
 */
export async function createRusak(data) {
  const response = await fetch(`${API_BASE}/rusak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create rusak");
  }

  return response.json();
}

/**
 * Get all rusak records
 * @returns {Promise<Array>} List of damage records
 */
export async function listRusak() {
  const response = await fetch(`${API_BASE}/rusak`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rusak list");
  }

  return response.json();
}

/**
 * ==================== DIPINJAM ====================
 */

/**
 * Create dipinjam (borrowed) transaction
 * @param {Object} data - Borrow data
 * @param {string} data.AsetId - Asset ID
 * @param {number} data.lokasi_id - Location ID from aset_lokasi
 * @param {string} data.Peminjam - Borrower name
 * @param {string} data.TglPinjam - Borrow date (YYYY-MM-DD)
 * @param {string} data.TglKembali - Return date (YYYY-MM-DD)
 * @param {string} [data.StatusPeminjaman] - Status (borrowed/returned)
 * @param {string} [data.catatan] - Notes
 * @returns {Promise<Object>} Created borrow record with lokasi info
 */
export async function createDipinjam(data) {
  const response = await fetch(`${API_BASE}/dipinjam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create dipinjam");
  }

  return response.json();
}

/**
 * Get all dipinjam records
 * @returns {Promise<Array>} List of borrow records
 */
export async function listDipinjam() {
  const response = await fetch(`${API_BASE}/dipinjam`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dipinjam list");
  }

  return response.json();
}

/**
 * ==================== DIJUAL ====================
 */

/**
 * Create dijual (sold) transaction
 * @param {Object} data - Sale data
 * @param {string} data.AsetId - Asset ID
 * @param {number} data.lokasi_id - Location ID from aset_lokasi
 * @param {string} data.TglDijual - Sale date (YYYY-MM-DD)
 * @param {number} data.HargaJual - Sale price
 * @param {string} [data.Pembeli] - Buyer name
 * @param {string} [data.catatan] - Notes
 * @returns {Promise<Object>} Created sale record with lokasi info
 */
export async function createDijual(data) {
  const response = await fetch(`${API_BASE}/dijual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create dijual");
  }

  return response.json();
}

/**
 * Get all dijual records
 * @returns {Promise<Array>} List of sale records
 */
export async function listDijual() {
  const response = await fetch(`${API_BASE}/dijual`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dijual list");
  }

  return response.json();
}
