import React, { useState, useEffect } from "react";
import { FaExchangeAlt, FaBuilding, FaDoorOpen } from "react-icons/fa";
import { listDepartemen } from "@/api/departemen";
import ActionButton from "./ActionButton";

export default function MutasiTab({
  asetId,
  asset,
  form,
  setForm,
  mutations,
  loading,
  onCreateRequest,
  onDelete,
}) {
  const [departemenList, setDepartemenList] = useState([]);

  useEffect(() => {
    const loadDepartemen = async () => {
      try {
        const data = await listDepartemen();
        setDepartemenList(data || []);
      } catch (err) {
        // ignore
      }
    };
    loadDepartemen();
  }, []);

  useEffect(() => {
    if (asset && departemenList.length > 0) {
      setForm((prev) => ({
        ...prev,
        departemenAsalId: asset.departemen_id || prev.departemenAsalId,
        ruanganAsal: asset.lokasi || prev.ruanganAsal,
      }));
    }
  }, [asset, departemenList]);

  return (
    <>
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
            <FaExchangeAlt className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Tambah Data Mutasi
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Pindahkan aset ke lokasi atau departemen lain
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tanggal Mutasi */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Mutasi
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tanggal: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Grid Departemen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departemen Asal
              </label>
              <div className="relative">
                <select
                  value={form.departemenAsalId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      departemenAsalId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  disabled
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-gray-50 cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <option value="">Pilih Departemen Asal</option>
                  {departemenList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departemen Tujuan
              </label>
              <div className="relative">
                <select
                  value={form.departemenTujuanId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      departemenTujuanId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-white hover:border-blue-300 focus:ring-4 focus:ring-blue-100 
                  focus:border-blue-500 transition-all duration-200 shadow-sm"
                >
                  <option value="">Pilih Departemen Tujuan</option>
                  {departemenList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Ruangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ruangan Asal
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Server Room Lt 2"
                  value={form.ruanganAsal}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ruanganAsal: e.target.value,
                    }))
                  }
                  disabled
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-700 
                  bg-gray-50 cursor-not-allowed transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ruangan Tujuan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan ruangan tujuan"
                  value={form.ruanganTujuan}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ruanganTujuan: e.target.value,
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

          {/* Alasan Mutasi */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alasan Mutasi
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Masukkan alasan mutasi secara detail..."
                value={form.alasan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, alasan: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
                rows="3"
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
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 
                bg-white placeholder-gray-400 hover:border-blue-300 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                resize-none transition-all duration-200 shadow-sm"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      <ActionButton type="mutasi" loading={loading} onClick={onCreateRequest} />
    </>
  );
}
