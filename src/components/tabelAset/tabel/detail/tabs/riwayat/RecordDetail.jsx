import React from "react";
import { formatRupiah } from "@/utils/format";
import {
  FiTool,
  FiAlertCircle,
  FiUser,
  FiShoppingCart,
  FiTruck,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiInfo,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

export function RecordDetail({ item, recordDetails }) {
  const tabelRef = item.tabelRef || item.tabel_ref;
  const recordId = item.recordId || item.record_id;
  const key = `${tabelRef}-${recordId}`;
  const detail = recordDetails[key];

  if (!detail) {
    return (
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 text-slate-500">
          <FiInfo className="w-4 h-4" />
          <span className="text-sm italic">
            Detail tidak tersedia (loading atau tidak ditemukan)
          </span>
        </div>
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

  const DetailRow = ({ icon: Icon, label, value, valueClass = "" }) => (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-500 mb-0.5">{label}</div>
        <div className={`text-sm text-slate-900 wrap-break-word ${valueClass}`}>
          {value}
        </div>
      </div>
    </div>
  );

  const renderAssetValueRow = () => {
    const maybe =
      detail?.nilaiAset ??
      detail?.NilaiAset ??
      detail?.nilai_aset ??
      detail?.aset_nilai ??
      detail?.AsetNilai ??
      item?.nilaiAset ??
      item?.NilaiAset;
    if (maybe == null) return null;
    return (
      <DetailRow
        icon={FiDollarSign}
        label="Nilai Aset"
        value={formatRupiah(maybe)}
        valueClass="font-semibold text-slate-800"
      />
    );
  };

  const MutationRow = ({ icon: Icon, label, from, to }) => (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
            {from || "-"}
          </span>
          <FiArrowRight className="w-4 h-4 text-slate-400 flex shrink-0" />
          <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-lg font-medium">
            {to || "-"}
          </span>
        </div>
      </div>
    </div>
  );

  switch (tabelRef) {
    case "perbaikan":
      return (
        <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
          {renderAssetValueRow()}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-200">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <FiTool className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-amber-900">
              Detail Perbaikan
            </span>
          </div>

          <DetailRow
            icon={FiCalendar}
            label="Tanggal"
            value={formatDate(detail.tanggal || detail.tanggal_perbaikan)}
          />

          {detail.deskripsi && (
            <DetailRow
              icon={FiFileText}
              label="Deskripsi"
              value={detail.deskripsi}
            />
          )}

          {detail.teknisi && (
            <DetailRow icon={FiUser} label="Vendor" value={detail.teknisi} />
          )}

          {detail.PurchaseOrder && (
            <DetailRow
              icon={FiFileText}
              label="Purchase Order"
              value={detail.PurchaseOrder}
              valueClass="font-mono text-xs"
            />
          )}

          {detail.biaya != null && (
            <DetailRow
              icon={FiDollarSign}
              label="Biaya"
              value={formatRupiah(detail.biaya)}
              valueClass="font-semibold text-amber-700"
            />
          )}

          {detail.status && (
            <DetailRow
              icon={FiCheckCircle}
              label="Status"
              value={<span className="capitalize">{detail.status}</span>}
            />
          )}
        </div>
      );

    case "rusak":
      return (
        <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-xl space-y-1">
          {renderAssetValueRow()}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-200">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <FiAlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-900">
              Detail Kerusakan
            </span>
          </div>

          <DetailRow
            icon={FiCalendar}
            label="Tanggal"
            value={formatDate(detail.tanggal || detail.TglRusak)}
          />

          {(detail.keterangan || detail.Kerusakan) && (
            <DetailRow
              icon={FiFileText}
              label="Keterangan"
              value={detail.keterangan || detail.Kerusakan}
            />
          )}

          {(detail.StatusRusak || detail.statusRusak) && (
            <DetailRow
              icon={FiCheckCircle}
              label="Status Kerusakan"
              value={
                <span className="capitalize">
                  {detail.StatusRusak || detail.statusRusak}
                </span>
              }
            />
          )}

          {detail.estimasi_biaya != null && (
            <DetailRow
              icon={FiDollarSign}
              label="Estimasi Biaya"
              value={formatRupiah(detail.estimasi_biaya)}
              valueClass="font-semibold text-red-700"
            />
          )}

          {detail.catatan && (
            <DetailRow icon={FiInfo} label="Catatan" value={detail.catatan} />
          )}
        </div>
      );

    case "dipinjam":
      return (
        <div className="mt-4 p-5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
          {renderAssetValueRow()}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-200">
            <div className="bg-indigo-100 p-1.5 rounded-lg">
              <FiUser className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-indigo-900">
              Detail Peminjaman
            </span>
          </div>

          <DetailRow
            icon={FiCalendar}
            label="Tanggal Pinjam"
            value={formatDate(detail.tanggal_pinjam || detail.TglPinjam)}
          />

          <DetailRow
            icon={FiCalendar}
            label="Tanggal Kembali"
            value={
              formatDate(detail.tanggal_kembali || detail.TglKembali) || "-"
            }
          />

          {(detail.peminjam || detail.Peminjam) && (
            <DetailRow
              icon={FiUser}
              label="Peminjam"
              value={detail.peminjam || detail.Peminjam}
            />
          )}

          {detail.keperluan && (
            <DetailRow
              icon={FiFileText}
              label="Keperluan"
              value={detail.keperluan || detail.Keperluan}
            />
          )}

          {(detail.status || detail.Status) && (
            <DetailRow
              icon={FiCheckCircle}
              label="Status"
              value={
                <span className="capitalize">
                  {detail.status || detail.Status}
                </span>
              }
            />
          )}
        </div>
      );

    case "dijual":
      return (
        <div className="mt-4 p-5 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
          {renderAssetValueRow()}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-300">
            <div className="bg-slate-200 p-1.5 rounded-lg">
              <FiShoppingCart className="w-4 h-4 text-slate-700" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Detail Penjualan
            </span>
          </div>

          <DetailRow
            icon={FiCalendar}
            label="Tanggal Jual"
            value={formatDate(detail.tanggal_jual || detail.TglDijual)}
          />

          {(detail.pembeli || detail.Pembeli) && (
            <DetailRow
              icon={FiUser}
              label="Pembeli"
              value={detail.pembeli || detail.Pembeli}
            />
          )}

          {(detail.harga_jual != null || detail.HargaJual != null) && (
            <DetailRow
              icon={FiDollarSign}
              label="Harga Jual"
              value={formatRupiah(detail.harga_jual || detail.HargaJual)}
              valueClass="font-semibold text-slate-700"
            />
          )}

          {(detail.catatan || detail.alasan || detail.Alasan) && (
            <DetailRow
              icon={FiInfo}
              label="Catatan"
              value={detail.catatan || detail.alasan || detail.Alasan}
            />
          )}
        </div>
      );

    case "mutasi":
      return (
        <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
          {renderAssetValueRow()}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <FiTruck className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-blue-900">
              Detail Mutasi
            </span>
          </div>

          <DetailRow
            icon={FiCalendar}
            label="Tanggal Mutasi"
            value={formatDate(detail.TglMutasi)}
          />

          <MutationRow
            icon={FiMapPin}
            label="Departemen"
            from={detail.departemen_asal_nama}
            to={detail.departemen_tujuan_nama}
          />

          <MutationRow
            icon={FiMapPin}
            label="Lokasi"
            from={detail.ruangan_asal}
            to={detail.ruangan_tujuan}
          />

          {detail.alasan && (
            <DetailRow icon={FiFileText} label="Alasan" value={detail.alasan} />
          )}

          {detail.catatan && (
            <DetailRow icon={FiInfo} label="Catatan" value={detail.catatan} />
          )}
        </div>
      );

    default:
      return null;
  }
}
