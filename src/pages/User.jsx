import React, { useState, useEffect, useRef, useMemo } from "react";
import { generateAsetId } from "../utils/format";
import Alert from "../components/Alert";
import { FaPlus } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Confirm from "../components/Confirm";
import CreateAsset from "../components/CreateAsset";
import AssetDetail from "../components/AssetDetail";
import { createAset, listAset } from "../api/aset";
import SearchFilterBar from "../components/SearchFilterBar";
import AssetTable from "../components/AssetTable";

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

export default function User({ user, sessionUser, onLogout }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    asetId: "",
    accurateId: "",
    namaAset: "",
    spesifikasi: "",
    grup: GROUPS[0],
    beban: sessionUser?.beban ?? BEBANS[0],
    akunPerkiraan: AKUN[0],
    nilaiAset: "",
    tglPembelian: "",
    masaManfaat: "",
    statusAset: "aktif",
    keterangan: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [alert, setAlert] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const tableRef = useRef(null);
  const [detailAsset, setDetailAsset] = useState(null);
  // Scan control moved into SearchFilterBar
  const [filterBeban, setFilterBeban] = useState(sessionUser?.beban ?? "All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const suggestedAsetId = useMemo(
    () => generateAsetId(assets, form.beban, form.tglPembelian),
    [assets, form.beban, form.tglPembelian]
  );

  useEffect(() => {
    if (showCreate) {
      setForm((f) => ({ ...f, asetId: suggestedAsetId }));
    }
  }, [showCreate, suggestedAsetId]);

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
      const finalPayload = { ...form, asetId: form.asetId || suggestedAsetId };
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
        setAlert({ type: "success", message: "Aset berhasil ditambahkan." });
      } else {
        await loadAssets();
      }
      resetForm();
    } catch (err) {
      const message = err?.message || String(err);
      setError(
        err?.status === 401 || err?.status === 403
          ? `${message} (unauthorized)`
          : message
      );
      setAlert({ type: "error", message: message });
    } finally {
      setLoading(false);
    }
  };

  // load assets for the user dashboard
  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAset();
      const list = Array.isArray(data) ? data : data?.items ?? [];
      // if sessionUser exists and has a beban and not admin, filter by beban
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
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAssets();
    // ensure the user's beban is used in the form when sessionUser changes
    if (sessionUser?.beban) {
      setForm((prev) => ({ ...prev, beban: sessionUser.beban }));
      setFilterBeban(sessionUser.beban);
    }
  }, [sessionUser]);

  // ESC key to close panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowCreate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Navbar
        title="User dashboard"
        user={user}
        onLogout={() => setLogoutConfirm(true)}
      />
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

      <div className="min-h-screen bg-white p-6 pt-0">
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
                  <h3 className="text-base font-semibold">Create Asset</h3>
                  <div className="flex items-center gap-2">
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
                  onSubmit={handleCreate}
                  onCancel={() => resetForm()}
                  isEditing={false}
                  loading={loading}
                  error={error}
                  groups={GROUPS}
                  bebans={BEBANS}
                  akun={AKUN}
                  disabledBeban={true}
                  hideHeader={true}
                  autoAsetId={suggestedAsetId}
                  readOnlyAsetId={true}
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
                showBeban={false}
                filterStatus={filterStatus}
                onFilterStatusChange={(v) => setFilterStatus(v)}
                statuses={STATUSES}
                showStatus={true}
                onResetFilters={() => {
                  setFilterBeban(sessionUser?.beban ?? "All");
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
                    showActions={false}
                    loading={loading}
                    title={`Daftar Aset (Beban: ${
                      sessionUser?.beban ?? "All"
                    })`}
                    ref={tableRef}
                    resetOnAssetsChange={false}
                    leftControls={
                      <button
                        onClick={() => setShowCreate((s) => !s)}
                        className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm flex items-center gap-2 mr-2"
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    }
                    onView={(a) => setDetailAsset(a)}
                  />
                );
              })()}
              {detailAsset && (
                <AssetDetail
                  asset={detailAsset}
                  onClose={() => setDetailAsset(null)}
                  onEdit={(a) => {
                    setDetailAsset(null);
                    // For user role we do not have inline edit; if user has edit, call startEdit if available
                  }}
                  onDelete={(id) => {
                    setDetailAsset(null);
                    // no delete for user page; ignore
                  }}
                  onUpdated={(updated) => {
                    if (!updated) return;
                    setAssets((prev) =>
                      prev.map((p) =>
                        String(p.asetId ?? p.id) ===
                        String(updated.asetId ?? updated.id)
                          ? { ...p, ...(updated || {}) }
                          : p
                      )
                    );
                    setDetailAsset((prev) => ({
                      ...(prev || {}),
                      ...(updated || {}),
                    }));
                  }}
                />
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
