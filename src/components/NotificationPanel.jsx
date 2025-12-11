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
} from "@/api/notification";
import { approveRecord, rejectRecord } from "@/api/approval";

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
      console.warn("Failed to save hidden notification IDs:", err);
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
      // Check if click is outside panel and not on the bell button
      const isOutsidePanel =
        panelRef.current && !panelRef.current.contains(e.target);
      const isNotBellButton = !e.target.closest('[aria-label="Notifications"]');

      if (isOutsidePanel && isNotBellButton) {
        console.log("Click outside notification panel detected");
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

  // Handle notification click
  const handleNotificationClick = async (notification, event) => {
    // Don't navigate if clicking on action buttons
    if (event?.target.closest(".notification-actions")) {
      return;
    }

    try {
      console.log("Notification clicked:", notification);
      // Mark as read
      if (!notification.is_read) {
        try {
          await markAsRead(notification.id);
          onRefresh?.();
        } catch (err) {
          console.warn(
            "Could not mark as read (backend might not be ready):",
            err
          );
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
        console.log("Navigating to asset detail:", assetIdCandidate);
        navigate(
          `/aset/daftar?highlight=${encodeURIComponent(assetIdCandidate)}`
        );
      } else if (notification.tipe === "approval") {
        console.log("Navigating to approval page");
        navigate("/approval/pending");
      } else {
        console.log("Navigating to asset list");
        navigate("/aset/daftar");
      }

      onClose?.();
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  };

  // Handle approve notification
  const handleApprove = async (notification, event) => {
    event.stopPropagation();
    if (!notification.tabel_ref || !notification.record_id) return;

    try {
      setProcessingId(notification.id);
      console.log("Approving:", notification.tabel_ref, notification.record_id);
      await approveRecord(notification.tabel_ref, notification.record_id);

      // Try to delete the server-side notification (if backend supports it)
      try {
        await deleteNotification(notification.id);
      } catch (err) {
        console.warn("Failed to delete notification on server:", err);
      }

      // Immediately hide this notification locally
      setHiddenIds((prev) => new Set([...prev, notification.id]));

      // Refresh to get updated list from backend
      setTimeout(() => {
        onRefresh?.();
      }, 500);
    } catch (err) {
      console.error("Failed to approve:", err);
      alert(err.message || "Gagal menyetujui");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject notification
  const handleReject = async (notification, event) => {
    event.stopPropagation();
    if (!notification.tabel_ref || !notification.record_id) return;

    const alasan = prompt("Alasan penolakan:");
    if (!alasan || !alasan.trim()) return;

    try {
      setProcessingId(notification.id);
      console.log("Rejecting:", notification.tabel_ref, notification.record_id);
      await rejectRecord(
        notification.tabel_ref,
        notification.record_id,
        alasan
      );

      // Try to delete the server-side notification (if backend supports it)
      try {
        await deleteNotification(notification.id);
      } catch (err) {
        console.warn("Failed to delete notification on server:", err);
      }

      // Immediately hide this notification locally
      setHiddenIds((prev) => new Set([...prev, notification.id]));

      // Refresh to get updated list from backend
      setTimeout(() => {
        onRefresh?.();
      }, 500);
    } catch (err) {
      console.error("Failed to reject:", err);
      alert(err.message || "Gagal menolak");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      console.log("Marking all notifications as read");
      await markAllAsRead();
      onRefresh?.();
    } catch (err) {
      console.warn(
        "Failed to mark all as read (backend might not be ready):",
        err
      );
      // Still refresh to update UI with dummy data
      onRefresh?.();
    }
  };

  // Show all notifications (clear locally hidden IDs)
  const handleShowAll = () => {
    try {
      localStorage.removeItem("hiddenNotificationIds");
    } catch (err) {
      console.warn(
        "Failed to clear hiddenNotificationIds from localStorage",
        err
      );
    }
    setHiddenIds(new Set());
    // Refresh list from backend to ensure fresh state
    onRefresh?.();
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

  // Filter out hidden notifications and already processed approvals
  // Only show notifications with tipe 'approval' (diajukan) and not hidden
  const visibleNotifications = notifications.filter((n) => {
    if (hiddenIds.has(n.id)) return false;
    return n.tipe === "approval";
  });
  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  console.log(
    `Total notifications: ${notifications.length}, Visible: ${visibleNotifications.length}, Hidden: ${hiddenIds.size}`
  );

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
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.tipe)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {notification.judul || "Notifikasi"}
                      </p>
                      {!notification.is_read && (
                        <span className="shrink-0 w-2 h-2 bg-indigo-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {notification.pesan}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeTime(notification.created_at)}
                    </p>

                    {/* Action Buttons for Approval Notifications */}
                    {notification.tipe === "approval" &&
                      notification.tabel_ref &&
                      notification.record_id && (
                        <div className="notification-actions flex gap-2 mt-3">
                          <button
                            onClick={(e) => handleApprove(notification, e)}
                            disabled={processingId === notification.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <FaCheck className="text-xs" />
                            Setujui
                          </button>
                          <button
                            onClick={(e) => handleReject(notification, e)}
                            disabled={processingId === notification.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <FaTimes className="text-xs" />
                            Tolak
                          </button>
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
    </div>
  );
}
