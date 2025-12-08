import { useEffect, useState, useRef, useMemo } from "react";
import CreateAsset from "@/components/tabelAset/addAset/CreateAsset";
import SearchFilterBar from "@/components/tabelAset/filter/SearchFilterBar";
import AssetTable from "@/components/tabelAset/tabel/AssetTable";
import Alert from "@/components/Alert";
import Confirm from "@/components/Confirm";
import AssetDetail from "@/components/tabelAset/tabel/detail/AssetDetail";
// formatRupiah used in `AssetTable` component; no longer needed here
import Forbidden from "@/components/Forbidden";
import { createAset, listAset } from "@/api/aset";
import { listBeban } from "@/api/beban";
import { listDepartemen } from "@/api/departemen";
import { FaPlus } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import UserListModal from "@/components/UserListModal";
import {
  generateAsetId,
  getCurrentDate,
  prepareAssetPayload,
  GROUPS,
  AKUN,
  STATUSES,
} from "@/utils/format";

export default function Admin({ user, onLogout, sessionUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [assets, setAssets] = useState([]);
  const [bebanList, setBebanList] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filterBeban, setFilterBeban] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDepartemen, setFilterDepartemen] = useState("All");

  const [search, setSearch] = useState("");
  // Inline editing removed — only create is supported
  const tableRef = useRef(null);
  // selection for delete removed: no batch delete
  const [detailAsset, setDetailAsset] = useState(null);
  // Scan control is now handled by SearchFilterBar
  // Confirm modal for delete removed
  const [form, setForm] = useState({
    asetId: "",
    accurateId: "",
    namaAset: "",
    spesifikasi: "",
    grup: "",
    beban: "",
    departemen_id: "",
    akunPerkiraan: "",
    nilaiAset: "",
    tglPembelian: getCurrentDate(),
    masaManfaat: "",
    statusAset: "aktif",
    keterangan: "",
    pengguna: "",
    lokasi: "",
  });
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const suggestedAsetId = useMemo(
    () => generateAsetId(assets, form.beban, form.tglPembelian),
    [assets, form.beban, form.tglPembelian]
  );

  useEffect(() => {
    if (showCreate) {
      (async () => {
        try {
          const data = await listAset({ includeBebanHeader: false });
          const masterList = Array.isArray(data) ? data : data?.items ?? [];
          const suggested = generateAsetId(
            masterList,
            form.beban,
            form.tglPembelian
          );
          setForm((f) => ({ ...f, asetId: suggested }));
        } catch (err) {
          setForm((f) => ({ ...f, asetId: suggestedAsetId }));
        }
      })();
    }
  }, [showCreate, suggestedAsetId]);

  // load assets & beban list
  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAset({ includeBebanHeader: false });
      const list = Array.isArray(data) ? data : data?.items ?? [];
      const hasRoleFilter = sessionUser?.role !== "admin" && sessionUser?.beban;
      const parseBebans = (userBeban) => {
        if (!userBeban) return [];
        if (Array.isArray(userBeban))
          return Array.from(
            new Set(userBeban.map((b) => String(b).trim()).filter(Boolean))
          );
        let raw = String(userBeban || "").trim();
        try {
          const d = decodeURIComponent(raw);
          if (d && typeof d === "string") raw = d;
        } catch (err) {}
        return Array.from(
          new Set(
            raw
              .split(/[;,|]/)
              .map((b) => String(b || "").trim())
              .filter(Boolean)
          )
        );
      };
      const sessionUserBebansSet = new Set(
        parseBebans(sessionUser?.beban).map((b) =>
          String(b).trim().toLowerCase()
        )
      );
      const filteredList = hasRoleFilter
        ? list.filter((a) =>
            sessionUserBebansSet.size > 0
              ? sessionUserBebansSet.has(
                  String(a?.bebanKode || a?.beban || "")
                    .trim()
                    .toLowerCase()
                )
              : false
          )
        : list;
      setAssets(filteredList);
      // debug logs removed for production
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadBebanList = async () => {
    try {
      const data = await listBeban();
      setBebanList(data || []);
    } catch (err) {
      console.error("Failed to load beban list:", err);
      setBebanList([]);
    }
  };

  const loadDepartemenList = async () => {
    try {
      const data = await listDepartemen();
      setDepartemenList(data || []);
    } catch (err) {
      console.error("Failed to load departemen list:", err);
      setDepartemenList([]);
    }
  };

  // Compute beban options from loaded beban list
  const bebanOptions = useMemo(() => {
    return bebanList
      .filter((b) => b.aktif !== false) // Only active beban
      .map((b) => b.kode)
      .sort();
  }, [bebanList]);

  useEffect(() => {
    // Re-load assets and beban when sessionUser changes
    loadAssets();
    loadBebanList();
    loadDepartemenList();
  }, [sessionUser]);

  // ESC key to close panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowCreate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // after hooks: guard checks
  if (!sessionUser || sessionUser.role !== "admin") {
    return (
      <Forbidden
        message="Access restricted to administrators only."
        onLogout={onLogout}
      />
    );
  }
  if (!user || user.id !== sessionUser.id) {
    return (
      <Forbidden
        message="You cannot view another user's admin data."
        onLogout={onLogout}
      />
    );
  }

  const resetForm = () =>
    setForm({
      asetId: "",
      accurateId: "",
      namaAset: "",
      spesifikasi: "",
      grup: "",
      beban: "",
      departemen_id: "",
      akunPerkiraan: "",
      nilaiAset: "",
      tglPembelian: getCurrentDate(),
      masaManfaat: "",
      statusAset: "aktif",
      keterangan: "",
      pengguna: "",
      lokasi: "",
    });

  const handleCreateRequest = (e, file) => {
    e?.preventDefault();
    setError(null);

    // Validasi field wajib
    const requiredFields = [
      { field: "asetId", label: "Aset ID" },
      { field: "namaAset", label: "Nama Aset" },
      { field: "grup", label: "Kategori" },
      { field: "akunPerkiraan", label: "Akun Perkiraan" },
      { field: "beban", label: "Beban" },
      { field: "tglPembelian", label: "Tanggal Perolehan" },
      { field: "nilaiAset", label: "Harga Perolehan" },
    ];

    const emptyFields = requiredFields.filter(
      (rf) => !form[rf.field] || String(form[rf.field]).trim() === ""
    );

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map((f) => f.label).join(", ");
      setError(`Field wajib diisi: ${fieldNames}`);
      setAlert({ type: "error", message: `Field wajib diisi: ${fieldNames}` });
      return;
    }

    // Show confirmation
    setPendingFile(file);
    setConfirmCreate(true);
  };

  const handleCreate = async () => {
    setConfirmCreate(false);
    setLoading(true);
    setError(null);

    try {
      // Ensure AsetId is auto-generated if not provided
      const finalPayload = {
        ...form,
        asetId: form.asetId || suggestedAsetId,
        statusAset: "aktif",
      };
      // also set the form state so the UI reflects it
      if (!form.asetId) setForm((f) => ({ ...f, asetId: suggestedAsetId }));

      // Convert beban kode to beban_id
      const apiPayload = await prepareAssetPayload(finalPayload, bebanList);

      const created = await createAset(apiPayload);

      // Upload image if file is provided
      if (pendingFile) {
        const assetId = created?.asetId || created?.id || finalPayload.asetId;

        if (!assetId) {
          console.error("No asset ID found for image upload");
          setAlert({
            type: "warning",
            message:
              "Aset berhasil ditambahkan tetapi tidak dapat upload gambar (ID tidak ditemukan)",
          });
        } else {
          const { uploadAsetImage } = await import("../api/aset");
          try {
            const uploadResult = await uploadAsetImage(assetId, pendingFile);
            // Update the created asset with the image info if returned
            if (uploadResult?.gambar) {
              created.gambar = uploadResult.gambar;
            }
          } catch (uploadErr) {
            console.error("Image upload failed:", uploadErr);
            setAlert({
              type: "warning",
              message: `Aset berhasil ditambahkan tetapi upload gambar gagal: ${
                uploadErr.message || uploadErr
              }`,
            });
          }
        }
      }

      if (created && (created.id || created.asetId)) {
        setAssets((prev) => {
          const id = String(created.asetId ?? created.id);
          const found = prev.some((p) => String(p.asetId ?? p.id) === id);
          if (found)
            return prev.map((p) =>
              String(p.asetId ?? p.id) === id ? created : p
            );
          return [created, ...prev];
        });
        tableRef.current?.goToAsset?.(created.asetId ?? created.id, {
          highlight: "bg",
        });
      } else {
        await loadAssets();
      }
      resetForm();
      setShowCreate(false);
      setPendingFile(null);
      setAlert({ type: "success", message: "Aset berhasil ditambahkan." });
    } catch (err) {
      const message = err?.message || String(err);
      setError(
        err?.status === 401 || err?.status === 403
          ? `${message} (unauthorized — please login or ensure backend is running)`
          : message
      );
      setAlert({
        type: "error",
        message:
          err?.status === 401 || err?.status === 403
            ? `${message} (unauthorized)`
            : message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Editing removed; admin can only create assets now

  // Compare form with the current `editing` asset to detect whether a change occurred.
  // no edit comparisons required for create-only flow

  // Update handler removed; editing is disabled

  // Delete action removed from UI

  // Batch delete removed

  return (
    <>
      <Navbar
        title="Admin dashboard"
        user={user}
        onLogout={() => setLogoutConfirm(true)}
        leftControls={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3 py-1 rounded-md border bg-white text-sm hover:bg-gray-50"
            >
              Daftar User
            </button>
          </div>
        }
      />
      <div className="bg-white p-6 pt-0">
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}
        {logoutConfirm && (
          <Confirm
            open={logoutConfirm}
            title="Logout"
            message="Yakin ingin keluar?"
            confirmLabel="Logout"
            onClose={() => setLogoutConfirm(false)}
            onConfirm={() => {
              setLogoutConfirm(false);
              onLogout?.();
            }}
          />
        )}
        {/* Delete confirm modal removed (edit/delete disabled) */}

        <main>
          {/* Welcome message removed — header / navbar now displays username */}

          <section className="mt-6 relative">
            {showCreate && (
              <div className="mb-6">
                <CreateAsset
                  form={form}
                  setForm={setForm}
                  onSubmit={handleCreateRequest}
                  onCancel={() => {
                    resetForm();
                    setShowCreate(false);
                  }}
                  isEditing={false}
                  loading={loading}
                  error={error}
                  groups={GROUPS}
                  bebans={bebanOptions}
                  departemen={departemenList}
                  akun={AKUN}
                  disabledBeban={false}
                  hideHeader={true}
                  readOnlyAsetId={false}
                  submitDisabled={false}
                  useMaster={true}
                />
              </div>
            )}

            <div>
              <SearchFilterBar
                filterBeban={filterBeban}
                onFilterChange={(v) => setFilterBeban(v)}
                bebans={bebanOptions}
                filterGroup={filterGroup}
                onFilterGroupChange={(v) => setFilterGroup(v)}
                groups={GROUPS}
                filterYear={filterTahun}
                onFilterYearChange={(v) => setFilterTahun(v)}
                filterStatus={filterStatus}
                onFilterStatusChange={(v) => setFilterStatus(v)}
                statuses={STATUSES}
                showStatus={true}
                showDepartemen={true}
                departemen={departemenList}
                filterDepartemen={filterDepartemen}
                onFilterDepartemenChange={(v) => setFilterDepartemen(v)}
                search={search}
                onSearchChange={(v) => setSearch(v)}
                onResetFilters={() => {
                  setFilterBeban("All");
                  setFilterGroup("All");
                  setFilterTahun("All");
                  setFilterStatus("All");
                  setFilterDepartemen("All");
                  setSearch("");
                }}
                showScan={true}
                assets={assets}
                onScanFound={(found) => {
                  tableRef.current?.goToAsset?.(found.asetId ?? found.id, {
                    highlight: "bg",
                  });
                  setDetailAsset(found);
                }}
                useMaster={true}
              />
              {/* Group and search filter */}
              {(() => {
                const q = search.trim().toLowerCase();
                const filtered = assets.filter((a) => {
                  const bebanValue =
                    a.bebanKode || a.beban || a.beban?.kode || "";
                  const matchBeban =
                    filterBeban === "All" || bebanValue === filterBeban;
                  const matchGroup =
                    filterGroup === "All" || a.grup === filterGroup;
                  const tgl = a.tglPembelian
                    ? String(a.tglPembelian).substring(0, 4)
                    : null;
                  const matchTahun =
                    filterTahun === "All" ||
                    (tgl && tgl === String(filterTahun));
                  const matchStatus =
                    filterStatus === "All" ||
                    (a.statusAset && a.statusAset === filterStatus);
                  const matchDepartemen =
                    filterDepartemen === "All" ||
                    (a.departemen_id &&
                      String(a.departemen_id) === String(filterDepartemen));
                  if (!matchBeban) return false;
                  if (!matchGroup) return false;
                  if (!matchTahun) return false;
                  if (!matchStatus) return false;
                  if (!matchDepartemen) return false;
                  if (!q) return true;
                  const fields = [
                    a.namaAset,
                    a.asetId,
                    a.accurateId,
                    a.spesifikasi,
                  ]
                    .filter(Boolean)
                    .map((s) => String(s).toLowerCase());
                  return fields.some((f) => f.includes(q));
                });
                return (
                  <AssetTable
                    assets={filtered}
                    onView={(a) => setDetailAsset(a)}
                    loading={loading}
                    title={`Daftar Aset (Admin)`}
                    leftControls={
                      <button
                        onClick={() => setShowCreate((s) => !s)}
                        className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm flex items-center gap-2 mr-2"
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    }
                    ref={tableRef}
                    resetOnAssetsChange={false}
                    useMaster={false}
                  />
                );
              })()}
              <UserListModal
                open={showUserModal}
                onClose={() => setShowUserModal(false)}
                bebans={bebanOptions}
              />
            </div>
            {detailAsset && (
              <AssetDetail
                asset={detailAsset}
                onClose={() => setDetailAsset(null)}
                userRole="admin"
                groups={GROUPS}
                bebans={bebanOptions}
                departemen={departemenList}
                akun={AKUN}
                onUpdated={(updated, type) => {
                  // update local ed table with new asset returned after image upload or data update
                  if (!updated) return;
                  setAssets((prev) =>
                    prev.map((p) =>
                      String(p.asetId ?? p.id) ===
                      String(updated.asetId ?? updated.id)
                        ? { ...p, ...(updated || {}) }
                        : p
                    )
                  );
                  // merge into the detailAsset preserved properties
                  setDetailAsset((prev) => ({
                    ...(prev || {}),
                    ...(updated || {}),
                  }));
                  setAlert({
                    type: "success",
                    message:
                      type === "image"
                        ? "Gambar berhasil diperbarui."
                        : "Data aset berhasil diperbarui.",
                  });
                }}
              />
            )}
          </section>
        </main>

        <Confirm
          open={confirmCreate}
          title="Konfirmasi Buat Aset"
          message={`Apakah Anda yakin ingin membuat aset baru dengan ID "${
            form.asetId || suggestedAsetId
          }"?`}
          confirmLabel="Ya, Buat"
          cancelLabel="Batal"
          onConfirm={handleCreate}
          onClose={() => setConfirmCreate(false)}
        />
      </div>
    </>
  );
}
