import React from "react";
import { FaSearch, FaUndo } from "react-icons/fa";
import { CiBarcode } from "react-icons/ci";

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
}) {
  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 
                 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-200"
    >
      {/* LEFT SIDE FILTERS */}
      <div className="flex items-center flex-wrap gap-3">
        {/* RESET BUTTON */}
        <button
          onClick={() => onResetFilters?.()}
          className="h-12 w-12 rounded-xl border border-gray-200 bg-white 
                     hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
          title="Reset Filters"
        >
          <FaUndo className="h-5 w-5" />
        </button>

        {/* BEBAN FILTER */}
        {showBeban && (
          <select
            value={filterBeban}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Beban (semua)</option>
            {bebans.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}

        {/* GRUP FILTER */}
        {showGroup && (
          <select
            value={filterGroup}
            onChange={(e) => onFilterGroupChange?.(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-sm bg-white 
                       focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="All">Grup (semua)</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}

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
        {showScan && <ScanControl assets={assets} onScanFound={onScanFound} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCAN BUTTON + INPUT DROPDOWN
--------------------------------------------------------- */
function ScanControl({ assets = [], onScanFound }) {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [notFound, setNotFound] = React.useState(false);
  const inputRef = React.useRef(null);

  const lookup = (val) => {
    const v = String(val || "").trim();
    if (!v) return null;
    return assets.find((x) => String(x.asetId ?? x.id) === v);
  };

  React.useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus?.(), 10);
  }, [visible]);

  const submit = (val) => {
    const found = lookup(val);
    if (found) {
      setVisible(false);
      setValue("");
      setNotFound(false);
      onScanFound?.(found);
    } else {
      setNotFound(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setVisible((s) => !s);
          setValue("");
          setNotFound(false);
        }}
        className="h-12 w-12 rounded-xl bg-green-600 text-white hover:bg-green-500
                   flex items-center justify-center transition shadow"
        title="Scan Aset Id"
        aria-label="Open scan popup"
      >
        <CiBarcode className="h-10 w-10" />
      </button>

      {visible && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setVisible(false);
              setValue("");
              setNotFound(false);
            }}
          />
          <div className="relative z-70 w-[min(560px,95%)] bg-white rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                Scan atau paste Aset Id
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setVisible(false);
                  setValue("");
                  setNotFound(false);
                }}
                aria-label="Close scan popup"
                title="Tutup"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  const val = e.target.value || "";
                  setValue(val);
                  if (notFound) setNotFound(false);
                  // Automatically submit if the entered/pasted ID exactly matches an asset
                  const found = lookup(val);
                  if (found) {
                    submit(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setVisible(false);
                    setValue("");
                    setNotFound(false);
                    return;
                  }
                  if (e.key === "Enter") {
                    submit(value);
                    return;
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Scan or paste Aset ID"
                aria-label="Scan or paste Aset ID"
              />
              <button
                onClick={() => submit(value)}
                className="px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Cari
              </button>
            </div>
            {notFound && (
              <div className="mt-2 text-sm text-red-600">
                Aset tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
