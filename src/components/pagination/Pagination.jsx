import React from "react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  total,
  totalNominal,
  formatRupiah,
}) {
  return (
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
  );
}
