import React from "react";
import { FaCopy, FaCheck } from "react-icons/fa";
import { formatRupiah } from "@/utils/format";

export default function FieldPanel({
  asetRecord,
  copiedKey,
  handleCopyToClipboard,
}) {
  const fields = [
    ["Aset ID", asetRecord?.asetId ?? asetRecord?.id ?? "-"],
    ["Accurate ID", asetRecord?.accurateId ?? "-"],
    ["Kategori", asetRecord?.grup ?? "-"],
    ["Akun Perkiraan", asetRecord?.akunPerkiraan ?? "-"],
    [
      "Nilai",
      asetRecord && asetRecord.nilaiAset != null
        ? formatRupiah(asetRecord.nilaiAset)
        : "-",
    ],
    [
      "Beban",
      (() => {
        const bebanValue =
          asetRecord?.bebanKode || asetRecord?.beban?.kode || asetRecord?.beban;
        return typeof bebanValue === "string" ? bebanValue : "-";
      })(),
    ],
    ["Tanggal Pembelian", asetRecord?.tglPembelian ?? "-"],
    [
      "Masa Manfaat",
      asetRecord?.masaManfaat != null ? `${asetRecord.masaManfaat} bulan` : "-",
    ],
  ];

  return (
    <div className="md:col-span-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, value], i) => {
          const isNilai = label === "Nilai";
          const isBeban = label === "Beban";
          const val = value ?? "-";
          const isAsetId = label === "Aset ID";
          const isAccurate = label === "Accurate ID";

          return (
            <div
              key={i}
              className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${
                isNilai || isBeban ? "" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">{label}</div>
                {(isAsetId || isAccurate) && (
                  <button
                    onClick={() =>
                      handleCopyToClipboard(
                        val,
                        isAsetId ? "asetId" : "accurateId"
                      )
                    }
                    className="ml-2 p-1 rounded text-gray-500 hover:bg-gray-100"
                    title={`Copy ${label}`}
                  >
                    {copiedKey === (isAsetId ? "asetId" : "accurateId") ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                )}
              </div>
              <div className={`text-base mt-1 ${isNilai ? "text-basa" : ""}`}>
                {val}
              </div>
            </div>
          );
        })}

        <div className="md:col-span-2 h-36 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="font-medium text-gray-600">Spesifikasi</div>
          <div className="text-base mt-1 whitespace-pre-line">
            {asetRecord?.spesifikasi ?? "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
