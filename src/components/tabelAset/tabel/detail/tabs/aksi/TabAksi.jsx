import React from "react";

export default function TabAksi({ asetId, onClose }) {
  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-6 pt-6 pb-4 border-b border-gray-300 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide">Aksi </h2>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
        >
          Tutup
        </button>
      </div>

      {/* Content */}
      <div
        className="p-6 overflow-auto"
        style={{ height: "calc(692px - 76px)" }}
      >
        <div className="text-gray-600 text-center py-12">
          <p className="text-lg mb-2">{asetId}</p>
          <p className="text-sm italic">Kok sek.... sabar</p>
        </div>
      </div>
    </div>
  );
}
