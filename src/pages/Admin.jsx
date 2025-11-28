import { useEffect, useState, useRef } from "react";
import CreateAsset from "../components/CreateAsset";
import SearchFilterBar from "../components/SearchFilterBar";
import AssetTable from "../components/AssetTable";
import Alert from "../components/Alert";
import Confirm from "../components/Confirm";
// formatRupiah used in `AssetTable` component; no longer needed here
import Forbidden from "../components/Forbidden";
import { listAset, createAset, updateAset, deleteAset } from "../api/aset";

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

export default function Admin({ user, onLogout, sessionUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filterBeban, setFilterBeban] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const tableRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
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
  });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

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
    });

  const handleCreate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await createAset(form);
      if (created && (created.id || created.asetId)) {
        setAssets((prev) => {
          const id = String(created.id ?? created.asetId);
          const found = prev.some((p) => String(p.id ?? p.asetId) === id);
          if (found)
            return prev.map((p) =>
              String(p.id ?? p.asetId) === id ? created : p
            );
          return [created, ...prev];
        });
        tableRef.current?.goToAsset?.(created.id ?? created.asetId, {
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
    });
    setShowCreate(true);
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      const idToSend = editing.id ?? editing.asetId;
      // merge existing asset with the form so we don't overwrite fields with empty strings
      const payloadToSend = { ...(editing || {}), ...(form || {}) };
      // debug logging removed for production
      const updated = await updateAset(idToSend, payloadToSend);
      if (!updated) {
        // Server returned no content — we still need to reload assets, but warn the user
        setError(
          "Update succeeded but server returned no updated data (204). Refreshing list."
        );
      }
      setEditing(null);
      resetForm();
      if (updated && (updated.id || updated.asetId)) {
        setAlert({ type: "success", message: "Aset berhasil diperbarui." });
        setAssets((prev) =>
          prev.map((p) =>
            String(p.id ?? p.asetId) === String(updated.id ?? updated.asetId)
              ? updated
              : p
          )
        );
        tableRef.current?.goToAsset?.(updated.id ?? updated.asetId, {
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
          prev.filter((p) => !deletedIds.includes(String(p.id ?? p.asetId)))
        );
        setAlert({
          type: "success",
          message: `${successCount} aset berhasil dihapus.`,
        });
        // Clear from selectedIds
        setSelectedIds((prev) =>
          Array.isArray(prev)
            ? prev.filter((s) => !deletedIds.includes(String(s)))
            : []
        );
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
    <div className="min-h-screen bg-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user?.username ?? "Unknown"}
          </div>
          <button
            onClick={() => setLogoutConfirm(true)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </header>
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
            confirmModal.ids && confirmModal.ids.length > 1 ? "Hapus" : "Hapus"
          }
        />
      )}

      <main>
        <p>
          Welcome,
          <span className="font-semibold"> {user?.username}</span>
          {sessionUser?.beban && (
            <span className="ml-2 text-sm text-gray-500"></span>
          )}
        </p>

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
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
                  >
                    Hide
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
              search={search}
              onSearchChange={(v) => setSearch(v)}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreate((s) => !s)}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <h2 className="font-semibold">Daftar Aset</h2>
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => {
                      setConfirmModal({
                        open: true,
                        ids: selectedIds,
                        title: "Hapus Aset Terpilih",
                        message: `Yakin ingin menghapus ${selectedIds.length} aset terpilih?`,
                        danger: true,
                      });
                    }}
                    className="px-3 py-1 rounded-md bg-red-500 text-white text-sm font-semibold ml-2 hover:bg-red-600"
                  >
                    Delete ({selectedIds.length})
                  </button>
                )}
              </div>
            </div>
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
                  filterTahun === "All" || (tgl && tgl === String(filterTahun));
                if (!matchBeban) return false;
                if (!matchGroup) return false;
                if (!matchTahun) return false;
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
                  onDelete={handleDelete}
                  loading={loading}
                  title={`Daftar Aset (Admin)`}
                  ref={tableRef}
                  resetOnAssetsChange={false}
                  selectable={true}
                  onSelectionChange={(ids) => setSelectedIds(ids)}
                />
              );
            })()}
          </div>
        </section>
      </main>
    </div>
  );
}
