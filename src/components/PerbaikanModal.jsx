import React, { useEffect, useState } from "react";
import Confirm from "./Confirm";
import { listPerbaikan, createPerbaikan, deletePerbaikan } from "@/api/aset";
import { formatRupiah } from "@/utils/format";

export default function PerbaikanModal({ asetId, open, onClose, onChange }) {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal: "",
    purchaseOrder: "",
    vendor: "",
    bagian: "",
    nominal: "",
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
    try {
      setLoading(true);
      const created = await createPerbaikan(asetId, form);
      setRepairs((prev) => [...(prev || []), created]);
      setForm({
        tanggal: "",
        purchaseOrder: "",
        vendor: "",
        bagian: "",
        nominal: "",
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
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Close
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
                    <th className="p-2">PO</th>
                    <th className="p-2">Vendor</th>
                    <th className="p-2">Bagian</th>
                    <th className="p-2">Nominal</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {repairs.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.tanggal}</td>
                      <td className="p-2">{r.purchaseOrder}</td>
                      <td className="p-2">{r.vendor}</td>
                      <td className="p-2">{r.bagian}</td>
                      <td className="p-2">
                        {r.nominal ? formatRupiah(r.nominal) : "-"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={form.tanggal}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggal: e.target.value }))
              }
              type="date"
              className="p-2 border rounded"
            />
            <input
              placeholder="PO"
              value={form.purchaseOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, purchaseOrder: e.target.value }))
              }
              className="p-2 border rounded"
            />
            <input
              placeholder="Vendor"
              value={form.vendor}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, vendor: e.target.value }))
              }
              className="p-2 border rounded"
            />
            <input
              placeholder="Bagian"
              value={form.bagian}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bagian: e.target.value }))
              }
              className="p-2 border rounded"
            />
            <input
              placeholder="Nominal"
              value={form.nominal}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nominal: e.target.value }))
              }
              className="p-2 border rounded"
              type="number"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-indigo-600 text-white rounded"
              >
                Tambah
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
