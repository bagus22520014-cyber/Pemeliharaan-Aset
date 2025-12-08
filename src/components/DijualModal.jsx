import React, { useState } from "react";
import LocationSelector from "./LocationSelector";
import Confirm from "./Confirm";
import { createDijual } from "@/api/transaksi";
import { formatRupiah } from "@/utils/format";

/**
 * Modal untuk mencatat penjualan aset
 * Mengurangi stok dari lokasi yang dipilih
 */
export default function DijualModal({
  asetId,
  namaAset,
  open,
  onClose,
  onSuccess,
}) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    tanggal_jual: today,
    lokasi_id: null,
    harga_jual: "",
    pembeli: "",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const handleSubmit = async () => {
    if (!form.lokasi_id) {
      setError("Ruangan harus dipilih");
      return;
    }

    if (!form.tanggal_jual) {
      setError("Tanggal dijual harus diisi");
      return;
    }

    if (!form.harga_jual || parseFloat(form.harga_jual) <= 0) {
      setError("Harga jual harus diisi dan lebih dari 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        AsetId: asetId,
        lokasi_id: form.lokasi_id,
        tanggal_jual: form.tanggal_jual,
        harga_jual: parseFloat(form.harga_jual),
        pembeli: form.pembeli?.trim() || null,
        catatan: form.catatan || null,
      };

      await createDijual(payload);

      // Reset form
      setForm({
        tanggal_jual: today,
        lokasi_id: null,
        harga_jual: "",
        pembeli: "",
        catatan: "",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
      setConfirmSubmit(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />
        <div className="relative z-70 w-[min(600px,95%)] bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg">Catat Penjualan Aset</div>
              <div className="text-sm text-gray-600">{namaAset || asetId}</div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
            >
              Tutup
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Tanggal Dijual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Dijual <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.tanggal_jual}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tanggal_jual: e.target.value }))
                }
                disabled={loading}
                required
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            {/* Ruangan Selector */}
            <LocationSelector
              asetId={asetId}
              selectedLokasiId={form.lokasi_id}
              onSelect={(id) => setForm((prev) => ({ ...prev, lokasi_id: id }))}
              jumlahDiperlukan={1}
              disabled={loading}
            />

            {/* Harga Jual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.harga_jual}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, harga_jual: e.target.value }))
                }
                disabled={loading}
                required
                placeholder="Contoh: 2000000"
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {form.harga_jual && parseFloat(form.harga_jual) > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  {formatRupiah(parseFloat(form.harga_jual))}
                </div>
              )}
            </div>

            {/* Nama Pembeli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pembeli
              </label>
              <input
                type="text"
                value={form.pembeli}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pembeli: e.target.value }))
                }
                disabled={loading}
                placeholder="Contoh: PT ABC atau Nama Perorangan"
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                value={form.catatan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, catatan: e.target.value }))
                }
                disabled={loading}
                rows={2}
                placeholder="Catatan tambahan (opsional)"
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setConfirmSubmit(true)}
              disabled={
                loading ||
                !form.tanggal_jual ||
                !form.lokasi_id ||
                !form.harga_jual ||
                parseFloat(form.harga_jual) <= 0
              }
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Menyimpan..." : "Catat Penjualan"}
            </button>
          </div>
        </div>
      </div>

      {confirmSubmit && (
        <Confirm
          open={confirmSubmit}
          title="Konfirmasi Penjualan"
          message={`Yakin ingin mencatat penjualan aset dengan harga ${formatRupiah(
            parseFloat(form.harga_jual)
          )}?`}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={handleSubmit}
          confirmLabel="Ya, Catat Penjualan"
        />
      )}
    </>
  );
}
