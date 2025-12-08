import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  generateAsetId,
  getCurrentDate,
  prepareAssetPayload,
  GROUPS,
  AKUN,
  STATUSES,
} from "@/utils/format";
import Alert from "@/components/Alert";
import { FaPlus } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Confirm from "@/components/Confirm";
import CreateAsset from "@/components/tabelAset/addAset/CreateAsset";
import AssetDetail from "@/components/tabelAset/tabel/detail/AssetDetail";
import { createAset, listAset } from "@/api/aset";
import { listBeban } from "@/api/beban";
import { listDepartemen } from "@/api/departemen";
import SearchFilterBar from "@/components/tabelAset/filter/SearchFilterBar";
import AssetTable from "@/components/tabelAset/tabel/AssetTable";

export default function User({ user, sessionUser, onLogout }) {
  const [showCreate, setShowCreate] = useState(false);
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [bebanList, setBebanList] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);
  const [alert, setAlert] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const tableRef = useRef(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  // Scan control moved into SearchFilterBar
  const [filterBeban, setFilterBeban] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTahun, setFilterTahun] = useState("All");
  const [filterDepartemen, setFilterDepartemen] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const suggestedAsetId = useMemo(
    () => generateAsetId(assets, form.beban, form.tglPembelian),
    [assets, form.beban, form.tglPembelian]
  );

  useEffect(() => {
    if (showCreate) {
      // If useMaster behavior is desired, try to compute suggestedAsetId using asset data
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

  const resetForm = () =>
    setForm((prev) => ({
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
    }));

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
      const finalPayload = {
        ...form,
        asetId: form.asetId || suggestedAsetId,
        statusAset: "aktif",
      };
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
        setAlert({ type: "success", message: "Aset berhasil ditambahkan." });
      } else {
        await loadAssets();
      }
      resetForm();
      setShowCreate(false);
      setPendingFile(null);
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

  // parse user beban string (CSV) or array into normalized array
  const parseBebans = (userBeban) => {
    if (!userBeban) return [];
    // If already array, normalize and return
    if (Array.isArray(userBeban))
      return Array.from(
        new Set(userBeban.map((b) => String(b).trim()).filter(Boolean))
      );
    // Try decodeURIComponent in case backend returned encoded commas (e.g., %2C)
    let raw = String(userBeban || "").trim();
    try {
      const d = decodeURIComponent(raw);
      if (d && typeof d === "string") raw = d;
    } catch (err) {
      // ignore decode error
    }
    // Split on common separators (comma, semicolon, pipe)
    return Array.from(
      new Set(
        raw
          .split(/[;,|]/)
          .map((b) => String(b || "").trim())
          .filter(Boolean)
      )
    );
  };

  // Compute beban options from loaded beban list
  const bebanOptions = useMemo(() => {
    return bebanList
      .filter((b) => b.aktif !== false) // Only active beban
      .map((b) => b.kode)
      .sort();
  }, [bebanList]);

  // helper - return allowed bebans for a user's beban based on location prefix
  const getAllowedBebansForUser = (userBeban) => {
    const bebanList = parseBebans(userBeban);
    if (!bebanList || bebanList.length === 0) return [];
    const allowed = new Set();
    for (const ubRaw of bebanList) {
      const ub = String(ubRaw).trim();
      if (!ub) continue;
      let prefix = ub;
      if (ub.includes("-")) prefix = ub.split("-")[0];
      else prefix = ub.slice(0, 3); // fallback: first 3 letters for non-hyphenated codes
      const prefixNorm = String(prefix).trim().toLowerCase();
      bebanOptions.forEach((b) => {
        const bb = String(b || "").trim();
        let bprefix = bb;
        if (bb.includes("-")) bprefix = bb.split("-")[0];
        else bprefix = bb.slice(0, 3);
        if (String(bprefix).trim().toLowerCase() === prefixNorm)
          allowed.add(bb);
      });
    }
    // also ensure any explicit user-provided beban entries are included
    for (const b of bebanList) {
      if (b) allowed.add(String(b).trim());
    }
    return Array.from(allowed);
  };

  // load assets for the user dashboard
  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      // fetch all assets from the master table so the UI displays
      // the master dataset counts and suggestions
      const data = await listAset({ includeBebanHeader: false });
      const list = Array.isArray(data) ? data : data?.items ?? [];
      // if sessionUser exists and has a beban and not admin, filter assets to
      // include assets assigned to the user's beban AND any beban that shares
      // the same location prefix (e.g., BNT-NET <-> BNT-MEDIA)
      const hasRoleFilter = sessionUser?.role !== "admin" && sessionUser?.beban;
      let filteredList = list;
      if (hasRoleFilter) {
        const allowedFromPrefix = getAllowedBebansForUser(sessionUser.beban);
        const parsedBebans = parseBebans(sessionUser?.beban);
        const unionAllowed = Array.from(
          new Set([...(allowedFromPrefix || []), ...(parsedBebans || [])])
        );
        const allowedTargets = new Set(
          unionAllowed.map((b) =>
            String(b || "")
              .trim()
              .toLowerCase()
          )
        );
        const sessionUserBebansList = parseBebans(sessionUser.beban).map((b) =>
          String(b).trim().toLowerCase()
        );
        const sessionUserBebansSet = new Set(sessionUserBebansList);
        filteredList = list.filter((a) => {
          const ab = String(a?.bebanKode || a?.beban || "")
            .trim()
            .toLowerCase();
          // If asset has no beban, don't show it to a restricted user
          if (!ab) return false;
          // Show if the asset's beban exactly matches any of the session user's bebans
          if (sessionUserBebansSet.has(ab)) return true;
          // Show if the asset's beban is in the allowed set (same prefix)
          if (allowedTargets.has(ab)) return true;
          return false;
        });
      }
      setAssets(filteredList);
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

  React.useEffect(() => {
    loadAssets();
    loadBebanList();
    loadDepartemenList();
  }, [sessionUser]);

  // Allowed bebans for the current user (if not admin)
  const allowedBebans = React.useMemo(() => {
    if (sessionUser?.role === "admin") return bebanOptions;

    // Parse user beban - return only exact matches from database
    const parsed = parseBebans(sessionUser?.beban);

    // Filter to only include valid bebans from bebanOptions
    const validBebans = parsed.filter((b) =>
      bebanOptions.some((validBeban) => validBeban === b)
    );

    if (validBebans && validBebans.length) return validBebans;

    // Fallback if no valid bebans found
    return parsed.length > 0
      ? parsed
      : bebanOptions.length > 0
      ? [bebanOptions[0]]
      : [];
  }, [
    sessionUser?.beban,
    sessionUser?.role,
    sessionUser?.username,
    bebanOptions,
  ]);

  // Debug: Log when allowedBebans changes

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

      <div className="bg-white p-6 pt-0">
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
                    setShowCreate(false);
                    resetForm();
                  }}
                  isEditing={false}
                  loading={loading}
                  error={error}
                  groups={GROUPS}
                  akun={AKUN}
                  bebans={allowedBebans}
                  departemen={departemenList}
                  disabledBeban={allowedBebans.length <= 1}
                  hideHeader={true}
                  readOnlyAsetId={true}
                  useMaster={true}
                />
              </div>
            )}
            <div>
              <SearchFilterBar
                filterBeban={filterBeban}
                onFilterChange={(v) => setFilterBeban(v)}
                bebans={allowedBebans}
                filterGroup={filterGroup}
                onFilterGroupChange={(v) => setFilterGroup(v)}
                groups={GROUPS}
                filterYear={filterTahun}
                onFilterYearChange={(v) => setFilterTahun(v)}
                search={search}
                onSearchChange={(v) => setSearch(v)}
                showBeban={true}
                filterStatus={filterStatus}
                onFilterStatusChange={(v) => setFilterStatus(v)}
                statuses={STATUSES}
                showStatus={true}
                showDepartemen={true}
                departemen={departemenList}
                filterDepartemen={filterDepartemen}
                onFilterDepartemenChange={(v) => setFilterDepartemen(v)}
                onResetFilters={() => {
                  // reset to show all allowed bebans by default (union), not a single CSV value
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
              {(() => {
                const q = search.trim().toLowerCase();
                const userAllowedTargetsArr = Array.from(
                  new Set([
                    ...(getAllowedBebansForUser(sessionUser?.beban) || []),
                    ...(parseBebans(sessionUser?.beban) || []),
                  ])
                ).map((b) => String(b).trim().toLowerCase());
                const userAllowedTargetsSet = new Set(userAllowedTargetsArr);
                const sessionUserBebansSet = new Set(
                  parseBebans(sessionUser?.beban).map((b) =>
                    String(b).trim().toLowerCase()
                  )
                );
                const normalizedFilterBeban =
                  filterBeban === "All" || !filterBeban
                    ? null
                    : String(filterBeban).trim().toLowerCase();

                const filtered = assets.filter((a) => {
                  const bebanValue =
                    a?.bebanKode || a?.beban || a?.beban?.kode || "";
                  const ab = String(bebanValue).trim().toLowerCase();
                  let matchBeban = false;
                  if (filterBeban === "All") {
                    if (sessionUser?.role !== "admin") {
                      // non-admin users see all assets in their allowed set or matching one of their beban values
                      matchBeban =
                        sessionUserBebansSet.size > 0
                          ? sessionUserBebansSet.has(ab) ||
                            userAllowedTargetsSet.has(ab)
                          : userAllowedTargetsSet.has(ab);
                    } else {
                      matchBeban = true; // admin sees everything by default
                    }
                  } else {
                    // specific beban selected: only show assets that match the selected beban
                    matchBeban = ab === normalizedFilterBeban;
                  }
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
                    useMaster={false}
                  />
                );
              })()}
              {detailAsset && (
                <AssetDetail
                  asset={detailAsset}
                  onClose={() => setDetailAsset(null)}
                  userRole="user"
                  groups={GROUPS}
                  bebans={bebanOptions}
                  departemen={departemenList}
                  akun={AKUN}
                  onUpdated={(updated, type) => {
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
            </div>
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
