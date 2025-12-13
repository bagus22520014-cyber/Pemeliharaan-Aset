import React from "react";
import { FaImage } from "react-icons/fa";

export default function ImageSection({
  mode,
  asset,
  previewUrl,
  imageSrc,
  imgKey,
  resolveImageUrl,
  code128Url,
  setZoomOpen,
  file,
  inputRef,
  handleFileChange,
  handleCancelFile,
  handleUpload,
  uploading,
  uploadError,
}) {
  const isViewMode = mode === "view";
  const assetStatus =
    asset?.statusAset || asset?.StatusAset || asset?.status || "";
  const isSold = String(assetStatus).toLowerCase() === "dijual";

  return (
    <div className="md:col-span-2">
      <div className="relative rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex flex-col items-center h-full">
        <div className="relative w-full h-full group">
          {/* IMAGE */}
          {previewUrl || asset?.gambar ? (
            <img
              key={imgKey}
              alt="aset-image"
              src={
                imageSrc ||
                resolveImageUrl?.(previewUrl || asset?.gambar) ||
                previewUrl
              }
              className="h-full w-full rounded-md border border-gray-200 bg-white shadow-sm object-cover cursor-pointer"
              onClick={() =>
                isViewMode
                  ? window.open(
                      imageSrc || resolveImageUrl?.(previewUrl || asset.gambar),
                      "_blank"
                    )
                  : null
              }
            />
          ) : (
            <div className="h-full w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
              <FaImage className="h-40 w-40" />
            </div>
          )}

          {/* BARCODE */}
          {code128Url && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-lg border shadow z-20 pointer-events-auto cursor-pointer">
              <img
                alt="barcode"
                src={code128Url}
                onClick={() => setZoomOpen?.(true)}
                title="Click to enlarge barcode"
                className="h-16 w-auto object-contain hover:scale-105 transition-transform mb-0.5"
              />
            </div>
          )}

          {/* ACTION BUTTONS OVERLAY */}
          {isSold ? (
            // For sold assets: show a static darken overlay, no buttons or text
            <div className="absolute inset-0 bg-black/40 rounded-md z-10 pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => inputRef?.current?.click?.()}
                className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100 pointer-events-auto"
              >
                {file
                  ? "Ganti Gambar"
                  : isViewMode
                  ? "Ganti Gambar"
                  : "Pilih Gambar"}
              </button>

              {file && (
                <div className="flex items-center gap-3">
                  {isViewMode && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="h-10 px-4 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 pointer-events-auto"
                    >
                      {uploading ? "Uploading…" : "Upload"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100 pointer-events-auto"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {uploadError && (
          <div className="text-red-600 mt-2 text-center">{uploadError}</div>
        )}
      </div>
    </div>
  );
}
