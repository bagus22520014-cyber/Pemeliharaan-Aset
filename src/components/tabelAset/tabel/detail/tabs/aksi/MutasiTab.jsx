import React, { useState, useEffect } from "react";
import { listDepartemen } from "@/api/departemen";

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
        console.error("Failed to load departemen:", err);
      }
    };
    loadDepartemen();
  }, []);

  // Auto-fill departemen asal dan ruangan asal dari data aset
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
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Mutasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mutasi <span className="text-red-500">*</span>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departemen Asal
            </label>
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
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300 bg-gray-100 cursor-not-allowed"
            >
              <option value="">-- Pilih Departemen Asal --</option>
              {departemenList.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nama} ({dept.kode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departemen Tujuan
            </label>
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
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">-- Pilih Departemen Tujuan --</option>
              {departemenList.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nama} ({dept.kode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruangan Asal
            </label>
            <input
              type="text"
              placeholder="Server Room Lt 2"
              value={form.ruanganAsal}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ruanganAsal: e.target.value }))
              }
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruangan Tujuan
            </label>
            <input
              type="text"
              placeholder="Masukkan ruangan tujuan"
              value={form.ruanganTujuan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ruanganTujuan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Mutasi <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Masukkan alasan mutasi"
              value={form.alasan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, alasan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="3"
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
              rows="3"
            />
          </div>
        </div>
        <button
          onClick={onCreateRequest}
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Menyimpan..." : "Simpan Mutasi"}
        </button>
      </div>
    </>
  );
}
