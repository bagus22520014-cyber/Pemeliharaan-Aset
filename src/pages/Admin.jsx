import { useEffect, useState, useRef, useMemo } from "react";
import CreateAsset from "../components/CreateAsset";
import SearchFilterBar from "../components/SearchFilterBar";
import AssetTable from "../components/AssetTable";
import Alert from "../components/Alert";
import Confirm from "../components/Confirm";
import AssetDetail from "../components/AssetDetail";
// formatRupiah used in `AssetTable` component; no longer needed here
import Forbidden from "../components/Forbidden";
import { listAset, createAset, updateAset, deleteAset } from "../api/aset";
import { FaPlus } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { generateAsetId } from "../utils/format";

const GROUPS = [
  "BANGUNAN",
  "DISTRIBUSI JARINGAN",
  "HEADEND",
  "KENDARAAN",
  "KOMPUTER",
  "PERALATAN & INVENTARIS KANTOR",
  "TANAH",
];
const BEBANS = [
  "HO",
  "BJR-NET",
  "BNT-NET",
  "BTM-NET",
  "GTO-NET",
  "KDR-NET",
  "LMP-NET",
  "MLG-NET",
  "PDG-NET",
  "PKB-NET",
  "PKP-NET",
  "PLB-NET",
  "SBY-NET",
  "SMD-NET",
  "SRG-NET",
  "MLMKOB",
  "MLMMET",
  "MLMSDKB",
  "MLMSL",
  "BJR-MEDIA",
  "BNT-MEDIA",
  "BTM-MEDIA",
  "GTO-MEDIA",
  "KDR-MEDIA",
  "LMP-MEDIA",
  "MLG-MEDIA",
  "PDG-MEDIA",
  "PKB-MEDIA",
  "PKP-MEDIA",
  "PLB-MEDIA",
  "SBY-MEDIA",
  "SMD-MEDIA",
  "SRG-MEDIA",
];
const AKUN = [
  "1701-01 (Tanah)",
  "1701-02 (Bangunan)",
  "1701-03 (Kendaraan)",
  "1701-04 (Distribusi Jaringan / Headend)",
  "1701-05 (Peralatan & Inventaris Kantor)",
  "1701-06 (Renovasi & Instalasi Listrik)",
  "1701-07 (Perlengkapan & Inventaris IT)",
];
const STATUSES = ["aktif", "rusak", "diperbaiki", "dipinjam", "dijual"];

