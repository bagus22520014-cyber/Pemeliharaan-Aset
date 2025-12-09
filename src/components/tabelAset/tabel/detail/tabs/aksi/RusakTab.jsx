import React from "react";
import { FaExclamationTriangle, FaClipboardCheck } from "react-icons/fa";
import ActionButton from "./ActionButton";

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
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500 p-3 rounded-xl shadow-lg">
            <FaExclamationTriangle className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Tambah Data Kerusakan
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Catat kerusakan pada aset ini
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tanggal Rusak */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Rusak
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.TglRusak}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, TglRusak: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Deskripsi Kerusakan */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi Kerusakan
            </label>
            <div className="relative">
              <textarea
                placeholder="Masukkan deskripsi detail kerusakan yang terjadi..."
                value={form.Kerusakan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Kerusakan: e.target.value }))
                }
                rows="4"
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                <FaClipboardCheck className="inline mr-1" />
                Detail kerusakan
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan Tambahan
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan catatan tambahan jika ada"
                value={form.catatan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, catatan: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <ActionButton type="rusak" loading={loading} onClick={onCreateRequest} />
    </>
  );
}
