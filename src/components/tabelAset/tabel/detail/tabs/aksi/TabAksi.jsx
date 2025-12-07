import React, { useState, useEffect } from "react";
import {
  listPerbaikan,
  createPerbaikan,
  deletePerbaikan,
  listRusak,
  createRusak,
  deleteRusak,
  listDipinjam,
  createDipinjam,
  deleteDipinjam,
  listDijual,
  createDijual,
  deleteDijual,
  updateAset,
} from "@/api/aset";
import { formatRupiah, getCurrentDate } from "@/utils/format";
import Confirm from "@/components/Confirm";

export default function TabAksi({ asetId, asset, onClose, onUpdated }) {
  const [activeSubTab, setActiveSubTab] = useState("perbaikan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Perbaikan state
  const [repairs, setRepairs] = useState([]);
  const [repairForm, setRepairForm] = useState({
    tanggal: getCurrentDate(),
    deskripsi: "",
    biaya: "",
    teknisi: "",
    status: "pending",
  });

  // Rusak state
  const [damages, setDamages] = useState([]);
  const [damageForm, setDamageForm] = useState({
    tanggal: getCurrentDate(),
    keterangan: "",
    tingkatKerusakan: "ringan",
    estimasiBiaya: "",
    jumlahRusak: 1,
    statusRusak: "temporary",
    catatan: "",
  });

  // Dipinjam state
  const [borrows, setBorrows] = useState([]);
  const [borrowForm, setBorrowForm] = useState({
    tanggalPinjam: getCurrentDate(),
    tanggalKembali: "",
    peminjam: "",
    keperluan: "",
    jumlahDipinjam: 1,
    status: "dipinjam",
  });

  // Dijual state
  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({
    tanggalJual: getCurrentDate(),
    pembeli: "",
    hargaJual: "",
    jumlahDijual: 1,
    catatan: "",
  });

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    type: null,
  });
  const [confirmCreate, setConfirmCreate] = useState({
    open: false,
    type: null,
  });

  useEffect(() => {
    loadData();
  }, [asetId, activeSubTab]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      if (activeSubTab === "perbaikan") {
        const list = await listPerbaikan(asetId);
        setRepairs(Array.isArray(list) ? list : list ? [list] : []);
      } else if (activeSubTab === "rusak") {
        const list = await listRusak(asetId);
        setDamages(Array.isArray(list) ? list : list ? [list] : []);
      } else if (activeSubTab === "dipinjam") {
        const list = await listDipinjam(asetId);
        setBorrows(Array.isArray(list) ? list : list ? [list] : []);
      } else if (activeSubTab === "dijual") {
        const list = await listDijual(asetId);
        setSales(Array.isArray(list) ? list : list ? [list] : []);
      }
    } catch (err) {
      setError(`Gagal memuat data: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // Validation functions
  function validateRepairForm() {
    if (!repairForm.tanggal) return "Tanggal harus diisi";
    // Deskripsi, biaya, dan teknisi bersifat opsional
    return null;
  }

  function validateDamageForm() {
    if (!damageForm.tanggal) return "Tanggal harus diisi";
    return null;
  }

  function validateBorrowForm() {
    if (!borrowForm.tanggalPinjam) return "Tanggal pinjam harus diisi";
    if (!borrowForm.peminjam?.trim()) return "Nama peminjam harus diisi";
    return null;
  }

  function validateSaleForm() {
    if (!saleForm.tanggalJual) return "Tanggal jual harus diisi";
    return null;
  }

  // Create handlers
  function handleCreateRequest(type) {
    let validationError = null;
    if (type === "perbaikan") validationError = validateRepairForm();
    else if (type === "rusak") validationError = validateDamageForm();
    else if (type === "dipinjam") validationError = validateBorrowForm();
    else if (type === "dijual") validationError = validateSaleForm();

    if (validationError) {
      setError(validationError);
      return;
    }
    setConfirmCreate({ open: true, type });
  }

  async function handleCreate() {
    const type = confirmCreate.type;
    setConfirmCreate({ open: false, type: null });
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let created;
      let newStatus = asset.statusAset;

      if (type === "perbaikan") {
        created = await createPerbaikan(asetId, {
          tanggal: repairForm.tanggal,
          deskripsi: repairForm.deskripsi,
          biaya: repairForm.biaya ? parseFloat(repairForm.biaya) : null,
          teknisi: repairForm.teknisi,
          status: repairForm.status,
        });
        setRepairs((prev) => [...prev, created]);
        setRepairForm({
          tanggal: getCurrentDate(),
          deskripsi: "",
          biaya: "",
          teknisi: "",
          status: "pending",
        });
        newStatus = "diperbaiki";
        setSuccess("Perbaikan berhasil ditambahkan");
      } else if (type === "rusak") {
        created = await createRusak(asetId, {
          tanggal: damageForm.tanggal,
          keterangan: damageForm.keterangan,
          tingkatKerusakan: damageForm.tingkatKerusakan,
          estimasiBiaya: damageForm.estimasiBiaya
            ? parseFloat(damageForm.estimasiBiaya)
            : null,
          jumlahRusak: parseInt(damageForm.jumlahRusak) || 1,
          statusRusak: damageForm.statusRusak,
          catatan: damageForm.catatan,
        });
        setDamages((prev) => [...prev, created]);
        setDamageForm({
          tanggal: getCurrentDate(),
          keterangan: "",
          tingkatKerusakan: "ringan",
          estimasiBiaya: "",
          jumlahRusak: 1,
          statusRusak: "temporary",
          catatan: "",
        });
        newStatus = "rusak";
        setSuccess("Data kerusakan berhasil ditambahkan");
      } else if (type === "dipinjam") {
        created = await createDipinjam(asetId, {
          tanggalPinjam: borrowForm.tanggalPinjam,
          tanggalKembali: borrowForm.tanggalKembali || null,
          peminjam: borrowForm.peminjam,
          keperluan: borrowForm.keperluan,
          jumlahDipinjam: parseInt(borrowForm.jumlahDipinjam) || 1,
          status: borrowForm.status,
        });
        setBorrows((prev) => [...prev, created]);
        setBorrowForm({
          tanggalPinjam: getCurrentDate(),
          tanggalKembali: "",
          peminjam: "",
          keperluan: "",
          jumlahDipinjam: 1,
          status: "dipinjam",
        });
        newStatus = "dipinjam";
        setSuccess("Data peminjaman berhasil ditambahkan");
      } else if (type === "dijual") {
        created = await createDijual(asetId, {
          tanggalJual: saleForm.tanggalJual,
          pembeli: saleForm.pembeli,
          hargaJual: saleForm.hargaJual ? parseFloat(saleForm.hargaJual) : null,
          jumlahDijual: parseInt(saleForm.jumlahDijual) || 1,
          catatan: saleForm.catatan,
        });
        setSales((prev) => [...prev, created]);
        setSaleForm({
          tanggalJual: getCurrentDate(),
          pembeli: "",
          hargaJual: "",
          jumlahDijual: 1,
          catatan: "",
        });
        newStatus = "dijual";
        setSuccess("Data penjualan berhasil ditambahkan");
      }

      // Backend automatically updates status, just trigger refresh
      // Note: Backend should handle status update to avoid duplicate riwayat
      if (onUpdated) {
        onUpdated({ ...asset, statusAset: newStatus });
      }
    } catch (err) {
      console.error(`Error creating ${type}:`, err);
      setError(`Gagal menambahkan data: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // Delete handlers
  async function handleDelete(id, type) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (type === "perbaikan") {
        await deletePerbaikan(id);
        setRepairs((prev) => prev.filter((r) => String(r.id) !== String(id)));
      } else if (type === "rusak") {
        await deleteRusak(id);
        setDamages((prev) => prev.filter((r) => String(r.id) !== String(id)));
      } else if (type === "dipinjam") {
        await deleteDipinjam(id);
        setBorrows((prev) => prev.filter((r) => String(r.id) !== String(id)));
      } else if (type === "dijual") {
        await deleteDijual(id);
        setSales((prev) => prev.filter((r) => String(r.id) !== String(id)));
      }
      setSuccess("Data berhasil dihapus");
    } catch (err) {
      setError(`Gagal menghapus data: ${err.message || err}`);
    } finally {
      setConfirmDelete({ open: false, id: null, type: null });
      setLoading(false);
    }
  }

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-6 pt-6 pb-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-wide">
            Aksi Aset: {asetId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
          >
            Tutup
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2">
          {[
            { key: "perbaikan", label: "Perbaikan" },
            { key: "rusak", label: "Kerusakan" },
            { key: "dipinjam", label: "Peminjaman" },
            { key: "dijual", label: "Penjualan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeSubTab === tab.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="p-6 overflow-auto"
        style={{ height: "calc(692px - 140px)" }}
      >
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Perbaikan Tab */}
        {activeSubTab === "perbaikan" && (
          <PerbaikanTab
            form={repairForm}
            setForm={setRepairForm}
            repairs={repairs}
            loading={loading}
            onCreateRequest={() => handleCreateRequest("perbaikan")}
            onDelete={(id) =>
              setConfirmDelete({ open: true, id, type: "perbaikan" })
            }
          />
        )}

        {/* Rusak Tab */}
        {activeSubTab === "rusak" && (
          <RusakTab
            form={damageForm}
            setForm={setDamageForm}
            damages={damages}
            loading={loading}
            onCreateRequest={() => handleCreateRequest("rusak")}
            onDelete={(id) =>
              setConfirmDelete({ open: true, id, type: "rusak" })
            }
          />
        )}

        {/* Dipinjam Tab */}
        {activeSubTab === "dipinjam" && (
          <DipinjamTab
            form={borrowForm}
            setForm={setBorrowForm}
            borrows={borrows}
            loading={loading}
            onCreateRequest={() => handleCreateRequest("dipinjam")}
            onDelete={(id) =>
              setConfirmDelete({ open: true, id, type: "dipinjam" })
            }
          />
        )}

        {/* Dijual Tab */}
        {activeSubTab === "dijual" && (
          <DijualTab
            form={saleForm}
            setForm={setSaleForm}
            sales={sales}
            loading={loading}
            onCreateRequest={() => handleCreateRequest("dijual")}
            onDelete={(id) =>
              setConfirmDelete({ open: true, id, type: "dijual" })
            }
          />
        )}
      </div>

      {/* Confirm Create Dialog */}
      {confirmCreate.open && (
        <Confirm
          open={confirmCreate.open}
          title={`Konfirmasi ${
            confirmCreate.type === "perbaikan"
              ? "Perbaikan"
              : confirmCreate.type === "rusak"
              ? "Kerusakan"
              : confirmCreate.type === "dipinjam"
              ? "Peminjaman"
              : "Penjualan"
          }`}
          message={`Tambah data ${confirmCreate.type} untuk aset ${asetId}?`}
          onClose={() => setConfirmCreate({ open: false, type: null })}
          onConfirm={handleCreate}
          confirmLabel="Tambah"
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete.open && (
        <Confirm
          open={confirmDelete.open}
          title="Hapus Data"
          message="Yakin ingin menghapus data ini?"
          danger={true}
          onClose={() =>
            setConfirmDelete({ open: false, id: null, type: null })
          }
          onConfirm={() => handleDelete(confirmDelete.id, confirmDelete.type)}
          confirmLabel="Hapus"
        />
      )}
    </div>
  );
}

// Perbaikan Sub-component
function PerbaikanTab({
  form,
  setForm,
  repairs,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Perbaikan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
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
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="pending">Pending</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              placeholder="Deskripsi perbaikan..."
              value={form.deskripsi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teknisi
            </label>
            <input
              type="text"
              placeholder="Nama teknisi"
              value={form.teknisi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, teknisi: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biaya
            </label>
            <input
              type="number"
              placeholder="500000"
              value={form.biaya}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, biaya: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
              step="1000"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCreateRequest}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow"
          >
            {loading ? "Menyimpan..." : "Tambah Perbaikan"}
          </button>
        </div>
      </div>
    </>
  );
}

// Rusak Sub-component
function RusakTab({
  form,
  setForm,
  damages,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Kerusakan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
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
              Tingkat Kerusakan
            </label>
            <select
              value={form.tingkatKerusakan}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tingkatKerusakan: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="berat">Berat</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              placeholder="Deskripsi kerusakan..."
              value={form.keterangan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, keterangan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimasi Biaya
            </label>
            <input
              type="number"
              placeholder="1500000"
              value={form.estimasiBiaya}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, estimasiBiaya: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Rusak
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahRusak}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahRusak: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Kerusakan
            </label>
            <select
              value={form.statusRusak}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  statusRusak: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="temporary">Temporary</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={form.catatan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, catatan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCreateRequest}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow"
          >
            {loading ? "Menyimpan..." : "Tambah Data Kerusakan"}
          </button>
        </div>
      </div>
    </>
  );
}

// Dipinjam Sub-component
function DipinjamTab({
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
              value={form.tanggalPinjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggalPinjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kembali
            </label>
            <input
              type="date"
              value={form.tanggalKembali}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tanggalKembali: e.target.value,
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
              placeholder="Nama peminjam"
              value={form.peminjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, peminjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Dipinjam
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahDipinjam}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahDipinjam: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              placeholder="Keperluan peminjaman..."
              value={form.keperluan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, keperluan: e.target.value }))
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

// Dijual Sub-component
function DijualTab({
  form,
  setForm,
  sales,
  loading,
  onCreateRequest,
  onDelete,
}) {
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tambah Data Penjualan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Jual <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggalJual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggalJual: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pembeli
            </label>
            <input
              type="text"
              placeholder="Nama pembeli"
              value={form.pembeli}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, pembeli: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Jual
            </label>
            <input
              type="number"
              placeholder="5000000"
              value={form.hargaJual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hargaJual: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Dijual
            </label>
            <input
              type="number"
              placeholder="1"
              value={form.jumlahDijual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jumlahDijual: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-300"
              min="1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              placeholder="Catatan atau alasan penjualan..."
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
            {loading ? "Menyimpan..." : "Tambah Data Penjualan"}
          </button>
        </div>
      </div>
    </>
  );
}
