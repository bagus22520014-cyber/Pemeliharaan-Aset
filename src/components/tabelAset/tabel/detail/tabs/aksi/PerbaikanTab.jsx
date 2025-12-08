import React from "react";

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
              Tanggal Perbaikan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal_perbaikan}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tanggal_perbaikan: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <input
              type="text"
              placeholder="Masukkan nama vendor"
              value={form.teknisi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, teknisi: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Perbaikan
            </label>
            <textarea
              placeholder="Masukkan deskripsi perbaikan"
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
              Biaya Perbaikan (Rp)
            </label>
            <input
              type="number"
              placeholder="Masukkan biaya perbaikan"
              value={form.biaya}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, biaya: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
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
