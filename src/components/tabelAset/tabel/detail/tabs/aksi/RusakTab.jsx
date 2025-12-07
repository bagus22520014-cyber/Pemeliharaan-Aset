import React from "react";
import LocationSelector from "@/components/LocationSelector";

export default function RusakTab({
  asetId,
  form,
  setForm,
  damages,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Kerusakan
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
            jumlahDiperlukan={parseInt(form.jumlahRusak) || 1}
            label="Ruangan"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tingkat Kerusakan
            </label>
            <select
              value={form.tingkatKerusakan}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tingkatKerusakan: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="berat">Berat</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              placeholder="Deskripsi kerusakan..."
              value={form.keterangan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, keterangan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimasi Biaya
            </label>
            <input
              type="number"
              placeholder="1500000"
              value={form.estimasiBiaya}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, estimasiBiaya: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Rusak
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahRusak}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahRusak: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Kerusakan
            </label>
            <select
              value={form.statusRusak}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  statusRusak: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="temporary">Temporary</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={form.catatan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, catatan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCreateRequest}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow"
          >
            {loading ? "Menyimpan..." : "Tambah Data Kerusakan"}
          </button>
        </div>
      </div>
    </>
  );
}
