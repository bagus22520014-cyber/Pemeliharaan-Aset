import React from "react";
import FormHeader from "./FormHeader";
import ImageSection from "./ImageSection";
import FormFields from "./FormFields";

/**
 * Unified layout component for both AssetDetail and CreateAsset
 */
export default function AssetFormLayout({
  mode = "view",
  form,
  setForm,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  groups = [],
  bebans = [],
  departemen = [],
  akun = [],
  asset = null,
  imageProps = {},
  barcodeProps = {},
  additionalButtons = null,
  disabledBeban = false,
  readOnlyAsetId = false,
  autoAsetId = null,
  manualMode = false,
  toggleManualMode = null,
  copiedKey = null,
  handleCopyToClipboard = null,
  masterBebans = [],
  suggestedAsetId = "",
  isEditing = false,
  submitDisabled = false,
  noBackdrop = false,
  showEditButton = false,
  onEdit,
}) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  const {
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
  } = imageProps;

  const displayData = isViewMode ? asset : form;
  const statusValue = isViewMode ? asset?.statusAset : "aktif";
  const titleValue = isViewMode
    ? asset?.namaAset ?? "Detail Aset"
    : form?.namaAset || (isEditing ? "Edit Aset" : "Tambah Aset Baru");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isCreateMode) {
      onSubmit(e, file);
    } else if (isEditMode) {
      onSubmit?.(e);
    } else {
      onSubmit?.(e);
    }
  };

  const content = (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 p-6"
      style={{
        width: noBackdrop ? "1388px" : "1388px",
        height: "692px",
        overflow: "hidden",
      }}
    >
      <FormHeader
        mode={mode}
        form={form}
        setForm={setForm}
        asset={asset}
        statusValue={statusValue}
        titleValue={titleValue}
        isEditing={isEditing}
        loading={loading}
        submitDisabled={submitDisabled}
        additionalButtons={additionalButtons}
        onCancel={onCancel}
        showEditButton={showEditButton}
        onEdit={onEdit}
      />

      <form
        id="asset-form"
        onSubmit={handleFormSubmit}
        className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-6 text-sm text-gray-800"
        style={{ height: "calc(692px - 120px)" }}
      >
        <ImageSection
          mode={mode}
          asset={asset}
          previewUrl={previewUrl}
          imageSrc={imageSrc}
          imgKey={imgKey}
          resolveImageUrl={resolveImageUrl}
          code128Url={code128Url}
          setZoomOpen={setZoomOpen}
          file={file}
          inputRef={inputRef}
          handleFileChange={handleFileChange}
          handleCancelFile={handleCancelFile}
          handleUpload={handleUpload}
          uploading={uploading}
          uploadError={uploadError}
        />

        <div
          className="md:col-span-3 overflow-y-auto pr-2"
          style={{ height: "100%" }}
        >
          <FormFields
            mode={mode}
            form={form}
            setForm={setForm}
            displayData={displayData}
            groups={groups}
            bebans={bebans}
            departemen={departemen}
            akun={akun}
            masterBebans={masterBebans}
            readOnlyAsetId={readOnlyAsetId}
            autoAsetId={autoAsetId}
            suggestedAsetId={suggestedAsetId}
            manualMode={manualMode}
            toggleManualMode={toggleManualMode}
            disabledBeban={disabledBeban}
            copiedKey={copiedKey}
            handleCopyToClipboard={handleCopyToClipboard}
          />
        </div>
      </form>
    </div>
  );

  if (noBackdrop) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full" style={{ maxWidth: "1388px" }}>
        {content}
      </div>
    </div>
  );
}
