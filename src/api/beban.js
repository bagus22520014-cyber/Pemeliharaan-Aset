const BASE = "/beban";

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const user = JSON.parse(raw);
    const headers = {};
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    if (user?.role) headers["x-role"] = String(user.role);
    if (user?.username) headers["x-username"] = String(user.username);
    return headers;
  } catch (err) {
    return {};
  }
}

/**
 * Get all beban list
 */
export async function listBeban() {
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
 * Get beban by ID
 */
export async function getBebanById(id) {
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
 * Get beban by kode
 */
export async function getBebanByKode(kode) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/kode/${encodeURIComponent(kode)}`, {
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

/**
 * Create beban (Admin only)
 */
export async function createBeban(data) {
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
 * Update beban (Admin only)
 */
export async function updateBeban(id, data) {
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
 * Delete beban (Admin only)
 */
export async function deleteBeban(id) {
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

// Helper: Build beban kode -> id map
let bebanCache = null;
export async function getBebanMap() {
  if (!bebanCache) {
    const list = await listBeban();
    bebanCache = {
      byKode: {},
      byId: {},
    };
    for (const b of list) {
      bebanCache.byKode[b.kode] = b;
      bebanCache.byId[b.id] = b;
    }
  }
  return bebanCache;
}

export function clearBebanCache() {
  bebanCache = null;
}

/**
 * Get beban_id from kode
 */
export async function getBebanIdByKode(kode) {
  const map = await getBebanMap();
  return map.byKode[kode]?.id;
}

/**
 * Get beban kode from id
 */
export async function getBebanKodeById(id) {
  const map = await getBebanMap();
  return map.byId[id]?.kode;
}
