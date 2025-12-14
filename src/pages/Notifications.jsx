import React, { useEffect, useState } from "react";
import { FaBell, FaCheck, FaTimes, FaCheckDouble } from "react-icons/fa";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "@/api/notification";
import { approveRecord, rejectRecord, getApprovalDetail } from "@/api/approval";
import { updateAset, listAset } from "@/api/aset";
import RejectModal from "@/components/RejectModal";
import NotificationPanel from "@/components/NotificationPanel";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    notification: null,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await listNotifications();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : [];
      setNotifications(arr);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (n) => {
    if (!n?.tabel_ref || !n?.record_id) return;
    try {
      setProcessingId(n.id);
      await approveRecord(n.tabel_ref, n.record_id);

      // attempt to update asset status
      try {
        const detail = await getApprovalDetail(
          n.tabel_ref,
          encodeURIComponent(n.record_id)
        );
        const asetId =
          detail?.aset_id || detail?.AsetId || detail?.asetId || null;
        if (asetId) {
          const type = String(n.tabel_ref || "").toLowerCase();
          const status =
            type === "perbaikan"
              ? "aktif"
              : type === "rusak"
              ? "rusak"
              : type === "dipinjam"
              ? "dipinjam"
              : type === "dijual"
              ? "dijual"
              : null;
          if (status) {
            try {
              await updateAset(asetId, { statusAset: status });
            } catch (e) {
              /* ignore */
            }
          }
        }
      } catch (e) {
        /* ignore */
      }

      // notify submitter
      try {
        const detail = await getApprovalDetail(
          n.tabel_ref,
          encodeURIComponent(n.record_id)
        );
        const submitter =
          detail?.created_by ||
          detail?.createdBy ||
          detail?.user_id ||
          detail?.UserId ||
          null;
        if (submitter) {
          const judul = `${n.tabel_ref} Disetujui`;
          const pesan = `Permintaan ${n.tabel_ref} untuk ${
            detail?.asetId || detail?.AsetId || detail?.aset_id || "aset"
          } telah disetujui.`;
          try {
            await createNotification({
              user_id: submitter,
              tipe: "approved",
              judul,
              pesan,
              tabel_ref: n.tabel_ref,
              record_id: n.record_id,
              aset_id:
                detail?.asetId || detail?.AsetId || detail?.aset_id || null,
            });
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      try {
        await deleteNotification(n.id);
      } catch (e) {
        /* ignore */
      }
      await load();
    } catch (e) {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (n) => {
    if (!n?.tabel_ref || !n?.record_id) return;
    setRejectModal({ open: true, notification: n });
  };

  const handleRejectConfirm = async (alasan) => {
    const n = rejectModal.notification;
    if (!n) return;
    try {
      setProcessingId(n.id);
      await rejectRecord(n.tabel_ref, n.record_id, alasan);

      // notify submitter
      try {
        const detail = await getApprovalDetail(
          n.tabel_ref,
          encodeURIComponent(n.record_id)
        );
        const submitter =
          detail?.created_by ||
          detail?.createdBy ||
          detail?.user_id ||
          detail?.UserId ||
          null;
        if (submitter) {
          const judul = `${n.tabel_ref} Ditolak`;
          const pesan = `Permintaan ${n.tabel_ref} untuk ${
            detail?.asetId || detail?.AsetId || detail?.aset_id || "aset"
          } ditolak. Alasan: ${alasan}`;
          try {
            await createNotification({
              user_id: submitter,
              tipe: "rejected",
              judul,
              pesan,
              tabel_ref: n.tabel_ref,
              record_id: n.record_id,
              aset_id:
                detail?.asetId || detail?.AsetId || detail?.aset_id || null,
            });
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      try {
        await deleteNotification(n.id);
      } catch (e) {
        /* ignore */
      }
      setRejectModal({ open: false, notification: null });
      await load();
    } catch (e) {
      /* ignore */
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch (e) {
      /* ignore */
    }
    await load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <NotificationPanel
        notifications={notifications}
        onRefresh={load}
        asPage={true}
      />
    </div>
  );
}
