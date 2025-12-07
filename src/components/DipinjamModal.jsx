import React, { useState } from "react";
import LocationSelector from "./LocationSelector";
import Confirm from "./Confirm";
import { createDipinjam } from "@/api/transaksi";

/**
 * Modal untuk mencatat peminjaman aset
 * Mengurangi stok dari lokasi yang dipilih
 */
export default function DipinjamModal({
  asetId,
  namaAset,
  open,
  onClose,
  onSuccess,
}) {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    TglPinjam: today,
    TglKembali: nextWeek,
    lokasi_id: null,
    Peminjam: "",
    jumlah_dipinjam: 1,
    StatusPeminjaman: "borrowed",
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

    if (!form.TglPinjam || !form.TglKembali) {
      setError("Tanggal pinjam dan kembali harus diisi");
      return;
    }

    if (!form.Peminjam?.trim()) {
      setError("Nama peminjam harus diisi");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        AsetId: asetId,
        lokasi_id: form.lokasi_id,
        Peminjam: form.Peminjam.trim(),
        TglPinjam: form.TglPinjam,
        TglKembali: form.TglKembali,
        jumlah_dipinjam: parseInt(form.jumlah_dipinjam) || 1,
        StatusPeminjaman: form.StatusPeminjaman,
        catatan: form.catatan || null,
      };

      await createDipinjam(payload);

      // Reset form
      setForm({
        TglPinjam: today,
        TglKembali: nextWeek,
        lokasi_id: null,
        Peminjam: "",
        jumlah_dipinjam: 1,
        StatusPeminjaman: "borrowed",
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
              <div className="font-semibold text-lg">Catat Peminjaman Aset</div>
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
            {/* Nama Peminjam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Peminjam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.Peminjam}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Peminjam: e.target.value }))
                }
                disabled={loading}
                required
                placeholder="Contoh: Ahmad Suryadi"
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            {/* Tanggal Pinjam & Kembali */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pinjam <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.TglPinjam}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, TglPinjam: e.target.value }))
                  }
                  disabled={loading}
                  required
                  className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Kembali <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.TglKembali}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      TglKembali: e.target.value,
                    }))
                  }
                  disabled={loading}
                  required
                  min={form.TglPinjam}
                  className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Ruangan Selector */}
            <LocationSelector
              asetId={asetId}
              selectedLokasiId={form.lokasi_id}
              onSelect={(id) => setForm((prev) => ({ ...prev, lokasi_id: id }))}
              jumlahDiperlukan={parseInt(form.jumlah_dipinjam) || 1}
              disabled={loading}
            />

            {/* Jumlah Dipinjam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Dipinjam <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.jumlah_dipinjam}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    jumlah_dipinjam: e.target.value,
                  }))
                }
                disabled={loading}
                required
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            {/* Status Peminjaman */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.StatusPeminjaman}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    StatusPeminjaman: e.target.value,
                  }))
                }
                disabled={loading}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              >
                <option value="borrowed">Dipinjam</option>
                <option value="returned">Dikembalikan</option>
              </select>
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
                !form.TglPinjam ||
                !form.TglKembali ||
                !form.lokasi_id ||
                !form.Peminjam?.trim()
              }
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Menyimpan..." : "Catat Peminjaman"}
            </button>
          </div>
        </div>
      </div>

      {confirmSubmit && (
        <Confirm
          open={confirmSubmit}
          title="Konfirmasi Peminjaman"
          message={`Yakin ingin mencatat peminjaman ${form.jumlah_dipinjam} unit aset oleh ${form.Peminjam}? Stok akan dikurangi dari lokasi yang dipilih.`}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={handleSubmit}
          confirmLabel="Ya, Catat Peminjaman"
        />
      )}
    </>
  );
}
