import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { formatRupiah } from "../utils/format";
import { Sort } from "./Icons";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";

function AssetTable(
  {
    assets = [],
    onEdit,
    onView,
    onDelete,
    onDeleteSelected,
    leftControls = null,
    showActions = true,
    loading = false,
    title = "Daftar Aset",
    pageSize = 10,
    onPageChange,
    resetOnAssetsChange = false,
    selectable = false,
    onSelectionChange,
  },
  ref
) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({ key: "", direction: "none" });
  const [highlighted, setHighlighted] = useState({ id: null, type: null });
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  // When assets prop changes, reconcile selectedIds to remove IDs that no longer exist
  useEffect(() => {
    if (!assets || selectedIds.size === 0) return;
    const idsInAssets = new Set(
      (assets || []).map((a) => String(a.asetId ?? a.id))
    );
    const newSelected = new Set(
      Array.from(selectedIds).filter((id) => idsInAssets.has(id))
    );
    if (newSelected.size !== selectedIds.size) {
      setSelectedIds(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    }
  }, [assets]);
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((assets?.length || 0) / pageSize));
    if (resetOnAssetsChange) {
      setPage(1);
      onPageChange?.(1);
    } else {
      // Clamp the current page if it exceeds totalPages (e.g., after deletion)
      setPage((p) => Math.min(p, totalPages));
    }
  }, [assets, resetOnAssetsChange, pageSize]);

  useImperativeHandle(ref, () => ({
    resetPageToFirst: () => {
      setPage(1);
      onPageChange?.(1);
    },
    setPage: (p) => {
      setPage(p);
      onPageChange?.(p);
    },
    goToAsset: (assetIdOrAsetId, { highlight = "bg", duration = 900 } = {}) => {
      if (!assetIdOrAsetId) return;
      // find index in the sorted assets by ID or asedId
      const idx = sortedAssets.findIndex(
        (it) =>
          (it.id && String(it.id) === String(assetIdOrAsetId)) ||
          String(it.asetId) === String(assetIdOrAsetId)
      );
      if (idx === -1) return;
      const targetPage = Math.floor(idx / pageSize) + 1;
      setPage(targetPage);
      onPageChange?.(targetPage);
      // set the highlight state by storing the id and type; the caller must trigger an animation
      setHighlighted({ id: String(assetIdOrAsetId), type: highlight });
      // clear after duration
      setTimeout(() => setHighlighted({ id: null, type: null }), duration);
    },
    getSelected: () => Array.from(selectedIds),
    clearSelection: () => {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    },
    setSelection: (ids) => {
      const s = new Set(ids || []);
      setSelectedIds(s);
      onSelectionChange?.(Array.from(s));
    },
  }));
  const handleSort = (key) => {
    const next = (prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: "", direction: "none" };
    };
    setSortBy((prev) => next(prev));
    setPage(1);
    onPageChange?.(1);
  };
  const total = assets.length;
  const totalNominal = useMemo(
    () =>
      assets.reduce((sum, a) => {
        const v = Number(a?.nilaiAset ?? 0);
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0),
    [assets]
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  // compute sorted assets
  const sortedAssets = useMemo(() => {
    const { key, direction } = sortBy;
    if (!key || direction === "none") return assets.slice();
    const sorted = assets.slice().sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];
      // numeric sort
      if (key === "nilaiAset" || key === "masaManfaat") {
        const na = Number(va || 0);
        const nb = Number(vb || 0);
        return na - nb;
      }
      if (key === "tglPembelian") {
        const da = va ? new Date(va) : 0;
        const db = vb ? new Date(vb) : 0;
        return da - db;
      }
      // fallback string compare
      const sa = va ? String(va).toLowerCase() : "";
      const sb = vb ? String(vb).toLowerCase() : "";
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return 0;
    });
    if (direction === "desc") sorted.reverse();
    return sorted;
  }, [assets, sortBy]);
  const visibleAssets = sortedAssets.slice(startIndex, endIndex);
  const getIconClass = (key) =>
    `h-3 w-3 ${
      sortBy.key === key && sortBy.direction !== "none"
        ? "text-indigo-600"
        : "text-gray-400"
    }`;
  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "aktif":
        return "bg-green-500";
      case "rusak":
        return "bg-red-500";
      case "diperbaiki":
        return "bg-yellow-500";
      case "dipinjam":
        return "bg-indigo-600";
      case "dijual":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };
  // Ensure we compute column span correctly for loading/no-data states
  // columns (AsetId, AccurateId, Nama, Grup, Beban, Status, Nilai, Pembelian, Masa, [Actions])
  // We no longer use a checkbox column for selection indicators; selection is shown via row background
  const colCount = showActions ? 9 : 8;
  // add 1 column for StatusAset
  const colCountWithStatus = colCount + 1;

  // const allVisibleSelected = ... (checkbox column removed)
  // const someVisibleSelected = ... (checkbox column removed)

  return (
    <div className="overflow-auto mt-4 rounded-2xl ring-1 ring-gray-300 bg-white shadow-sm">
      <div className=" h-[55px] px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {leftControls}
          <div className="text-lg font-semibold text-gray-700">{title}</div>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                setSelectedIds(new Set());
                onSelectionChange?.([]);
              }}
              className="h-10 w-10 rounded-md border bg-white text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center relative"
              title={`Batal Pilih (${selectedIds.size})`}
              aria-label={`Batal Pilih (${selectedIds.size})`}
            >
              <FaTimes className="h-4 w-4 text-gray-600" />
              {selectedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedIds.size}
                </span>
              )}
            </button>
          )}
          {selectedIds.size > 0 && onDeleteSelected && (
            <button
              onClick={() => onDeleteSelected(Array.from(selectedIds))}
              className="h-10 w-10 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-500 flex items-center justify-center"
              title={`Hapus ${selectedIds.size} terpilih`}
              aria-label={`Hapus ${selectedIds.size} terpilih`}
            >
              <FaTrash className="h-4 w-4" />
              {selectedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedIds.size}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {/* Removed checkbox column header - selection is indicated by row background color */}
              <th
                className="p-3 w-10 text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("statusAset")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSort("statusAset")
                }
                aria-sort={
                  sortBy.key === "statusAset"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="sr-only">Status</span>
                  <Sort
                    className={getIconClass("statusAset")}
                    direction={
                      sortBy.key === "statusAset" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("asetId")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && handleSort("asetId")
                }
                aria-sort={
                  sortBy.key === "asetId"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Aset Id
                  <Sort
                    className={getIconClass("asetId")}
                    direction={
                      sortBy.key === "asetId" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("accurateId")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSort("accurateId")
                }
                aria-sort={
                  sortBy.key === "accurateId"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Accurate Id
                  <Sort
                    className={getIconClass("accurateId")}
                    direction={
                      sortBy.key === "accurateId" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("namaAset")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && handleSort("namaAset")
                }
                aria-sort={
                  sortBy.key === "namaAset"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Nama
                  <Sort
                    className={getIconClass("namaAset")}
                    direction={
                      sortBy.key === "namaAset" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th className="p-3 font-semibold border-l border-gray-200">
                Grup
              </th>
              <th className="p-3 font-semibold border-l border-gray-200">
                Beban
              </th>
              {/* Removed the old middle status column: status is now shown as a colored circle at the left */}
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("nilaiAset")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSort("nilaiAset")
                }
                aria-sort={
                  sortBy.key === "nilaiAset"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Nilai
                  <Sort
                    className={getIconClass("nilaiAset")}
                    direction={
                      sortBy.key === "nilaiAset" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("tglPembelian")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSort("tglPembelian")
                }
                aria-sort={
                  sortBy.key === "tglPembelian"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Pembelian
                  <Sort
                    className={getIconClass("tglPembelian")}
                    direction={
                      sortBy.key === "tglPembelian" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600 border-l border-gray-200"
                onClick={() => handleSort("masaManfaat")}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSort("masaManfaat")
                }
                aria-sort={
                  sortBy.key === "masaManfaat"
                    ? sortBy.direction === "asc"
                      ? "ascending"
                      : sortBy.direction === "desc"
                      ? "descending"
                      : "none"
                    : "none"
                }
              >
                <div className="flex items-center gap-2">
                  Masa
                  <Sort
                    className={getIconClass("masaManfaat")}
                    direction={
                      sortBy.key === "masaManfaat" ? sortBy.direction : "none"
                    }
                  />
                </div>
              </th>
              {showActions && (
                <th className="p-3 font-semibold text-center border-l border-gray-200 w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={colCountWithStatus}
                  className="p-6 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td
                  colSpan={colCountWithStatus}
                  className="p-6 text-center text-gray-500 italic"
                >
                  Tidak ada data aset
                </td>
              </tr>
            ) : (
              visibleAssets.map((a) => {
                const aid = String(a.asetId ?? a.id);
                const isHighlighted =
                  highlighted.id && String(highlighted.id) === aid;
                const isSelected = selectedIds.has(aid);
                return (
                  <tr
                    tabIndex={0}
                    key={a.asetId ?? a.id}
                    data-asset-id={a.asetId ?? a.id}
                    className={`border-t transition odd:bg-white even:bg-gray-50 ${
                      isHighlighted
                        ? highlighted.type === "bg"
                          ? "animate-blink-bg"
                          : "animate-blink-text"
                        : ""
                    } ${
                      isSelected
                        ? "bg-gray-200! hover:bg-gray-300!"
                        : "hover:bg-gray-100"
                    }`}
                    aria-selected={isSelected}
                    // Row handlers: open detail on short click, toggle selection on long-press
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      const action = e.target.closest(".action-cell");
                      const checkbox = e.target.closest(
                        'input[type="checkbox"]'
                      );
                      if (action || checkbox) return;
                      // set a long-press timer on the row
                      // store timer on DOM element to avoid closures across rerenders
                      const el = e.currentTarget;
                      if (!selectable) {
                        // not selectable: don't start long-press, just no-op
                        return;
                      }
                      el.__pressTimer = setTimeout(() => {
                        // toggle selection
                        const newSet = new Set(selectedIds);
                        if (newSet.has(aid)) newSet.delete(aid);
                        else newSet.add(aid);
                        setSelectedIds(newSet);
                        onSelectionChange?.(Array.from(newSet));
                        // flag that a long press occurred to avoid opening detail
                        el.__longPress = true;
                        el.__pressTimer = null;
                      }, 600);
                    }}
                    onKeyDown={(e) => {
                      // keyboard support: Enter => open view; Space => toggle selection
                      const action = e.target.closest(".action-cell");
                      if (e.key === "Enter") {
                        if (!action) onView?.(a);
                        return;
                      }
                      if (e.key === " ") {
                        e.preventDefault();
                        if (!selectable || action) return;
                        const newSet = new Set(selectedIds);
                        if (newSet.has(aid)) newSet.delete(aid);
                        else newSet.add(aid);
                        setSelectedIds(newSet);
                        onSelectionChange?.(Array.from(newSet));
                      }
                    }}
                    onMouseUp={(e) => {
                      const action = e.target.closest(".action-cell");
                      const checkbox = e.target.closest(
                        'input[type="checkbox"]'
                      );
                      const el = e.currentTarget;
                      if (el.__pressTimer) {
                        clearTimeout(el.__pressTimer);
                        el.__pressTimer = null;
                        // short click => open detail
                        if (!action && !checkbox) onView?.(a);
                      } else if (el.__longPress) {
                        // if long-press happened, clear longPress flag after a short delay
                        if (el.__longPress)
                          setTimeout(() => (el.__longPress = false), 50);
                      } else {
                        // No timer and no long-press: this is a short click (non-selectable or no timer)
                        if (!action && !checkbox) onView?.(a);
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      if (el.__pressTimer) {
                        clearTimeout(el.__pressTimer);
                        el.__pressTimer = null;
                      }
                    }}
                    onTouchStart={(e) => {
                      const action = e.target.closest(".action-cell");
                      const checkbox = e.target.closest(
                        'input[type="checkbox"]'
                      );
                      if (action || checkbox) return;
                      if (!selectable) return;
                      const el = e.currentTarget;
                      el.__pressTimer = setTimeout(() => {
                        const newSet = new Set(selectedIds);
                        if (newSet.has(aid)) newSet.delete(aid);
                        else newSet.add(aid);
                        setSelectedIds(newSet);
                        onSelectionChange?.(Array.from(newSet));
                        el.__longPress = true;
                        el.__pressTimer = null;
                      }, 600);
                    }}
                    onTouchEnd={(e) => {
                      const el = e.currentTarget;
                      if (el.__pressTimer) {
                        clearTimeout(el.__pressTimer);
                        el.__pressTimer = null;
                        const action = e.target.closest(".action-cell");
                        const checkbox = e.target.closest(
                          'input[type="checkbox"]'
                        );
                        if (!action && !checkbox) onView?.(a);
                        return;
                      }
                      if (el.__longPress)
                        setTimeout(() => (el.__longPress = false), 50);
                      else {
                        // non-longpress short tap
                        const action = e.target.closest(".action-cell");
                        const checkbox = e.target.closest(
                          'input[type="checkbox"]'
                        );
                        if (!action && !checkbox) onView?.(a);
                      }
                    }}
                  >
                    {/* Status circle */}
                    <td className="p-3 text-center border-l border-gray-200">
                      <span
                        title={a.keterangan || ""}
                        className={`inline-block w-3 h-3 rounded-full ${getStatusClass(
                          a.statusAset
                        )}`}
                      />
                    </td>
                    <td className="p-3 border-l border-gray-200">{a.asetId}</td>
                    <td className="p-3 border-l border-gray-200">
                      {a.accurateId}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      {a.namaAset}
                    </td>
                    <td className="p-3 border-l border-gray-200">{a.grup}</td>
                    <td className="p-3 border-l border-gray-200">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {a.beban}
                      </span>
                    </td>
                    {/* Old status badge removed; status circle is now the first column */}
                    <td className="p-3 font-semibold text-gray-900 border-l border-gray-200">
                      {formatRupiah(a.nilaiAset)}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      {a.tglPembelian}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      {a.masaManfaat} bulan
                    </td>
                    {/* Status column will be inserted earlier next to Beban */}
                    {showActions && (
                      <td className="p-3 text-center action-cell border-l border-gray-200">
                        <div className="flex gap-2 justify-center">
                          {/* View button removed - row click/short click opens detail */}
                          <button
                            onClick={() => onEdit?.(a)}
                            title="Edit"
                            aria-label={`Edit ${a?.asetId ?? a?.id}`}
                            className="p-2 rounded-md border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete?.(a.asetId ?? a.id)}
                            title="Delete"
                            aria-label={`Delete ${a?.asetId ?? a?.id}`}
                            className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
          <div className="text-sm text-gray-600 w-1/4">
            Showing {startIndex + 1}-{endIndex} of {total} items
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 py-2">
            {/* Prev */}
            <button
              disabled={page <= 1}
              onClick={() => {
                const next = Math.max(1, page - 1);
                setPage(next);
                onPageChange?.(next);
              }}
              className={`px-4 py-1.5 rounded-full border text-sm transition 
      ${page <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Prev
            </button>

            {/* Numbered Pages */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const active = p === page;

                return (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      onPageChange?.(p);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition
            border
            ${
              active
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              disabled={page >= totalPages}
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                onPageChange?.(next);
              }}
              className={`px-4 py-1.5 rounded-full border text-sm transition 
      ${
        page >= totalPages
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-gray-100"
      }`}
            >
              Next
            </button>
          </div>

          <div className="text-md text-black font-bold w-1/4 text-right inline-flex items-center justify-end px-3 py-1 rounded">
            Total Nilai Aset: {formatRupiah(totalNominal)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(AssetTable);
