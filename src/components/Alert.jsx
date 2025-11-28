import React, { useEffect } from "react";

export default function Alert({
  type = "info",
  message = "",
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const base =
    "p-3 rounded-md shadow text-sm flex items-start gap-3 justify-between";
  const typeClass =
    type === "success"
      ? "bg-green-50 text-green-800 border border-green-100"
      : type === "error"
      ? "bg-red-50 text-red-800 border border-red-100"
      : type === "warning"
      ? "bg-amber-50 text-amber-800 border border-amber-100"
      : "bg-blue-50 text-blue-800 border border-blue-100";

  return (
    <div className={`${base} ${typeClass}`} role="alert">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          {type === "success"
            ? "Berhasil"
            : type === "error"
            ? "Error"
            : "Info"}
        </span>
        <div className="text-sm">{message}</div>
      </div>
      <div>
        <button
          aria-label="close"
          onClick={() => onClose?.()}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
