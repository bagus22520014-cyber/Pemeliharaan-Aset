import React from "react";

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
              value={form.tanggal_pinjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggal_pinjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kembali <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal_kembali}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tanggal_kembali: e.target.value,
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
              placeholder="Masukkan nama peminjam"
              value={form.peminjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, peminjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              placeholder="Masukkan catatan"
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
            {loading ? "Menyimpan..." : "Tambah Data Peminjaman"}
          </button>
        </div>
      </div>
    </>
  );
}
