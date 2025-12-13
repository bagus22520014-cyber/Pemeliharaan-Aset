import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaCheckDouble,
  FaClock,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "@/api/notification";
import { approveRecord, rejectRecord, getApprovalDetail } from "@/api/approval";
import RejectModal from "@/components/RejectModal";
import { updateAset, listAset } from "@/api/aset";

/**
 * Notification panel dropdown
 */
export default function NotificationPanel({
  notifications = [],
  onClose,
  onRefresh,
}) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [processingId, setProcessingId] = useState(null);
  const modalOpenRef = useRef(false);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    notification: null,
  });
  const [rejectError, setRejectError] = useState(null);

  // Load hidden IDs from localStorage to persist across page refreshes
  const [hiddenIds, setHiddenIds] = useState(() => {
    try {
      const stored = localStorage.getItem("hiddenNotificationIds");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save hidden IDs to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "hiddenNotificationIds",
        JSON.stringify([...hiddenIds])
      );
    } catch (err) {
      // ignore storage errors
    }
  }, [hiddenIds]);

  // Clean up old hidden IDs that are no longer in notifications
  useEffect(() => {
    const currentNotificationIds = new Set(notifications.map((n) => n.id));
    const idsToRemove = [...hiddenIds].filter(
      (id) => !currentNotificationIds.has(id)
    );

    if (idsToRemove.length > 0) {
      setHiddenIds((prev) => {
        const newSet = new Set(prev);
        idsToRemove.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  }, [notifications, hiddenIds]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If a modal (reject modal) is open, don't close the notification panel
      if (modalOpenRef.current) return;
      // Check if click is outside panel and not on the bell button
      const isOutsidePanel =
        panelRef.current && !panelRef.current.contains(e.target);
      const isNotBellButton = !e.target.closest('[aria-label="Notifications"]');

      if (isOutsidePanel && isNotBellButton) {
        onClose?.();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Keep a ref in sync with modal open state to avoid reattaching document handlers
  useEffect(() => {
    modalOpenRef.current = rejectModal.open;
  }, [rejectModal.open]);

  // Handle notification click
  const handleNotificationClick = async (notification, event) => {
    // Don't navigate if clicking on action buttons
    if (event?.target.closest(".notification-actions")) {
      return;
    }

    try {
      // Mark as read
      if (!notification.is_read) {
        try {
          await markAsRead(notification.id);
          onRefresh?.();
        } catch (err) {
          // ignore mark-as-read errors
        }
      }

      // Navigate to relevant page with specific asset
      // Prefer `aset_id` (AsetId) if provided by backend, fall back to record_id
      const assetIdCandidate =
        notification.aset_id ||
        notification.AsetId ||
        notification.record_id ||
        notification.RecordId;
      if (assetIdCandidate) {
        navigate(
          `/aset/daftar?highlight=${encodeURIComponent(assetIdCandidate)}`
        );
      } else if (notification.tipe === "approval") {
        navigate("/approval/pending");
      } else {
        navigate("/aset/daftar");
      }

      onClose?.();
    } catch (err) {
      // ignore navigation errors
    }
  };

  // Handle approve notification
  const handleApprove = async (notification, event) => {
    event.stopPropagation();
    if (!notification.tabel_ref || !notification.record_id) return;

    try {
      setProcessingId(notification.id);
      await approveRecord(notification.tabel_ref, notification.record_id);

      // Fetch approval detail (best-effort)
      let approvalDetail = null;
      try {
        approvalDetail = await getApprovalDetail(
          notification.tabel_ref,
          encodeURIComponent(notification.record_id)
        );
      } catch (e) {
        // ignore detail fetch errors
      }

      // Try to update related asset status based on the approval type
      try {
        const asetId =
          approvalDetail?.aset_id ||
          approvalDetail?.AsetId ||
          approvalDetail?.asetId ||
          approvalDetail?.record_id ||
          approvalDetail?.RecordId ||
          null;
        if (asetId) {
          const type = String(notification.tabel_ref || "").toLowerCase();
          let newStatus = null;
          if (type === "perbaikan") newStatus = "aktif";
          else if (type === "rusak") newStatus = "rusak";
          else if (type === "dipinjam") newStatus = "dipinjam";
          else if (type === "dijual") newStatus = "dijual";

          if (newStatus) {
            try {
              await updateAset(asetId, { statusAset: newStatus });
              try {
                window.dispatchEvent(new Event("assetsUpdated"));
              } catch (e) {
                /* ignore */
              }
            } catch (e) {
              /* ignore update failure */
            }
          }
        }
      } catch (e) {
        /* ignore status update errors */
      }

      // Notify the submitter (best-effort)
      try {
        const submitter =
          approvalDetail?.created_by ||
          approvalDetail?.createdBy ||
          approvalDetail?.CreatedBy ||
          approvalDetail?.user_id ||
          approvalDetail?.UserId ||
          null;
        if (submitter) {
          const typeLabel =
            typeLabels[String(notification.tabel_ref || "").toLowerCase()] ||
            notification.tabel_ref;
          const judul = `${typeLabel} Disetujui`;
          const pesan = `Permintaan ${typeLabel} untuk ${
            approvalDetail?.asetId ||
            approvalDetail?.AsetId ||
            approvalDetail?.aset_id ||
            "aset"
          } telah disetujui.`;
          try {
            await createNotification({
              user_id: submitter,
              tipe: "approved",
              judul,
              pesan,
              tabel_ref: notification.tabel_ref,
              record_id: notification.record_id,
              aset_id:
                approvalDetail?.asetId ||
                approvalDetail?.AsetId ||
                approvalDetail?.aset_id ||
                null,
            });
          } catch (e) {
            /* ignore notification creation errors */
          }
        }
      } catch (e) {
        /* ignore submitter notify errors */
      }

      // Delete the originating notification (best-effort)
      try {
        await deleteNotification(notification.id);
      } catch (err) {
        /* ignore delete errors */
      }

      // Immediately hide this notification locally and refresh
      setHiddenIds((prev) => new Set([...prev, notification.id]));
      setTimeout(() => {
        onRefresh?.();
      }, 500);
    } catch (err) {
      alert(err?.message || "Gagal menyetujui");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject notification
  const handleRejectClick = (notification, event) => {
    event.stopPropagation();
    if (!notification.tabel_ref || !notification.record_id) return;
    setRejectError(null);
    setRejectModal({ open: true, notification });
  };

  const handleRejectConfirm = async (alasan) => {
    const notification = rejectModal.notification;
    if (!notification) return;
    try {
      setProcessingId(notification.id);
      await rejectRecord(
        notification.tabel_ref,
        notification.record_id,
        alasan
      );

      // Notify the submitter about rejection (best-effort)
      try {
        const detail = await getApprovalDetail(
          notification.tabel_ref,
          encodeURIComponent(notification.record_id)
        );
        const submitter =
          detail?.created_by ||
          detail?.createdBy ||
          detail?.CreatedBy ||
          detail?.user_id ||
          detail?.UserId ||
          null;
        if (submitter) {
          const typeLabel =
            typeLabels[String(notification.tabel_ref || "").toLowerCase()] ||
            notification.tabel_ref;
          const judul = `${typeLabel} Ditolak`;
          const pesan = `Permintaan ${typeLabel} untuk ${
            detail?.asetId || detail?.AsetId || detail?.aset_id || "aset"
          } ditolak. Alasan: ${alasan}`;
          try {
            await createNotification({
              user_id: submitter,
              tipe: "rejected",
              judul,
              pesan,
              tabel_ref: notification.tabel_ref,
              record_id: notification.record_id,
              aset_id:
                detail?.asetId || detail?.AsetId || detail?.aset_id || null,
            });
          } catch (e) {
            // ignore notification creation errors
          }
        }
      } catch (e) {
        // ignore errors
      }

      try {
        await deleteNotification(notification.id);
      } catch (err) {
        // ignore delete errors
      }

      setHiddenIds((prev) => new Set([...prev, notification.id]));
      setTimeout(() => onRefresh?.(), 500);
      setRejectModal({ open: false, notification: null });
    } catch (err) {
      setRejectError(err.message || "Gagal menolak");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      onRefresh?.();
    } catch (err) {
      // ignore
      onRefresh?.();
    }
  };

  // Show all notifications (clear locally hidden IDs)
  const handleShowAll = () => {
    try {
      localStorage.removeItem("hiddenNotificationIds");
    } catch (err) {
      // ignore
    }
    setHiddenIds(new Set());
    // Refresh list from backend to ensure fresh state
    onRefresh?.();
  };

  const typeLabels = {
    mutasi: "Mutasi",
    perbaikan: "Perbaikan Aset",
    rusak: "Kerusakan Aset",
    dipinjam: "Peminjaman Aset",
    dijual: "Penjualan Aset",
    aset: "Aset",
  };

  const getRejectModalTitle = (notification) => {
    if (!notification) return "Tolak Notifikasi";
    const key = String(notification.tabel_ref || "").toLowerCase();
    const label =
      typeLabels[key] ||
      (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Notifikasi");
    return `Tolak ${label}`;
  };

  const getResourceTypeLabel = (notification) => {
    if (!notification) return "item";
    const key = String(notification.tabel_ref || "").toLowerCase();
    return typeLabels[key] || key || "item";
  };

  // Get icon for notification type
  const getNotificationIcon = (tipe) => {
    switch (tipe) {
      case "approval":
        return <FaClock className="text-yellow-600" />;
      case "approved":
        return <FaCheck className="text-green-600" />;
      case "rejected":
        return <FaTimes className="text-red-600" />;
      case "error":
        return <FaExclamationCircle className="text-red-600" />;
      default:
        return <FaInfoCircle className="text-blue-600" />;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getAssetIdCandidateFromNotification = (n) =>
    n?.aset_id || n?.AsetId || n?.record_id || n?.RecordId || null;

  const getAssetNameCandidateFromNotification = (n) =>
    n?.namaAset || n?.NamaAset || n?.judul || n?.pesan || null;

  const renderNotificationTitle = (n) => {
    if (!n) return "Notifikasi";
    if (n.tipe === "approval") {
      // Prefer name from fetched approval detail
      const idFromNotif = getAssetIdCandidateFromNotification(n);
      const idFromTitle = extractAsetIdFromJudul(n.judul);
      const id = notifNames[n.id]?.asetId || idFromNotif || idFromTitle;
      const name =
        notifNames[n.id]?.name || getAssetNameCandidateFromNotification(n);

      if (name && id) return `${name} (${id})`;
      if (name) return name;
      // If original title was like 'Persetujuan Diperlukan (ID)', strip the prefix
      if (typeof n.judul === "string" && /persetujuan/i.test(n.judul)) {
        if (id) return `${id}`;
        // fallback: remove prefix
        return n.judul.replace(/Persetujuan Diperlukan\s*/i, "").trim();
      }
      if (id) return `${n.judul || "Notifikasi"} (${id})`;
    }
    return n.judul || "Notifikasi";
  };

  const extractAsetIdFromJudul = (judul) => {
    if (!judul || typeof judul !== "string") return null;
    // match content inside parentheses first
    const m = judul.match(/\(([^)]+)\)/);
    if (m && m[1]) return m[1].trim();
    // otherwise try to find pattern like 0003/MLG-MEDIA/2025
    const m2 = judul.match(/[A-Za-z0-9]+\/[A-Za-z0-9-]+\/[0-9]{4}/);
    return m2 ? m2[0] : null;
  };

  // Map of notification.id -> { name, asetId }
  const [notifNames, setNotifNames] = useState({});

  // Filter out hidden notifications and already processed approvals
  // Only show notifications with tipe 'approval' (diajukan) and not hidden
  const visibleNotifications = notifications.filter((n) => {
    if (hiddenIds.has(n.id)) return false;
    return n.tipe === "approval";
  });
  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  // summary logging removed

  // Log incoming notifications that target the current user (for debugging)
  useEffect(() => {
    try {
      // silent: no per-notification debug logging
      const raw = localStorage.getItem("user");
      const me = raw ? JSON.parse(raw) : null;
      const meId = me?.id ?? me?.ID ?? me?.username ?? me?.user_id;
      if (!meId) return;
    } catch (e) {
      /* ignore */
    }
  }, [notifications]);

  // Fetch approval detail to obtain asset name when notification doesn't include it
  useEffect(() => {
    let mounted = true;
    visibleNotifications.forEach((n) => {
      if (!n || String(n.tipe).toLowerCase() !== "approval") return;
      if (notifNames[n.id]) return; // already have
      const id = getAssetIdCandidateFromNotification(n);
      if (!id) return;

      (async () => {
        try {
          const detail = await getApprovalDetail(
            n.tabel_ref,
            encodeURIComponent(n.record_id)
          );
          let name =
            detail?.namaAset ||
            detail?.NamaAset ||
            detail?.nama ||
            detail?.Nama ||
            detail?.judul ||
            null;
          let asetId = detail?.aset_id || detail?.AsetId || id;

          // If no name found from approval detail, try to lookup by composite AsetId
          if (!name && asetId && typeof asetId === "string") {
            try {
              const all = await listAset({ includeBebanHeader: false });
              if (Array.isArray(all)) {
                const found = all.find(
                  (a) =>
                    a.asetId === asetId ||
                    a.AsetId === asetId ||
                    a.id === asetId
                );
                if (found) {
                  name =
                    found.namaAset ||
                    found.NamaAset ||
                    found.nama ||
                    found.Nama ||
                    null;
                  asetId = found.asetId || found.AsetId || asetId;
                }
              }
            } catch (e) {
              // ignore fallback lookup errors
            }
          }

          if (mounted) {
            setNotifNames((prev) => ({ ...prev, [n.id]: { name, asetId } }));
          }
        } catch (err) {
          // ignore fetch errors
        }
      })();
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNotifications]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
      role="menu"
      aria-orientation="vertical"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FaBell className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <FaCheckDouble className="text-xs" />
              Tandai Semua Dibaca
            </button>
          )}

          {hiddenIds.size > 0 && (
            <button
              onClick={handleShowAll}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              title="Tampilkan semua notifikasi yang disembunyikan"
            >
              Tampilkan Semua
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl text-gray-300 mb-2" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={(e) => handleNotificationClick(notification, e)}
                className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
                  !notification.is_read ? "bg-indigo-50" : ""
                }`}
              >
                <div className="flex">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!notification.is_read && (
                          <span className="shrink-0 w-2 h-2 bg-indigo-600 rounded-full" />
                        )}
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {renderNotificationTitle(notification)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 ml-2 shrink-0 whitespace-nowrap">
                        {formatRelativeTime(notification.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {renderNotificationMessage(notification)}
                    </p>

                    {/* Action Buttons for Approval Notifications */}
                    {notification.tipe === "approval" &&
                      notification.tabel_ref &&
                      notification.record_id && (
                        <div className="notification-actions flex gap-2 mt-3">
                          <button
                            onClick={(e) => handleApprove(notification, e)}
                            disabled={processingId === notification.id}
                            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition ${
                              String(
                                notification.tabel_ref || ""
                              ).toLowerCase() !== "aset"
                                ? "w-1/2"
                                : "w-full"
                            }`}
                          >
                            <FaCheck className="text-xs" />
                            Setujui
                          </button>
                          {String(
                            notification.tabel_ref || ""
                          ).toLowerCase() !== "aset" && (
                            <button
                              onClick={(e) =>
                                handleRejectClick(notification, e)
                              }
                              disabled={processingId === notification.id}
                              className="w-1/2 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <FaTimes className="text-xs" />
                              Tolak
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {visibleNotifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose?.();
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Lihat Semua Notifikasi
          </button>
        </div>
      )}
      {/* Reject modal for notification rejects */}
      <RejectModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, notification: null })}
        onConfirm={handleRejectConfirm}
        title={getRejectModalTitle(rejectModal.notification)}
        resourceType={getResourceTypeLabel(rejectModal.notification)}
        loading={processingId === rejectModal.notification?.id}
      />
      {rejectError && (
        <div className="px-4 py-2 bg-red-50 text-red-700 border-t border-red-200 text-sm">
          {rejectError}
        </div>
      )}
    </div>
  );
}

// Compose a contextual message for approval notifications
function renderNotificationMessage(notification) {
  if (!notification) return "";
  // If backend provided a meaningful message, prefer it unless it's a generic 'Persetujuan Diperlukan'
  const raw = String(notification.pesan || "").trim();
  if (raw && !/persetujuan diperl[iy]akan/i.test(raw)) return raw;

  const type = String(notification.tabel_ref || "").toLowerCase();
  // Try to get name/id from notification or prefetched mapping on the component via data attributes
  const name =
    notification._fetchedName ||
    notification.namaAset ||
    notification.NamaAset ||
    null;
  const id =
    notification.aset_id ||
    notification.AsetId ||
    notification.record_id ||
    notification.RecordId ||
    null;

  const labelFor = (n, i) => {
    if (n && i) return `${n} (${i})`;
    if (n) return n;
    if (i) return `${i}`;
    return "item";
  };

  switch (type) {
    case "perbaikan":
      return `Pengajuan Perbaikan untuk ${labelFor(name, id)}`;
    case "rusak":
      return `Laporan Kerusakan untuk ${labelFor(name, id)}`;
    case "dipinjam":
      return `Permintaan Peminjaman untuk ${labelFor(name, id)}`;
    case "mutasi":
      return `Permintaan Mutasi untuk ${labelFor(name, id)}`;
    case "dijual":
      return `Permintaan Penjualan untuk ${labelFor(name, id)}`;
    case "aset":
      return `Permintaan terkait aset ${labelFor(name, id)}`;
    default:
      // fallback to provided message or title
      return raw || notification.judul || "Notifikasi";
  }
}
