import React from "react";
import { formatRupiah } from "@/utils/format";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTools,
  FaExclamationTriangle,
  FaHandHoldingUsd,
  FaExchangeAlt,
  FaHandshake,
  FaClock,
  FaUser,
  FaIdBadge,
  FaTag,
} from "react-icons/fa";

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

  // Function to get icon based on action type
  const getActionIcon = (jenis) => {
    if (jenis === "input") return <FaPlus className="text-white" />;
    if (jenis === "update") return <FaEdit className="text-white" />;
    if (jenis === "delete") return <FaTrash className="text-white" />;
    if (jenis?.includes("perbaikan")) return <FaTools className="text-white" />;
    if (jenis?.includes("rusak"))
      return <FaExclamationTriangle className="text-white" />;
    if (jenis?.includes("dipinjam"))
      return <FaHandshake className="text-white" />;
    if (jenis?.includes("dijual"))
      return <FaHandHoldingUsd className="text-white" />;
    if (jenis?.includes("mutasi"))
      return <FaExchangeAlt className="text-white" />;
    return <FaEdit className="text-white" />;
  };

  return (
    <div className="relative pl-8">
      {/* Timeline dot with icon */}
      <div className="absolute -left-4 top-2">
        <div
          className={`w-8 h-8 rounded-xl ${getIconColor(
            jenisAksi
          )} ring-4 ring-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200`}
        >
          {getActionIcon(jenisAksi)}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-md hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-sm uppercase tracking-wide ${getAksiColor(
                  jenisAksi
                )}`}
              >
                {getAksiLabel(jenisAksi)}
              </span>

              {(jenisAksi?.includes("perbaikan") ||
                jenisAksi?.includes("rusak") ||
                jenisAksi?.includes("dipinjam") ||
                jenisAksi?.includes("dijual") ||
                jenisAksi?.includes("mutasi")) &&
                item.statusAset && (
                  <span className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border-2 border-blue-200 flex items-center gap-1.5">
                    <FaTag className="text-blue-500" />
                    Status:{" "}
                    <span className="capitalize">{item.statusAset}</span>
                  </span>
                )}

              <div className="text-sm flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-gray-200">
                <FaUser className="text-gray-500" />
                <span className="text-gray-600">oleh </span>
                <span className="font-bold text-gray-900">
                  {item.username || "-"}
                </span>
                <span className="text-gray-500 text-xs">
                  ({item.role || "-"})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold bg-white px-3 py-2 rounded-xl border-2 border-gray-200">
              <FaClock className="text-gray-500" />
              {formatDate(item.waktu)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {jenisAksi === "input" && item.asetIdString && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border-2 border-blue-200">
              <FaIdBadge className="text-blue-500 text-lg" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                ID Aset:
              </span>
              <span className="text-sm font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border-2 border-blue-300">
                {item.asetIdString}
              </span>
            </div>
          )}

          {jenisAksi === "input" && item.namaAset && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FaTag className="text-gray-400" />
                Nama Aset
              </div>
              <div className="text-base font-bold text-gray-900">
                {item.namaAset}
              </div>
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
