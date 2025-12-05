import React, { useState, useEffect } from "react";
import { listRiwayat } from "@/api/aset";

export default function TabRiwayat({ asetId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!asetId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listRiwayat(asetId);
        setHistory(data || []);
      } catch (err) {
        setError(err.message || "Gagal memuat riwayat");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [asetId]);

  const formatDate = (waktu) => {
    if (!waktu) return "-";
    try {
      const d = new Date(waktu);
      if (isNaN(d.getTime())) return waktu;

      const pad = (n) => String(n).padStart(2, "0");
      const date = `${pad(d.getDate())}/${pad(
        d.getMonth() + 1
      )}/${d.getFullYear()}`;
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return `${date} ${time}`;
    } catch {
      return waktu;
    }
  };

  const renderPerubahan = (perubahan) => {
    if (!perubahan || typeof perubahan !== "object") return null;

    const formatValue = (field, value) => {
      if (value == null) return "null";

      // Format date fields (TglPembelian or similar ISO datetime strings)
      if (
        (field === "TglPembelian" || field === "tglPembelian") &&
        typeof value === "string" &&
        value.includes("T")
      ) {
        // Extract date portion from ISO string
        const datePart = value.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      }

      return value;
    };

    return (
      <div className="mt-2 space-y-1 text-sm">
        {Object.entries(perubahan).map(([field, change]) => {
          if (!change || typeof change !== "object") return null;
          const { before, after } = change;
          return (
            <div key={field} className="flex gap-2">
              <span className="font-semibold text-gray-700">{field}:</span>
              <span className="text-red-600">{formatValue(field, before)}</span>
              <span>→</span>
              <span className="text-green-600">
                {formatValue(field, after)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getAksiLabel = (jenisAksi) => {
    const labels = {
      input: "Input Baru",
      edit: "Edit",
      delete: "Hapus",
      perbaikan: "Perbaikan",
    };
    return labels[jenisAksi] || jenisAksi;
  };

  const getAksiColor = (jenisAksi) => {
    const colors = {
      input: "bg-green-100 text-green-700 border-green-300",
      edit: "bg-blue-100 text-blue-700 border-blue-300",
      delete: "bg-red-100 text-red-700 border-red-300",
      perbaikan: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
    return colors[jenisAksi] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-6 pt-6 pb-4 border-b border-gray-300 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide">Riwayat Aset</h2>
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
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">Memuat riwayat...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">Belum ada riwayat untuk aset ini</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAksiColor(
                            item.jenisAksi || item.jenis_aksi
                          )}`}
                        >
                          {getAksiLabel(item.jenisAksi || item.jenis_aksi)}
                        </span>
                        <span className="text-sm text-gray-600">
                          oleh{" "}
                          <span className="font-semibold text-gray-800">
                            {item.username || "-"}
                          </span>{" "}
                          ({item.role || "-"})
                        </span>
                      </div>

                      {item.asetIdString && (
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">ID:</span>{" "}
                          {item.asetIdString}
                        </p>
                      )}

                      {item.namaAset && (
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">Nama:</span>{" "}
                          {item.namaAset}
                        </p>
                      )}

                      {item.perubahan && renderPerubahan(item.perubahan)}
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      {formatDate(item.waktu)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
