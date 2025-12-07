const BASE = "/aset-lokasi";

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const user = JSON.parse(raw);
    const headers = {};
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    if (user?.role) headers["x-role"] = String(user.role);
    if (user?.username) headers["x-username"] = String(user.username);
    if (user?.beban) headers["x-beban"] = String(user.beban);
    return headers;
  } catch (err) {
    return {};
  }
}

/**
 * Get all aset lokasi records
 */
export async function listAsetLokasi() {
  const headers = getAuthHeaders();
  const res = await fetch(BASE, { headers, credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

/**
 * Get aset lokasi by aset ID
 * Returns detailed location distribution with total_allocated and available count
 */
export async function getAsetLokasiByAsetId(asetId) {
  const headers = getAuthHeaders();
  const encodedId = encodeURIComponent(asetId);
  const res = await fetch(`${BASE}/aset/${encodedId}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

/**
 * Get aset by specific lokasi
 */
export async function getAsetByLokasi(lokasi) {
  const headers = getAuthHeaders();
  const encodedLokasi = encodeURIComponent(lokasi);
  const res = await fetch(`${BASE}/lokasi/${encodedLokasi}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

/**
 * Get aset lokasi by ID
 */
export async function getAsetLokasiById(id) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/${id}`, { headers, credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Create aset lokasi allocation
 * @param {Object} data - { AsetId, lokasi, jumlah, keterangan }
 */
export async function createAsetLokasi(data) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const res = await fetch(BASE, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Update aset lokasi allocation
 */
export async function updateAsetLokasi(id, data) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Delete aset lokasi allocation (Admin only)
 */
export async function deleteAsetLokasi(id) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
