import React, { useState } from "react";
import ToolsButton from "./ToolsButton";
import TabRiwayat from "./tabs/riwayat/TabRiwayat";
import TabAksi from "./tabs/aksi/TabAksi";
import { useAssetDetail } from "./useAssetDetail";
import AssetFormLayout from "@/components/tabelAset/FormLayout/AssetFormLayout";
import BarcodeZoomModal from "./BarcodeZoomModal";
import Confirm from "@/components/Confirm";

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
    distribusiLokasi,
    setDistribusiLokasi,
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

  const isAdmin = userRole === "admin";

  const handleDetailClick = () => {
    setActiveTab("detail");
  };

  const handleHistoryClick = () => {
    setActiveTab("riwayat");
  };

  const handleToolsClick = () => {
    setActiveTab("aksi");
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
            />
          </div>

          {/* Content - Conditional based on activeTab with fade animation */}
          <div key={activeTab} className="animate-tabFade">
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
                showEditButton={isAdmin && !isEditMode}
                onEdit={handleStartEdit}
                distribusiLokasi={distribusiLokasi}
                onDistribusiChange={setDistribusiLokasi}
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

            {activeTab === "aksi" && (
              <TabAksi
                asetId={
                  asetRecord?.asetId ??
                  asetRecord?.id ??
                  localAsset.asetId ??
                  localAsset.id
                }
                asset={asetRecord || localAsset}
                onClose={onClose}
                onUpdated={onUpdated}
              />
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
    </>
  );
}
