import React, { useState, useEffect } from "react";
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
  showAll,
}) {
  const [open, setOpen] = useState(Boolean(showAll));

  useEffect(() => {
    setOpen(Boolean(showAll));
  }, [showAll]);
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

          {jenisAksi === "input" &&
            (item.namaAset || item.nilaiAset || item.NilaiAset) &&
            (() => {
              const maybe =
                item?.nilaiAset ??
                item?.NilaiAset ??
                item?.nilai_aset ??
                item?.aset_nilai ??
                item?.AsetNilai;
              return (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FaTag className="text-gray-400" />
                        Nama Aset
                      </div>
                      <div className="text-base font-bold text-gray-900 truncate">
                        {item.namaAset}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition border ${
                          open
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {open ? "Tutup" : "Lihat Detail"}
                      </button>
                    </div>
                  </div>

                  {/* Details grid (visible when open or when global showAll is true) */}
                  {(open || showAll) && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                      {/* Accurate ID */}
                      <div>
                        <div className="text-xs text-gray-500">Accurate ID</div>
                        <div className="font-medium">
                          {item?.AccurateId || item?.accurateId || "-"}
                        </div>
                      </div>
                      {/* Spesifikasi */}
                      <div>
                        <div className="text-xs text-gray-500">Spesifikasi</div>
                        <div className="truncate">
                          {item?.Spesifikasi || item?.spesifikasi || "-"}
                        </div>
                      </div>

                      {/* Kategori */}
                      <div>
                        <div className="text-xs text-gray-500">Kategori</div>
                        <div className="font-medium">
                          {item?.Grup || item?.grup || item?.kategori || "-"}
                        </div>
                      </div>
                      {/* Akun Perkiraan */}
                      <div>
                        <div className="text-xs text-gray-500">
                          Akun Perkiraan
                        </div>
                        <div className="font-medium">
                          {item?.AkunPerkiraan || item?.akunPerkiraan || "-"}
                        </div>
                      </div>

                      {/* Harga Perolehan */}
                      <div>
                        <div className="text-xs text-gray-500">
                          Harga Perolehan
                        </div>
                        <div className="font-medium">
                          {maybe != null ? `Rp ${formatRupiah(maybe)}` : "-"}
                        </div>
                      </div>
                      {/* Beban */}
                      <div>
                        <div className="text-xs text-gray-500">Beban</div>
                        <div className="font-medium">
                          {(item?.beban && (item.beban.kode || item.beban)) ||
                            item?.bebanKode ||
                            item?.beban ||
                            "-"}
                        </div>
                      </div>

                      {/* Departemen */}
                      <div>
                        <div className="text-xs text-gray-500">Departemen</div>
                        <div className="font-medium">
                          {(item?.departemen &&
                            (item.departemen.nama || item.departemen.kode)) ||
                            item?.departemenNama ||
                            item?.departemen ||
                            "-"}
                        </div>
                      </div>
                      {/* Tanggal Perolehan */}
                      <div>
                        <div className="text-xs text-gray-500">
                          Tanggal Perolehan
                        </div>
                        <div className="font-medium">
                          {item?.TglPembelian ||
                            item?.tglPembelian ||
                            item?.tanggal ||
                            "-"}
                        </div>
                      </div>

                      {/* Masa Manfaat */}
                      <div>
                        <div className="text-xs text-gray-500">
                          Masa Manfaat
                        </div>
                        <div className="font-medium">
                          {item?.MasaManfaat ?? item?.masaManfaat
                            ? `${item?.MasaManfaat || item?.masaManfaat} bulan`
                            : "-"}
                        </div>
                      </div>
                      {/* Pengguna */}
                      <div>
                        <div className="text-xs text-gray-500">Pengguna</div>
                        <div className="font-medium">
                          {item?.Pengguna || item?.pengguna || "-"}
                        </div>
                      </div>

                      {/* Lokasi */}
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-500">Lokasi</div>
                        <div className="font-medium">
                          {item?.Lokasi || item?.lokasi || "-"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          {(showAll || (item.tabelRef && item.tabelRef !== "aset")) &&
            renderRecordDetail(item)}

          {item.perubahan && renderPerubahan(item.perubahan)}
        </div>
      </div>
    </div>
  );
}
