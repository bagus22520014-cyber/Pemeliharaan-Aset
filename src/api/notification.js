/**
 * API functions for notification system
 */

/**
 * Get auth headers from localStorage
 */
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
 * Handle API response
 */
async function handleResponse(res) {
  if (res.ok) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  let message = `HTTP ${res.status}`;
  try {
    const errBody = await res.json();
    if (errBody.message) message = errBody.message;
    else if (errBody.error) message = errBody.error;
  } catch {
    message = (await res.text()) || message;
  }

  const err = new Error(message);
  err.status = res.status;
  throw err;
}

/**
 * Normalize notification record from backend
 */
function normalizeNotification(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };

  // Normalize fields
  if (r.Id && !r.id) r.id = r.Id;
  if (r.ID && !r.id) r.id = r.ID;
  if (r.Tipe && !r.tipe) r.tipe = r.Tipe;
  if (r.Judul && !r.judul) r.judul = r.Judul;
  if (r.Pesan && !r.pesan) r.pesan = r.Pesan;
  if (r.TabelRef && !r.tabel_ref) r.tabel_ref = r.TabelRef;
  if (r.RecordId && !r.record_id) r.record_id = r.RecordId;
  if (r.UserId && !r.user_id) r.user_id = r.UserId;
  if (r.IsRead && !r.is_read) r.is_read = r.IsRead;
  if (r.CreatedAt && !r.created_at) r.created_at = r.CreatedAt;

  // Additional mappings to support backend variants and panduan fields
  if (r.AsetId && !r.aset_id) r.aset_id = r.AsetId;
  // If no numeric record_id exists but AsetId is provided, expose it as record_id
  if (!r.record_id && r.AsetId) r.record_id = r.AsetId;
  if (r.waktu_dibuat && !r.created_at) r.created_at = r.waktu_dibuat;
  if (typeof r.dibaca !== "undefined" && !r.is_read) r.is_read = r.dibaca;
  if (r.related_aset_id && !r.related_aset_id)
    r.related_aset_id = r.related_aset_id;

  return r;
}

/**
 * Get list of notifications
 * @param {boolean} onlyUnread - Filter for unread notifications only
 * @returns {Promise<Array>} List of notifications
 */
export async function listNotifications(onlyUnread = false) {
  const params = new URLSearchParams();
  if (onlyUnread) params.append("unread", "true");

  const url = `/notification${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });

  const data = await handleResponse(res);

  // Handle different response formats
  // Backend returns: { total: number, notifications: array }
  if (data?.notifications && Array.isArray(data.notifications)) {
    const mapped = data.notifications.map(normalizeNotification);
    try {
      const raw = localStorage.getItem("user");
      const me = raw ? JSON.parse(raw) : null;
      const meId = me?.id ?? me?.ID ?? me?.username ?? me?.user_id;
      if (meId != null) {
        // no-op: intentionally not logging in production
        mapped.forEach(() => {});
      }
    } catch (e) {}
    return mapped;
  }

  // Fallback: if data is already an array
  if (Array.isArray(data)) {
    const mapped = data.map(normalizeNotification);
    try {
      const raw = localStorage.getItem("user");
      const me = raw ? JSON.parse(raw) : null;
      const meId = me?.id ?? me?.ID ?? me?.username ?? me?.user_id;
      if (meId != null) {
        // no-op: intentionally not logging in production
        mapped.forEach(() => {});
      }
    } catch (e) {}
    return mapped;
  }

  // Return empty array if unexpected format
  return [];
}

/**
 * Create a notification targeting a user
 * @param {Object} payload - { user_id, tipe, judul, pesan, tabel_ref, record_id, aset_id }
 */
export async function createNotification(payload) {
  const res = await fetch(`/notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return normalizeNotification(data);
}

/**
 * Mark notification as read
 * @param {string|number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(notificationId) {
  const res = await fetch(`/notification/${notificationId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  const data = await handleResponse(res);
  return normalizeNotification(data);
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Result
 */
export async function markAllAsRead() {
  const res = await fetch("/notification/mark-all-read", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(res);
}

/**
 * Delete a notification by id (if backend supports it)
 * @param {string|number} notificationId
 */
export async function deleteNotification(notificationId) {
  const res = await fetch(`/notification/${notificationId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    credentials: "include",
  });

  // Some backends may return 204 No Content
  if (res.status === 204) return null;
  const data = await handleResponse(res);
  return normalizeNotification(data);
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  const res = await fetch("/notification/unread-count", {
    method: "GET",
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });

  const data = await handleResponse(res);
  return typeof data === "number" ? data : data?.count || 0;
}
