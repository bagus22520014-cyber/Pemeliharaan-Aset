import React, { useState } from "react";
import LocationSelector from "./LocationSelector";
import Confirm from "./Confirm";
import { createRusak } from "@/api/transaksi";

/**
 * Modal untuk mencatat aset rusak
 * Mengurangi stok dari lokasi yang dipilih
 */
export default function RusakModal({
  asetId,
  namaAset,
  open,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    TglRusak: new Date().toISOString().split("T")[0],
    lokasi_id: null,
    Kerusakan: "",
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

    if (!form.TglRusak) {
      setError("Tanggal rusak harus diisi");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        AsetId: asetId,
        lokasi_id: form.lokasi_id,
        TglRusak: form.TglRusak,
        Kerusakan: form.Kerusakan || null,
        catatan: form.catatan || null,
      };

      await createRusak(payload);

      // Reset form
      setForm({
        TglRusak: new Date().toISOString().split("T")[0],
        lokasi_id: null,
        Kerusakan: "",
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
              <div className="font-semibold text-lg">Catat Aset Rusak</div>
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
            {/* Tanggal Rusak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Rusak <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.TglRusak}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, TglRusak: e.target.value }))
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

            {/* Deskripsi Kerusakan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Kerusakan
              </label>
              <textarea
                value={form.Kerusakan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Kerusakan: e.target.value }))
                }
                disabled={loading}
                rows={3}
                placeholder="Contoh: Layar pecah, tidak bisa menyala"
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
              disabled={loading || !form.TglRusak || !form.lokasi_id}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Menyimpan..." : "Catat Aset Rusak"}
            </button>
          </div>
        </div>
      </div>

      {confirmSubmit && (
        <Confirm
          open={confirmSubmit}
          title="Konfirmasi Aset Rusak"
          message="Yakin ingin mencatat aset ini sebagai rusak?"
          danger={true}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={handleSubmit}
          confirmLabel="Ya, Catat Rusak"
        />
      )}
    </>
  );
}
