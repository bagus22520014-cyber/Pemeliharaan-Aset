import React from "react";
import LocationSelector from "@/components/LocationSelector";

export default function DipinjamTab({
  asetId,
  form,
  setForm,
  borrows,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Peminjaman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pinjam <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggalPinjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggalPinjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <LocationSelector
            asetId={asetId}
            selectedLokasiId={form.lokasi_id}
            onSelect={(lokasiId) =>
              setForm((prev) => ({ ...prev, lokasi_id: lokasiId }))
            }
            jumlahDiperlukan={parseInt(form.jumlahDipinjam) || 1}
            label="Ruangan"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kembali
            </label>
            <input
              type="date"
              value={form.tanggalKembali}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tanggalKembali: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peminjam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama peminjam"
              value={form.peminjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, peminjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Dipinjam
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahDipinjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahDipinjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              placeholder="Keperluan peminjaman..."
              value={form.keperluan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, keperluan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCreateRequest}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow"
          >
            {loading ? "Menyimpan..." : "Tambah Data Peminjaman"}
          </button>
        </div>
      </div>
    </>
  );
}
