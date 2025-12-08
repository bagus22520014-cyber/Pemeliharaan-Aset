import React from "react";
import { listAset } from "@/api/aset";
import { FaSearch, FaUndo } from "react-icons/fa";
import ScanControl from "./barcode/ScanControl";

export default function SearchFilterBar({
  filterBeban,
  onFilterChange,
  bebans = [],
  filterGroup,
  onFilterGroupChange,
  groups = [],
  filterYear,
  onFilterYearChange,
  search,
  onSearchChange,
  showBeban = true,
  showGroup = true,
  showYear = true,
  showStatus = false,
  statuses = [],
  filterStatus = "All",
  onFilterStatusChange,
  onResetFilters,
  rightControls = null,
  showScan = false,
  assets = [],
  onScanFound,
  useMaster = false,
  // New filters
  showDepartemen = false,
  departemen = [],
  filterDepartemen = "All",
  onFilterDepartemenChange,
}) {
  const [masterAssets, setMasterAssets] = React.useState([]);
  const [masterLoading, setMasterLoading] = React.useState(false);
  const bebanOptions =
    bebans && bebans.length
      ? bebans
      : useMaster && masterAssets && masterAssets.length
      ? Array.from(
          new Set(
            masterAssets
              .map((a) => {
                const val = a.bebanKode || a.beban || a.beban?.kode;
                // Ensure we return string, not object
                return typeof val === "string" ? val : null;
              })
              .filter(Boolean)
          )
        )
      : [];
  React.useEffect(() => {
    let mounted = true;
    async function loadMaster() {
      if (!useMaster) return;
      setMasterLoading(true);
      try {
        const data = await listAset({ includeBebanHeader: false });
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (mounted) setMasterAssets(list);
      } catch (err) {
        if (mounted) setMasterAssets([]);
      } finally {
        if (mounted) setMasterLoading(false);
      }
    }
    loadMaster();
    return () => {
      mounted = false;
    };
  }, [useMaster]);
  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 
                 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-100"
    >
      {/* LEFT SIDE FILTERS */}
      <div className="flex items-center flex-wrap gap-3">
        {/* RESET BUTTON */}
        <button
          onClick={() => onResetFilters?.()}
          className="h-12 w-12 rounded-xl border border-gray-100 bg-white 
                     hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
          title="Reset Filters"
        >
          <FaUndo className="h-5 w-5" />
        </button>

        {/* STATUS FILTER */}
        {showStatus && (
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Status (semua)</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {/* BEBAN FILTER */}
        {showBeban && (
          <select
            value={filterBeban}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Beban (semua)</option>
            {bebanOptions.map((b) => {
              const bebanValue =
                typeof b === "string" ? b : b?.kode || String(b);
              return (
                <option key={bebanValue} value={bebanValue}>
                  {bebanValue}
                </option>
              );
            })}
          </select>
        )}

        {/* KATEGORI FILTER */}
        {showGroup && (
          <select
            value={filterGroup}
            onChange={(e) => onFilterGroupChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Kategori (semua)</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}

        {/* DEPARTEMEN FILTER */}
        {showDepartemen && (
          <select
            value={filterDepartemen}
            onChange={(e) => onFilterDepartemenChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Departemen (semua)</option>
            {departemen.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama || d.kode}
              </option>
            ))}
          </select>
        )}

        {/* YEAR FILTER */}
        {showYear && (
          <input
            type="number"
            min={1900}
            max={2100}
            placeholder="Tahun"
            value={filterYear === "All" ? "" : filterYear}
            onChange={(e) => onFilterYearChange?.(e.target.value || "All")}
            className="h-12 px-4 w-32 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          />
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

          <input
            type="search"
            placeholder="Search aset…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-12 pl-10 pr-3 w-full rounded-xl border border-gray-300 
                       text-sm bg-white focus:ring-2 focus:ring-indigo-500 
                       shadow-sm transition"
          />

          {rightControls}
        </div>

        {/* SCAN BUTTON */}
        {showScan && (
          <ScanControl
            assets={useMaster ? masterAssets : assets}
            onScanFound={onScanFound}
          />
        )}
      </div>
    </div>
  );
}
