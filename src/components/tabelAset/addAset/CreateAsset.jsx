import React from "react";
import { useCreateAsset } from "./useCreateAsset";
import AssetFormLayout from "@/components/tabelAset/FormLayout/AssetFormLayout";
import BarcodeZoomModal from "@/components/tabelAset/tabel/detail/BarcodeZoomModal";

export default function CreateAsset({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  error = null,
  groups = [],
  bebans = [],
  akun = [],
  disabledBeban = false,
  hideHeader = false,
  autoAsetId = null,
  readOnlyAsetId = false,
  submitDisabled = false,
  useMaster = false,
}) {
  const {
    manualMode,
    masterBebans,
    suggestedAsetId,
    toggleManualMode,
    file,
    previewUrl,
    code128Url,
    inputRef,
    handleFileChange,
    handleCancelFile,
    zoomOpen,
    setZoomOpen,
  } = useCreateAsset({
    form,
    setForm,
    readOnlyAsetId,
    useMaster,
    autoAsetId,
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (loading || submitDisabled) return;
    onSubmit(e, file);
  };

  return (
    <>
      <AssetFormLayout
        mode="create"
        form={form}
        setForm={setForm}
        onSubmit={handleFormSubmit}
        onCancel={onCancel}
        groups={groups}
        bebans={bebans}
        akun={akun}
        loading={loading}
        error={error}
        submitDisabled={submitDisabled}
        imageProps={{
          previewUrl,
          file,
          code128Url,
          inputRef,
          handleFileChange,
          handleCancelFile,
          setZoomOpen,
        }}
        manualMode={manualMode}
        toggleManualMode={toggleManualMode}
        suggestedAsetId={suggestedAsetId}
        readOnlyAsetId={readOnlyAsetId}
      />

      <BarcodeZoomModal
        zoomOpen={zoomOpen}
        setZoomOpen={setZoomOpen}
        code128Url={code128Url}
      />
    </>
  );
}
