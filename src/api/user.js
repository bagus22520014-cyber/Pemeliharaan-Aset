export function getAuthHeaders() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const user = JSON.parse(raw);
    const headers = {};
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    if (user?.role) headers["x-role"] = String(user.role);
    if (user?.beban) headers["x-beban"] = String(user.beban);
    return headers;
  } catch (err) {}
  return {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch (err) {
      body = await res.text().catch(() => null);
    }
    const msg =
      body && typeof body === "object"
        ? body.message || JSON.stringify(body)
        : String(body ?? res.status);
    const e = new Error(msg);
    e.status = res.status;
    e.body = body;
    throw e;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function listUsers() {
  const headers = getAuthHeaders();
  try {
    // Try endpoint that lists users; backend may expose '/user' or '/user/list'
    const res = await fetch("/user", {
      method: "GET",
      credentials: "include",
      headers,
    });
    const data = await handleResponse(res);
    if (Array.isArray(data)) return data;
    // If it returned a single object (current user), attempt alternate endpoint
    if (data && typeof data === "object") {
      // fallback to /user/list
      const res2 = await fetch("/user/list", {
        method: "GET",
        credentials: "include",
        headers,
      });
      const d2 = await handleResponse(res2);
      if (Array.isArray(d2)) return d2;
    }
    return [];
  } catch (err) {
    // Try alternate endpoint gracefully
    try {
      const res = await fetch("/user/list", {
        method: "GET",
        credentials: "include",
        headers,
      });
      const data = await handleResponse(res);
      if (Array.isArray(data)) return data;
    } catch (err2) {
      throw err;
    }
    return [];
  }
}

export async function createUser(payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const res = await fetch(`/user/create`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data;
}

export async function updateUser(payload) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  // First try exact pattern for beban update: PUT /user/{username}/beban with { beban: [...] }
  if (payload?.username && payload?.beban) {
    const bebanArray = Array.isArray(payload.beban)
      ? payload.beban
      : String(payload.beban)
          .split(",")
          .map((b) => b.trim())
          .filter((b) => b);
    try {
      const res = await fetch(
        `/user/${encodeURIComponent(payload.username)}/beban`,
        {
          method: "PUT",
          credentials: "include",
          headers,
          body: JSON.stringify({ beban: bebanArray }),
        }
      );
      const data = await handleResponse(res);
      return data;
    } catch (err) {
      // fallthrough to other attempts
    }
  }

  // Try a few plausible endpoints for updating a user
  const tries = [
    { url: "/user", method: "PUT" },
    { url: "/user/update", method: "PUT" },
    { url: "/user/update", method: "POST" },
    { url: "/user", method: "PATCH" },
  ];
  for (const t of tries) {
    try {
      const res = await fetch(t.url, {
        method: t.method,
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(res);
      return data;
    } catch (err) {
      // try next
    }
  }
  // as a last resort try POST /user (some backends accept POST update)
  const res = await fetch(`/user`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data;
}

export async function resetUserPassword(username, newPassword) {
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
  const payload = { newPassword };
  // First try exact pattern: PUT /user/{username}/password with { newPassword }
  try {
    const res = await fetch(`/user/${encodeURIComponent(username)}/password`, {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data;
  } catch (err) {
    // fallthrough to other attempts
  }

  const tries = [
    { url: "/user/reset-password", method: "POST" },
    { url: "/user/reset", method: "POST" },
    { url: "/user/password", method: "PUT" },
    { url: "/user", method: "PATCH" },
  ];
  for (const t of tries) {
    try {
      const res = await fetch(t.url, {
        method: t.method,
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(res);
      return data;
    } catch (err) {
      // try next
    }
  }
  // fallback to POST /user/update-password
  const res = await fetch(`/user/update-password`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data;
}

export default { listUsers, createUser };
