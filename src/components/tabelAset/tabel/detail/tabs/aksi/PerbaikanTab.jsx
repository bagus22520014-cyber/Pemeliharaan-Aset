import React from "react";
import {
  FaTools,
  FaCalendarAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaFileInvoice,
  FaClipboardList,
  FaWrench,
} from "react-icons/fa";
import ActionButton from "./ActionButton";
import { formatRupiah, unformatRupiah } from "../../../../../../utils/format";

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
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-yellow-500 p-3 rounded-xl shadow-lg">
            <FaTools className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Tambah Perbaikan Aset
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Isi detail perbaikan untuk aset ini
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tanggal Perbaikan */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Perbaikan
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.tanggal_perbaikan}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tanggal_perbaikan: e.target.value,
                  }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Grid 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendor */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vendor
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan nama vendor"
                  value={form.teknisi}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, teknisi: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white placeholder-gray-400 hover:border-blue-300 
                  focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                  transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Biaya Perbaikan */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biaya Perbaikan
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </div>
                <input
                  type="text"
                  placeholder="0"
                  value={formatRupiah(form.biaya)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      biaya: unformatRupiah(e.target.value),
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 pl-10 text-gray-700 
                  bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                  focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Purchase Order */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purchase Order
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nomor PO"
                  value={form.PurchaseOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      PurchaseOrder: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white placeholder-gray-400 hover:border-blue-300 
                  focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                  transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi Perbaikan
            </label>
            <div className="relative">
              <textarea
                placeholder="Masukkan detail pekerjaan perbaikan yang dilakukan..."
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                }
                rows="4"
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                <FaWrench className="inline mr-1" />
                Detail perbaikan
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionButton
        type="diperbaiki"
        loading={loading}
        onClick={onCreateRequest}
      />
    </>
  );
}
