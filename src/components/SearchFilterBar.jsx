import React from "react";

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
}) {
  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 
                    bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-200"
    >
      {/* LEFT FILTERS */}
      <div className="flex items-center gap-4 flex-wrap">
        {showBeban && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Beban</label>
            <select
              value={filterBeban}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white 
                         focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            >
              <option value="All">All</option>
              {bebans.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}

        {showGroup && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Grup</label>
            <select
              value={filterGroup}
              onChange={(e) => onFilterGroupChange?.(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white 
                         focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            >
              <option value="All">All</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}

        {showYear && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">
              Tahun Pembelian
            </label>
            <input
              type="number"
              min={1900}
              max={2100}
              value={filterYear === "All" ? "" : filterYear}
              onChange={(e) => onFilterYearChange?.(e.target.value || "All")}
              placeholder="YYYY"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white 
                         focus:ring-2 focus:ring-indigo-500 shadow-sm transition w-28"
            />
          </div>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-1/3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
          />
        </svg>

        <input
          type="search"
          placeholder="Search by name, asetId, accurateId..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 
                     bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
        />
      </div>
    </div>
  );
}
