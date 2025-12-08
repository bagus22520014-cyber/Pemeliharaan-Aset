const BASE = "/mutasi";

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
    let message;
    if (body && typeof body === "object") {
      message = body.message || body.error || JSON.stringify(body);
    } else {
      message = String(body ?? res.status);
    }
    const e = new Error(message);
    e.status = res.status;
    e.body = body;
    throw e;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function listMutasi() {
  const headers = getAuthHeaders();
  const res = await fetch(BASE, {
    credentials: "include",
    headers,
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function getMutasiByAsetId(asetId) {
  if (!asetId) return [];
  const encoded = encodeURIComponent(String(asetId));
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/aset/${encoded}`, {
    credentials: "include",
    headers,
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function getMutasi(id) {
  if (!id) return null;
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/${id}`, {
    credentials: "include",
    headers,
  });
  return handleResponse(res);
}

export async function createMutasi(payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateMutasi(id, payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteMutasi(id) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers,
  });
  return handleResponse(res);
}
