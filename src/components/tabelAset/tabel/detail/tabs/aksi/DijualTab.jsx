import React from "react";
import { FaShoppingCart, FaMoneyBillWave, FaUser } from "react-icons/fa";
import ActionButton from "./ActionButton";
import { formatRupiah, unformatRupiah } from "../../../../../../utils/format";

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
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-500 p-3 rounded-xl shadow-lg">
            <FaShoppingCart className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Tambah Data Penjualan Aset
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Catat penjualan aset ini
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tanggal Jual */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Jual
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.tanggal_jual}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tanggal_jual: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Grid Harga & Pembeli */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Jual
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </div>
                <input
                  type="text"
                  placeholder="0"
                  value={formatRupiah(form.harga_jual)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      harga_jual: unformatRupiah(e.target.value),
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 pl-10 text-gray-700 
                  bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                  focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pembeli
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan nama pembeli"
                  value={form.pembeli}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pembeli: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white placeholder-gray-400 hover:border-blue-300 
                  focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                  transition-all duration-200 shadow-sm"
                />
              </div>
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
                rows="3"
                value={form.catatan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, catatan: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <ActionButton type="dijual" loading={loading} onClick={onCreateRequest} />
    </>
  );
}
