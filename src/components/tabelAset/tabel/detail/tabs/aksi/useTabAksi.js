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
  updateAset,
} from "@/api/aset";
import {
  listMutasi as getMutasiByAsetId,
  createMutasi,
  deleteMutasi,
} from "@/api/mutasi";
import { getCurrentDate } from "@/utils/format";

export function useTabAksi(asetId, asset, onUpdated, onSwitchToRiwayat) {
  const [activeSubTab, setActiveSubTab] = useState("mutasi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Perbaikan state
  const [repairs, setRepairs] = useState([]);
  const [repairForm, setRepairForm] = useState({
    tanggal_perbaikan: getCurrentDate(),
    deskripsi: "",
    biaya: "",
    teknisi: "",
    PurchaseOrder: "",
  });

  // Rusak state
  const [damages, setDamages] = useState([]);
  const [damageForm, setDamageForm] = useState({
    TglRusak: getCurrentDate(),
    Kerusakan: "",
    catatan: "",
  });

  // Dipinjam state
  const [borrows, setBorrows] = useState([]);
  const [borrowForm, setBorrowForm] = useState({
    tanggal_pinjam: getCurrentDate(),
    tanggal_kembali: "",
    peminjam: "",
    catatan: "",
  });

  // Dijual state
  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({
    tanggal_jual: getCurrentDate(),
    pembeli: "",
    harga_jual: "",
    catatan: "",
  });

  // Mutasi state
  const [mutations, setMutations] = useState([]);
  const [mutationForm, setMutationForm] = useState({
    tanggal: getCurrentDate(),
    departemenAsalId: null,
    departemenTujuanId: null,
    ruanganAsal: "",
    ruanganTujuan: "",
    alasan: "",
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
      } else if (activeSubTab === "mutasi") {
        const list = await getMutasiByAsetId(asetId);
        setMutations(Array.isArray(list) ? list : list ? [list] : []);
      }
    } catch (err) {
      setError(`Gagal memuat data: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // Validation functions
  function validateRepairForm() {
    if (!repairForm.tanggal_perbaikan) return "Tanggal harus diisi";
    return null;
  }

  function validateDamageForm() {
    if (!damageForm.TglRusak) return "Tanggal harus diisi";
    return null;
  }

  function validateBorrowForm() {
    if (!borrowForm.tanggal_pinjam) return "Tanggal pinjam harus diisi";
    if (!borrowForm.peminjam?.trim()) return "Nama peminjam harus diisi";
    return null;
  }

  function validateSaleForm() {
    if (!saleForm.tanggal_jual) return "Tanggal jual harus diisi";
    if (!saleForm.harga_jual || parseFloat(saleForm.harga_jual) <= 0)
      return "Harga jual harus diisi";
    return null;
  }

  function validateMutationForm() {
    if (!mutationForm.tanggal) return "Tanggal mutasi harus diisi";
    const hasDepartemenChange =
      mutationForm.departemenAsalId || mutationForm.departemenTujuanId;
    const hasRuanganChange =
      mutationForm.ruanganAsal || mutationForm.ruanganTujuan;
    if (!hasDepartemenChange && !hasRuanganChange) {
      return "Minimal harus mengisi departemen asal/tujuan atau ruangan asal/tujuan";
    }
    if (!mutationForm.alasan?.trim()) return "Alasan mutasi harus diisi";
    return null;
  }

  // Create handlers
  function handleCreateRequest(type) {
    let validationError = null;
    if (type === "perbaikan") validationError = validateRepairForm();
    else if (type === "rusak") validationError = validateDamageForm();
    else if (type === "dipinjam") validationError = validateBorrowForm();
    else if (type === "dijual") validationError = validateSaleForm();
    else if (type === "mutasi") validationError = validateMutationForm();

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
          tanggal_perbaikan: repairForm.tanggal_perbaikan,
          deskripsi: repairForm.deskripsi,
          biaya: repairForm.biaya ? parseFloat(repairForm.biaya) : null,
          teknisi: repairForm.teknisi,
        });
        setRepairs((prev) => [...prev, created]);
        setRepairForm({
          tanggal_perbaikan: getCurrentDate(),
          deskripsi: "",
          biaya: "",
          teknisi: "",
        });
        newStatus = "diperbaiki";
        setSuccess("Perbaikan berhasil ditambahkan");
        // Switch to riwayat tab after 1 second
        setTimeout(() => {
          if (onSwitchToRiwayat) onSwitchToRiwayat();
        }, 1000);
      } else if (type === "rusak") {
        created = await createRusak(asetId, {
          TglRusak: damageForm.TglRusak,
          Kerusakan: damageForm.Kerusakan,
          catatan: damageForm.catatan || null,
        });
        setDamages((prev) => [...prev, created]);
        setDamageForm({
          TglRusak: getCurrentDate(),
          Kerusakan: "",
          catatan: "",
        });
        newStatus = "rusak";
        setSuccess("Data kerusakan berhasil ditambahkan");
        // Switch to riwayat tab after 1 second
        setTimeout(() => {
          if (onSwitchToRiwayat) onSwitchToRiwayat();
        }, 1000);
      } else if (type === "dipinjam") {
        created = await createDipinjam(asetId, {
          tanggal_pinjam: borrowForm.tanggal_pinjam,
          tanggal_kembali: borrowForm.tanggal_kembali || null,
          peminjam: borrowForm.peminjam,
          catatan: borrowForm.catatan || null,
        });
        setBorrows((prev) => [...prev, created]);
        setBorrowForm({
          tanggal_pinjam: getCurrentDate(),
          tanggal_kembali: "",
          peminjam: "",
          catatan: "",
        });
        newStatus = "dipinjam";
        setSuccess("Data peminjaman berhasil ditambahkan");
        // Switch to riwayat tab after 1 second
        setTimeout(() => {
          if (onSwitchToRiwayat) onSwitchToRiwayat();
        }, 1000);
      } else if (type === "dijual") {
        created = await createDijual(asetId, {
          tanggal_jual: saleForm.tanggal_jual,
          pembeli: saleForm.pembeli || null,
          harga_jual: saleForm.harga_jual
            ? parseFloat(saleForm.harga_jual)
            : null,
          catatan: saleForm.catatan || null,
        });
        setSales((prev) => [...prev, created]);
        setSaleForm({
          tanggal_jual: getCurrentDate(),
          pembeli: "",
          harga_jual: "",
          catatan: "",
        });
        newStatus = "dijual";
        setSuccess("Data penjualan berhasil ditambahkan");
        // Switch to riwayat tab after 1 second
        setTimeout(() => {
          if (onSwitchToRiwayat) onSwitchToRiwayat();
        }, 1000);
      } else if (type === "mutasi") {
        // Backend expects numeric asset.id, not string asetId
        const numericAssetId = asset?.id || asset?.ID;
        if (!numericAssetId) {
          throw new Error("Asset ID tidak ditemukan");
        }
        created = await createMutasi({
          aset_id: numericAssetId,
          TglMutasi: mutationForm.tanggal,
          departemen_asal_id: mutationForm.departemenAsalId || null,
          departemen_tujuan_id: mutationForm.departemenTujuanId || null,
          ruangan_asal: mutationForm.ruanganAsal?.trim() || null,
          ruangan_tujuan: mutationForm.ruanganTujuan?.trim() || null,
          alasan: mutationForm.alasan.trim(),
          catatan: mutationForm.catatan?.trim() || null,
        });
        setMutations((prev) => [...prev, created]);

        // Update aset data setelah mutasi
        const updatePayload = {};
        if (mutationForm.departemenTujuanId) {
          updatePayload.departemen_id = mutationForm.departemenTujuanId;
        }
        if (mutationForm.ruanganTujuan?.trim()) {
          updatePayload.lokasi = mutationForm.ruanganTujuan.trim();
        }

        // Update aset jika ada perubahan
        if (Object.keys(updatePayload).length > 0) {
          try {
            await updateAset(asetId, updatePayload);
            // Update asset object untuk UI
            const updatedAsset = {
              ...asset,
              ...updatePayload,
            };
            if (onUpdated) {
              onUpdated(updatedAsset);
            }
          } catch (updateErr) {
            console.error("Failed to update asset after mutasi:", updateErr);
            // Continue anyway, mutasi sudah berhasil disimpan
          }
        }

        setMutationForm({
          tanggal: getCurrentDate(),
          departemenAsalId: null,
          departemenTujuanId: null,
          ruanganAsal: "",
          ruanganTujuan: "",
          alasan: "",
          catatan: "",
        });
        setSuccess("Data mutasi berhasil ditambahkan dan aset telah diupdate");
        // Switch to riwayat tab after 1 second
        setTimeout(() => {
          if (onSwitchToRiwayat) onSwitchToRiwayat();
        }, 1000);
      }

      if (onUpdated && newStatus !== asset.statusAset) {
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
      } else if (type === "mutasi") {
        await deleteMutasi(id);
        setMutations((prev) => prev.filter((r) => String(r.id) !== String(id)));
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
    mutations,
    mutationForm,
    setMutationForm,
    confirmDelete,
    setConfirmDelete,
    confirmCreate,
    setConfirmCreate,
    handleCreateRequest,
    handleCreate,
    handleDelete,
  };
}
