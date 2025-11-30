import React from "react";
import { FaHistory } from "react-icons/fa";

export default function HistoryButton({
  onClick,
  title = "Riwayat Perbaikan",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 transition ${className}`}
      aria-label={title}
    >
      <FaHistory className="h-5 w-5 text-white" />
    </button>
  );
}