export default function Admin({ user, onLogout, sessionUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filterBeban, setFilterBeban] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const tableRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailAsset, setDetailAsset] = useState(null);
  // Scan control is now handled by SearchFilterBar
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    ids: [],
    title: null,
    message: null,
    danger: false,
  });
  const [form, setForm] = useState({
    asetId: "",
    accurateId: "",
    namaAset: "",
    spesifikasi: "",
    grup: GROUPS[0],
    beban: BEBANS[0],
    akunPerkiraan: AKUN[0],
    nilaiAset: "",
    tglPembelian: "",
    masaManfaat: "",
    statusAset: "aktif",
    keterangan: "",
  });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const suggestedAsetId = useMemo(
    () => generateAsetId(assets, form.beban, form.tglPembelian),
    [assets, form.beban, form.tglPembelian]
  );

  useEffect(() => {
    if (showCreate && !editing) {
      setForm((f) => ({ ...f, asetId: suggestedAsetId }));
    }
  }, [showCreate, editing, suggestedAsetId]);

  // load assets & effect (must be declared before potential early returns so hooks are stable)
  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAset();
      const list = Array.isArray(data) ? data : data?.items ?? [];
      const hasRoleFilter = sessionUser?.role !== "admin" && sessionUser?.beban;
      const normalizedUserBeban = hasRoleFilter
        ? String(sessionUser.beban).trim().toLowerCase()
        : null;
      const filteredList = hasRoleFilter
        ? list.filter(
            (a) =>
              String(a?.beban ?? "")
                .trim()
                .toLowerCase() === normalizedUserBeban
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
  useEffect(() => {
    // Re-load assets when sessionUser changes (e.g., after login)
    loadAssets();
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
      grup: GROUPS[0],
      beban: BEBANS[0],
      akunPerkiraan: AKUN[0],
      nilaiAset: "",
      tglPembelian: "",
      masaManfaat: "",
      statusAset: "aktif",
      keterangan: "",
    });

  const handleCreate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Ensure AsetId is auto-generated if not provided
      const finalPayload = { ...form, asetId: form.asetId || suggestedAsetId };
      // also set the form state so the UI reflects it
      if (!form.asetId) setForm((f) => ({ ...f, asetId: suggestedAsetId }));
      const created = await createAset(finalPayload);
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

  const startEdit = (asset) => {
    // Use a shallow copy to avoid accidental mutations; pre-populate editing and form
    setEditing({ ...asset });
    setForm({
      asetId: asset.asetId ?? "",
      accurateId: asset.accurateId ?? "",
      namaAset: asset.namaAset ?? "",
      spesifikasi: asset.spesifikasi ?? "",
      grup: asset.grup ?? GROUPS[0],
      beban: asset.beban ?? BEBANS[0],
      akunPerkiraan: asset.akunPerkiraan ?? AKUN[0],
      nilaiAset: asset.nilaiAset ?? "",
      tglPembelian: asset.tglPembelian ?? "",
      masaManfaat: asset.masaManfaat ?? "",
      statusAset: asset.statusAset ?? "aktif",
      keterangan: asset.keterangan ?? "",
    });
    setShowCreate(true);
  };

  // Compare form with the current `editing` asset to detect whether a change occurred.
  const isFormChanged = (() => {
    if (!editing) return true; // not in edit mode => allow create
    const keys = [
      "asetId",
      "accurateId",
      "namaAset",
      "spesifikasi",
      "grup",
      "beban",
      "akunPerkiraan",
      "nilaiAset",
      "tglPembelian",
      "masaManfaat",
      "statusAset",
      "keterangan",
    ];
    for (const k of keys) {
      const a = form?.[k] ?? "";
      const b = editing?.[k] ?? "";
      if (String(a) !== String(b)) return true;
    }
    return false;
  })();

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      // Prefer using asetId (the human-friendly id which may contain slashes)
      // when available, otherwise fall back to numeric DB id.
      const idToSend = editing.asetId ?? editing.id;
      // merge existing asset with the form so we don't overwrite fields with empty strings
      const payloadToSend = { ...(editing || {}), ...(form || {}) };
      try {
        // eslint-disable-next-line no-console
        console.debug(
          "handleUpdate -> idToSend:",
          idToSend,
          "editing.statusAset:",
          editing?.statusAset,
          "payload.statusAset:",
          payloadToSend?.statusAset,
          "payload (raw):",
          payloadToSend
        );
      } catch {}
      const updated = await updateAset(idToSend, payloadToSend);
      if (!updated) {
        // Server returned no content — we still need to reload assets, but warn the user
        setError(
          "Update succeeded but server returned no updated data (204). Refreshing list."
        );
      }
      try {
        // after update, fetch current version from server and log
        const refreshed = await listAset();
        // find asset by asetId or id
        const found = Array.isArray(refreshed)
          ? refreshed.find((a) => String(a.asetId ?? a.id) === String(idToSend))
          : null;
        // eslint-disable-next-line no-console
        console.debug("handleUpdate -> after server refresh found:", found);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug("handleUpdate -> after refresh error:", String(err));
      }
      // Keep the create/edit form populated after update: keep `editing` set to the
      // updated record and set the form fields to server's returned asset (if any).
      // This prevents the UI from clearing the form and allows the user to continue
      // editing further if needed.
      if (updated && (updated.id || updated.asetId)) {
        setEditing(typeof updated === "object" ? { ...updated } : editing);
        setForm((f) => ({ ...f, ...(updated || {}) }));
      }
      if (updated && (updated.id || updated.asetId)) {
        setAlert({ type: "success", message: "Aset berhasil diperbarui." });
        setAssets((prev) =>
          prev.map((p) =>
            String(p.asetId ?? p.id) === String(updated.asetId ?? updated.id)
              ? updated
              : p
          )
        );
        tableRef.current?.goToAsset?.(updated.asetId ?? updated.id, {
          highlight: "text",
        });
      } else {
        await loadAssets();
      }
    } catch (err) {
      const message = err?.message || String(err);
      setError(
        err?.status === 401 || err?.status === 403
          ? `${message} (unauthorized — please login or ensure backend is running)`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Show confirm modal for deleting a single asset
    setConfirmModal({
      open: true,
      ids: [id],
      title: "Hapus Aset",
      message: "Yakin ingin menghapus aset ini?",
      danger: true,
    });
    setLoading(true);
    setError(null);
    try {
      // Note: delete execution will be performed when user confirms in the Confirm modal
      // Keep the call quick; actual network call handled in performConfirmedDelete
      // No-op here
      // If this id was selected, remove it from selection
      setSelectedIds((prev) =>
        Array.isArray(prev) ? prev.filter((s) => String(s) !== String(id)) : []
      );
    } catch (err) {
      const message = err?.message || String(err);
      setError(
        err?.status === 401 || err?.status === 403
          ? `${message} (unauthorized — please login or ensure backend is running)`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const performConfirmedDelete = async (ids = []) => {
    if (!ids || ids.length === 0)
      return setConfirmModal({
        open: false,
        ids: [],
        title: null,
        message: null,
        danger: false,
      });
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(ids.map((id) => deleteAset(id)));
      const failed = results.filter((r) => r.status === "rejected");
      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      if (failed.length) {
        const msgs = failed
          .map((f) => f.reason?.message || String(f.reason))
          .join("; ");
        setError(`Some deletes failed: ${msgs}`);
        setAlert({
          type: "error",
          message: `Beberapa penghapusan gagal: ${failed.length}`,
        });
      }
      if (successCount > 0) {
        // Remove deleted ids from local assets state
        const deletedIds = ids.map((i) => String(i));
        setAssets((prev) =>
          prev.filter((p) => !deletedIds.includes(String(p.asetId ?? p.id)))
        );
        setAlert({
          type: "success",
          message: `${successCount} aset berhasil dihapus.`,
        });
        // Clear from selectedIds in parent state and the table's internal state
        setSelectedIds((prev) =>
          Array.isArray(prev)
            ? prev.filter((s) => !deletedIds.includes(String(s)))
            : []
        );
        try {
          tableRef.current?.clearSelection?.();
        } catch {}
      }
    } catch (err) {
      setError(String(err));
      setAlert({ type: "error", message: String(err) });
    } finally {
      setLoading(false);
      setConfirmModal({
        open: false,
        ids: [],
        title: null,
        message: null,
        danger: false,
      });
    }
  };

  return (
    <>
      <Navbar
        title="Admin dashboard"
        user={user}
        onLogout={() => setLogoutConfirm(true)}
        leftControls={<div></div>}
      />
      <div className="min-h-screen bg-white p-6 pt-0">
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
        {confirmModal.open && (
          <Confirm
            open={confirmModal.open}
            title={confirmModal.title}
            message={confirmModal.message}
            danger={confirmModal.danger}
            onClose={() =>
              setConfirmModal({
                open: false,
                ids: [],
                title: null,
                message: null,
                danger: false,
              })
            }
            onConfirm={() => performConfirmedDelete(confirmModal.ids)}
            confirmLabel={
              confirmModal.ids && confirmModal.ids.length > 1
                ? "Hapus"
                : "Hapus"
            }
          />
        )}

        <main>
          {/* Welcome message removed — header / navbar now displays username */}

          <section
            className={`mt-6 grid grid-cols-1 ${
              showCreate ? "md:grid-cols-4" : "md:grid-cols-1"
            } gap-6`}
          >
            {showCreate && (
              <div className="md:col-span-1 bg-gray-50 p-2 rounded shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">
                    {editing ? "Edit Asset" : "Create Asset"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {editing && (
                      <button
                        onClick={() => {
                          setEditing(null);
                          resetForm();
                        }}
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
                      >
                        New
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreate(false)}
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <CreateAsset
                  form={form}
                  setForm={setForm}
                  onSubmit={editing ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setEditing(null);
                    resetForm();
                  }}
                  isEditing={!!editing}
                  loading={loading}
                  error={error}
                  groups={GROUPS}
                  bebans={BEBANS}
                  akun={AKUN}
                  disabledBeban={false}
                  hideHeader={true}
                  autoAsetId={suggestedAsetId}
                  readOnlyAsetId={false}
                  submitDisabled={editing ? !isFormChanged : false}
                />
              </div>
            )}

            <div
              className={`transition-all ${
                showCreate ? "md:col-span-3" : "md:col-span-1 md:w-full"
              }`}
            >
              <SearchFilterBar
                filterBeban={filterBeban}
                onFilterChange={(v) => setFilterBeban(v)}
                bebans={BEBANS}
                filterGroup={filterGroup}
                onFilterGroupChange={(v) => setFilterGroup(v)}
                groups={GROUPS}
                filterYear={filterTahun}
                onFilterYearChange={(v) => setFilterTahun(v)}
                filterStatus={filterStatus}
                onFilterStatusChange={(v) => setFilterStatus(v)}
                statuses={STATUSES}
                showStatus={true}
                search={search}
                onSearchChange={(v) => setSearch(v)}
                onResetFilters={() => {
                  setFilterBeban("All");
                  setFilterGroup("All");
                  setFilterTahun("All");
                  setFilterStatus("All");
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
              />
              {/* Group and search filter */}
              {(() => {
                const q = search.trim().toLowerCase();
                const filtered = assets.filter((a) => {
                  const matchBeban =
                    filterBeban === "All" || a.beban === filterBeban;
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
                  if (!matchBeban) return false;
                  if (!matchGroup) return false;
                  if (!matchTahun) return false;
                  if (!matchStatus) return false;
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
                    onEdit={startEdit}
                    onView={(a) => setDetailAsset(a)}
                    onDelete={handleDelete}
                    onDeleteSelected={(ids) =>
                      setConfirmModal({
                        open: true,
                        ids,
                        title: "Hapus Aset Terpilih",
                        message: `Yakin ingin menghapus ${ids.length} aset terpilih?`,
                        danger: true,
                      })
                    }
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
                    selectable={true}
                    onSelectionChange={(ids) => setSelectedIds(ids)}
                  />
                );
              })()}
            </div>
            {detailAsset && (
              <AssetDetail
                asset={detailAsset}
                onClose={() => setDetailAsset(null)}
                onEdit={(a) => {
                  setDetailAsset(null);
                  startEdit(a);
                }}
                onDelete={(id) => {
                  setDetailAsset(null);
                  handleDelete(id);
                }}
                onUpdated={(updated) => {
                  // update local ed table with new asset returned after image upload
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
                    message: "Gambar berhasil diperbarui.",
                  });
                }}
              />
            )}
          </section>
        </main>
      </div>
    </>
  );
}
