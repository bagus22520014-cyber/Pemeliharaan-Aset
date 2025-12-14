import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaChevronDown, FaBell, FaSyncAlt } from "react-icons/fa";
import NotificationPanel from "./NotificationPanel";
import { listNotifications, getUnreadCount } from "@/api/notification";
import { getApprovalDetail } from "@/api/approval";

export default function Navbar({
  title = "Pemeliharaan Aset",
  icon: Icon = null,
  user,
  onLogout,
  leftControls = null,
  rightControls = null,
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await listNotifications();

      // Backend returns { total, notifications } not direct array
      const notifArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      // Get current user id from localStorage to filter notifications for this user
      let me = null;
      try {
        const raw = localStorage.getItem("user");
        me = raw ? JSON.parse(raw) : null;
      } catch (e) {
        me = null;
      }
      const meId =
        me?.id ?? me?.ID ?? me?.user_id ?? me?.userId ?? me?.username ?? null;

      // Filter notifications intended for this user (if we know the user), otherwise keep all
      const userNotifications = notifArray.filter((n) => {
        if (!meId) return true;
        return (
          n?.user_id == meId ||
          n?.UserId == meId ||
          n?.userId == meId ||
          n?.recipient_id == meId ||
          n?.to_user_id == meId ||
          n?.penerima == meId ||
          n?.penerima_id == meId
        );
      });

      // Preserve approval-specific validation (remove stale approval notifications)
      // Exclude locally-hidden notification IDs (persisted by NotificationPanel)
      let hiddenIds = [];
      try {
        const stored = localStorage.getItem("hiddenNotificationIds");
        hiddenIds = stored ? JSON.parse(stored) : [];
      } catch (err) {
        hiddenIds = [];
      }
      const hiddenSet = new Set(hiddenIds);

      const approvalOnlyNotifications = userNotifications.filter(
        (n) => n.tipe === "approval"
      );

      const validated = await Promise.all(
        approvalOnlyNotifications.map(async (n) => {
          if (hiddenSet.has(n.id)) return null;
          if (!n.tabel_ref || !n.record_id) return n; // keep if missing refs

          try {
            const detail = await getApprovalDetail(
              n.tabel_ref,
              encodeURIComponent(n.record_id)
            );
            const status =
              detail?.approval_status ||
              detail?.approvalStatus ||
              detail?.status;
            if (status && String(status).toLowerCase() !== "diajukan") {
              return null;
            }
            return n;
          } catch (err) {
            return n;
          }
        })
      );

      const visibleValidatedApprovals = validated.filter(Boolean);

      // Pass the full notification array to the panel (panel will filter/hide as needed)
      setNotifications(notifArray);

      // Compute unread count for this user across all types (important for non-admin users)
      const unreadForUser = userNotifications.filter(
        (n) => !n.is_read && !n.IsRead
      ).length;
      setUnreadCount(unreadForUser);
    } catch (err) {
      // fallback to dummy notifications when backend fails
      // Fallback: Use dummy notifications if backend not ready
      const dummyNotifications = [
        {
          id: 1,
          tipe: "approval",
          judul: "Persetujuan Aset Baru",
          pesan: "User john mengajukan aset baru: Laptop Dell XPS 15",
          tabel_ref: "aset",
          record_id: "0001/MLG-NET/2025",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          tipe: "approval",
          judul: "Persetujuan Perbaikan",
          pesan: "User jane mengajukan perbaikan untuk aset 0008/SRG-NET/2019",
          tabel_ref: "perbaikan",
          record_id: 5,
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          id: 3,
          tipe: "approved",
          judul: "Aset Disetujui",
          pesan: "Aset Anda (0002/MLG-NET/2025) telah disetujui oleh admin",
          tabel_ref: "aset",
          record_id: "0002/MLG-NET/2025",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ];
      setNotifications(dummyNotifications);
      setUnreadCount(2); // 2 unread
    } finally {
    }
  };

  // Initial fetch only — manual refresh replaces polling
  useEffect(() => {
    fetchNotifications();
    return undefined;
  }, []);

  // Listen for global notification refresh events (dispatched after approve in detail)
  useEffect(() => {
    const onRefreshEvent = () => fetchNotifications();
    window.addEventListener("notifications:refresh", onRefreshEvent);
    return () =>
      window.removeEventListener("notifications:refresh", onRefreshEvent);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200 
                  flex items-center justify-between px-6 py-3 ${className}`}
      role="banner"
    >
      {/* LEFT AREA */}
      <div className="flex items-center gap-4">
        {/* OPTIONAL LEFT CONTROLS (Mobile menu from MainLayout) */}
        {leftControls}

        {/* APP TITLE */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Icon className="text-indigo-600 text-lg" />
              </div>
            )}
            <h1 className="text-xl font-semibold tracking-wide text-gray-800">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* RIGHT AREA */}
      <nav className="flex items-center gap-3">
        {/* OPTIONAL RIGHT CONTROLS */}
        {rightControls}

        {/* NOTIFICATION BELL + Manual Refresh */}
        <div className="relative flex items-center" ref={notificationRef}>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              // Fetch notifications and show only those for current user
              try {
                const data = await listNotifications();
                // Normalize array payload
                const notifArray = Array.isArray(data)
                  ? data
                  : Array.isArray(data?.notifications)
                  ? data.notifications
                  : [];

                // Get current user id from localStorage
                let me = null;
                try {
                  const raw = localStorage.getItem("user");
                  me = raw ? JSON.parse(raw) : null;
                } catch (e) {
                  me = null;
                }
                const meId =
                  me?.id ??
                  me?.ID ??
                  me?.user_id ??
                  me?.userId ??
                  me?.username ??
                  null;

                const matches = notifArray.filter((n) => {
                  if (!meId) return true; // if we don't know me, return all
                  // check common recipient keys
                  return (
                    n?.user_id == meId ||
                    n?.UserId == meId ||
                    n?.userId == meId ||
                    n?.recipient_id == meId ||
                    n?.to_user_id == meId ||
                    n?.penerima == meId ||
                    n?.penerima_id == meId
                  );
                });

                try {
                  console.log("notifications (filtered):", matches);
                } catch (logErr) {
                  /* ignore */
                }
              } catch (err) {
                try {
                  console.error("Failed to fetch notifications:", err);
                } catch (logErr) {
                  /* ignore */
                }
              }
              setNotificationOpen((s) => !s);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            aria-label="Notifications"
            title="Notifikasi"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => fetchNotifications()}
            className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
            title="Refresh notifikasi"
            aria-label="Refresh notifications"
          >
            <FaSyncAlt />
          </button>

          {/* Notification Panel */}
          {notificationOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setNotificationOpen(false)}
              onRefresh={fetchNotifications}
            />
          )}
        </div>

        {/* USER MENU */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 
                       transition text-gray-700"
          >
            {/* Avatar */}
            <div
              className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 
                            flex items-center justify-center font-semibold shadow-sm"
            >
              {(user?.username || "?").charAt(0).toUpperCase()}
            </div>

            {/* Username + Chevron */}
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm font-medium">
                {user?.username ?? "Unknown"}
              </span>
              <FaChevronDown
                className={`h-3 w-3 transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* MENU DROPDOWN */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 
                         overflow-hidden animate-fade-in z-50"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
