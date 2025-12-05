import React from "react";

export default function BarcodeZoomModal({
  zoomOpen,
  setZoomOpen,
  code128Url,
}) {
  if (!zoomOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setZoomOpen(false)}
      />
      <div className="z-70 bg-white rounded-2xl shadow-2xl p-4 max-w-[900px] w-[95%] mx-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 font-semibold">Barcode</div>
          <button
            onClick={() => setZoomOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close barcode preview"
            title="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 bg-white flex items-center justify-center">
          <img
            alt="barcode-large"
            src={code128Url}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
