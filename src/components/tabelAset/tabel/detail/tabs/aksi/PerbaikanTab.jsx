import React from "react";
import LocationSelector from "@/components/LocationSelector";

export default function PerbaikanTab({
  asetId,
  form,
  setForm,
  repairs,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Perbaikan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggal: e.target.value }))
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
            label="Ruangan"
            required
          />
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
              <option value="pending">Pending</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              placeholder="Deskripsi perbaikan..."
              value={form.deskripsi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biaya
            </label>
            <input
              type="number"
              placeholder="500000"
              value={form.biaya}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, biaya: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
              step="1000"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCreateRequest}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow"
          >
            {loading ? "Menyimpan..." : "Tambah Perbaikan"}
          </button>
        </div>
      </div>
    </>
  );
}
