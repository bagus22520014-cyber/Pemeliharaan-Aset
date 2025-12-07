import React from "react";
import { formatRupiah } from "@/utils/format";

export function TimelineItem({
  item,
  getIconColor,
  getAksiColor,
  getAksiLabel,
  formatDate,
  renderRecordDetail,
  renderPerubahan,
}) {
  const jenisAksi = item.jenisAksi || item.jenis_aksi;

  return (
    <div className="relative pl-6">
      {/* Timeline dot */}
      <div className="absolute -left-3 top-2">
        <div
          className={`w-6 h-6 rounded-full ${getIconColor(
            jenisAksi
          )} ring-4 ring-white shadow-lg flex items-center justify-center`}
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
        {/* Header */}
        <div className="bg-linear-to-r from-gray-50 to-white px-5 py-3 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 shadow-sm ${getAksiColor(
                  jenisAksi
                )}`}
              >
                {getAksiLabel(jenisAksi)}
              </span>
              {(jenisAksi?.includes("perbaikan") ||
                jenisAksi?.includes("rusak") ||
                jenisAksi?.includes("dipinjam") ||
                jenisAksi?.includes("dijual")) &&
                item.statusAset && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                    Status:{" "}
                    <span className="capitalize">{item.statusAset}</span>
                  </span>
                )}
              <div className="text-sm">
                <span className="text-gray-600">oleh </span>
                <span className="font-bold text-gray-900">
                  {item.username || "-"}
                </span>
                <span className="text-gray-500"> ({item.role || "-"})</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {formatDate(item.waktu)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {jenisAksi === "input" && item.asetIdString && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ID Aset:
              </span>
              <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {item.asetIdString}
              </span>
            </div>
          )}

          {jenisAksi === "input" && item.namaAset && (
            <div className="mb-3 text-base font-semibold text-gray-800">
              {item.namaAset}
            </div>
          )}

          {item.tabelRef &&
            item.tabelRef !== "aset" &&
            renderRecordDetail(item)}

          {item.perubahan && renderPerubahan(item.perubahan)}
        </div>
      </div>
    </div>
  );
}
