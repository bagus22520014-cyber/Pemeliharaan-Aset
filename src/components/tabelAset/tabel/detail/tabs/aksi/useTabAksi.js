import { useState, useEffect } from "react";
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
} from "@/api/aset";
import { getCurrentDate } from "@/utils/format";

export function useTabAksi(asetId, asset, onUpdated) {
  const [activeSubTab, setActiveSubTab] = useState("perbaikan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Perbaikan state
  const [repairs, setRepairs] = useState([]);
  const [repairForm, setRepairForm] = useState({
    tanggal: getCurrentDate(),
    lokasi_id: null,
    deskripsi: "",
    biaya: "",
    teknisi: "",
    status: "pending",
  });

  // Rusak state
  const [damages, setDamages] = useState([]);
  const [damageForm, setDamageForm] = useState({
    tanggal: getCurrentDate(),
    lokasi_id: null,
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
    lokasi_id: null,
    peminjam: "",
    keperluan: "",
    jumlahDipinjam: 1,
    status: "dipinjam",
  });

  // Dijual state
  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({
    tanggalJual: getCurrentDate(),
    lokasi_id: null,
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
    if (!repairForm.lokasi_id) return "Lokasi harus dipilih";
    return null;
  }

  function validateDamageForm() {
    if (!damageForm.tanggal) return "Tanggal harus diisi";
    if (!damageForm.lokasi_id) return "Lokasi harus dipilih";
    return null;
  }

  function validateBorrowForm() {
    if (!borrowForm.tanggalPinjam) return "Tanggal pinjam harus diisi";
    if (!borrowForm.peminjam?.trim()) return "Nama peminjam harus diisi";
    if (!borrowForm.lokasi_id) return "Lokasi harus dipilih";
    return null;
  }

  function validateSaleForm() {
    if (!saleForm.tanggalJual) return "Tanggal jual harus diisi";
    if (!saleForm.lokasi_id) return "Lokasi harus dipilih";
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
          lokasi_id: repairForm.lokasi_id,
          deskripsi: repairForm.deskripsi,
          biaya: repairForm.biaya ? parseFloat(repairForm.biaya) : null,
          teknisi: repairForm.teknisi,
          status: repairForm.status,
        });
        setRepairs((prev) => [...prev, created]);
        setRepairForm({
          tanggal: getCurrentDate(),
          lokasi_id: null,
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
          lokasi_id: damageForm.lokasi_id,
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
          lokasi_id: null,
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
          lokasi_id: borrowForm.lokasi_id,
          peminjam: borrowForm.peminjam,
          keperluan: borrowForm.keperluan,
          jumlahDipinjam: parseInt(borrowForm.jumlahDipinjam) || 1,
          status: borrowForm.status,
        });
        setBorrows((prev) => [...prev, created]);
        setBorrowForm({
          tanggalPinjam: getCurrentDate(),
          tanggalKembali: "",
          lokasi_id: null,
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
          lokasi_id: saleForm.lokasi_id,
          pembeli: saleForm.pembeli,
          hargaJual: saleForm.hargaJual ? parseFloat(saleForm.hargaJual) : null,
          jumlahDijual: parseInt(saleForm.jumlahDijual) || 1,
          catatan: saleForm.catatan,
        });
        setSales((prev) => [...prev, created]);
        setSaleForm({
          tanggalJual: getCurrentDate(),
          lokasi_id: null,
          pembeli: "",
          hargaJual: "",
          jumlahDijual: 1,
          catatan: "",
        });
        newStatus = "dijual";
        setSuccess("Data penjualan berhasil ditambahkan");
      }

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

  return {
    activeSubTab,
    setActiveSubTab,
    loading,
    error,
    success,
    repairs,
    repairForm,
    setRepairForm,
    damages,
    damageForm,
    setDamageForm,
    borrows,
    borrowForm,
    setBorrowForm,
    sales,
    saleForm,
    setSaleForm,
    confirmDelete,
    setConfirmDelete,
    confirmCreate,
    setConfirmCreate,
    handleCreateRequest,
    handleCreate,
    handleDelete,
  };
}
