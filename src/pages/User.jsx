import React, { useState, useEffect, useRef } from "react";
import Alert from "../components/Alert";
import Confirm from "../components/Confirm";
import CreateAsset from "../components/CreateAsset";
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [alert, setAlert] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const tableRef = useRef(null);
  const [filterBeban, setFilterBeban] = useState(sessionUser?.beban ?? "All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [search, setSearch] = useState("");

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
    <div className="min-h-screen bg-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User dashboard</h1>
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

      <main>
        <p>
          Welcome,
          <span className="font-semibold"> {user?.username}</span>
        </p>

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
                    Hide
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
              </div>
            </div>
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
                  showActions={false}
                  loading={loading}
                  title={`Daftar Aset (Beban: ${sessionUser?.beban ?? "All"})`}
                  ref={tableRef}
                  resetOnAssetsChange={false}
                />
              );
            })()}
          </div>
        </section>
      </main>
    </div>
  );
}
