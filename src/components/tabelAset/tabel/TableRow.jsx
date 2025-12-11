import React from "react";
import { FaTimes } from "react-icons/fa";
import { getApprovalStatusClass, getApprovalStatusLabel } from "@/utils/format";

export default function TableRow({
  a,
  onView,
  selectable,
  selectedIds,
  setSelectedIds,
  onSelectionChange,
  formatRupiah,
  getStatusClass,
  showActions,
  highlighted,
}) {
  const aid = String(a.asetId ?? a.id);
  const isHighlighted = highlighted.id && String(highlighted.id) === aid;
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
        isSelected ? "bg-gray-200! hover:bg-gray-300!" : "hover:bg-gray-100"
      }`}
      aria-selected={isSelected}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        const action = e.target.closest(".action-cell");
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (action || checkbox) return;
        const el = e.currentTarget;
        if (!selectable) return;
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
      onKeyDown={(e) => {
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
        const checkbox = e.target.closest('input[type="checkbox"]');
        const el = e.currentTarget;
        if (el.__pressTimer) {
          clearTimeout(el.__pressTimer);
          el.__pressTimer = null;
          if (!action && !checkbox) onView?.(a);
        } else if (el.__longPress) {
          if (el.__longPress) setTimeout(() => (el.__longPress = false), 50);
        } else {
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
        const checkbox = e.target.closest('input[type="checkbox"]');
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
          const checkbox = e.target.closest('input[type="checkbox"]');
          if (!action && !checkbox) onView?.(a);
          return;
        }
        if (el.__longPress) setTimeout(() => (el.__longPress = false), 50);
        else {
          const action = e.target.closest(".action-cell");
          const checkbox = e.target.closest('input[type="checkbox"]');
          if (!action && !checkbox) onView?.(a);
        }
      }}
    >
      <td
        style={{ width: "60px", minWidth: "60px", maxWidth: "60px" }}
        className="p-3 text-center border-l border-gray-200"
      >
        <div className="flex flex-col items-center gap-1">
          <span
            title={a.keterangan || ""}
            className={`inline-block w-3 h-3 rounded-full ${getStatusClass(
              a.statusAset
            )}`}
          />
          {a.approval_status && a.approval_status !== "disetujui" && (
            <span
              title={`Status Persetujuan: ${getApprovalStatusLabel(
                a.approval_status
              )}`}
              className={`text-[8px] px-1 py-0.5 rounded border ${getApprovalStatusClass(
                a.approval_status
              )}`}
            >
              {a.approval_status === "diajukan" ? "⏳" : "✗"}
            </span>
          )}
        </div>
      </td>
      <td
        style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.asetId}
        </div>
      </td>
      <td
        style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.accurateId}
        </div>
      </td>
      <td
        style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.namaAset}
        </div>
      </td>
      <td
        style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.grup}
        </div>
      </td>
      <td
        style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin justify-center flex">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-100">
            {(() => {
              const bebanValue = a.bebanKode || a.beban?.kode || a.beban;
              return typeof bebanValue === "string" ? bebanValue : "-";
            })()}
          </span>
        </div>
      </td>

      <td
        style={{ width: "130px", minWidth: "130px", maxWidth: "130px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin text-center">
          {a.tglPembelian}
        </div>
      </td>
      <td
        style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.masaManfaat} bulan
        </div>
      </td>
      <td
        style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.pengguna || "-"}
        </div>
      </td>
      <td
        style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {a.lokasi || "-"}
        </div>
      </td>
      <td
        style={{ width: "160px", minWidth: "160px", maxWidth: "160px" }}
        className="p-0 border-l border-gray-200"
      >
        <div className="p-3 font-semibold text-gray-900 overflow-x-auto whitespace-nowrap scrollbar-thin text-right">
          {formatRupiah(a.nilaiAset)}
        </div>
      </td>
    </tr>
  );
}
