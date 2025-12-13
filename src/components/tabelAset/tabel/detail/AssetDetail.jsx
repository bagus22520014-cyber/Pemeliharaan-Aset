import React, { useState } from "react";
import ToolsButton from "./ToolsButton";
import TabRiwayat from "./tabs/riwayat/TabRiwayat";
import TabAksi from "./tabs/aksi/TabAksi";
import { useAssetDetail } from "./useAssetDetail";
import AssetFormLayout from "@/components/tabelAset/FormLayout/AssetFormLayout";
import BarcodeZoomModal from "./BarcodeZoomModal";
import Confirm from "@/components/Confirm";
import ApprovalActions from "@/components/ApprovalActions";
import RejectModal from "@/components/RejectModal";
import { approveAset, rejectAset } from "@/api/approval";
import { listNotifications, deleteNotification } from "@/api/notification";
import { listPerbaikan, listRusak, listDipinjam, listDijual } from "@/api/aset";
import Alert from "@/components/Alert";

export default function AssetDetail({
  asset,
  onClose,
  onUpdated,
  userRole = "user",
  groups = [],
  bebans = [],
  departemen = [],
  akun = [],
}) {
  if (!asset) return null;

  const {
    zoomOpen,
    setZoomOpen,
    localAsset,
    asetRecord,
    asetNotFound,
    copiedKey,
    file,
    previewUrl,
    uploading,
    uploadError,
    inputRef,
    imageSrc,
    imgKey,
    code128Url,
    handleFileChange,
    handleCancelFile,
    handleUpload,
    handleCopyToClipboard,
    getStatusClass,
    resolveImageUrl,
    isEditMode,
    editForm,
    setEditForm,
    updateLoading,
    updateError,
    confirmUpdate,
    setConfirmUpdate,
    handleStartEdit,
    handleCancelEdit,
    handleUpdateRequest,
    handleUpdateSubmit,
  } = useAssetDetail({ asset, onUpdated });

  const [activeTab, setActiveTab] = useState("detail"); // detail, riwayat, aksi
  const [rejectModal, setRejectModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalAlert, setApprovalAlert] = useState(null);

  const isAdmin = userRole === "admin";
  const approvalStatus =
    asetRecord?.approvalStatus || asetRecord?.approval_status;
  const assetStatus =
    asetRecord?.statusAset ||
    asetRecord?.StatusAset ||
    asetRecord?.status ||
    localAsset?.statusAset ||
    localAsset?.StatusAset ||
    localAsset?.status;
  const canApprove = isAdmin && approvalStatus === "diajukan";
  const isRejected =
    approvalStatus && String(approvalStatus).toLowerCase() === "ditolak";
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);

  const disableAksi =
    isRejected ||
    (approvalStatus &&
      String(approvalStatus).toLowerCase() === "diajukan" &&
      !isAdmin) ||
    (hasPendingTransactions && !isAdmin) ||
    String(assetStatus || "").toLowerCase() === "dijual";

  const getDisableMessage = () => {
    const s = String(assetStatus || "").toLowerCase();
    if (s === "dijual") return "Aksi dinonaktifkan: aset telah dijual.";
    if (isRejected) return "Aksi dinonaktifkan: aset telah ditolak.";
    if (
      approvalStatus &&
      String(approvalStatus).toLowerCase() === "diajukan" &&
      !isAdmin
    )
      return "Aksi dinonaktifkan: aset sedang diajukan untuk persetujuan.";
    if (hasPendingTransactions && !isAdmin)
      return "Aksi dinonaktifkan: terdapat transaksi yang menunggu persetujuan.";
    return "Aksi dinonaktifkan.";
  };

  // If actions are disabled, ensure the active tab cannot be 'aksi'
  React.useEffect(() => {
    if (disableAksi && activeTab === "aksi") {
      // switch immediately to the riwayat tab so user sees history/pending
      setActiveTab("riwayat");
    }
  }, [disableAksi, activeTab]);

  // If asset is already sold, disable actions and editing for everyone
  if (String(assetStatus || "").toLowerCase() === "dijual") {
    // force disable for everyone
    // eslint-disable-next-line no-unused-vars
    // keep disableAksi as true
    // assign to variable by shadowing isn't necessary; just set flag
  }

  // Check related transaction lists for any pending approval entries
  React.useEffect(() => {
    let mounted = true;
    async function checkPending() {
      setHasPendingTransactions(false);
      try {
        const asetId =
          asetRecord?.asetId ??
          asetRecord?.id ??
          localAsset?.asetId ??
          localAsset?.id;
        if (!asetId) return;

        const [perbaikan, rusak, dipinjam, dijual] = await Promise.all([
          (async () => {
            try {
              const l = await listPerbaikan(asetId);
              return Array.isArray(l) ? l : l ? [l] : [];
            } catch {
              return [];
            }
          })(),
          (async () => {
            try {
              const l = await listRusak(asetId);
              return Array.isArray(l) ? l : l ? [l] : [];
            } catch {
              return [];
            }
          })(),
          (async () => {
            try {
              const l = await listDipinjam(asetId);
              return Array.isArray(l) ? l : l ? [l] : [];
            } catch {
              return [];
            }
          })(),
          (async () => {
            try {
              const l = await listDijual(asetId);
              return Array.isArray(l) ? l : l ? [l] : [];
            } catch {
              return [];
            }
          })(),
        ]);

        const all = [...perbaikan, ...rusak, ...dipinjam, ...dijual];
        const pending = all.some((r) => {
          const s = (r?.approval_status || r?.approvalStatus || "")
            .toString()
            .toLowerCase();
          return s === "diajukan";
        });

        if (mounted) setHasPendingTransactions(pending);
      } catch (e) {
        if (mounted) setHasPendingTransactions(false);
      }
    }
    checkPending();
    return () => {
      mounted = false;
    };
  }, [asetRecord, localAsset]);

  const handleDetailClick = () => {
    setActiveTab("detail");
  };

  const handleHistoryClick = () => {
    setActiveTab("riwayat");
  };

  const handleToolsClick = () => {
    if (disableAksi) {
      // when disabled, show an alert instead of switching
      setApprovalAlert({
        type: "warning",
        message: getDisableMessage(),
      });
      return;
    }
    setActiveTab("aksi");
  };

  const handleApprove = async () => {
    if (!canApprove) return;

    try {
      setApprovalLoading(true);
      await approveAset(asetRecord?.id || asetRecord?.asetId);

      setApprovalAlert({
        type: "success",
        message: "Aset berhasil disetujui",
      });
      // Clean up related approval notifications (if any)
      try {
        const allNotifs = await listNotifications();
        const matches = (
          Array.isArray(allNotifs) ? allNotifs : allNotifs?.notifications || []
        ).filter((n) => {
          if (!n) return false;
          const ref = String(n.tabel_ref || n.TabelRef || "").toLowerCase();
          const rid = String(n.record_id || n.RecordId || n.AsetId || "");
          const targetId = String(asetRecord?.id || asetRecord?.asetId || "");
          return ref === "aset" && rid === targetId;
        });
        for (const m of matches) {
          try {
            await deleteNotification(m.id);
          } catch (e) {
            // ignore individual delete errors
          }
        }
      } catch (e) {
        // ignore notification cleanup errors
      }

      // Notify app to refresh notifications (Navbar listens and will refetch)
      try {
        window.dispatchEvent(new Event("notifications:refresh"));
      } catch (e) {}
      // Refresh asset data
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Approval failed:", error);
      setApprovalAlert({
        type: "error",
        message: "Gagal menyetujui aset: " + error.message,
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async (alasan) => {
    if (!canApprove) return;

    try {
      setApprovalLoading(true);
      await rejectAset(asetRecord?.id || asetRecord?.asetId, alasan);

      setApprovalAlert({
        type: "success",
        message: "Aset berhasil ditolak",
      });
      // Clean up related approval notifications (if any)
      try {
        const allNotifs = await listNotifications();
        const matches = (
          Array.isArray(allNotifs) ? allNotifs : allNotifs?.notifications || []
        ).filter((n) => {
          if (!n) return false;
          const ref = String(n.tabel_ref || n.TabelRef || "").toLowerCase();
          const rid = String(n.record_id || n.RecordId || n.AsetId || "");
          const targetId = String(asetRecord?.id || asetRecord?.asetId || "");
          return ref === "aset" && rid === targetId;
        });
        for (const m of matches) {
          try {
            await deleteNotification(m.id);
          } catch (e) {}
        }
      } catch (e) {}

      try {
        window.dispatchEvent(new Event("notifications:refresh"));
      } catch (e) {}
      // Refresh asset data
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Rejection failed:", error);
      setApprovalAlert({
        type: "error",
        message: "Gagal menolak aset: " + error.message,
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
        <div className="relative mx-4 w-full" style={{ maxWidth: "1388px" }}>
          {/* Book Tabs - Positioned at top */}
          <div className="flex justify-start -mb-0.5 relative z-20 pl-2">
            <ToolsButton
              onDetailClick={handleDetailClick}
              onHistoryClick={handleHistoryClick}
              onToolsClick={handleToolsClick}
              onDisabledClick={() =>
                setApprovalAlert({
                  type: "warning",
                  message: getDisableMessage(),
                })
              }
              detailTitle="Detail"
              historyTitle="Riwayat"
              toolsTitle="Aksi"
              activeTab={activeTab}
              disableTools={disableAksi}
            />
          </div>

          {/* Content - Conditional based on activeTab (no animation) */}
          <div key={activeTab}>
            {approvalAlert && (
              <Alert
                type={approvalAlert.type}
                message={approvalAlert.message}
                onClose={() => setApprovalAlert(null)}
              />
            )}
            {activeTab === "detail" && (
              <AssetFormLayout
                mode={isEditMode ? "edit" : "view"}
                asset={asetRecord}
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleUpdateRequest}
                onCancel={isEditMode ? handleCancelEdit : onClose}
                loading={updateLoading}
                error={updateError}
                groups={groups}
                bebans={bebans}
                departemen={departemen}
                akun={akun}
                noBackdrop={true}
                isEditing={isEditMode}
                // Hide edit button when asset is rejected
                showEditButton={
                  isAdmin &&
                  !isEditMode &&
                  !canApprove &&
                  !isRejected &&
                  String(assetStatus || "").toLowerCase() !== "dijual"
                }
                onEdit={handleStartEdit}
                additionalButtons={
                  canApprove && (
                    <ApprovalActions
                      onApprove={handleApprove}
                      onReject={() => setRejectModal(true)}
                      loading={approvalLoading}
                      allowReject={false}
                    />
                  )
                }
                imageProps={{
                  previewUrl,
                  file,
                  code128Url,
                  inputRef,
                  handleFileChange,
                  handleCancelFile,
                  handleUpload,
                  uploading,
                  uploadError,
                  imageSrc,
                  imgKey,
                  resolveImageUrl,
                  setZoomOpen,
                }}
                copiedKey={copiedKey}
                handleCopyToClipboard={handleCopyToClipboard}
              />
            )}

            {activeTab === "riwayat" && (
              <TabRiwayat
                asetId={
                  asetRecord?.id ??
                  localAsset.id ??
                  asetRecord?.asetId ??
                  localAsset.asetId
                }
                onClose={onClose}
              />
            )}

            {activeTab === "aksi" && !disableAksi && (
              <TabAksi
                asetId={
                  asetRecord?.asetId ??
                  asetRecord?.id ??
                  localAsset.asetId ??
                  localAsset.id
                }
                asset={asetRecord || localAsset}
                onClose={onClose}
                onSwitchToRiwayat={() => setActiveTab("riwayat")}
                onUpdated={onUpdated}
                setHasPendingTransactions={setHasPendingTransactions}
              />
            )}
            {activeTab === "aksi" && disableAksi && (
              <div className="p-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  {getDisableMessage()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fadeIn { animation: fadeIn .15s ease-out }
      `}</style>{" "}
      <BarcodeZoomModal
        zoomOpen={zoomOpen}
        setZoomOpen={setZoomOpen}
        code128Url={code128Url}
      />
      <Confirm
        open={confirmUpdate}
        title="Konfirmasi Edit Aset"
        message={`Apakah Anda yakin ingin menyimpan perubahan pada aset "${
          editForm?.namaAset || asetRecord?.namaAset
        }"?`}
        confirmLabel={(() => {
          const raw =
            typeof window !== "undefined" ? localStorage.getItem("user") : null;
          let isAdmin = false;
          try {
            const u = raw ? JSON.parse(raw) : null;
            isAdmin = u?.role === "admin" || u?.role === "Admin";
          } catch (e) {
            isAdmin = false;
          }
          return isAdmin ? "Ya, Simpan" : "Ya, Ajukan";
        })()}
        cancelLabel="Batal"
        onConfirm={handleUpdateSubmit}
        onClose={() => setConfirmUpdate(false)}
      />
      <RejectModal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        onConfirm={handleReject}
        title="Tolak Aset"
        resourceType="Aset"
      />
    </>
  );
}
