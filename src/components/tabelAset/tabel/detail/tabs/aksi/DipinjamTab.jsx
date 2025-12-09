import React from "react";
import { FaHandshake, FaCalendarAlt, FaUser } from "react-icons/fa";
import ActionButton from "./ActionButton";

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
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
            <FaHandshake className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Tambah Data Peminjaman
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Catat peminjaman aset ini
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Grid Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Pinjam
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.tanggal_pinjam}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal_pinjam: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                  focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Kembali
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.tanggal_kembali}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal_kembali: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                  focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Peminjam */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Peminjam
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan nama peminjam"
                value={form.peminjam}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, peminjam: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan
            </label>
            <div className="relative">
              <textarea
                placeholder="Masukkan catatan tambahan jika ada..."
                value={form.catatan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, catatan: e.target.value }))
                }
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <ActionButton
        type="dipinjam"
        loading={loading}
        onClick={onCreateRequest}
      />
    </>
  );
}
