import React from "react";
import { formatRupiah } from "@/utils/format";

export function RecordDetail({ item, recordDetails }) {
  const tabelRef = item.tabelRef || item.tabel_ref;
  const recordId = item.recordId || item.record_id;
  const key = `${tabelRef}-${recordId}`;
  const detail = recordDetails[key];

  if (!detail) {
    return (
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 italic">
        Detail tidak tersedia (loading atau tidak ditemukan)
      </div>
    );
  }

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    if (dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }
    return dateStr;
  };

  switch (tabelRef) {
    case "perbaikan":
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm space-y-1">
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 min-w-[120px]">
              Tanggal:
            </span>
            <span className="text-gray-900">
              {formatDate(detail.tanggal || detail.tanggal_perbaikan)}
            </span>
          </div>
          {detail.deskripsi && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Deskripsi:
              </span>
              <span className="text-gray-900">{detail.deskripsi}</span>
            </div>
          )}
          {detail.teknisi && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Teknisi:
              </span>
              <span className="text-gray-900">{detail.teknisi}</span>
            </div>
          )}
          {detail.biaya != null && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Biaya:
              </span>
              <span className="text-gray-900 font-semibold">
                {formatRupiah(detail.biaya)}
              </span>
            </div>
          )}
          {detail.status && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Status:
              </span>
              <span className="text-gray-900 capitalize">{detail.status}</span>
            </div>
          )}
        </div>
      );

    case "rusak":
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm space-y-1">
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 min-w-[120px]">
              Tanggal:
            </span>
            <span className="text-gray-900">
              {formatDate(detail.tanggal || detail.TglRusak)}
            </span>
          </div>
          {(detail.keterangan || detail.Kerusakan) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Keterangan:
              </span>
              <span className="text-gray-900">
                {detail.keterangan || detail.Kerusakan}
              </span>
            </div>
          )}
          {(detail.jumlah_rusak != null || detail.jumlahRusak != null) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Jumlah Rusak:
              </span>
              <span className="text-gray-900 font-semibold">
                {detail.jumlah_rusak || detail.jumlahRusak}
              </span>
            </div>
          )}
          {(detail.StatusRusak || detail.statusRusak) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Status Kerusakan:
              </span>
              <span className="text-gray-900 capitalize">
                {detail.StatusRusak || detail.statusRusak}
              </span>
            </div>
          )}
          {detail.estimasi_biaya != null && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Estimasi Biaya:
              </span>
              <span className="text-gray-900 font-semibold">
                {formatRupiah(detail.estimasi_biaya)}
              </span>
            </div>
          )}
          {detail.catatan && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Catatan:
              </span>
              <span className="text-gray-900">{detail.catatan}</span>
            </div>
          )}
        </div>
      );

    case "dipinjam":
      return (
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm space-y-1">
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 min-w-[120px]">
              Tanggal Pinjam:
            </span>
            <span className="text-gray-900">
              {formatDate(detail.tanggal_pinjam || detail.TglPinjam)}
            </span>
          </div>
          {detail.tanggal_kembali && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Tanggal Kembali:
              </span>
              <span className="text-gray-900">
                {formatDate(detail.tanggal_kembali)}
              </span>
            </div>
          )}
          {(detail.peminjam || detail.Peminjam) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Peminjam:
              </span>
              <span className="text-gray-900">
                {detail.peminjam || detail.Peminjam}
              </span>
            </div>
          )}
          {(detail.jumlah_dipinjam != null ||
            detail.jumlahDipinjam != null) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Jumlah Dipinjam:
              </span>
              <span className="text-gray-900 font-semibold">
                {detail.jumlah_dipinjam || detail.jumlahDipinjam}
              </span>
            </div>
          )}
          {(detail.keperluan || detail.Keperluan) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Keperluan:
              </span>
              <span className="text-gray-900">
                {detail.keperluan || detail.Keperluan}
              </span>
            </div>
          )}
          {(detail.status || detail.Status) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Status:
              </span>
              <span className="text-gray-900 capitalize">
                {detail.status || detail.Status}
              </span>
            </div>
          )}
        </div>
      );

    case "dijual":
      return (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm space-y-1">
          <div className="flex gap-2">
            <span className="font-semibold text-gray-700 min-w-[120px]">
              Tanggal Jual:
            </span>
            <span className="text-gray-900">
              {formatDate(detail.tanggal_jual || detail.TglDijual)}
            </span>
          </div>
          {(detail.pembeli || detail.Pembeli) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Pembeli:
              </span>
              <span className="text-gray-900">
                {detail.pembeli || detail.Pembeli}
              </span>
            </div>
          )}
          {(detail.jumlah_dijual != null || detail.jumlahDijual != null) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Jumlah Dijual:
              </span>
              <span className="text-gray-900 font-semibold">
                {detail.jumlah_dijual || detail.jumlahDijual}
              </span>
            </div>
          )}
          {(detail.harga_jual != null || detail.HargaJual != null) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Harga Jual:
              </span>
              <span className="text-gray-900 font-semibold">
                {formatRupiah(detail.harga_jual || detail.HargaJual)}
              </span>
            </div>
          )}
          {(detail.catatan || detail.alasan || detail.Alasan) && (
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                Catatan:
              </span>
              <span className="text-gray-900">
                {detail.catatan || detail.alasan || detail.Alasan}
              </span>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
