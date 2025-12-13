import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";
import {
  getPendingApprovals,
  approveRecord,
  rejectRecord,
  getApprovalDetail,
} from "@/api/approval";
import { updateAset, getAset } from "@/api/aset";
import ApprovalActions from "@/components/ApprovalActions";
import RejectModal from "@/components/RejectModal";
import Alert from "@/components/Alert";
import { getApprovalStatusClass, getApprovalStatusLabel } from "@/utils/format";

/**
 * Admin-only page to view and manage pending approvals
 */
export default function PendingApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, aset, perbaikan, rusak, dipinjam, dijual, mutasi
  const [rejectModal, setRejectModal] = useState({ open: false, record: null });
  const [processingId, setProcessingId] = useState(null);

  // Load approvals
  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPendingApprovals();
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar persetujuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    // Manual refresh only: remove polling
    return undefined;
  }, []);

  // Filter approvals
  useEffect(() => {
    let filtered = [...approvals];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (a) => (a.tabel_ref || "").toLowerCase() === filterType.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.asetId || "").toLowerCase().includes(term) ||
          (a.namaAset || "").toLowerCase().includes(term) ||
          (a.created_by || "").toLowerCase().includes(term) ||
          (a.deskripsi || "").toLowerCase().includes(term)
      );
    }

    setFilteredApprovals(filtered);
  }, [approvals, filterType, searchTerm]);

  // Handle approve
  const handleApprove = async (record) => {
    if (!record?.tabel_ref || !record?.record_id) {
      setError("Data tidak valid");
      return;
    }

    try {
      setProcessingId(record.record_id);
      setError("");
      await approveRecord(record.tabel_ref, record.record_id);
      // If this was a perbaikan, set the related asset status to 'aktif'
      try {
        if (String(record.tabel_ref || "").toLowerCase() === "perbaikan") {
          const detail = await getApprovalDetail(
            record.tabel_ref,
            record.record_id
          );
          const asetId =
            detail?.asetId ||
            detail?.AsetId ||
            detail?.record?.aset_id ||
            detail?.record?.AsetId ||
            detail?.record?.asetId ||
            detail?.aset_id ||
            null;
          if (asetId) {
            try {
              await updateAset(asetId, { statusAset: "aktif" });
            } catch (e) {
              console.warn(
                "Failed to update asset status after perbaikan approve",
                e
              );
            }
          }
        }
        // Dijual: set NilaiAset = 0 and statusAset = 'dijual' on approve
        if (String(record.tabel_ref || "").toLowerCase() === "dijual") {
          try {
            const detail = await getApprovalDetail(
              record.tabel_ref,
              record.record_id
            );
            const asetId =
              detail?.asetId ||
              detail?.AsetId ||
              detail?.aset_id ||
              detail?.record?.aset_id ||
              detail?.record?.asetId ||
              null;

            const findCompositeAsetId = (obj, depth = 3) => {
              if (!obj || depth < 0) return null;
              if (
                typeof obj === "string" &&
                obj.includes("/") &&
                obj.length > 5
              )
                return obj;
              if (typeof obj !== "object") return null;
              for (const v of Object.values(obj)) {
                const found = findCompositeAsetId(v, depth - 1);
                if (found) return found;
              }
              return null;
            };

            if (asetId) {
              const payload = { nilaiAset: 0, statusAset: "dijual" };
              let targetId = String(asetId);
              try {
                const resolved = await getAset(asetId);
                if (resolved) {
                  const hasNumericId =
                    resolved.id && /^\d+$/.test(String(resolved.id));
                  const hasAsetId =
                    resolved.asetId &&
                    String(resolved.asetId).trim().length > 0;
                  if (/^\d+$/.test(String(asetId))) {
                    if (hasNumericId) targetId = resolved.id;
                  } else {
                    if (hasAsetId) targetId = resolved.asetId;
                    else targetId = String(asetId);
                  }
                }
              } catch (resolveErr) {
                const composite = findCompositeAsetId(detail);
                if (composite) targetId = composite;
              }

              try {
                // eslint-disable-next-line no-console
                console.debug("apply-dijual->updateAset", {
                  asetId,
                  targetId,
                  payload,
                });
                let res = await updateAset(targetId, payload);
                // eslint-disable-next-line no-console
                console.debug("apply-dijual->updateAset:response", res);
              } catch (firstErr) {
                const composite = findCompositeAsetId(detail);
                if (composite && composite !== String(targetId)) {
                  try {
                    console.debug(
                      "Retrying updateAset with composite AsetId",
                      composite
                    );
                    const res2 = await updateAset(composite, payload);
                    // eslint-disable-next-line no-console
                    console.debug("apply-dijual->updateAset:response", res2);
                  } catch (secondErr) {
                    console.warn(
                      "Failed to apply dijual to asset:",
                      secondErr || firstErr
                    );
                  }
                } else {
                  console.warn("Failed to apply dijual to asset:", firstErr);
                }
              }
            } else {
              console.debug("apply-dijual: missing asetId", { detail });
            }
          } catch (e) {
            console.warn("Failed to process dijual post-approve:", e);
          }
        }
      } catch (e) {
        console.warn("Post-approve hook failed:", e);
      }
      setSuccess(`${record.tabel_ref} berhasil disetujui`);
      // Remove from list
      setApprovals((prev) =>
        prev.filter(
          (a) =>
            !(
              a.tabel_ref === record.tabel_ref &&
              a.record_id === record.record_id
            )
        )
      );
    } catch (err) {
      setError(err.message || "Gagal menyetujui");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject
  const handleReject = async (alasan) => {
    const record = rejectModal.record;
    if (!record?.tabel_ref || !record?.record_id) {
      setError("Data tidak valid");
      return;
    }

    try {
      setProcessingId(record.record_id);
      setError("");
      await rejectRecord(record.tabel_ref, record.record_id, alasan);
      setSuccess(`${record.tabel_ref} berhasil ditolak`);
      // Remove from list
      setApprovals((prev) =>
        prev.filter(
          (a) =>
            !(
              a.tabel_ref === record.tabel_ref &&
              a.record_id === record.record_id
            )
        )
      );
      setRejectModal({ open: false, record: null });
    } catch (err) {
      setError(err.message || "Gagal menolak");
    } finally {
      setProcessingId(null);
    }
  };

  // Group by table type
  const groupedApprovals = filteredApprovals.reduce((acc, approval) => {
    const type = approval.tabel_ref || "unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(approval);
    return acc;
  }, {});

  const typeLabels = {
    aset: "Aset Baru",
    perbaikan: "Perbaikan",
    rusak: "Kerusakan",
    dipinjam: "Peminjaman",
    dijual: "Penjualan",
    mutasi: "Mutasi",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Persetujuan Menunggu
          </h1>
          <p className="text-gray-600">
            Kelola pengajuan aset dan transaksi dari user
          </p>
        </div>
        <div>
          <button
            onClick={() => loadApprovals()}
            disabled={loading}
            className="px-3 py-1 rounded-md bg-white border border-gray-200 text-sm flex items-center gap-2"
            title="Refresh daftar persetujuan"
          >
            <FaSyncAlt className="h-4 w-4 text-gray-600" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ID Aset, nama, user..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="all">Semua Tipe</option>
                <option value="aset">Aset</option>
                <option value="perbaikan">Perbaikan</option>
                <option value="rusak">Kerusakan</option>
                <option value="dipinjam">Peminjaman</option>
                <option value="dijual">Penjualan</option>
                <option value="mutasi">Mutasi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat persetujuan...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredApprovals.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaExclamationCircle className="text-5xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tidak Ada Persetujuan
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== "all"
              ? "Tidak ada persetujuan yang sesuai dengan filter"
              : "Semua pengajuan telah diproses"}
          </p>
        </div>
      )}

      {/* Grouped Approvals */}
      {!loading && Object.keys(groupedApprovals).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedApprovals).map(([type, records]) => (
            <div
              key={type}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {typeLabels[type] || type} ({records.length})
                </h2>
              </div>

              {/* Records */}
              <div className="divide-y divide-gray-200">
                {records.map((record) => (
                  <div
                    key={`${record.tabel_ref}-${record.record_id}`}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {record.asetId ||
                                record.namaAset ||
                                `${type} #${record.record_id}`}
                            </h3>
                            {record.namaAset && record.asetId && (
                              <p className="text-sm text-gray-600 mb-1">
                                {record.namaAset}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                              <span>
                                Diajukan oleh:{" "}
                                <strong>
                                  {record.created_by || "Unknown"}
                                </strong>
                              </span>
                              {record.created_at && (
                                <span>
                                  •{" "}
                                  {new Date(
                                    record.created_at
                                  ).toLocaleDateString("id-ID")}
                                </span>
                              )}
                            </div>
                            {record.deskripsi && (
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                {record.deskripsi}
                              </p>
                            )}
                            {record.alasan && (
                              <p className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Alasan:</span>{" "}
                                {record.alasan}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0">
                        <ApprovalActions
                          onApprove={() => handleApprove(record)}
                          onReject={() =>
                            setRejectModal({ open: true, record })
                          }
                          loading={processingId === record.record_id}
                          allowReject={
                            String(record.tabel_ref || "").toLowerCase() !==
                            "aset"
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, record: null })}
        onConfirm={handleReject}
        title={`Tolak ${typeLabels[rejectModal.record?.tabel_ref] || "Item"}`}
        resourceType={typeLabels[rejectModal.record?.tabel_ref] || "item"}
        loading={processingId === rejectModal.record?.record_id}
      />
    </div>
  );
}
