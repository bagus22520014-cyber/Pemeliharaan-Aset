import React from "react";
import { FaHistory, FaInfoCircle, FaTools } from "react-icons/fa";

export default function ToolsButton({
  onDetailClick,
  onHistoryClick,
  onToolsClick,
  detailTitle = "Detail",
  historyTitle = "Riwayat",
  toolsTitle = "Tools",
  activeTab = "detail",
  className = "",
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {/* Detail Tab */}
      <button
        onClick={onDetailClick}
        title={detailTitle}
        className={`px-6 py-2.5 rounded-t-xl font-semibold transition flex items-center gap-2 ${
          activeTab === "detail"
            ? "bg-gray-100 text-blue-600 border-t-2 border-blue-600"
            : "bg-white/20 text-white hover:bg-white/30"
        }`}
        aria-label={detailTitle}
      >
        <FaInfoCircle className="h-4 w-4" />
        {detailTitle}
      </button>

      {/* History Tab */}
      <button
        onClick={onHistoryClick}
        title={historyTitle}
        className={`px-6 py-2.5 rounded-t-xl font-semibold transition flex items-center gap-2 ${
          activeTab === "riwayat"
            ? "bg-gray-100 text-indigo-600 border-t-2 border-indigo-600"
            : "bg-white/20 text-white hover:bg-white/30"
        }`}
        aria-label={historyTitle}
      >
        <FaHistory className="h-4 w-4" />
        {historyTitle}
      </button>

      {/* Tools Tab */}
      <button
        onClick={onToolsClick}
        title={toolsTitle}
        className={`px-6 py-2.5 rounded-t-xl font-semibold transition flex items-center gap-2 ${
          activeTab === "aksi"
            ? "bg-gray-100 text-orange-600 border-t-2 border-orange-600"
            : "bg-white/20 text-white hover:bg-white/30"
        }`}
        aria-label={toolsTitle}
      >
        <FaTools className="h-4 w-4" />
        {toolsTitle}
      </button>
    </div>
  );
}
