import React, { useEffect, useState } from "react";
import Confirm from "./Confirm";
import { listPerbaikan, createPerbaikan, deletePerbaikan } from "@/api/aset";
import { formatRupiah } from "@/utils/format";
import LocationSelector from "./LocationSelector";

export default function PerbaikanModal({ asetId, open, onClose, onChange }) {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal_perbaikan: "",
    lokasi_id: null,
    deskripsi: "",
    biaya: "",
    teknisi: "",
    PurchaseOrder: "",
  });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const list = await listPerbaikan(asetId);
        setRepairs(Array.isArray(list) ? list : list ? [list] : []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, asetId]);

  async function handleCreate() {
    if (!form.lokasi_id) {
      setError("Lokasi harus dipilih");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await createPerbaikan(asetId, form);
      setRepairs((prev) => [...(prev || []), created]);
      setForm({
        tanggal_perbaikan: "",
        lokasi_id: null,
        deskripsi: "",
        biaya: "",
        teknisi: "",
        PurchaseOrder: "",
      });
      onChange?.(created);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      setLoading(true);
      await deletePerbaikan(id);
      setRepairs((prev) => prev.filter((r) => String(r.id) !== String(id)));
      onChange?.({ id, deleted: true });
    } catch (err) {
      setError(String(err));
    } finally {
      setConfirm({ open: false, id: null });
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative z-70 w-[min(900px,95%)] bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-lg">Riwayat Perbaikan</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
            >
              Tutup
            </button>
          </div>
        </div>

        <div className="mb-3">
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {!loading && repairs.length === 0 && (
            <div className="text-sm text-gray-600 italic">
              Belum ada perbaikan
            </div>
          )}
          {!loading && repairs.length > 0 && (
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Deskripsi</th>
                    <th className="p-2">Teknisi</th>
                    <th className="p-2">PO</th>
                    <th className="p-2">Biaya</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {repairs.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">
                        {r.tanggal_perbaikan || r.tanggal}
                      </td>
                      <td className="p-2">{r.deskripsi || "-"}</td>
                      <td className="p-2">{r.teknisi || "-"}</td>
                      <td className="p-2">{r.PurchaseOrder || "-"}</td>
                      <td className="p-2">
                        {r.biaya ? formatRupiah(r.biaya) : "-"}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => setConfirm({ open: true, id: r.id })}
                          className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="text-sm font-medium mb-2">Tambah Perbaikan Baru</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Perbaikan <span className="text-red-500">*</span>
              </label>
              <input
                value={form.tanggal_perbaikan}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tanggal_perbaikan: e.target.value,
                  }))
                }
                type="date"
                required
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <LocationSelector
                asetId={asetId}
                selectedLokasiId={form.lokasi_id}
                onSelect={(id) =>
                  setForm((prev) => ({ ...prev, lokasi_id: id }))
                }
                jumlahDiperlukan={1}
                label="Ruangan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Perbaikan
              </label>
              <input
                placeholder="Contoh: Ganti hard disk"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                }
                disabled={loading}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teknisi
              </label>
              <input
                placeholder="Nama teknisi"
                value={form.teknisi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teknisi: e.target.value }))
                }
                disabled={loading}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order
              </label>
              <input
                placeholder="Masukkan nomor PO"
                value={form.PurchaseOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    PurchaseOrder: e.target.value,
                  }))
                }
                disabled={loading}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Perbaikan (Rp)
              </label>
              <input
                placeholder="Contoh: 250000"
                value={form.biaya}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, biaya: e.target.value }))
                }
                disabled={loading}
                type="number"
                min="0"
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {form.biaya && parseFloat(form.biaya) > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  {formatRupiah(parseFloat(form.biaya))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleCreate}
                disabled={loading || !form.tanggal_perbaikan || !form.lokasi_id}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Menyimpan..." : "Tambah Perbaikan"}
              </button>
            </div>
          </div>
        </div>

        {confirm.open && (
          <Confirm
            open={confirm.open}
            title="Hapus Perbaikan"
            message="Yakin ingin menghapus perbaikan ini?"
            danger={true}
            onClose={() => setConfirm({ open: false, id: null })}
            onConfirm={() => handleDelete(confirm.id)}
            confirmLabel="Hapus"
          />
        )}
      </div>
    </div>
  );
}
