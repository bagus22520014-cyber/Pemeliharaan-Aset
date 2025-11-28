import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { formatRupiah } from "../utils/format";
import { Sort } from "./Icons";

function AssetTable(
  {
    assets = [],
    onEdit,
    onDelete,
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
    getPage: () => page,
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
  // Ensure we compute column span correctly for loading/no-data states
  const colCount = (showActions ? 9 : 8) + (selectable ? 1 : 0);

  const allVisibleSelected =
    visibleAssets.length > 0 &&
    visibleAssets.every((a) => selectedIds.has(String(a.id ?? a.asetId)));
  const someVisibleSelected = visibleAssets.some((a) =>
    selectedIds.has(String(a.id ?? a.asetId))
  );

  return (
    <div className="overflow-auto mt-4 rounded-2xl ring-1 ring-gray-300 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        <div className="text-xs text-gray-500">
          Showing {startIndex + 1}-{endIndex} of {total} items
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {selectable && (
                <th className="p-3 font-semibold text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (!el) return;
                      el.indeterminate =
                        !allVisibleSelected && someVisibleSelected;
                    }}
                    onChange={(e) => {
                      // toggle selection for visible rows
                      const newSet = new Set(selectedIds);
                      if (e.target.checked) {
                        visibleAssets.forEach((a) =>
                          newSet.add(String(a.id ?? a.asetId))
                        );
                      } else {
                        visibleAssets.forEach((a) =>
                          newSet.delete(String(a.id ?? a.asetId))
                        );
                      }
                      setSelectedIds(newSet);
                      onSelectionChange?.(Array.from(newSet));
                    }}
                  />
                </th>
              )}
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
              <th className="p-3 font-semibold">Grup</th>
              <th className="p-3 font-semibold">Beban</th>
              <th
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
                className="p-3 font-semibold cursor-pointer hover:text-indigo-600"
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
                <th className="p-3 font-semibold text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="p-6 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="p-6 text-center text-gray-500 italic"
                >
                  Tidak ada data aset
                </td>
              </tr>
            ) : (
              visibleAssets.map((a) => {
                const aid = String(a.id ?? a.asetId);
                const isHighlighted =
                  highlighted.id && String(highlighted.id) === aid;
                const isSelected = selectedIds.has(aid);
                return (
                  <tr
                    key={a.id ?? a.asetId}
                    data-asset-id={a.id ?? a.asetId}
                    className={`border-t hover:bg-gray-100 transition odd:bg-white even:bg-gray-50 ${
                      isHighlighted
                        ? highlighted.type === "bg"
                          ? "animate-blink-bg"
                          : "animate-blink-text"
                        : ""
                    } ${isSelected ? "bg-indigo-50" : ""}`}
                  >
                    {selectable && (
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSet = new Set(selectedIds);
                            if (e.target.checked) newSet.add(aid);
                            else newSet.delete(aid);
                            setSelectedIds(newSet);
                            onSelectionChange?.(Array.from(newSet));
                          }}
                        />
                      </td>
                    )}
                    <td className="p-3">{a.asetId}</td>
                    <td className="p-3">{a.accurateId}</td>
                    <td className="p-3">{a.namaAset}</td>
                    <td className="p-3">{a.grup}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {a.beban}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {formatRupiah(a.nilaiAset)}
                    </td>
                    <td className="p-3">{a.tglPembelian}</td>
                    <td className="p-3">{a.masaManfaat}</td>
                    {showActions && (
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => onEdit?.(a)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-2"
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
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDelete?.(a.id ?? a.asetId)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
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
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-2 14H7L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                            <span>Delete</span>
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
            Page {page} of {totalPages}
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
