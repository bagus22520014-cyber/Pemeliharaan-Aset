const BASE = "/departemen";

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
 * Get all departemen list
 */
export async function listDepartemen() {
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
 * Get departemen by ID
 */
export async function getDepartemenById(id) {
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
 * Create departemen (Admin only)
 */
export async function createDepartemen(data) {
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
 * Update departemen (Admin only)
 */
export async function updateDepartemen(id, data) {
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
 * Delete departemen (Admin only)
 */
export async function deleteDepartemen(id) {
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

// Helper: Build departemen cache
let departemenCache = null;
export async function getDepartemenMap() {
  if (!departemenCache) {
    const list = await listDepartemen();
    departemenCache = {
      byKode: {},
      byId: {},
    };
    for (const d of list) {
      departemenCache.byKode[d.kode] = d;
      departemenCache.byId[d.id] = d;
    }
  }
  return departemenCache;
}

export function clearDepartemenCache() {
  departemenCache = null;
}
