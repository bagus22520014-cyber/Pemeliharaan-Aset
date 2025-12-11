import { useEffect, useState, useMemo } from "react";
import { listAset } from "@/api/aset";
import { getStatusClass } from "@/utils/format";

export function useAssetTable({
  assets = [],
  useMaster = true,
  loading = false,
  pageSize = 10,
  onPageChange,
  resetOnAssetsChange = false,
  selectable = false,
  onSelectionChange,
}) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({ key: "", direction: "none" });
  const [highlighted, setHighlighted] = useState({ id: null, type: null });
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [internalAssets, setInternalAssets] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  // Fetch assets from backend when useMaster is enabled
  useEffect(() => {
    let mounted = true;
    const fetchMaster = async () => {
      if (!useMaster) return;
      setInternalLoading(true);
      setInternalError(null);
      try {
        const data = await listAset({ includeBebanHeader: false });
        if (!mounted) return;
        const list = Array.isArray(data)
          ? data
          : data?.items ?? (data ? [data] : []);
        setInternalAssets(list);
      } catch (err) {
        if (!mounted) return;
        setInternalError(String(err || ""));
      } finally {
        if (!mounted) return;
        setInternalLoading(false);
      }
    };
    fetchMaster();
    return () => {
      mounted = false;
    };
  }, [useMaster]);

  // When assets prop changes, reconcile selectedIds to remove IDs that no longer exist
  useEffect(() => {
    const src = useMaster ? internalAssets : assets;
    if (!src || selectedIds.size === 0) return;
    const idsInAssets = new Set(
      (src || []).map((a) => String(a.asetId ?? a.id))
    );
    const newSelected = new Set(
      Array.from(selectedIds).filter((id) => idsInAssets.has(id))
    );
    if (newSelected.size !== selectedIds.size) {
      setSelectedIds(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    }
  }, [assets, internalAssets, useMaster, selectedIds, onSelectionChange]);

  useEffect(() => {
    const src = useMaster ? internalAssets : assets;
    const totalPages = Math.max(1, Math.ceil((src?.length || 0) / pageSize));
    if (resetOnAssetsChange) {
      setPage(1);
      onPageChange?.(1);
    } else {
      // Clamp the current page if it exceeds totalPages (e.g., after deletion)
      setPage((p) => Math.min(p, totalPages));
    }
  }, [
    assets,
    internalAssets,
    resetOnAssetsChange,
    pageSize,
    useMaster,
    onPageChange,
  ]);

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

  // If useMaster is true, prefer internalAssets from backend; otherwise
  // use the parent-provided `assets` prop (which may be a filtered list).
  const sourceAssets = useMaster
    ? internalAssets && internalAssets.length > 0
      ? internalAssets
      : assets
    : assets;

  const total = sourceAssets.length;
  const isLoading = loading || (useMaster ? internalLoading : false);

  const totalNominal = useMemo(
    () =>
      sourceAssets.reduce((sum, a) => {
        // Determine approval status from common variants
        const apr =
          a?.approval_status ?? a?.approvalStatus ?? a?.ApprovalStatus;

        // If approval status is present, only include when it's 'disetujui'
        if (typeof apr !== "undefined" && apr !== null) {
          const aprNorm = String(apr).toLowerCase();
          if (aprNorm !== "disetujui") return sum;
        }

        const v = Number(a?.nilaiAset ?? 0);
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0),
    [sourceAssets]
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  // compute sorted assets
  const sortedAssets = useMemo(() => {
    const { key, direction } = sortBy;
    if (!key || direction === "none") return sourceAssets.slice();
    const sorted = sourceAssets.slice().sort((a, b) => {
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
  }, [sourceAssets, sortBy]);

  const visibleAssets = sortedAssets.slice(startIndex, endIndex);

  const getIconClass = (key) =>
    `h-3 w-3 ${
      sortBy.key === key && sortBy.direction !== "none"
        ? "text-indigo-600"
        : "text-gray-400"
    }`;

  const goToAsset = (
    assetIdOrAsetId,
    { highlight = "bg", duration = 900 } = {}
  ) => {
    if (!assetIdOrAsetId) return;
    // find index in the sorted assets by ID or asetId
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
  };

  const colCount = 9; // with status
  const colCountWithStatus = colCount;

  return {
    // State
    page,
    setPage,
    sortBy,
    setSortBy,
    highlighted,
    setHighlighted,
    selectedIds,
    setSelectedIds,
    internalAssets,
    internalLoading,
    internalError,

    // Computed
    sourceAssets,
    total,
    isLoading,
    totalNominal,
    totalPages,
    startIndex,
    endIndex,
    sortedAssets,
    visibleAssets,

    // Handlers
    handleSort,
    goToAsset,

    // Utilities
    getIconClass,
    getStatusClass,
    colCount,
    colCountWithStatus,
  };
}
