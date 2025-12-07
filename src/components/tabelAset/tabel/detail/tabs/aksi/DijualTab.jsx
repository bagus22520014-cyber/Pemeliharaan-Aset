import React from "react";
import LocationSelector from "@/components/LocationSelector";

export default function DijualTab({
  asetId,
  form,
  setForm,
  sales,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Penjualan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Jual <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggalJual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggalJual: e.target.value }))
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
            jumlahDiperlukan={parseInt(form.jumlahDijual) || 1}
            label="Ruangan"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pembeli
            </label>
            <input
              type="text"
              placeholder="Nama pembeli"
              value={form.pembeli}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, pembeli: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Jual
            </label>
            <input
              type="number"
              placeholder="5000000"
              value={form.hargaJual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hargaJual: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Dijual
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahDijual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahDijual: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              placeholder="Catatan atau alasan penjualan..."
              value={form.catatan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, catatan: e.target.value }))
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
            {loading ? "Menyimpan..." : "Tambah Data Penjualan"}
          </button>
        </div>
      </div>
    </>
  );
}
