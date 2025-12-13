import React from "react";
import { FaImage } from "react-icons/fa";

export default function ImageSection({
  previewUrl,
  asetRecord,
  imageSrc,
  imgKey,
  resolveImageUrl,
  code128Url,
  setZoomOpen,
  inputRef,
  handleFileChange,
  file,
  handleUpload,
  uploading,
  handleCancelFile,
  uploadError,
}) {
  return (
    <div className="md:col-span-1">
      <div className="relative rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex flex-col items-center h-143">
        <div className="relative h-full aspect-square w-full group">
          {/* IMAGE */}
          {previewUrl || asetRecord?.gambar ? (
            <img
              key={imgKey}
              alt="aset-image-large"
              src={imageSrc || resolveImageUrl(previewUrl || asetRecord.gambar)}
              className="h-full w-full rounded-md border border-gray-200 bg-white shadow-sm object-cover cursor-pointer"
              onClick={() =>
                window.open(
                  imageSrc || resolveImageUrl(previewUrl || asetRecord.gambar),
                  "_blank"
                )
              }
            />
          ) : (
            <div className="h-full w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
              <FaImage className="h-40 w-40" />
            </div>
          )}

          {/* BARCODE */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow z-20 pointer-events-auto cursor-pointer">
            <img
              alt="barcode"
              src={code128Url}
              onClick={() => setZoomOpen(true)}
              title="Click to enlarge barcode"
              className="h-16 w-auto object-contain hover:scale-105 transition-transform"
            />
          </div>

          {/* ACTION BUTTONS OVERLAY */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <button
              onClick={() => inputRef.current?.click?.()}
              className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100 pointer-events-auto"
            >
              Ganti Gambar
            </button>

            {file && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="h-10 px-4 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 pointer-events-auto"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>

                <button
                  onClick={handleCancelFile}
                  className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100 pointer-events-auto"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* upload errors intentionally not shown under browse controls */}
      </div>
    </div>
  );
}
