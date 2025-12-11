import React, { useState, useEffect } from "react";
import Confirm from "./Confirm";
import { createMutasi } from "@/api/mutasi";
import { listDepartemen } from "@/api/departemen";
import { updateAset } from "@/api/aset";

/**
 * Modal untuk mencatat mutasi aset (perpindahan departemen/ruangan)
 */
export default function MutasiModal({
  asetId,
  namaAset,
  asset,
  open,
  onClose,
  onSuccess,
}) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    TglMutasi: today,
    departemen_asal_id: null,
    departemen_tujuan_id: null,
    ruangan_asal: "",
    ruangan_tujuan: "",
    alasan: "",
    catatan: "",
  });
  const [departemenList, setDepartemenList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      const loadDepartemen = async () => {
        try {
          const data = await listDepartemen();
          setDepartemenList(data || []);
        } catch (err) {
          console.error("Failed to load departemen:", err);
        }
      };
      loadDepartemen();
    }
  }, [open]);

  // Auto-fill departemen asal dan ruangan asal dari data aset saat modal dibuka
  useEffect(() => {
    if (open && asset) {
      setForm((prev) => ({
        ...prev,
        departemen_asal_id: asset.departemen_id || prev.departemen_asal_id,
        ruangan_asal: asset.lokasi || prev.ruangan_asal,
      }));
    }
  }, [open, asset]);

  const handleSubmit = async () => {
    if (!form.TglMutasi) {
      setError("Tanggal mutasi harus diisi");
      return;
    }

    // Minimal harus ada perubahan departemen ATAU ruangan
    const hasDepartemenChange =
      form.departemen_asal_id || form.departemen_tujuan_id;
    const hasRuanganChange = form.ruangan_asal || form.ruangan_tujuan;

    if (!hasDepartemenChange && !hasRuanganChange) {
      setError(
        "Minimal harus mengisi departemen asal/tujuan atau ruangan asal/tujuan"
      );
      return;
    }

    if (!form.alasan?.trim()) {
      setError("Alasan mutasi harus diisi");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // determine if current user is admin; only admins should apply
      // mutasi updates to the aset immediately (auto-approve behavior)
      let isAdmin = false;
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : null;
        isAdmin = u?.role === "admin" || u?.role === "Admin";
      } catch (e) {
        isAdmin = false;
      }

      // Prefer numeric asset.id, but accept string asetId as fallback (user view)
      const numericAssetId = asset?.id || asset?.ID;
      const stringAsetId = asset?.asetId || asset?.AsetId;
      if (!numericAssetId && !stringAsetId) {
        throw new Error("Asset ID tidak ditemukan");
      }

      const payload = {
        TglMutasi: form.TglMutasi,
        departemen_asal_id: form.departemen_asal_id || null,
        departemen_tujuan_id: form.departemen_tujuan_id || null,
        ruangan_asal: form.ruangan_asal?.trim() || null,
        ruangan_tujuan: form.ruangan_tujuan?.trim() || null,
        alasan: form.alasan.trim(),
        catatan: form.catatan?.trim() || null,
      };
      if (numericAssetId) payload.aset_id = numericAssetId;
      else payload.AsetId = stringAsetId;

      await createMutasi(payload);

      // Update aset data setelah mutasi
      const updatePayload = {};
      if (form.departemen_tujuan_id) {
        updatePayload.departemen_id = form.departemen_tujuan_id;
      }
      if (form.ruangan_tujuan?.trim()) {
        updatePayload.lokasi = form.ruangan_tujuan.trim();
      }

      // Update aset jika ada perubahan — only apply immediately for admins
      if (isAdmin && Object.keys(updatePayload).length > 0) {
        try {
          await updateAset(asetId, updatePayload);
        } catch (updateErr) {
          console.error("Failed to update asset after mutasi:", updateErr);
          // Continue anyway, mutasi sudah berhasil disimpan
        }
      }

      // Reset form
      setForm({
        TglMutasi: today,
        departemen_asal_id: null,
        departemen_tujuan_id: null,
        ruangan_asal: "",
        ruangan_tujuan: "",
        alasan: "",
        catatan: "",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
      setConfirmSubmit(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />
        <div className="relative z-70 w-[min(700px,95%)] bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Mutasi Aset</h2>
              <p className="text-sm text-gray-600 mt-1">
                {asetId} - {namaAset}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmSubmit(true);
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mutasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.TglMutasi}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, TglMutasi: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departemen Asal
                  </label>
                  <select
                    value={form.departemen_asal_id || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        departemen_asal_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
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
                    value={form.departemen_tujuan_id || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        departemen_tujuan_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Pilih Departemen Tujuan</option>
                    {departemenList.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nama} ({dept.kode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruangan Asal
                  </label>
                  <input
                    type="text"
                    placeholder="Server Room Lt 2"
                    value={form.ruangan_asal}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ruangan_asal: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruangan Tujuan
                  </label>
                  <input
                    type="text"
                    placeholder="Ruang GA Lt 1"
                    value={form.ruangan_tujuan}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ruangan_tujuan: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Mutasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Restrukturisasi departemen / Kebutuhan operasional"
                  value={form.alasan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, alasan: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  placeholder="Unit dipindahkan dalam kondisi baik"
                  value={form.catatan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, catatan: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan Mutasi"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Confirm
        open={confirmSubmit}
        title="Konfirmasi Mutasi"
        message={`Yakin ingin mencatat mutasi aset "${namaAset}"?`}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmSubmit(false)}
      />
    </>
  );
}
