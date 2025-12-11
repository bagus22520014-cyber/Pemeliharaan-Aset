/**
 * API functions for approval system
 * Handles approval workflow for all transaction types (aset, perbaikan, rusak, dipinjam, dijual, mutasi)
 * 
 * BACKEND REQUIREMENTS:
 * When approving/rejecting a record, the backend MUST:
 * 1. Update the record's approval_status to "disetujui" or "ditolak"
 * 2. Delete the corresponding notification from the notification table
 *    OR change notification.tipe from "approval" to "approved"/"rejected"
 * 
 * This ensures notifications don't persist after being processed.
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
 * Normalize approval record from backend
 */
function normalizeApprovalRecord(record) {
  if (!record || typeof record !== "object") return record;
  const r = { ...record };

  // Normalize approval status
  if (r.ApprovalStatus && !r.approval_status)
    r.approval_status = r.ApprovalStatus;
  if (r.approval_status && !r.approvalStatus)
    r.approvalStatus = r.approval_status;

  // Normalize approval date
  if (r.ApprovalDate && !r.approval_date) r.approval_date = r.ApprovalDate;
  if (r.approval_date && !r.approvalDate) r.approvalDate = r.approval_date;

  // Normalize table reference
  if (r.TabelRef && !r.tabel_ref) r.tabel_ref = r.TabelRef;
  if (r.RecordId && !r.record_id) r.record_id = r.RecordId;

  // Normalize asset ID
  if (r.AsetId && !r.asetId) r.asetId = r.AsetId;

  // Normalize submitter info
  if (r.CreatedBy && !r.created_by) r.created_by = r.CreatedBy;
  if (r.CreatedAt && !r.created_at) r.created_at = r.CreatedAt;

  return r;
}

/**
 * Get all pending approvals (admin only)
 * @returns {Promise<Array>} List of pending approval records
 */
export async function getPendingApprovals() {
  const res = await fetch("/approval/pending", {
    method: "GET",
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });
  const data = await handleResponse(res);
  if (Array.isArray(data)) {
    return data.map(normalizeApprovalRecord);
  }
  return data;
}

/**
 * Get approval detail for specific record
 * @param {string} tabelRef - Table reference (aset, perbaikan, rusak, etc)
 * @param {string|number} recordId - Record ID
 * @returns {Promise<Object>} Approval detail
 */
export async function getApprovalDetail(tabelRef, recordId) {
  const res = await fetch(`/approval/${tabelRef}/${recordId}`, {
    method: "GET",
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });
  const data = await handleResponse(res);
  return normalizeApprovalRecord(data);
}

/**
 * Approve a record
 * @param {string} tabelRef - Table reference (aset, perbaikan, rusak, etc)
 * @param {string|number} recordId - Record ID
 * @returns {Promise<Object>} Updated record
 */
export async function approveRecord(tabelRef, recordId) {
  const res = await fetch(`/approval/${tabelRef}/${recordId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  const data = await handleResponse(res);
  return normalizeApprovalRecord(data);
}

/**
 * Reject a record
 * @param {string} tabelRef - Table reference (aset, perbaikan, rusak, etc)
 * @param {string|number} recordId - Record ID
 * @param {string} alasan - Rejection reason
 * @returns {Promise<Object>} Updated record
 */
export async function rejectRecord(tabelRef, recordId, alasan) {
  const res = await fetch(`/approval/${tabelRef}/${recordId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ alasan }),
  });
  const data = await handleResponse(res);
  return normalizeApprovalRecord(data);
}

/**
 * Specific helper functions for each transaction type
 */

export async function approveAset(asetId) {
  return approveRecord("aset", asetId);
}

export async function rejectAset(asetId, alasan) {
  return rejectRecord("aset", asetId, alasan);
}

export async function approvePerbaikan(perbaikanId) {
  return approveRecord("perbaikan", perbaikanId);
}

export async function rejectPerbaikan(perbaikanId, alasan) {
  return rejectRecord("perbaikan", perbaikanId, alasan);
}

export async function approveRusak(rusakId) {
  return approveRecord("rusak", rusakId);
}

export async function rejectRusak(rusakId, alasan) {
  return rejectRecord("rusak", rusakId, alasan);
}

export async function approveDipinjam(dipinjamId) {
  return approveRecord("dipinjam", dipinjamId);
}

export async function rejectDipinjam(dipinjamId, alasan) {
  return rejectRecord("dipinjam", dipinjamId, alasan);
}

export async function approveDijual(dijualId) {
  return approveRecord("dijual", dijualId);
}

export async function rejectDijual(dijualId, alasan) {
  return rejectRecord("dijual", dijualId, alasan);
}

export async function approveMutasi(mutasiId) {
  return approveRecord("mutasi", mutasiId);
}

export async function rejectMutasi(mutasiId, alasan) {
  return rejectRecord("mutasi", mutasiId, alasan);
}
