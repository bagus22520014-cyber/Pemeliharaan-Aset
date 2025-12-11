import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

/**
 * Approval action buttons (Approve/Reject)
 * Used in asset detail view and approval list
 */
export default function ApprovalActions({
  onApprove,
  onReject,
  loading = false,
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onApprove}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Setujui"
      >
        <FaCheck className="text-sm" />
        <span>Setujui</span>
      </button>
      <button
        onClick={onReject}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Tolak"
      >
        <FaTimes className="text-sm" />
        <span>Tolak</span>
      </button>
    </div>
  );
}
