import React, { forwardRef, useImperativeHandle } from "react";
import { formatRupiah } from "@/utils/format";
import { Sort } from "@/components/Icons";
import { FaTimes } from "react-icons/fa";
import { useAssetTable } from "./useAssetTable";
import Pagination from "@/components/pagination/Pagination";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

function AssetTable(
  {
    assets = [],
    onView,
    leftControls = null,
    showActions = false,
    useMaster = true,
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
  const {
    page,
    setPage,
    sortBy,
    handleSort,
    highlighted,
    selectedIds,
    setSelectedIds,
    sourceAssets,
    total,
    isLoading,
    totalNominal,
    totalPages,
    startIndex,
    endIndex,
    sortedAssets,
    visibleAssets,
    getIconClass,
    getStatusClass,
    colCountWithStatus,
    goToAsset: hookGoToAsset,
  } = useAssetTable({
    assets,
    useMaster,
    loading,
    pageSize,
    onPageChange,
    resetOnAssetsChange,
    selectable,
    onSelectionChange,
  });

  useImperativeHandle(ref, () => ({
    resetPageToFirst: () => {
      setPage(1);
      onPageChange?.(1);
    },
    setPage: (p) => {
      setPage(p);
      onPageChange?.(p);
    },
    goToAsset: hookGoToAsset,
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  return (
    <div className="overflow-auto mt-4 rounded-2xl ring-1 ring-gray-300 bg-white shadow-sm">
      <div className=" h-[55px] px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-700">{title}</div>
        <div className="flex items-center gap-3">
          {leftControls}
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
        </div>
      </div>
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <TableHeader
            sortBy={sortBy}
            handleSort={handleSort}
            getIconClass={getIconClass}
            showActions={showActions}
          />

          <tbody className="text-gray-700">
            {isLoading ? (
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
              visibleAssets.map((a) => (
                <TableRow
                  key={a.asetId ?? a.id}
                  a={a}
                  onView={onView}
                  selectable={selectable}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  onSelectionChange={onSelectionChange}
                  formatRupiah={formatRupiah}
                  getStatusClass={getStatusClass}
                  showActions={showActions}
                  highlighted={highlighted}
                />
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          totalNominal={totalNominal}
          formatRupiah={formatRupiah}
        />
      </div>
    </div>
  );
}

export default forwardRef(AssetTable);
