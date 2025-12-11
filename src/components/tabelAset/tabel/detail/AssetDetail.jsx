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
  const canApprove = isAdmin && approvalStatus === "diajukan";
  const isRejected =
    approvalStatus && String(approvalStatus).toLowerCase() === "ditolak";

  const handleDetailClick = () => {
    setActiveTab("detail");
  };

  const handleHistoryClick = () => {
    setActiveTab("riwayat");
  };

  const handleToolsClick = () => {
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
              detailTitle="Detail"
              historyTitle="Riwayat"
              toolsTitle="Aksi"
              activeTab={activeTab}
              disableTools={isRejected}
            />
          </div>

          {/* Content - Conditional based on activeTab with fade animation */}
          <div key={activeTab} className="animate-tabFade">
            {approvalAlert && (
              <div className="mb-4">
                <Alert
                  type={approvalAlert.type}
                  message={approvalAlert.message}
                  onClose={() => setApprovalAlert(null)}
                />
              </div>
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
                  isAdmin && !isEditMode && !canApprove && !isRejected
                }
                onEdit={handleStartEdit}
                additionalButtons={
                  canApprove && (
                    <ApprovalActions
                      onApprove={handleApprove}
                      onReject={() => setRejectModal(true)}
                      loading={approvalLoading}
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

            {activeTab === "aksi" && !isRejected && (
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
              />
            )}
            {activeTab === "aksi" && isRejected && (
              <div className="p-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  Aksi dan edit dinonaktifkan karena pengajuan aset ini telah
                  ditolak.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tabFade { 
          from { opacity: 0; transform: translateY(-10px) } 
          to { opacity: 1; transform: translateY(0) }
        }
        .animate-fadeIn { animation: fadeIn .15s ease-out }
        .animate-tabFade { animation: tabFade .3s ease-out }
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
        confirmLabel="Ya, Simpan"
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
