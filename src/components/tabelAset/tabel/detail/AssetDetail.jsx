import React, { useState } from "react";
import { FaDatabase, FaHistory } from "react-icons/fa";
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
  initialTab = null,
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
    dataSource,
    setDataSource,
  } = useAssetDetail({ asset, onUpdated });

  const [activeTab, setActiveTab] = useState(initialTab || "detail"); // detail, riwayat, aksi

  // Update activeTab if parent requests a different initialTab after mount
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
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
    String(assetStatus || "").toLowerCase() === "dijual" ||
    dataSource === "aset_copy";

  const getDisableMessage = () => {
    if (dataSource === "aset_copy")
      return "Aksi dinonaktifkan: melihat data awal (read-only).";
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

  // If user switches to the original-data source, cancel any active edit mode
  React.useEffect(() => {
    if (dataSource === "aset_copy") {
      // cancel edit when viewing read-only original data
      try {
        if (isEditMode) handleCancelEdit();
      } catch (e) {}
      // if currently on aksi tab, switch to riwayat since aksi is read-only
      try {
        if (activeTab === "aksi") setActiveTab("riwayat");
      } catch (e) {}
    }
  }, [dataSource, isEditMode, handleCancelEdit]);

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

  // Always default to current `aset` when opening detail or switching to the Detail tab
  React.useEffect(() => {
    if (asset) {
      try {
        setDataSource("aset");
      } catch (e) {}
    }
  }, [asset, setDataSource]);

  React.useEffect(() => {
    if (activeTab === "detail") {
      try {
        setDataSource("aset");
      } catch (e) {}
    }
  }, [activeTab, setDataSource]);

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
      // approval failed — show alert
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
      // rejection failed — show alert
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
                // Hide edit button when asset is rejected or when viewing original snapshot
                showEditButton={
                  isAdmin &&
                  !isEditMode &&
                  !canApprove &&
                  !isRejected &&
                  dataSource !== "aset_copy" &&
                  String(assetStatus || "").toLowerCase() !== "dijual"
                }
                onEdit={() => {
                  if (dataSource === "aset_copy") {
                    setApprovalAlert({
                      type: "warning",
                      message: "Tidak dapat mengubah data awal (read-only).",
                    });
                    return;
                  }
                  handleStartEdit();
                }}
                additionalButtons={
                  <>
                    {canApprove && (
                      <ApprovalActions
                        onApprove={handleApprove}
                        onReject={() => setRejectModal(true)}
                        loading={approvalLoading}
                        allowReject={false}
                      />
                    )}
                  </>
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

          {/* Floating data-source toggle (bottom-right) */}
          {asetRecord && activeTab === "detail" && (
            <div className="absolute bottom-5 right-5 z-10">
              <button
                type="button"
                onClick={() =>
                  setDataSource((prev) =>
                    prev === "aset" ? "aset_copy" : "aset"
                  )
                }
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-colors duration-150 ${
                  dataSource === "aset"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                aria-label={
                  dataSource === "aset" ? "data saat ini" : "data awal"
                }
              >
                {dataSource === "aset" ? (
                  <FaDatabase className="w-5 h-5" />
                ) : (
                  <FaHistory className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
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
